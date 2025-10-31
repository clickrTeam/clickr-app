use clap::{Parser, Subcommand};

#[derive(Debug, Parser)]
#[command(name = "shifter")]
#[command(about,version, long_about = None)]
pub struct ClickrArgs {
    #[command(subcommand)]
    pub mode: ClickrSubcommand,
}

#[derive(Debug, Subcommand)]
pub enum ClickrSubcommand {
    /// Check the given profile and report and issues
    #[clap(visible_alias("c"))]
    Check {},

    /// Check and activate the given profile
    #[clap(visible_alias("l"))]
    Load {},

    /// Report the status of the clickr daemon
    #[clap(visible_alias("s"))]
    Status {},

    /// Visualize the current profile
    #[clap(visible_alias("v"))]
    Show {},

    /// Pause the remapping of all inputs
    #[clap(visible_alias("p"))]
    Pause {},

    /// Resume the remapping of all inputs
    #[clap(visible_alias("r"))]
    Resume {},
}
