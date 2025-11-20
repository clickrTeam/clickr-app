use miette::{NamedSource, Report, Severity};
use std::fs;
use std::sync::Arc;
use thiserror::Error;

pub mod ast;
pub mod check;
pub mod cli;
pub mod compiled;
pub mod ipc;
pub mod lex;
pub mod parse;
pub mod utils;

use crate::ipc::{send_pause, send_profile, send_resume};
use crate::lex::Lexer;
use crate::parse::{Parse, TokenStream};

#[derive(Debug, Error)]
pub enum ClientError {
    #[error("File I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Failed to parse profile")]
    Parse(Report),

    #[error("Profile validation failed")]
    Validation, // Errors are printed, we just need to signal failure

    #[error("Daemon communication error: {0}")]
    Ipc(#[from] ipc::IpcError),
}

fn parse_profile(profile_path: &str) -> Result<(ast::Profile, Arc<String>), ClientError> {
    let contents = Arc::new(fs::read_to_string(profile_path).map_err(ClientError::Io)?);

    let lexer = Lexer::new(profile_path, &contents);
    let mut ts = TokenStream::new(lexer);

    let profile = ast::Profile::parse(&mut ts).map_err(|err| {
        ClientError::Parse(err.with_source_code(NamedSource::new(profile_path, contents.clone())))
    })?;

    Ok((profile, contents))
}

fn print_reports(reports: Vec<Report>, filename: &str, contents: Arc<String>) -> (usize, usize) {
    let mut errors = 0;
    let mut warnings = 0;

    for report in reports {
        match report.severity() {
            Some(Severity::Error) | None => errors += 1, // Treat no severity as error
            _ => warnings += 1,
        }
        eprintln!(
            "{:?}",
            report.with_source_code(NamedSource::new(filename, contents.clone()))
        );
    }
    (errors, warnings)
}

pub fn check_profile(profile_path: &str) -> Result<(), ClientError> {
    let (profile, contents) = parse_profile(profile_path)?;

    let mut reports = profile.check();
    let initial_error_count = reports
        .iter()
        .filter(|r| r.severity() == Some(Severity::Error))
        .count();
    if initial_error_count == 0 {
        reports.extend(profile.compile().err())
    };

    if reports.is_empty() {
        println!("Check passed. Profile is valid.");
        Ok(())
    } else {
        let (errors, warnings) = print_reports(reports, profile_path, contents);
        println!(
            "Check finished: {} error(s), {} warning(s)",
            errors, warnings
        );
        Err(ClientError::Validation)
    }
}

pub fn load_profile(profile_path: &str) -> Result<(), ClientError> {
    let (profile, contents) = parse_profile(profile_path)?;
    let reports = profile.check();
    let initial_error_count = reports
        .iter()
        .filter(|r| r.severity() == Some(Severity::Error))
        .count();

    if initial_error_count > 0 {
        let (errors, warnings) = print_reports(reports, profile_path, contents);
        println!(
            "Check finished: {} error(s), {} warning(s)",
            errors, warnings
        );
        eprintln!("Profile is invalid. Aborting load.");
        return Err(ClientError::Validation);
    }

    match profile.compile() {
        Ok(compiled) => {
            println!("Profile is valid and compiled. Sending to daemon...");
            send_profile(&compiled)?;
            println!("Successfully loaded profile.");
            Ok(())
        }
        Err(compile_err) => {
            print_reports(vec![compile_err], profile_path, contents);
            eprintln!("Profile failed compilation check. Aborting load.");
            Err(ClientError::Validation)
        }
    }
}

/// Requests the key binder to pauses remappings
pub fn pause_keybinder() -> Result<(), ClientError> {
    println!("Pausing keybinder...");
    send_pause()?;
    println!("Keybinder successfully paused.");
    Ok(())
}

/// Requests the key binder to resume remappings
pub fn resume_keybinder() -> Result<(), ClientError> {
    println!("Resuming keybinder...");
    send_resume()?;
    println!("Keybinder successfully resumed ...");
    Ok(())
}

/// Checks the status of the daemon by attempting a connection to the local socket.
pub fn get_status() -> Result<(), ClientError> {
    println!("Checking daemon status...");

    // ipc::check_connection is a new function we need to implement in ipc.rs
    match crate::ipc::check_connection() {
        Ok(_) => {
            println!("Daemon status: **UP** (Listening on socket)");
            Ok(())
        }
        Err(_) => {
            // We treat failure to connect as the daemon being down.
            println!("Daemon status: **DOWN** (No listener found)");
            // Return an error so main.rs sets the exit code (status 1) for scripting.
            Err(ClientError::Validation)
        }
    }
}
