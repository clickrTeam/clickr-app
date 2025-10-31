use clap::{Parser, Subcommand};

use crate::cli::styling::CLAP_STYLING;

mod styling;

#[derive(Debug, Parser)]
#[command(name = "shifter")]
#[command(about, version, long_about = None)]
#[clap(styles = CLAP_STYLING)]
pub struct ClickrArgs {
    #[command(subcommand)]
    pub mode: ClickrSubcommand,
}

#[derive(Debug, Subcommand)]
pub enum ClickrSubcommand {
    /// Check the given profile and report any issues
    #[clap(visible_alias("c"))]
    Check {
        /// Profile to use
        #[clap(short = 'p', long = "profile")]
        profile: Option<String>,
    },

    /// Check and activate the given profile
    #[clap(visible_alias("l"))]
    Load {
        /// Profile to use
        #[clap(short = 'p', long = "profile")]
        profile: Option<String>,
    },

    /// Report the status of the clickr daemon
    #[clap(visible_alias("s"))]
    Status {},

    /// Visualize the current profile
    #[clap(visible_alias("v"))]
    Show {
        /// Profile to visualize
        #[clap(short = 'p', long = "profile")]
        profile: Option<String>,
    },

    /// Pause the remapping of all inputs
    #[clap(visible_alias("p"))]
    Pause {},

    /// Resume the remapping of all inputs
    #[clap(visible_alias("r"))]
    Resume {},
}
