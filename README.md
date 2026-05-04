# AppMediaForge (v1.4.2)

A browser-based automation tool for generating App Store Connect, Google Play Store, and web app marketing assets from a single source image.

## Live Links

- **Project page:** [https://cnerd.us/projects/appmediaforge](https://cnerd.us/projects/appmediaforge)
- **Launch the app:** [https://cnerd.us/projects/appmediaforge/index.html](https://cnerd.us/projects/appmediaforge/index.html)

The project page includes the public description, screenshots, feature overview, and security posture. Use the launch link to open the actual AppMediaForge tool.

## What It Does

AppMediaForge helps app developers and small teams create store-ready screenshots and icon bundles without manually resizing, cropping, renaming, and organizing every asset. Everything runs in the browser, so source images stay on the user's machine.

Use it to:

- Generate iPhone, iPad, Android, and web assets from local image files.
- Create standard screenshot sets or split wide marketing images into panorama-style carousel slices.
- Add simple captions and background styling.
- Export organized ZIP files with platform, locale, device, and orientation folders.
- Generate common iOS, Android, and web icon sizes from one 1024x1024 source image.

## Features & Supported Devices

This tool automatically resizes, pads/crops, and captions your source screenshots for the following required targets:

**iOS (iPhone)**
- iPhone 6.9" Display (iPhone 16 Pro Max)
- iPhone 6.5" Display (iPhone 11 Pro Max / XS Max)
- iPhone 5.5" Display (iPhone 8 Plus)

**iPadOS (iPad)**
- iPad Pro 12.9" (3rd Gen+)
- iPad Pro 13" (M4)
- iPad Pro 11"
- iPad Air 10.9"
- iPad 10.2"

**Android**
- Android Phones (FHD+)
- Android Tablets (7" & 10")

**Capabilities**
- **Panorama Mode:** Split wide marketing images into seamless carousels (2, 3, or 4 screens).
- **Standard Mode:** Batch process single screenshots.
- **Client-Side Generation:** Privacy-focused; images are processed entirely in your browser.
- **ZIP Export:** Downloads a structured ZIP file ready for upload.

## Deliverables Status
- **A (Product Spec):** Implemented in UI flow.
- **B (Architecture):** Client-side generator active.
- **C (Data Model):** Updated for iPadOS support.
- **D (API):** Reference endpoints provided (optional backend).
- **E (Code):** Full frontend implementation + Server logic reference.
- **F (Tests):** See `server/generator.test.ts`.
- **G (Deployment):** Configured for static hosting.

## Architecture

1.  **Frontend (Vite + React):**
    -   Handles user interaction, file selection, and configuration.
    -   Uses `HTMLCanvasElement` and `Blob` APIs for instant processing in the browser.
2.  **Output:**
    -   Generates a structured ZIP file organized by `Platform -> Locale -> Device -> Orientation`.
3.  **Privacy:**
    -   No backend is required for the current app.
    -   Uploaded images are processed locally in the browser and are not sent to a server by the app.

## How to Run Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## Deployment Guide (Hostinger / Web Host)

This app is configured as a static site, meaning it runs entirely in the browser and does not require a Node.js server for the basic functionality.

### Build the App
Run the following command on your local machine:
```bash
npm run build
```
This creates a `dist` folder containing the optimized HTML, CSS, and JS files.

### Hosting Instructions
1.  Log in to your hosting provider (e.g., Hostinger) -> **File Manager**.
2.  Navigate to `public_html`.
3.  Create a folder named `projects/appmediaforge` (or your preferred path).
4.  **Upload** the *contents* of your local `dist` folder into this new folder.
5.  Visit `www.yourdomain.com/projects/appmediaforge/index.html`.

### Embedding in WordPress
To display the tool inside a WordPress page:
1.  Upload the app as described above.
2.  Use a **Custom HTML** block in WordPress:
    ```html
    <iframe 
      src="/projects/appmediaforge/index.html" 
      style="width: 100%; height: 100vh; min-height: 900px; border: none;" 
      title="App Store Asset Manager"
    ></iframe>
    ```

## API / Server-Side (Optional Phase 2)

If you enable server-side features for advanced processing or cloud storage:

### `POST /api/generate`
**Request:**
```json
{
  "project_id": "proj_123",
  "assets": ["asset_1_id"],
  "config": { ...GenerationConfig... }
}
```

### GCP Deployment
1.  **Build Container:**
    Create a `Dockerfile` that installs dependencies.
2.  **Cloud Run:**
    ```bash
    gcloud run deploy ios-media-forge --source . --region us-central1 --allow-unauthenticated
    ```
