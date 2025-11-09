use crate::ast::key::KeyIdent;
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

#[derive(Debug, Serialize)]
pub struct BasicRemapping {
    pub trigger: BasicTrigger,
    pub binds: Vec<Bind>,
    pub behavior: Behavior,
}

#[derive(Debug, Serialize)]
pub struct SequenceRemapping {
    pub triggers: Vec<AdvancedTrigger>,
    pub binds: Vec<Bind>,
    pub behavior: Behavior,
}

#[derive(Debug, Serialize)]
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
}

#[derive(Debug, Serialize)]
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
        value: u64,
    },
    MaximumWait {
        value: u64,
    },
}

#[derive(Debug, Serialize)]
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
        value: u64,
    },
    RunScript {
        interpreter: String,
        script: String,
    },
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Behavior {
    Capture,
    Release,
    Default,
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
            ShiftLeft => "ShiftLeft", ShiftRight => "ShiftRight",
            CtrlLeft => if cfg!(target_os = "macos") { "Control" } else { "CtrlLeft" },
            CtrlRight => if cfg!(target_os = "macos") { "Control" } else { "CtrlRight" },
            AltLeft => if cfg!(target_os = "macos") { "OptionLeft" } else { "AltLeft" },
            AltRight => if cfg!(target_os = "macos") { "OptionRight" } else { "AltRight" },
            MetaLeft => if cfg!(target_os = "macos") { "CommandLeft" } else { "WinLeft" },
            MetaRight => if cfg!(target_os = "macos") { "CommandRight" } else { "WinRight" },

            // Navigation / editing
            Esc => "Esc", Tab => "Tab", CapsLock => "CapsLock", Enter => "Enter",
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
