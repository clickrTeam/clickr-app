use clap::Parser;
use std::process::exit;

use clickr_cli::{
    check_profile,
    cli::{ClickrArgs, ClickrSubcommand},
    get_status, load_profile, ClientError,
};

fn main() {
    let args = ClickrArgs::parse();

    // Run the appropriate command and store the result
    let result = match args.mode {
        ClickrSubcommand::Load { profile } => {
            if let Some(profile_file) = profile {
                load_profile(&profile_file)
            } else {
                eprintln!("Error: No profile file provided for 'load'");
                exit(2);
            }
        }
        ClickrSubcommand::Check { profile } => {
            if let Some(profile_file) = profile {
                check_profile(&profile_file)
            } else {
                eprintln!("Error: No profile file provided for 'check'");
                exit(2);
            }
        }
        ClickrSubcommand::Status {} => get_status(),

        ClickrSubcommand::Show { .. } => {
            println!("'show' is not yet implemented.");
            Ok(())
        }
        ClickrSubcommand::Pause {} => {
            println!("'pause' is not yet implemented.");
            Ok(())
        }
        ClickrSubcommand::Resume {} => {
            println!("'resume' is not yet implemented.");
            Ok(())
        }
    };

    // Centralized error handling
    if let Err(e) = result {
        match e {
            ClientError::Io(err) => eprintln!("File Error: {}", err),
            ClientError::Parse(report) => eprintln!("{:?}", report), // Already formatted
            ClientError::Validation => {
                // The library already printed the detailed miette errors.
                // We just need to ensure the exit code is set.
                eprintln!("Failed due to profile errors.");
            }
            ClientError::Ipc(ipc_err) => {
                if !matches!(ipc_err, clickr_cli::ipc::IpcError::Connection(_)) {
                    eprintln!("Daemon Communication Error: {}", ipc_err);
                }
            }
        }
        exit(1);
    }
}
