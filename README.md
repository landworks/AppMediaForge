# iOSMediaForge

A web-based automation tool to generate App Store Connect-ready screenshots.

## Deliverables Status
- **A (Product Spec):** Implemented in UI flow.
- **B (Architecture):** See below.
- **C (Data Model):** See `types.ts`.
- **D (API):** See API Endpoints section.
- **E (Code):** Frontend scaffold + Server logic provided.
- **F (Tests):** See `server/generator.test.ts`.
- **G (Deployment):** See Deployment section.

## Architecture

1.  **Frontend (Next.js/React):**
    -   Handles user interaction, file selection, and configuration.
    -   Uses local URL.createObjectURL for instant previews (no upload needed for preview).
2.  **Backend (Next.js API Routes / Node.js):**
    -   `/api/upload`: Receives multipart form data.
    -   `/api/generate`: Receives JSON config + Asset IDs.
    -   **Processing:**
        -   Fetches high-res original from Storage (GCS).
        -   Uses `sharp` to resize/composite images based on `APPLE_DEVICE_CLASSES`.
        -   Generates localized folders.
        -   Zips content using `archiver`.
        -   Uploads ZIP to GCS signed URL.
3.  **Storage:**
    -   Google Cloud Storage (GCS) buckets: `ios-media-forge-uploads`, `ios-media-forge-exports`.

## API Endpoints (Deliverable D)

### `POST /api/generate`
**Request:**
```json
{
  "project_id": "proj_123",
  "assets": ["asset_1_id", "asset_2_id"],
  "config": { ...GenerationConfig... }
}
```
**Response:**
```json
{
  "job_id": "job_abc",
  "status": "processing"
}
```

### `GET /api/jobs/:id`
**Response:**
```json
{
  "status": "completed",
  "download_url": "https://storage.googleapis.com/..."
}
```

## How to Run Locally

1.  **Frontend:**
    This output is a React SPA scaffold.
    ```bash
    npm install react react-dom react-scripts typescript @types/react @types/node sharp
    npm start
    ```

2.  **Backend Integration (Next.js):**
    -   Copy `server/imageProcessor.ts` to your Next.js API route handler.
    -   Ensure `sharp` is installed (`npm install sharp`).

## GCP Deployment (Deliverable G)

1.  **Build Container:**
    Create a `Dockerfile` that installs dependencies and builds the Next.js app.
    *Important:* Sharp requires platform-specific binaries. In Dockerfile:
    `RUN npm install --platform=linux --arch=x64 sharp`

2.  **Cloud Run:**
    ```bash
    gcloud run deploy ios-media-forge --source . --region us-central1 --allow-unauthenticated
    ```

3.  **Storage:**
    Enable Cloud Storage API and create buckets. Give the Cloud Run Service Account `Storage Object Admin` role.
