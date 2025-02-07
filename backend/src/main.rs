#[allow(unused)]

use reqwest::Client;
use serde_json::{json, Value};
use yup_oauth2::{read_service_account_key, ServiceAccountAuthenticator};
use chrono::{DateTime, Local};
use axum::{
    routing::{get},
    Router, Json, extract::Query
};
use serde::Deserialize;

static FIREBASE_PROJECT_ID: &str = "queuemanagementsystem-69ea3"; // Your Firebase Project ID
static FIRESTORE_COLLECTION: &str = "appointments"; // Firestore Collection
static ADDRESS: &str = "127.0.0.1:8000";

#[tokio::main]
async fn main() {
    // Create the Axum app with GET routes
    let app = Router::new()
        .route("/api/get_document", get(get_document_handler))
        .route("/api/get_sorted_documents", get(get_sorted_documents_handler));

        println!("-->> LISTENING on {ADDRESS} <<--");
        let listener = tokio::net::TcpListener::bind(ADDRESS).await.unwrap();
        axum::serve(listener, app).await.unwrap();
}

// DocumentRequest structure to receive query parameters
#[derive(Debug, Deserialize)]
struct DocumentRequest {
    document_id: Option<String>,
    amount: Option<u32>,
}

// Handler for getting a specific document by ID
async fn get_document_handler(Query(req): Query<DocumentRequest>) -> Json<Value> {
    let document_id = req.document_id.unwrap_or_else(|| "".to_string());
    if document_id.is_empty() {
        return Json(json!({ "error": "Missing document_id in the request" }));
    }

    match get_document_by_id(&document_id).await {
        Ok(data) => Json(data),
        Err(err) => Json(json!({ "error": err })),
    }
}

// Handler for getting sorted documents
async fn get_sorted_documents_handler(Query(req): Query<DocumentRequest>) -> Json<Value> {
    let amount = req.amount.unwrap_or(5); // Default to 5 documents if not specified
    match get_sorted_documents(amount).await {
        Ok(data) => Json(data),
        Err(err) => Json(json!({ "error": err })),
    }
}

// Function to get specific document by ID
async fn get_document_by_id(document_id: &str) -> Result<Value, String> {
    let token = get_access_token().await?;
    let firestore_url = format!(
        "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents/{}/{}",
        FIREBASE_PROJECT_ID, FIRESTORE_COLLECTION, document_id
    );

    let client = Client::new();
    let response = client.get(&firestore_url).bearer_auth(token).send().await.map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let data: Value = response.json().await.map_err(|e| e.to_string())?;
        Ok(data)
    } else {
        Err("Error fetching document".to_string())
    }
}

// Function to fetch and sort multiple documents
async fn get_sorted_documents(amount: u32) -> Result<Value, String> {
    let token = get_access_token().await?;
    let firestore_url = format!(
        "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents/{}/",
        FIREBASE_PROJECT_ID, FIRESTORE_COLLECTION
    );

    let client = Client::new();
    let response = client.get(&firestore_url).bearer_auth(token).send().await.map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let data: Value = response.json().await.map_err(|e| e.to_string())?;
        if let Some(documents) = data["documents"].as_array() {
            let mut appointments: Vec<Value> = documents.clone();

            let current_date = Local::now().format("%Y-%m-%d").to_string();
            appointments.retain(|appointment| {
                if let Some(timestamp) = appointment["fields"]["scheduled_date"]["timestampValue"].as_str() {
                    if let Ok(date_time) = DateTime::parse_from_rfc3339(timestamp) {
                        let local_date = date_time.with_timezone(&Local);
                        let appointment_date = local_date.format("%Y-%m-%d").to_string();
                        return appointment_date == current_date;
                    }
                }
                false
            });

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

            let limited_appointments: Vec<Value> = appointments.into_iter().take(amount as usize).collect();
            Ok(json!(limited_appointments))
        } else {
            Err("No documents found".to_string())
        }
    } else {
        Err("Error fetching documents".to_string())
    }
}

// Function to get Google OAuth 2.0 Token
async fn get_access_token() -> Result<String, String> {
    let service_account_key = read_service_account_key("serviceAccountKey.json")
        .await
        .map_err(|e| e.to_string())?;

    let auth = ServiceAccountAuthenticator::builder(service_account_key)
        .build()
        .await
        .map_err(|e| e.to_string())?;

    let token = auth
        .token(&["https://www.googleapis.com/auth/datastore"])
        .await
        .map_err(|e| e.to_string())?;

    Ok(token.token().expect("OAuth token missing").to_string())
}
