# AppMediaForge

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
    npm install
    npm run dev
    ```

## Deployment Guide (Hostinger / WordPress)

This app is configured as a static site, meaning it runs entirely in the browser and does not require a Node.js server for the basic functionality.

### Build the App
Run the following command on your local machine:
```bash
npm run build
```
This creates a `dist` folder containing the HTML, CSS, and JS files.

### Method 1: Hostinger Subfolder (Standalone)
This allows you to access the tool via `yourdomain.com/tools/media-forge`.

1.  Log in to Hostinger -> **File Manager**.
2.  Navigate to `public_html`.
3.  Create a folder named `media-forge` (or whatever you prefer).
4.  **Upload** the *contents* of your local `dist` folder into this new folder.
5.  Visit `www.yourdomain.com/media-forge`.

### Method 2: Embed inside WordPress
To display the tool inside a WordPress page (keeping your site's header/footer):

1.  Follow **Method 1** to upload the files to a subfolder (e.g., `media-forge`).
2.  Log in to WordPress Admin.
3.  Create a new Page.
4.  Add a **Custom HTML** block.
5.  Paste the following code:
    ```html
    <iframe 
      src="/media-forge/index.html" 
      style="width: 100%; height: 100vh; min-height: 800px; border: none;" 
      title="App Store Asset Manager"
    ></iframe>
    ```

## GCP Deployment (Optional - For Cloud Processing)

If you enable the server-side features (Phase 2), follow these steps:

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
