use crate::config;
use crate::error::Result;
use std::sync::Arc;

use axum::{extract::Query, Json};
use chrono::{DateTime, Local};
use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use yup_oauth2::{read_service_account_key, ServiceAccountAuthenticator};

pub async fn get_document(
    Query(req): Query<DocumentRequest>,
    config: Arc<config::Config>,
) -> Json<Value> {
    let id = req.id.clone().unwrap_or_default();
    if id.is_empty() {
        return Json(json!({"error": "Missing document 'id' in the request." }));
    }

    match get_document_by_id(
        &id,
        config.database().firebase_project_id(),
        config.database().collection(),
        config.database().service_account_key_path(),
    )
    .await
    {
        Ok(data) => Json(data),
        Err(err) => Json(json!({"error": err.to_string() })),
    }
}

async fn get_document_by_id(
    document_id: &str,
    firebase_project_id: &str,
    firebase_collection: &str,
    service_account_key: &str,
) -> Result<Value> {
    let token = get_access_token(service_account_key).await?;
    let firestore_url = format!(
        "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents/{}/{}",
        firebase_project_id, firebase_collection, document_id
    );

    let client = Client::new();
    let response = client
        .get(&firestore_url)
        .bearer_auth(token)
        .send()
        .await
        .map_err(|e| format!("Error fetching document: {e}"))?;

    if response.status().is_success() {
        let data: Value = response.json().await.map_err(|e| e.to_string())?;
        Ok(data)
    } else {
        Err(format!(
            "Firestore request failed with status: {}",
            response.status()
        )
        .into())
    }
}

pub async fn get_multiple_documents(
    Query(req): Query<DocumentRequest>,
    config: Arc<config::Config>,
) -> Json<Value> {
    let amount = req.amount.unwrap_or(10);

    match get_filtered_and_sorted_documents(
        amount,
        config.database().firebase_project_id(),
        config.database().collection(),
        config.database().service_account_key_path(),
    )
    .await
    {
        Ok(data) => Json(data),
        Err(err) => Json(json!({"error": err.to_string()})),
    }
}

async fn get_filtered_and_sorted_documents(
    amount: u64,
    firebase_project_id: &str,
    firebase_collection: &str,
    service_account_key: &str,
) -> Result<Value> {
    let token = get_access_token(service_account_key).await?;
    let firestore_url = format!(
        "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents/{}",
        firebase_project_id, firebase_collection
    );

    let client = Client::new();
    let response = client
        .get(&firestore_url)
        .bearer_auth(token)
        .send()
        .await
        .map_err(|e| format!("Error fetching document: {e}"))?;

    if response.status().is_success() {
        let data: Value = response.json().await.map_err(|e| e.to_string())?;
        if let Some(documents) = data["documents"].as_array() {
            let mut appointments: Vec<Value> = documents.clone();

            appointments = filter_documents_by_date(appointments);
            appointments = sort_documents(appointments);

            let limited_appointments: Vec<Value> = appointments.into_iter().take(amount as usize).collect();
            Ok(serde_json::Value::Array(limited_appointments))
        } else {
            Err("Error fetching documents".to_string().into())
        }
    } else {
        Err("Error fetching documents".to_string().into())
    }
}

fn filter_documents_by_date(mut documents: Vec<Value>) -> Vec<Value> {
    let current_date = Local::now().format("%Y-%m-%d").to_string();
    documents.retain(|document| {
        if let Some(timestamp) =
            document["fields"]["scheduled_date"]["timestampValue"].as_str()
        {
            if let Ok(date_time) = DateTime::parse_from_rfc3339(timestamp) {
                let local_date = date_time.with_timezone(&Local);
                let appointment_date = local_date.format("%Y-%m-%d").to_string();
                return appointment_date == current_date;
            }
        }
        false
    });
    documents
}

fn sort_documents(mut appointments: Vec<Value>) -> Vec<Value> {
    appointments.sort_by(|a, b| {
        let time_a = &a["fields"]["time_slot"].as_str().unwrap_or("");
        let time_b = &b["fields"]["time_slot"].as_str().unwrap_or("");
        if time_a != time_b {
            return time_a.cmp(time_b);
        }

        let queue_a = &a["fields"]["queue_number"].as_i64().unwrap_or(0);
        let queue_b = &b["fields"]["queue_number"].as_i64().unwrap_or(0);
        queue_a.cmp(queue_b)
    });
    appointments
}

async fn get_access_token(service_account_key: &str) -> Result<String> {
    let service_account_key = read_service_account_key(service_account_key)
        .await
        .map_err(|e| format!("Error reading service account key: {e}"))?;

    let auth = ServiceAccountAuthenticator::builder(service_account_key)
        .build()
        .await
        .map_err(|e| format!("OAuth build error: {e}"))?;

    let token = auth
        .token(&["https://www.googleapis.com/auth/datastore"])
        .await
        .map_err(|e| format!("Error fetching OAuth token: {e}"))?;

    Ok(token.token().unwrap_or_default().to_string())
}

#[derive(Debug, Deserialize)]
pub struct DocumentRequest {
    id: Option<String>,
    amount: Option<u64>,
}
