use clap::Parser;
use clickr_cli::ast::Profile;
use clickr_cli::cli::{ClickrArgs, ClickrSubcommand};
use clickr_cli::lex::Lexer;
use clickr_cli::parse::{Parse, TokenStream};
use clickr_cli::utils::exit_with_error;
use miette::NamedSource;
use std::fs;

fn main() {
    let args = ClickrArgs::parse();

    match args.mode {
        ClickrSubcommand::Check { profile } => {
            if let Some(profile_file) = profile {
                let contents =
                    fs::read_to_string(&profile_file).expect("Failed to read profile file");

                println!("Lexing profile: {}", profile_file);
                let lexer = Lexer::new(&profile_file, &contents);
                let mut ts = TokenStream::new(lexer);
                let profile = match Profile::parse(&mut ts) {
                    Ok(program) => program,
                    Err(err) => exit_with_error(
                        err.with_source_code(NamedSource::new(profile_file, contents)),
                    ),
                };
                dbg!(profile);
            } else {
                println!("No profile file provided");
            }
        }
        _ => todo!(),
    }
}
