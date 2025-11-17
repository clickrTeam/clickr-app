use clap::Parser;
use clickr_cli::ast::Profile;
use clickr_cli::check::CheckResult;
use clickr_cli::cli::{ClickrArgs, ClickrSubcommand};
use clickr_cli::lex::Lexer;
use clickr_cli::parse::{Parse, TokenStream};
use clickr_cli::utils::exit_with_error;
use miette::NamedSource;
use std::fs;

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
                let check_results = profile.check();
                let CheckResult { warnings, errors } = check_results;
                let total_errors = errors.len();
                let total_warnings = warnings.len();

                // Print errors first
                for err in errors {
                    //TODO: These clonse really suck
                    eprintln!(
                        "{:?}",
                        err.with_source_code(NamedSource::new(
                            profile_file.clone(),
                            contents.clone()
                        ))
                    );
                }

                // Print warnings
                for warn in warnings {
                    eprintln!(
                        "{:?}",
                        warn.with_source_code(NamedSource::new(
                            profile_file.clone(),
                            contents.clone()
                        ))
                    );
                }

                println!(
                    "Check finished: {} error(s), {} warning(s)",
                    total_errors, total_warnings
                );

                // Exit with error code if any errors
                if total_errors > 0 {
                    std::process::exit(1);
                }
            } else {
                println!("No profile file provided");
            }
        }
        _ => todo!(),
    }
}
