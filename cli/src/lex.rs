//! Lexer for the keyboard profile language

use crate::utils::{exit_with_error, Span};
use core::{
    fmt::{self, Display},
    str,
};
use miette::{miette, LabeledSpan, NamedSource, Severity};
use regex::bytes::Regex;
use std::{fmt::Formatter, sync::LazyLock};

static IDENT_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new("^[a-zA-Z][a-zA-Z0-9_]*").expect("regex invalid"));

static STRING_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"^"[^"]*""#).expect("regex invalid"));

static INT_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new("^[0-9]+").expect("regex invalid"));

fn bytes_to_keyword(bytes: &[u8]) -> Option<TokenType> {
    match bytes {
        b"profile" => Some(TokenType::Profile),
        b"config" => Some(TokenType::Config),
        b"layer" => Some(TokenType::Layer),
        b"tap" => Some(TokenType::Tap),
        b"hold" => Some(TokenType::Hold),
        b"chord" => Some(TokenType::Chord),
        b"sequence" => Some(TokenType::Sequence),
        b"combo" => Some(TokenType::Combo),
        b"run" => Some(TokenType::Run),
        b"open_app" => Some(TokenType::OpenApp),
        b"none" => Some(TokenType::NoneKw),
        b"capture" => Some(TokenType::Capture),
        b"release" => Some(TokenType::Release),
        b"wait" => Some(TokenType::Wait),
        b"true" => Some(TokenType::True),
        b"false" => Some(TokenType::False),
        _ => None,
    }
}

#[derive(Debug, Clone, Copy)]
pub struct Lexer<'a> {
    source_name: &'a str,
    bytes: &'a [u8],
    cur: usize,
}

impl<'a> Lexer<'a> {
    pub fn new(source_name: &'a str, source: &'a str) -> Self {
        Lexer {
            source_name,
            bytes: source.as_bytes(),
            cur: 0,
        }
    }

    fn create_token(&mut self, kind: TokenType, len: usize) -> Token<'a> {
        let token = Token {
            start: self.cur,
            bytes: str::from_utf8(&self.bytes[self.cur..(self.cur + len)])
                .expect("lexer bytes must come from a string"),
            kind,
        };
        self.cur += len;
        token
    }
}

impl<'a> Iterator for Lexer<'a> {
    type Item = Token<'a>;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            match self.bytes.get(self.cur) {
                None => return None,

                Some(b' ') | Some(b'\t') => {
                    // let m = COMMENT_WHITESPACE_REGEX
                    //     .find(&self.bytes[self.cur..])
                    //     .unwrap();
                    self.cur += 1;
                    continue;
                }
                Some(b'#') => {
                    while let Some(&b) = self.bytes.get(self.cur) {
                        if b == b'\n' {
                            break; // stop at the newline, do not consume it
                        }
                        self.cur += 1;
                    }
                    continue;
                }

                Some(b'\n') => return Some(self.create_token(TokenType::Newline, 1)),

                Some(b'{') => return Some(self.create_token(TokenType::LCurly, 1)),
                Some(b'}') => return Some(self.create_token(TokenType::RCurly, 1)),
                Some(b'(') => return Some(self.create_token(TokenType::LParen, 1)),
                Some(b')') => return Some(self.create_token(TokenType::RParen, 1)),
                Some(b'[') => return Some(self.create_token(TokenType::LSquare, 1)),
                Some(b']') => return Some(self.create_token(TokenType::RSquare, 1)),
                Some(b',') => return Some(self.create_token(TokenType::Comma, 1)),
                Some(b'=') => return Some(self.create_token(TokenType::Equals, 1)),
                Some(b'^') => return Some(self.create_token(TokenType::Caret, 1)),
                Some(b'_') => return Some(self.create_token(TokenType::Underscore, 1)),

                Some(b'0'..=b'9') => {
                    let int_lit = INT_REGEX.find(&self.bytes[self.cur..]).unwrap();
                    return Some(self.create_token(TokenType::IntLit, int_lit.end()));
                }

                Some(b'"') => match STRING_REGEX.find(&self.bytes[self.cur..]) {
                    Some(str_lit) => {
                        return Some(self.create_token(TokenType::StringLit, str_lit.end()))
                    }
                    None => exit_with_error(
                        miette!(
                            severity = Severity::Error,
                            labels = vec![LabeledSpan::at_offset(self.cur, "Unterminated string")],
                            "String literal must end on the same line"
                        )
                        .with_source_code(NamedSource::new(self.source_name, self.bytes.to_vec())),
                    ),
                },

                Some(b'a'..=b'z') | Some(b'A'..=b'Z') => {
                    let var = IDENT_REGEX
                        .find(&self.bytes[self.cur..])
                        .unwrap()
                        .as_bytes();
                    let kind = bytes_to_keyword(var).unwrap_or(TokenType::Variable);
                    return Some(self.create_token(kind, var.len()));
                }

                Some(b'\t') | Some(b'\r') | Some(128..) => exit_with_error(
                    miette!(
                        severity = Severity::Error,
                        labels = vec![LabeledSpan::at_offset(self.cur, "Invalid character")],
                        "Invalid character in profile"
                    )
                    .with_source_code(NamedSource::new(self.source_name, self.bytes.to_vec())),
                ),

                Some(_) => exit_with_error(
                    miette!(
                        severity = Severity::Error,
                        labels = vec![LabeledSpan::at_offset(self.cur, "Unexpected character")],
                        "Unexpected character in profile"
                    )
                    .with_source_code(NamedSource::new(self.source_name, self.bytes.to_vec())),
                ),
            }
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Token<'a> {
    start: usize,
    bytes: &'a str,
    kind: TokenType,
}

impl Token<'_> {
    pub fn kind(&self) -> TokenType {
        self.kind
    }

    pub fn loc(&self) -> Span {
        Span::new(self.start, self.bytes.len())
    }

    pub fn start(&self) -> usize {
        self.start
    }

    pub fn bytes(&self) -> &str {
        self.bytes
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    Profile,
    Config,
    Layer,
    Tap,
    Hold,
    Chord,
    Sequence,
    Combo,
    Run,
    OpenApp,
    NoneKw,
    Capture,
    Release,
    Wait,
    True,
    False,
    Variable,
    IntLit,
    StringLit,
    Equals,
    Comma,
    LCurly,
    RCurly,
    LParen,
    RParen,
    LSquare,
    RSquare,
    Colon,
    Newline,
    Caret,
    Underscore,
}

impl Display for TokenType {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
