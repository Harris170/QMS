use crate::Result;

use serde::Deserialize;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use toml::Table;

#[derive(Debug, Deserialize)]
pub struct Config {
    network: NetworkConfig,
    database: DatabaseConfig,
    queue: QueueConfig,
    form: FormConfig,
}

impl Config {
    pub fn network(&self) -> &NetworkConfig {
        &self.network
    }

    pub fn database(&self) -> &DatabaseConfig {
        &self.database
    }

    pub fn queue(&self) -> &QueueConfig {
        &self.queue
    }

    pub fn form(&self) -> &FormConfig {
        &self.form
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct NetworkConfig {
    ip_address: String,
    port: String,
}

impl NetworkConfig {
    pub fn ip_address(&self) -> &str {
        &self.ip_address
    }

    pub fn port(&self) -> &str {
        &self.port
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct DatabaseConfig {
    firebase_project_id: String,
    collection: String,
    service_account_key_path: String,
}

impl DatabaseConfig {
    pub fn firebase_project_id(&self) -> &str {
        &self.firebase_project_id
    }

    pub fn collection(&self) -> &str {
        &self.collection
    }

    pub fn service_account_key_path(&self) -> &str {
        &self.service_account_key_path
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct QueueConfig {
    queues: i64,
    queue_slots: i64,
    days_range: i64,
}

impl QueueConfig {
    pub fn queues(&self) -> i64 {
        self.queues
    }

    pub fn queue_slots(&self) -> i64 {
        self.queue_slots
    }

    pub fn days_range(&self) -> i64 {
        self.days_range
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct FormConfig {
    fields: Vec<FormField>,
}

impl FormConfig {
    pub fn fields(&self) -> &[FormField] {
        &self.fields
    }
}

#[derive(Clone, Debug, Deserialize)]
pub struct FormField {
    name: String,
    field_type: String,
    required: bool,
}

impl FormField {
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn field_type(&self) -> &str {
        &self.field_type
    }

    pub fn required(&self) -> bool {
        self.required
    }
}

pub fn read_file(toml_file_path: &Path) -> Result<toml::map::Map<String, toml::Value>> {
    let file_name = toml_file_path
        .file_name()
        .ok_or("Invalid file path")?
        .to_str()
        .ok_or("Invalid UTF-8 in file name")?;

    if file_name != "Config.toml" {
        return Err(format!("Invalid file name '{file_name}'. Expected 'Config.toml'").into());
    }

    let mut file = File::open(toml_file_path)
        .map_err(|e| format!("Unable to open '{:#?}' file: {e}", toml_file_path))?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let table = contents.parse::<Table>()?;
    Ok(table)
}
