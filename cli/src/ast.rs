use crate::{
    ast::key::KeyIdent,
    lex::TokenType,
    parse::{
        expect_tokens, next_match, parse_optional_trigger_args, parse_sequence_trailing,
        parse_square_bracket_list, Parse, TokenStream,
    },
    utils::Spanned,
};
use miette::{miette, LabeledSpan, Severity};

pub mod key;

#[derive(Debug, Clone)]
pub struct Profile {
    pub name: Spanned<String>,
    pub config: Spanned<Config>,
    pub layers: Box<[Spanned<Layer>]>,
}

impl Parse for Profile {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        if next_match!(ts, TokenType::Newline) {
            expect_tokens(ts, [TokenType::Newline])?;
        }
        expect_tokens(ts, [TokenType::Profile])?;
        let name = String::parse_spanned(ts)?;
        expect_tokens(ts, [TokenType::Newline])?;
        let config = Config::parse_spanned(ts)?;
        expect_tokens(ts, [TokenType::Newline])?;
        let layers = parse_sequence_trailing(ts, TokenType::Newline, TokenType::Eof)?;
        Ok(Self {
            name,
            config,
            layers,
        })
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub entries: Box<[Spanned<ConfigEntry>]>,
}

impl Parse for Config {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        expect_tokens(
            ts,
            [TokenType::Config, TokenType::LCurly, TokenType::Newline],
        )?;
        let entries = parse_sequence_trailing(ts, TokenType::Newline, TokenType::RCurly)?;

        expect_tokens(ts, [TokenType::RCurly])?;

        Ok(Self { entries })
    }
}

#[derive(Debug, Clone)]
pub enum ConfigEntry {
    DefaultLayer(Spanned<String>),
    DefaultBehavior(Spanned<Behavior>),
    TapTimeout(Spanned<usize>),
    HoldTime(Spanned<usize>),
    ChordTimeout(Spanned<usize>),
    SequenceTimeout(Spanned<usize>),
    ComboTimeout(Spanned<usize>),
    Advanced(bool),
}

impl Parse for ConfigEntry {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let [ident_token, _] = expect_tokens(ts, [TokenType::Ident, TokenType::Equals])?;
        Ok(match ident_token.bytes() {
            "default_layer" => ConfigEntry::DefaultLayer(String::parse_spanned(ts)?),
            "default_behavior" => ConfigEntry::DefaultBehavior(Behavior::parse_spanned(ts)?),
            "tap_timeout" => ConfigEntry::TapTimeout(usize::parse_spanned(ts)?),
            "hold_time" => ConfigEntry::HoldTime(usize::parse_spanned(ts)?),
            "chord_timeout" => ConfigEntry::ChordTimeout(usize::parse_spanned(ts)?),
            "sequence_timeout" => ConfigEntry::SequenceTimeout(usize::parse_spanned(ts)?),
            "combo_timeout" => ConfigEntry::ComboTimeout(usize::parse_spanned(ts)?),
            "advanced" => todo!(),
            _ => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!("invalid config entry {}", ident_token.bytes())),
                        ident_token.start(),
                        ident_token.bytes().len()
                    )],
                    "Unexpected configuration entry"
                ))
            }
        })
    }
}

impl ConfigEntry {
    pub fn get_timeout(&self) -> Option<usize> {
        match self {
            ConfigEntry::TapTimeout(t)
            | ConfigEntry::HoldTime(t)
            | ConfigEntry::ChordTimeout(t)
            | ConfigEntry::SequenceTimeout(t)
            | ConfigEntry::ComboTimeout(t) => Some(t.value),
            _ => None,
        }
    }
}

impl Config {
    pub fn to_data(&self) -> ConfigData {
        let mut data = ConfigData::default();

        for entry in self.entries.iter().rev() {
            match &entry.value {
                ConfigEntry::DefaultLayer(v) => data.default_layer = Some(v.value.clone()),
                ConfigEntry::DefaultBehavior(v) => data.default_behavior = v.value,
                ConfigEntry::TapTimeout(v) => data.tap_timeout = v.value,
                ConfigEntry::HoldTime(v) => data.hold_time = v.value,
                ConfigEntry::ChordTimeout(v) => data.chord_timeout = v.value,
                ConfigEntry::SequenceTimeout(v) => data.sequence_timeout = v.value,
                ConfigEntry::ComboTimeout(v) => data.combo_timeout = v.value,
                ConfigEntry::Advanced(v) => data.advanced = *v,
            }
        }

        data
    }
}

const DEFULT_TIMEOUT: usize = 200;

#[derive(Debug, Clone)]
pub struct ConfigData {
    pub default_layer: Option<String>,
    pub default_behavior: Behavior,
    pub tap_timeout: usize,
    pub hold_time: usize,
    pub chord_timeout: usize,
    pub sequence_timeout: usize,
    pub combo_timeout: usize,
    pub advanced: bool,
}

impl Default for ConfigData {
    fn default() -> Self {
        Self {
            default_layer: None,
            default_behavior: Behavior::default(),
            tap_timeout: DEFULT_TIMEOUT,
            hold_time: DEFULT_TIMEOUT,
            chord_timeout: DEFULT_TIMEOUT,
            sequence_timeout: DEFULT_TIMEOUT,
            combo_timeout: DEFULT_TIMEOUT,
            advanced: false,
        }
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub enum Behavior {
    Capture,
    Release,
    #[default]
    Wait,
}

impl Parse for Behavior {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let next_token = ts.next();
        match next_token.map(|t| t.kind()) {
            Some(TokenType::Capture) => Ok(Behavior::Capture),
            Some(TokenType::Release) => Ok(Behavior::Release),
            Some(TokenType::Wait) => Ok(Behavior::Wait),
            Some(_) => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!(
                            "expected: behavior, found: {}",
                            next_token.unwrap().kind()
                        )),
                        next_token.unwrap().start(),
                        next_token.unwrap().bytes().len()
                    )],
                    "Unexpected token found"
                ))
            }
            None => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::at_offset(
                        ts.lexer().bytes().len() - 1,
                        "expected: behavior"
                    )],
                    "Missing expected token"
                ))
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct Layer {
    pub name: Spanned<String>,
    pub statements: Box<[Spanned<Statement>]>,
}
impl Parse for Layer {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        expect_tokens(ts, [TokenType::Layer])?;
        let name = String::parse_spanned(ts)?;
        expect_tokens(ts, [TokenType::LCurly, TokenType::Newline])?;
        let statements = parse_sequence_trailing(ts, TokenType::Newline, TokenType::RCurly)?;
        expect_tokens(ts, [TokenType::RCurly])?;
        return Ok(Self { name, statements });
    }
}

#[derive(Debug, Clone)]
pub struct Statement {
    pub lhs: Spanned<Trigger>,
    pub rhs: Box<[Spanned<Bind>]>,
}
impl Parse for Statement {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let lhs = Trigger::parse_spanned(ts)?;
        expect_tokens(ts, [TokenType::Equals])?;
        let rhs = if next_match!(ts, TokenType::LSquare) {
            parse_square_bracket_list(ts)?
        } else {
            vec![Bind::parse_spanned(ts)?].into_boxed_slice()
        };

        Ok(Self { lhs, rhs })
    }
}

#[derive(Debug, Clone)]
pub enum Trigger {
    Key(Spanned<Key>),
    AppFocused(Spanned<String>),
    Chord(
        Box<[Spanned<KeyIdent>]>,
        Option<Spanned<Behavior>>,
        Option<Spanned<usize>>,
    ),
    Sequence(
        Box<[Spanned<KeyIdent>]>,
        Option<Spanned<Behavior>>,
        Option<Spanned<usize>>,
    ),
    Tap(
        Spanned<KeyIdent>,
        Option<Spanned<Behavior>>,
        Option<Spanned<usize>>,
    ),
    Hold(
        Spanned<KeyIdent>,
        Option<Spanned<Behavior>>,
        Option<Spanned<usize>>,
    ),
    Combo(
        Box<[Spanned<Key>]>,
        Option<Spanned<Behavior>>,
        Option<Spanned<usize>>,
    ),
}
impl Parse for Trigger {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        match ts.peek_type() {
            Some(TokenType::Ident)
            | Some(TokenType::StringLit)
            | Some(TokenType::IntLit)
            | Some(TokenType::Caret)
            | Some(TokenType::Underscore) => Ok(Trigger::Key(Key::parse_spanned(ts)?)),
            Some(TokenType::AppFocused) => {
                expect_tokens(ts, [TokenType::AppFocused, TokenType::LParen])?;
                let app_name = String::parse_spanned(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Trigger::AppFocused(app_name))
            }
            Some(TokenType::Chord) => {
                expect_tokens(ts, [TokenType::Chord, TokenType::LParen])?;
                let keys = parse_square_bracket_list(ts)?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Chord(keys, behavior, timeout))
            }
            Some(TokenType::Sequence) => {
                expect_tokens(ts, [TokenType::Sequence, TokenType::LParen])?;
                let keys = parse_square_bracket_list(ts)?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Sequence(keys, behavior, timeout))
            }

            Some(TokenType::Tap) => {
                expect_tokens(ts, [TokenType::Tap, TokenType::LParen])?;
                let key = KeyIdent::parse_spanned(ts)?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Tap(key, behavior, timeout))
            }

            Some(TokenType::Hold) => {
                expect_tokens(ts, [TokenType::Hold, TokenType::LParen])?;
                let key = KeyIdent::parse_spanned(ts)?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Hold(key, behavior, timeout))
            }
            Some(TokenType::Combo) => {
                expect_tokens(ts, [TokenType::Combo, TokenType::LParen])?;
                let keys = parse_square_bracket_list(ts)?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Combo(keys, behavior, timeout))
            }
            Some(_) => {
                let unexpected_token = ts.peek().unwrap();
                Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!(
                            "expected: left side of statment, found: {}",
                            unexpected_token.kind()
                        )),
                        unexpected_token.start(),
                        unexpected_token.bytes().len()
                    )],
                    "Unexpected token found"
                ))
            }
            None => Err(miette!(
                severity = Severity::Error,
                labels = vec![LabeledSpan::at_offset(
                    ts.lexer().bytes().len() - 1,
                    "expected: left side of statment"
                )],
                "Missing expected statement"
            )),
        }
    }
}

#[derive(Debug, Clone)]
pub enum Bind {
    Key(Spanned<Key>),
    None,
    ChangeLayer(Spanned<String>),
    Run {
        interpreter: Spanned<String>,
        script: Spanned<String>,
    },
    OpenApp(Spanned<String>),
}

impl Parse for Bind {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        match ts.peek_type() {
            Some(TokenType::Ident)
            | Some(TokenType::StringLit)
            | Some(TokenType::Caret)
            | Some(TokenType::Underscore) => Ok(Bind::Key(Key::parse_spanned(ts)?)),
            Some(TokenType::NoneKw) => {
                expect_tokens(ts, [TokenType::NoneKw])?;
                Ok(Bind::None)
            }
            Some(TokenType::Layer) => {
                expect_tokens(ts, [TokenType::Layer, TokenType::LParen])?;
                let new_layer = String::parse_spanned(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Bind::ChangeLayer(new_layer))
            }
            Some(TokenType::Run) => {
                expect_tokens(ts, [TokenType::Run, TokenType::LParen])?;
                let interpreter = String::parse_spanned(ts)?;
                expect_tokens(ts, [TokenType::Comma])?;
                let script = String::parse_spanned(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Bind::Run {
                    interpreter,
                    script,
                })
            }
            Some(TokenType::OpenApp) => {
                expect_tokens(ts, [TokenType::OpenApp, TokenType::LParen])?;
                let app_name = String::parse_spanned(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Bind::OpenApp(app_name))
            }
            Some(_) => {
                let unexpected_token = ts.peek().unwrap();
                Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!(
                            "expected: right side of statment, found: {}",
                            unexpected_token.kind()
                        )),
                        unexpected_token.start(),
                        unexpected_token.bytes().len()
                    )],
                    "Unexpected token found"
                ))
            }
            None => Err(miette!(
                severity = Severity::Error,
                labels = vec![LabeledSpan::at_offset(
                    ts.lexer().bytes().len() - 1,
                    "expected: right side of statment"
                )],
                "Missing expected statement"
            )),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Key {
    Unspecified(Spanned<KeyIdent>),
    Down(Spanned<KeyIdent>),
    Up(Spanned<KeyIdent>),
}
impl Key {
    pub fn is_basic_key(self) -> Option<KeyIdent> {
        match self {
            Key::Unspecified(k) => Some(k.value),
            _ => None,
        }
    }
}

impl Parse for Key {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        Ok(if next_match!(ts, TokenType::Caret) {
            expect_tokens(ts, [TokenType::Caret])?;
            Key::Up(KeyIdent::parse_spanned(ts)?)
        } else if next_match!(ts, TokenType::Underscore) {
            expect_tokens(ts, [TokenType::Underscore])?;
            Key::Down(KeyIdent::parse_spanned(ts)?)
        } else {
            Key::Unspecified(KeyIdent::parse_spanned(ts)?)
        })
    }
}

impl Parse for KeyIdent {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let (token, result) = if next_match!(ts, TokenType::StringLit) {
            let [str_token] = expect_tokens(ts, [TokenType::StringLit])?;
            let str_with_quotes = str_token.bytes();
            (
                str_token,
                (&str_with_quotes[1..str_with_quotes.len() - 1]).parse(),
            )
        } else if next_match!(ts, TokenType::IntLit) {
            let [int_token] = expect_tokens(ts, [TokenType::IntLit])?;
            (int_token, int_token.bytes().parse())
        } else {
            let [ident_token] = expect_tokens(ts, [TokenType::Ident])?;
            (ident_token, ident_token.bytes().parse())
        };

        result.map_err(|_| {
            miette!(
                severity = Severity::Error,
                labels = vec![LabeledSpan::new(
                    Some(format!("expected: key, found: {}", token.bytes())),
                    token.start(),
                    token.bytes().len()
                )],
                "Unexpected key found"
            )
        })
    }
}

impl Parse for String {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let [str_token] = expect_tokens(ts, [TokenType::StringLit])?;
        let str_with_quotes = str_token.bytes();
        assert!(str_with_quotes.len() >= 2);
        Ok(String::from(&str_with_quotes[1..str_with_quotes.len() - 1]))
    }
}

impl Parse for usize {
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self> {
        let [int_token] = expect_tokens(ts, [TokenType::IntLit])?;
        match int_token.bytes().parse() {
            Ok(i) => Ok(i),
            _ => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some("Invalid integer literal".to_string()),
                        int_token.start(),
                        int_token.bytes().len()
                    )],
                    "Integer literal outside of range"
                ))
            }
        }
    }
}
