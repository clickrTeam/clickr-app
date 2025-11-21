use interprocess::local_socket::{prelude::*, GenericFilePath, Name};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::{BufRead, BufReader, BufWriter, Write};
use thiserror::Error;

use crate::compiled::Profile;

#[derive(Debug, Error)]
pub enum IpcError {
    #[error("Socket connection error: {0}")]
    Connection(#[from] std::io::Error),

    #[error("JSON serialization/deserialization error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Daemon returned an error: {0}")]
    Daemon(String),
}

#[cfg(windows)]
const PIPE_PATH: &str = r"\\.\pipe\clickr";

#[cfg(not(windows))]
const PIPE_PATH: &str = "/tmp/clickr.sock";

fn get_socket_name() -> Result<Name<'static>, IpcError> {
    Ok(PIPE_PATH.to_fs_name::<GenericFilePath>()?)
}

#[derive(Serialize)]
struct SetProfileIpcMessage<'a> {
    #[serde(rename = "type")]
    msg_type: &'static str,
    profile: &'a Profile,
}

#[derive(Deserialize)]
struct IpcResponse {
    status: String,
    error: Option<String>,
}

fn send_message(message_string: String) -> Result<(), IpcError> {
    assert!(!message_string.contains("\n"));
    let stream = match LocalSocketStream::connect(get_socket_name()?) {
        Ok(stream) => stream,
        Err(e) => return Err(IpcError::Connection(e)),
    };

    let mut writer = BufWriter::new(&stream);
    writer.write_all(message_string.as_bytes())?;
    writer.write_all(b"\n")?;
    writer.flush()?;

    let mut reader = BufReader::new(&stream);
    let mut response_buf = String::new();

    if reader.read_line(&mut response_buf)? == 0 {
        return Err(IpcError::Daemon(
            "Connection closed by daemon before response.".to_string(),
        ));
    }

    let response: IpcResponse = serde_json::from_str(&response_buf)?;

    if response.status != "ok" {
        let error_msg = response
            .error
            .unwrap_or_else(|| "Unknown daemon error".to_string());
        return Err(IpcError::Daemon(error_msg));
    }

    Ok(())
}

pub fn send_profile(profile: &Profile) -> Result<(), IpcError> {
    let message = SetProfileIpcMessage {
        msg_type: "load_profile",
        profile,
    };
    send_message(serde_json::to_string(&message)?)
}

/// Requests the key binder to pauses remappings
pub fn send_pause() -> Result<(), IpcError> {
    let message = json!({"type" : "pause"});
    send_message(serde_json::to_string(&message)?)
}

/// Requests the key binder to resume remappings
pub fn send_resume() -> Result<(), IpcError> {
    let message = json!({"type" : "resume"});
    send_message(serde_json::to_string(&message)?)
}

// Attempt to connect using the platform-specific path
pub fn check_connection() -> Result<(), IpcError> {
    match LocalSocketStream::connect(get_socket_name()?) {
        Ok(_) => Ok(()),
        Err(e) => Err(IpcError::Connection(e)),
    }
}
