use crate::{
    ast::keys::KeyIdent,
    lex::TokenType,
    parse::{
        expect_tokens, next_match, parse_optional_trigger_args, parse_sequence,
        parse_sequence_trailing, parse_square_bracket_list, Parse,
    },
};
use miette::{miette, LabeledSpan, NamedSource, Severity};

mod keys;

#[derive(Debug, Clone)]
pub struct Profile {
    name: String,
    config: Config,
    layers: Box<[Layer]>,
}

impl Parse for Profile {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        if next_match!(ts, TokenType::Newline) {
            expect_tokens(ts, [TokenType::Newline])?;
        }
        expect_tokens(ts, [TokenType::Profile])?;
        let name = String::parse(ts)?;
        expect_tokens(ts, [TokenType::Newline])?;
        let config = Config::parse(ts)?;
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
    entries: Box<[ConfigEntry]>,
}

impl Parse for Config {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
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
    DefaultLayer(String),
    DefaultBehavior(Behavior),
    TapTimeout(usize),
    HoldTime(usize),
    ChordTimeout(usize),
    SequenceTimeout(usize),
    ComboTimeout(usize),
    Advanced(bool),
}

impl Parse for ConfigEntry {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        let [ident_token, eq_token] = expect_tokens(ts, [TokenType::Ident, TokenType::Equals])?;
        Ok(match ident_token.bytes() {
            "default_layer" => ConfigEntry::DefaultLayer(String::parse(ts)?),
            "default_behavior" => ConfigEntry::DefaultBehavior(Behavior::parse(ts)?),
            "tap_timeout" => ConfigEntry::TapTimeout(usize::parse(ts)?),
            "hold_time" => ConfigEntry::HoldTime(usize::parse(ts)?),
            "chord_timeout" => ConfigEntry::ChordTimeout(usize::parse(ts)?),
            "sequence_timeout" => ConfigEntry::SequenceTimeout(usize::parse(ts)?),
            "combo_timeout" => ConfigEntry::ComboTimeout(usize::parse(ts)?),
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

#[derive(Debug, Clone)]
pub enum Behavior {
    Capture,
    Release,
    Wait,
}

impl Parse for Behavior {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        let next_token = ts.peek();
        match next_token.map(|t| t.kind()) {
            Some(TokenType::Capture) => Ok(Behavior::Capture),
            Some(TokenType::Release) => Ok(Behavior::Release),
            Some(TokenType::Wait) => Ok(Behavior::Wait),
            Some(t) => {
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
    name: String,
    statements: Box<[Statement]>,
}
impl Parse for Layer {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        expect_tokens(ts, [TokenType::Layer])?;
        let name = String::parse(ts)?;
        expect_tokens(ts, [TokenType::LCurly])?;
        let statements = parse_sequence_trailing(ts, TokenType::Newline, TokenType::RCurly)?;
        expect_tokens(ts, [TokenType::RCurly])?;
        return Ok(Self { name, statements });
    }
}

#[derive(Debug, Clone)]
pub struct Statement {
    lhs: Trigger,
    rhs: Box<[Bind]>,
}
impl Parse for Statement {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        let lhs = Trigger::parse(ts)?;
        expect_tokens(ts, [TokenType::Equals])?;
        let rhs = if next_match!(ts, TokenType::LSquare) {
            parse_square_bracket_list(ts)?
        } else {
            vec![Bind::parse(ts)?].into_boxed_slice()
        };

        Ok(Self { lhs, rhs })
    }
}

#[derive(Debug, Clone)]
pub enum Trigger {
    Key(Key),
    Chord(Box<[KeyIdent]>, Option<Behavior>, Option<usize>),
    Sequence(Box<[KeyIdent]>, Option<Behavior>, Option<usize>),
    Tap(KeyIdent, Option<Behavior>, Option<usize>),
    Hold(KeyIdent, Option<Behavior>, Option<usize>),
    Combo(Box<[Key]>, Option<Behavior>, Option<usize>),
}
impl Parse for Trigger {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        match ts.peek_type() {
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
                let key = KeyIdent::parse(ts)?;
                expect_tokens(ts, [TokenType::Comma])?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Tap(key, behavior, timeout))
            }

            Some(TokenType::Hold) => {
                expect_tokens(ts, [TokenType::Tap, TokenType::LParen])?;
                let key = KeyIdent::parse(ts)?;
                expect_tokens(ts, [TokenType::Comma])?;
                let (behavior, timeout) = parse_optional_trigger_args(ts)?;
                Ok(Trigger::Hold(key, behavior, timeout))
            }
            Some(TokenType::Combo) => {
                expect_tokens(ts, [TokenType::Chord, TokenType::LParen])?;
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
    None,
    ChangeLayer(String),
    Run { interpreter: String, script: String },
    OpenApp(String),
}

impl Parse for Bind {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        match ts.peek_type() {
            Some(TokenType::NoneKw) => {
                expect_tokens(ts, [TokenType::NoneKw])?;
                Ok(Bind::None)
            }
            Some(TokenType::Layer) => {
                expect_tokens(ts, [TokenType::Layer, TokenType::LParen])?;
                let new_layer = String::parse(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Bind::ChangeLayer(new_layer))
            }
            Some(TokenType::Run) => {
                expect_tokens(ts, [TokenType::Run, TokenType::LParen])?;
                let interpreter = String::parse(ts)?;
                expect_tokens(ts, [TokenType::Comma])?;
                let script = String::parse(ts)?;
                expect_tokens(ts, [TokenType::RParen])?;
                Ok(Bind::Run {
                    interpreter,
                    script,
                })
            }
            Some(TokenType::OpenApp) => {
                expect_tokens(ts, [TokenType::Layer, TokenType::LParen])?;
                let app_name = String::parse(ts)?;
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

#[derive(Debug, Clone)]
pub enum Key {
    Unspecified(KeyIdent),
    Down(KeyIdent),
    Up(KeyIdent),
}

impl Parse for Key {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        Ok(if next_match!(ts, TokenType::Caret) {
            expect_tokens(ts, [TokenType::Caret])?;
            Key::Up(KeyIdent::parse(ts)?)
        } else if next_match!(ts, TokenType::Underscore) {
            expect_tokens(ts, [TokenType::Caret])?;
            Key::Down(KeyIdent::parse(ts)?)
        } else {
            Key::Unspecified(KeyIdent::parse(ts)?)
        })
    }
}

impl Parse for KeyIdent {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        let (token, result) = if next_match!(ts, TokenType::StringLit) {
            let [str_token] = expect_tokens(ts, [TokenType::StringLit])?;
            let str_with_quotes = str_token.bytes();
            (
                str_token,
                (&str_with_quotes[1..str_with_quotes.len() - 1]).parse(),
            )
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
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
        let [str_token] = expect_tokens(ts, [TokenType::StringLit])?;
        let str_with_quotes = str_token.bytes();
        assert!(str_with_quotes.len() >= 2);
        Ok(String::from(&str_with_quotes[1..str_with_quotes.len() - 1]))
    }
}

impl Parse for usize {
    fn parse(ts: &mut crate::parse::TokenStream<'_>) -> miette::Result<Self> {
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
