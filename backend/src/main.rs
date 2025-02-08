mod config;
mod database;
mod error;

pub use self::error::{Error, Result};

use axum::{routing::get, Router};
use std::sync::Arc;
use std::{fs, path::Path};

#[tokio::main]
async fn main() -> Result<()> {
    
    let config_path = Path::new("Config.toml");
    let config_content =
        fs::read_to_string(config_path).map_err(|e| format!("Failed to read config file: {e}"))?;
    let config_toml: config::Config =
        toml::from_str(&config_content).map_err(|e| format!("Failed to parse config file: {e}"))?;
    let shared_config = Arc::new(config_toml);

    let app: Router = Router::new()
        .route(
            "/api/get_document",
            get({
                let shared_config = shared_config.clone();
                move |query| database::get_document(query, shared_config)
            }),
        )
        .route(
            "/api/get_multiple_documents",
            get({
                let shared_config = shared_config.clone();
                move |query| database::get_multiple_documents(query, shared_config)
            }),
        );

    let address = format!(
        "{}:{}",
        shared_config.network().ip_address(),
        shared_config.network().port()
    );
    let listener = tokio::net::TcpListener::bind(&address).await.unwrap();

    println!("-------------------------------------");
    println!("VERSION: 1");
    println!("-->> LISTENING ON {address} <<--");
    println!("-------------------------------------");
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
