use std::collections::VecDeque;

use crate::{
    ast::Behavior,
    lex::{Lexer, Token, TokenType},
    utils::{Span, Spanned},
};
use miette::{miette, LabeledSpan, Severity};

/// Something that can be parsed from a token stream
pub trait Parse: Sized {
    fn parse_spanned(ts: &mut TokenStream<'_>) -> miette::Result<Spanned<Self>> {
        let start = ts.peek().map(|t| t.loc()).unwrap_or_default();
        let value = Self::parse(ts)?;
        let end = ts.prev_token.map(|t| t.loc()).unwrap_or_default();
        let next = ts.peek().map(|t| t.loc()).unwrap_or_default();
        // No tokens consumed
        let span = if start == next {
            Span::new(start.start(), 0)
        } else {
            start.join(end)
        };
        Ok(Spanned::new(value, span))
    }
    fn parse(ts: &mut TokenStream<'_>) -> miette::Result<Self>;
}

/// Parses P delimiter ... P and returns a boxed slice of P
/// Does not consume the terminating token or delimiter
pub fn parse_sequence<P: Parse>(
    ts: &mut TokenStream,
    delimiter: TokenType,
    terminator: TokenType,
) -> miette::Result<Box<[Spanned<P>]>> {
    let mut items = Vec::new();

    // Check for empty sequences
    if ts.peek_type() == Some(terminator) {
        return Ok(items.into_boxed_slice());
    }

    loop {
        items.push(P::parse_spanned(ts)?);
        if ts.peek_type() != Some(delimiter) {
            break;
        }
        expect_tokens(ts, [delimiter])?;
    }

    Ok(items.into_boxed_slice())
}

pub fn parse_square_bracket_list<P: Parse>(
    ts: &mut TokenStream,
) -> miette::Result<Box<[Spanned<P>]>> {
    expect_tokens(ts, [TokenType::LSquare])?;
    let seq = parse_sequence(ts, TokenType::Comma, TokenType::RSquare)?;
    expect_tokens(ts, [TokenType::RSquare])?;
    Ok(seq)
}

pub fn parse_optional_trigger_args(
    ts: &mut TokenStream,
) -> miette::Result<(Option<Spanned<Behavior>>, Option<Spanned<usize>>)> {
    let mut behavior = None;
    let mut timeout = None;
    if dbg!(!next_match!(ts, TokenType::RParen)) {
        expect_tokens(ts, [TokenType::Comma])?;
        behavior = Some(Behavior::parse_spanned(ts)?);
    }
    if dbg!(!next_match!(ts, TokenType::RParen)) {
        expect_tokens(ts, [TokenType::Comma])?;
        timeout = Some(usize::parse_spanned(ts)?);
    }
    expect_tokens(ts, [TokenType::RParen])?;

    Ok((behavior, timeout))
}

/// Parses P delimiter ... and returns a boxed slice of P
/// Does not consume the terminating token
pub fn parse_sequence_trailing<P: Parse>(
    ts: &mut TokenStream,
    delimiter: TokenType,
    terminator: TokenType,
) -> miette::Result<Box<[Spanned<P>]>> {
    let mut items = Vec::new();

    // Check for empty sequences
    if ts.peek_type() == Some(terminator) {
        return Ok(items.into_boxed_slice());
    }

    while ts.peek_type() != Some(terminator) {
        items.push(P::parse_spanned(ts)?);
        expect_tokens(ts, [delimiter])?;
    }

    Ok(items.into_boxed_slice())
}

/// A stream of tokens produced by a lexer, with support for peeking.
#[derive(Debug, Clone)]
pub struct TokenStream<'a> {
    // The front of the peeked queue contains the next token to be processed.
    peeked: VecDeque<Token<'a>>,
    lexer: Lexer<'a>,
    prev_token: Option<Token<'a>>,
}

impl<'a> Iterator for TokenStream<'a> {
    type Item = Token<'a>;

    /// Returns the next token from the peeked queue or the lexer.
    fn next(&mut self) -> Option<Self::Item> {
        self.peeked.pop_front().or_else(|| loop {
            let next = self.lexer.next();
            let next_type = next.map(|t| t.kind());
            let prev_token_type = self.prev_token.map(|t| t.kind());
            if next_type == Some(TokenType::Newline) && prev_token_type == Some(TokenType::Newline)
            {
                continue;
            }
            self.prev_token = next;
            break next;
        })
    }
}

impl<'a> TokenStream<'a> {
    /// Creates a new `TokenStream` wrapping the given lexer.
    pub fn new(lexer: Lexer<'a>) -> Self {
        Self {
            peeked: VecDeque::new(),
            lexer,
            prev_token: None,
        }
    }

    /// Returns the next token that will be yielded by the iterator.
    pub fn peek(&mut self) -> Option<&Token<'a>> {
        self.peek_at(1)
    }

    /// Returns the next token type that will be yielded by the iterator.
    pub fn peek_type(&mut self) -> Option<TokenType> {
        self.peek().map(|t| t.kind())
    }

    /// Peeks forward a specified number of items in the iterator.
    ///
    /// # Panics
    ///
    /// If `forward` is 0.
    pub fn peek_at(&mut self, forward: usize) -> Option<&Token<'a>> {
        assert!(forward != 0);

        for _ in self.peeked.len()..forward {
            let next = self.next()?;
            self.peeked.push_back(next);
        }
        self.peeked.get(forward - 1)
    }

    /// Peeks forward a specified number of items in the iterator and returns the token type.
    ///
    /// # Panics
    ///
    /// If `forward` is 0.
    pub fn peek_type_at(&mut self, forward: usize) -> Option<TokenType> {
        self.peek_at(forward).map(|t| t.kind())
    }

    /// Returns the lexer contained within this `TokenStream`.
    pub fn lexer(&self) -> Lexer<'a> {
        self.lexer
    }
}

/// Checks if the next tokens from the `TokenStream` match the given patterns, without modifying
/// the stream.
///
/// Returns `true` if all tokens match, `false` otherwise.
macro_rules! next_match {
    ($token_stream:expr, $($token_type:pat),+ ) => {
        {
            let mut ahead = 0;
            let mut all_match = true;
            $(
                ahead += 1;
                all_match = all_match &&  matches!($token_stream.peek_type_at(ahead), Some($token_type));
            )*
            all_match
        }
    };
}
pub(super) use next_match;

/// Consumes tokens from the `TokenStream` and checks if they match the expected token types.
///
/// Returns the matched tokens if all match. If any token does not match, returns an error with
/// details about the mismatch or missing token.
pub fn expect_tokens<'a, const N: usize>(
    ts: &mut TokenStream<'a>,
    expected: [TokenType; N],
) -> miette::Result<[Token<'a>; N]> {
    let mut out = [None; N];
    for (i, et) in expected.iter().enumerate() {
        out[i] = match ts.next() {
            Some(t) if t.kind() == *et => Some(t),
            Some(t) => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!("expected: {}, found: {}", et, t.kind())),
                        t.start(),
                        t.bytes().len()
                    )],
                    "Unexpected token found"
                ))
            }
            None => {
                return Err(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::at_offset(
                        ts.lexer().bytes().len() - 1,
                        format!("expected: {}", et)
                    )],
                    "Missing expected token"
                ))
            }
        }
    }

    Ok(out.map(Option::unwrap))
}
