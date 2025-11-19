#![allow(unstable_name_collisions)]
use itertools::Itertools;
use std::collections::HashMap;

use crate::{
    ast::{self, key::KeyIdent, ConfigData},
    utils::{Span, Spanned},
};
use miette::{LabeledSpan, Severity};
use serde::{Serialize, Serializer};

#[derive(Debug, Serialize)]
pub struct Profile {
    pub profile_name: String,
    pub default_layer: usize,
    pub layers: Vec<Layer>,
}

#[derive(Debug, Serialize)]
pub struct Layer {
    pub layer_name: String,
    pub remappings: Vec<Remapping>,
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
pub enum Remapping {
    Basic(BasicRemapping),
    Sequence(SequenceRemapping),
}

#[derive(Debug, Serialize, Eq, PartialEq, Hash)]
pub struct BasicRemapping {
    pub trigger: BasicTrigger,
    pub binds: Vec<Bind>,
}

#[derive(Debug, Serialize, Eq, PartialEq, Hash)]
pub struct SequenceRemapping {
    pub triggers: Vec<AdvancedTrigger>,
    pub binds: Vec<Bind>,
    pub behavior: Behavior,
}

#[derive(Debug, Serialize, Clone, Eq, PartialEq, Hash)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum BasicTrigger {
    KeyPress {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    KeyRelease {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    AppFocused {
        app_name: String,
    },
}

#[derive(Debug, Serialize, Clone, Copy, Eq, PartialEq, Hash)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AdvancedTrigger {
    KeyPress {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    KeyRelease {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    MinimumWait {
        duration: usize,
    },
    MaximumWait {
        duration: usize,
    },
}

#[derive(Debug, Serialize, Eq, PartialEq, Hash)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Bind {
    PressKey {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    ReleaseKey {
        #[serde(serialize_with = "serialize_key")]
        value: KeyIdent,
    },
    SwitchLayer {
        value: usize,
    },
    Wait {
        value: usize,
    },
    RunScript {
        interpreter: String,
        script: String,
    },
}

#[derive(Debug, Serialize, Clone, Copy, Eq, PartialEq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum Behavior {
    Capture,
    Release,
    Default,
}

impl ast::Profile {
    pub fn compile(self) -> miette::Result<Profile> {
        let ast::Profile {
            name,
            config,
            layers,
        } = self;
        let config_data = config.to_data();

        let layer_names: HashMap<String, usize> = layers
            .iter()
            .enumerate()
            .map(|(i, l)| (l.name.value.clone(), i))
            .collect();
        Ok(Profile {
            profile_name: name.value,
            default_layer: config_data
                .default_layer
                .as_ref()
                .map(|layer_name| {
                    layers
                        .iter()
                        .position(|l| &l.name.value == layer_name)
                        .expect("default layer should exist after validating the profile")
                })
                .unwrap_or(0),
            layers: layers
                .into_iter()
                .map(|l| l.value.compile(&config_data, layer_names.clone()))
                .collect::<Result<Vec<_>, _>>()?,
        })
    }
}

struct LayerCompilationState {
    basic_remappings: HashMap<BasicTrigger, Span>,
    sequence_remappings: HashMap<AdvancedTrigger, SequenceTrie>,
    config: ConfigData,
    layers: HashMap<String, usize>,
}
impl LayerCompilationState {
    fn try_insert_remappings(
        &mut self,
        remappings: &[Remapping],
        span: Span,
    ) -> miette::Result<()> {
        for remapping in remappings {
            match remapping {
                Remapping::Basic(basic_remapping) => {
                    match self.basic_remappings.entry(basic_remapping.trigger.clone()) {
                        std::collections::hash_map::Entry::Occupied(occupied_entry) => {
                            return Err(conflicting_binds(*occupied_entry.get(), span))
                        }
                        std::collections::hash_map::Entry::Vacant(vacant_entry) => {
                            vacant_entry.insert_entry(span);
                        }
                    }
                }
                Remapping::Sequence(SequenceRemapping {
                    triggers,
                    binds: _,
                    behavior,
                }) => {
                    if triggers.is_empty() {
                        return Err(miette::miette!(
                            severity = Severity::Error,
                            labels = vec![LabeledSpan::new(
                                Some("empty sequence found here".to_string()),
                                span.start(),
                                span.end()
                            ),],
                            "empty sequences not allowed"
                        ));
                    }

                    let mut created_new = false;
                    let mut current_trie = &mut self.sequence_remappings;
                    for (i, trigger) in triggers.iter().enumerate() {
                        // Ingore timers
                        match trigger {
                            AdvancedTrigger::KeyPress { .. } => (),
                            AdvancedTrigger::KeyRelease { .. } => (),
                            _ => continue,
                        };
                        let next_node = current_trie.entry(*trigger).or_insert_with(|| {
                            created_new = true;
                            SequenceTrie {
                                next: HashMap::new(),
                                behavior: *behavior,
                                span,
                            }
                        });
                        if &next_node.behavior != behavior {
                            return Err(conflicting_binds(next_node.span, span));
                        }

                        if i == triggers.len() - 1 {
                            if !created_new {
                                return Err(conflicting_binds(next_node.span, span));
                            }
                        } else {
                            if !created_new && next_node.next.is_empty() {
                                return Err(conflicting_binds(next_node.span, span));
                            }
                        }

                        current_trie = &mut next_node.next;
                    }
                }
            }
        }
        Ok(())
    }
}

struct SequenceTrie {
    next: HashMap<AdvancedTrigger, SequenceTrie>,
    behavior: Behavior,
    span: Span,
}

impl ast::Layer {
    fn compile(self, config: &ConfigData, layers: HashMap<String, usize>) -> miette::Result<Layer> {
        let mut state = LayerCompilationState {
            basic_remappings: HashMap::new(),
            sequence_remappings: HashMap::new(),
            config: config.clone(),
            layers: layers.clone(),
        };

        Ok(Layer {
            layer_name: self.name.value,
            remappings: self
                .statements
                .into_iter()
                .map(|statement| {
                    let span = statement.span;
                    let remappings = ast::Statement::compile(statement, &mut state);
                    state
                        .try_insert_remappings(&remappings, span)
                        .map(|_| remappings)
                })
                .collect::<Result<Vec<_>, _>>()?
                .into_iter()
                .flatten()
                .collect(),
        })
    }
}
impl ast::Statement {
    fn compile(statment: Spanned<Self>, state: &mut LayerCompilationState) -> Vec<Remapping> {
        match &statment.lhs.value {
            ast::Trigger::Key(trigger_key) => {
                if let Some(result) = ast::Statement::try_key_swap(&statment) {
                    return result;
                }

                match trigger_key.value {
                    ast::Key::Unspecified(key) => vec![
                        Remapping::Basic(BasicRemapping {
                            trigger: BasicTrigger::KeyPress { value: key.value },
                            binds: ast::Bind::compile(&statment.rhs, state),
                        }),
                        Remapping::Basic(BasicRemapping {
                            trigger: BasicTrigger::KeyRelease { value: key.value },
                            binds: vec![],
                        }),
                    ],
                    ast::Key::Down(key) => {
                        vec![Remapping::Basic(BasicRemapping {
                            trigger: BasicTrigger::KeyPress { value: key.value },
                            binds: ast::Bind::compile(&statment.rhs, state),
                        })]
                    }
                    ast::Key::Up(key) => {
                        vec![Remapping::Basic(BasicRemapping {
                            trigger: BasicTrigger::KeyRelease { value: key.value },
                            binds: ast::Bind::compile(&statment.rhs, state),
                        })]
                    }
                }
            }
            ast::Trigger::AppFocused(app_name) => {
                vec![Remapping::Basic(BasicRemapping {
                    trigger: BasicTrigger::AppFocused {
                        app_name: app_name.value.clone(),
                    },
                    binds: ast::Bind::compile(&statment.rhs, state),
                })]
            }
            ast::Trigger::Tap(key, behavior, timeout) => {
                vec![Remapping::Sequence(SequenceRemapping {
                    triggers: vec![
                        AdvancedTrigger::KeyPress { value: key.value },
                        AdvancedTrigger::MaximumWait {
                            duration: timeout
                                .as_deref()
                                .copied()
                                .unwrap_or(state.config.tap_timeout),
                        },
                        AdvancedTrigger::KeyRelease { value: key.value },
                    ],
                    binds: ast::Bind::compile(&statment.rhs, state),
                    behavior: ast::Behavior::compile(
                        behavior
                            .as_deref()
                            .copied()
                            .unwrap_or(state.config.default_behavior),
                    ),
                })]
            }
            ast::Trigger::Hold(key, behavior, timeout) => {
                vec![Remapping::Sequence(SequenceRemapping {
                    triggers: vec![
                        AdvancedTrigger::KeyPress { value: key.value },
                        AdvancedTrigger::MinimumWait {
                            duration: timeout
                                .as_deref()
                                .copied()
                                .unwrap_or(state.config.hold_time),
                        },
                    ],
                    binds: ast::Bind::compile(&statment.rhs, state),
                    behavior: ast::Behavior::compile(
                        behavior
                            .as_deref()
                            .copied()
                            .unwrap_or(state.config.default_behavior),
                    ),
                })]
            }
            ast::Trigger::Chord(keys, behavior, timeout) => {
                vec![Remapping::Sequence(SequenceRemapping {
                    triggers: keys
                        .iter()
                        .map(|k| AdvancedTrigger::KeyPress { value: k.value })
                        .intersperse_with(|| AdvancedTrigger::MaximumWait {
                            duration: timeout
                                .as_deref()
                                .copied()
                                .unwrap_or(state.config.chord_timeout),
                        })
                        .collect(),

                    binds: ast::Bind::compile(&statment.rhs, state),
                    behavior: ast::Behavior::compile(
                        behavior
                            .as_deref()
                            .copied()
                            .unwrap_or(state.config.default_behavior),
                    ),
                })]
            }
            ast::Trigger::Sequence(keys, behavior, timeout) => {
                vec![Remapping::Sequence(SequenceRemapping {
                    triggers: keys
                        .iter()
                        .flat_map(|k| {
                            [
                                AdvancedTrigger::KeyPress { value: k.value },
                                AdvancedTrigger::KeyRelease { value: k.value },
                            ]
                        })
                        .intersperse_with(|| AdvancedTrigger::MaximumWait {
                            duration: timeout
                                .as_deref()
                                .copied()
                                .unwrap_or(state.config.sequence_timeout),
                        })
                        .collect(),

                    binds: ast::Bind::compile(&statment.rhs, state),
                    behavior: ast::Behavior::compile(
                        behavior
                            .as_deref()
                            .copied()
                            .unwrap_or(state.config.default_behavior),
                    ),
                })]
            }
            ast::Trigger::Combo(keys, behavior, timeout) => {
                vec![Remapping::Sequence(SequenceRemapping {
                    triggers: keys
                        .iter()
                        .flat_map(|specified_key| match specified_key.value {
                            ast::Key::Unspecified(key) => [
                                Some(AdvancedTrigger::KeyPress { value: key.value }),
                                Some(AdvancedTrigger::KeyRelease { value: key.value }),
                            ],
                            ast::Key::Down(key) => {
                                [Some(AdvancedTrigger::KeyPress { value: key.value }), None]
                            }
                            ast::Key::Up(key) => {
                                [Some(AdvancedTrigger::KeyRelease { value: key.value }), None]
                            }
                        })
                        .flatten()
                        .intersperse_with(|| AdvancedTrigger::MaximumWait {
                            duration: timeout
                                .as_deref()
                                .copied()
                                .unwrap_or(state.config.combo_timeout),
                        })
                        .collect(),

                    binds: ast::Bind::compile(&statment.rhs, state),
                    behavior: ast::Behavior::compile(
                        behavior
                            .as_deref()
                            .copied()
                            .unwrap_or(state.config.default_behavior),
                    ),
                })]
            }
        }
    }

    fn try_key_swap(statment: &Spanned<Self>) -> Option<Vec<Remapping>> {
        if let ast::Trigger::Key(trigger_key) = statment.lhs.value
            && statment.rhs.len() == 1
            && let ast::Bind::Key(bind_key) = statment.rhs[0].value
            && let (Some(trigger_key_ident), Some(bind_key_ident)) = (
                trigger_key.value.is_basic_key(),
                bind_key.value.is_basic_key(),
            )
        {
            let remappings = vec![
                Remapping::Basic(BasicRemapping {
                    trigger: BasicTrigger::KeyPress {
                        value: trigger_key_ident,
                    },
                    binds: vec![Bind::PressKey {
                        value: bind_key_ident,
                    }],
                }),
                Remapping::Basic(BasicRemapping {
                    trigger: BasicTrigger::KeyRelease {
                        value: trigger_key_ident,
                    },
                    binds: vec![Bind::ReleaseKey {
                        value: bind_key_ident,
                    }],
                }),
            ];
            return Some(remappings);
        }
        None
    }
}
impl ast::Behavior {
    fn compile(self) -> Behavior {
        match self {
            ast::Behavior::Capture => Behavior::Capture,
            ast::Behavior::Release => Behavior::Release,
            ast::Behavior::Wait => Behavior::Default,
        }
    }
}
impl ast::Bind {
    fn compile(binds: &[Spanned<ast::Bind>], state: &mut LayerCompilationState) -> Vec<Bind> {
        let mut result_binds = Vec::new();
        for bind in binds {
            match &bind.value {
                ast::Bind::Key(key) => match key.value {
                    ast::Key::Unspecified(key_ident) => {
                        result_binds.push(Bind::PressKey {
                            value: key_ident.value,
                        });
                        result_binds.push(Bind::ReleaseKey {
                            value: key_ident.value,
                        });
                    }
                    ast::Key::Down(key_ident) => {
                        result_binds.push(Bind::PressKey {
                            value: key_ident.value,
                        });
                    }
                    ast::Key::Up(key_ident) => {
                        result_binds.push(Bind::ReleaseKey {
                            value: key_ident.value,
                        });
                    }
                },
                ast::Bind::None => (),
                ast::Bind::ChangeLayer(layer_name) => result_binds.push(Bind::SwitchLayer {
                    value: *state
                        .layers
                        .get(&layer_name.value)
                        .expect("layer must exist after checking the profile"),
                }),
                ast::Bind::Run {
                    interpreter,
                    script,
                } => result_binds.push(Bind::RunScript {
                    interpreter: interpreter.value.clone(),
                    script: script.value.clone(),
                }),
                ast::Bind::OpenApp(Spanned { value: name, .. }) => {
                    #[cfg(target_os = "macos")]
                    let (interpreter, script) =
                        ("sh".to_string(), format!(r#"open -a "{}""#, name));

                    #[cfg(target_os = "linux")]
                    let (interpreter, script) = ("sh".to_string(), name.clone());

                    #[cfg(target_os = "windows")]
                    let (interpreter, script) =
                        ("cmd.exe".to_string(), format!(r#"start "" "{}""#, name));

                    result_binds.push(Bind::RunScript {
                        interpreter,
                        script,
                    });
                }
            }
        }
        result_binds
    }
}

fn conflicting_binds(fst: Span, snd: Span) -> miette::Report {
    miette::miette!(
        severity = Severity::Error,
        labels = vec![
            LabeledSpan::new(None, fst.start(), fst.end()),
            LabeledSpan::new(None, snd.start(), snd.end()),
        ],
        "Conflicting statments"
    )
}

#[rustfmt::skip]
impl KeyIdent {
    pub fn to_keybinder_key(&self) -> &'static str {
        use KeyIdent::*;
        match self {
            // Letters
            A => "A", B => "B", C => "C", D => "D", E => "E", F => "F",
            G => "G", H => "H", I => "I", J => "J", K => "K", L => "L",
            M => "M", N => "N", O => "O", P => "P", Q => "Q", R => "R",
            S => "S", T => "T", U => "U", V => "V", W => "W", X => "X",
            Y => "Y", Z => "Z",

            // Digits
            Num0 => "0", Num1 => "1", Num2 => "2", Num3 => "3", Num4 => "4",
            Num5 => "5", Num6 => "6", Num7 => "7", Num8 => "8", Num9 => "9",

            // Function keys
            F1 => "F1", F2 => "F2", F3 => "F3", F4 => "F4", F5 => "F5",
            F6 => "F6", F7 => "F7", F8 => "F8", F9 => "F9", F10 => "F10",
            F11 => "F11", F12 => "F12",

            // Modifiers
            ShiftLeft => "LeftShift", ShiftRight => "RightShift",
            CtrlLeft => "LeftControl" ,
            CtrlRight => "RightControl",
            //TODO: keycodes are like this in the clickr applications
            // CtrlLeft => if cfg!(target_os = "macos") { "Control" } else { "CtrlLeft" },
            // CtrlRight => if cfg!(target_os = "macos") { "Control" } else { "CtrlRight" },
            // AltLeft => if cfg!(target_os = "macos") { "OptionLeft" } else { "AltLeft" },
            // AltRight => if cfg!(target_os = "macos") { "OptionRight" } else { "AltRight" },
            // MetaLeft => if cfg!(target_os = "macos") { "CommandLeft" } else { "WinLeft" },
            // MetaRight => if cfg!(target_os = "macos") { "CommandRight" } else { "WinRight" },
            // MetaLeft => if cfg!(target_os = "macos") { "CommandLeft" } else { "WinLeft" },
            // MetaRight => if cfg!(target_os = "macos") { "CommandRight" } else { "WinRight" },
            AltLeft => "LeftAlt" ,
            AltRight =>  "RightAlt",
            MetaLeft => "LeftSuper",
            MetaRight => "RightSuper",

            // Navigation / editing
            Esc => "Escape", Tab => "Tab", CapsLock => "CapsLock", Enter => "Enter",
            Backspace => "Backspace", Space => "Space",
            Insert => "Insert", Delete => "Delete", Home => "Home", End => "End",
            PageUp => "PageUp", PageDown => "PageDown",

            // Arrows
            Up => "ArrowUp", Down => "ArrowDown", Left => "ArrowLeft", Right => "ArrowRight",

            // Symbols
            Minus => "-", Equals => "=", LeftBracket => "[", RightBracket => "]",
            Backslash => "\\", Semicolon => ";", Quote => "'", Comma => ",",
            Period => ".", Slash => "/", Grave => "`",
        }
    }
}

pub fn serialize_key<S>(key: &KeyIdent, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = key.to_keybinder_key();
    serializer.serialize_str(&s)
}
