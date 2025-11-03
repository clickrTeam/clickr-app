use clap::Parser;
use clickr_cli::cli::{ClickrArgs, ClickrSubcommand};
use clickr_cli::lex::Lexer;
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

                for token in lexer {
                    println!("{:?}", token);
                }
            } else {
                println!("No profile file provided");
            }
        }
        _ => todo!(),
    }
}
