use clap::Parser;
use clickr_cli::ast::Profile;
use clickr_cli::cli::{ClickrArgs, ClickrSubcommand};
use clickr_cli::lex::Lexer;
use clickr_cli::parse::{Parse, TokenStream};
use clickr_cli::utils::exit_with_error;
use miette::{NamedSource, Severity};
use std::fs;
use std::sync::Arc;

fn main() {
    let args = ClickrArgs::parse();

    match args.mode {
        ClickrSubcommand::Load { profile } => {
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

        ClickrSubcommand::Check { profile } => {
            if let Some(profile_file) = profile {
                // Arc is only needed due to NamedSource impl
                let contents = Arc::new(
                    fs::read_to_string(&profile_file).expect("Failed to read profile file"),
                );

                println!("Loading profile: {}", profile_file);
                let lexer = Lexer::new(&profile_file, &contents);
                let mut ts = TokenStream::new(lexer);
                let profile = match Profile::parse(&mut ts) {
                    Ok(program) => program,
                    Err(err) => exit_with_error(
                        err.with_source_code(NamedSource::new(profile_file, contents)),
                    ),
                };
                let reports = profile.check();
                let mut errors = 0;
                let mut warnings = 0;

                // Print errors first
                for report in reports {
                    match report.severity() {
                        Some(Severity::Error) => errors += 1,
                        _ => warnings += 1,
                    }
                    eprintln!(
                        "{:?}",
                        report.with_source_code(NamedSource::new(&profile_file, contents.clone()))
                    );
                }

                println!(
                    "Check finished: {} error(s), {} warning(s)",
                    errors, warnings
                );

                // Exit with error code if any errors
                if errors > 0 {
                    std::process::exit(1);
                }
            } else {
                println!("No profile file provided");
            }
        }
        _ => todo!(),
    }
}
