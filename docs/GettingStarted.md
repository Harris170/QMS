# Getting Started

> [!NOTE]
> **DOCUMENTATION IS INCOMPLETE!**

> [!WARNING]
> Currently, there is no documentation yet for setting up a database (firebase in our case). It is needed for the following to work correctly.
> The `serviceAccountKey.json` MUST be in the same location as the `backend.exe`, for receiveing the documents from the database, which were
> submitted by the frontend website. Or alternatively, provide the path to `serviceAccountKey.json` file in `backend/Config.toml`.

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

## Queue-Desk Application
```
cd queue-desk
```

> [!NOTE]
> Pre-built binaries will be available soon.

### Building
Install `dioxus-cli` for building the application from scratch. [Dioxus installation](https://dioxuslabs.com/learn/0.6/getting_started/#install-the-dioxus-cli). Then,

```
dx serve
```

