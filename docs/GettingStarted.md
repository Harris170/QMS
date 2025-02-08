# Getting Started

> DOCUMENTATION IS INCOMPLETE!

> WARNING
No documentation for setting up a database (firebase in our case) is present. It is needed for the following to work correctly.

The `serviceAccountKey.json` MUST be in the same location as the `backend.exe`, for receiveing the documents in the database, which were submitted by the frontend.

## Backend Server
```
cd backend
```

```
cargo run
```

This will start the backend server on port  `127.0.0.1:8000` by default. This can be customized in the `Config.toml` file.

## Frontend Webapp
```
cd frontend
```

```
npm i
```

```
npm run dev
```

---

## Getting documents from the backend server using API endpoints
Currently there are 2 endpoints available in the backend.

### Getting a document by ID
Specifying the `<ID>` will get that document. The `<ID>` can be found in firebase.

```
curl http://127.0.0.1:8000/api/get_document?id=<ID>
```

### Getting filtered and sorted documents
Documents are filtered by today's date and then sorted by `time_slot` and `queue_number`.

Specifying `amount` will give the same amount of documents that are filtered and sorted.

```
curl localhost:8000/api/get_multiple_documents?amount=5
```
