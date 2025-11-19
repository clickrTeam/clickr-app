use crate::{
    ast::Profile,
    lex::Lexer,
    parse::{Parse, TokenStream},
};

fn test_profile(profile_str: &str, expected: Profile) {
    let mut token_stream = TokenStream::new(Lexer::new("test", profile_str));
    assert_eq!(Profile::parse(&mut token_stream), expected);
}
#[test]
fn profile() {
    let profile_str = r#"
profile "Layered Profile"

config {
}

layer "base" {
    # This is a comment
    a = b
}"#;
}
