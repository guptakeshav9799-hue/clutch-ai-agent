# Clutch — Autonomous AI Deadline Execution Agent

Clutch is an AI-powered logistics and task management web application that works *for* you. While you sleep, Clutch proactively manages your deadlines, breaks down tasks, creates Google Docs, blocks your calendar, and helps you overcome procrastination using behavioral psychology.

## Features

- **Shadow Agent**: An autonomous AI agent (powered by Gemini) that executes tasks in the background. It reads your deadlines, breaks them down into subtasks, and even creates initial drafts for you.
- **Crisis Mode**: Tasks change color and urgency based on proximity to the deadline (from calm green to emergency red).
- **Procrastination DNA**: Analyzes your habits and provides customized psychological tactics to help you get started.
- **Ulysses Contracts**: Allows you to set personal consequences for missing deadlines, using scientifically proven psychological pressure to improve follow-through.
- **Google Integrations**: Seamlessly integrates with Google Calendar and Gmail (via OAuth) to manage your schedule and pull in important deadlines.
- **Progressive Web App (PWA)**: Installable on desktop and mobile devices for a native-like experience.

## Tech Stack

- **Frontend**: React (Vite), Zustand (State Management), Framer Motion (Animations), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Authentication & Database**: Firebase Auth, Google OAuth, Firestore
- **AI Integration**: Google Gemini API
- **Deployment**: Google Cloud Run (Docker), Google Cloud Build

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Cloud Project with the following APIs enabled:
  - Google Gemini API
  - Google OAuth 2.0 (with Calendar and Gmail scopes)
  - Firebase Authentication and Firestore

### Environment Variables

You need to set up environment variables for both the client and the server.

1. Create a `.env` file in the `client` directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_VAPID_KEY=your-vapid-key
   VITE_API_URL=http://localhost:3001/api # Optional for local development via Vite proxy
   ```

2. Create a `.env` file in the root directory for the server:
   ```env
   PORT=3001
   NODE_ENV=development
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-secure-jwt-secret
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Running Locally

1. Install dependencies for both the client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Start the development server (runs both backend and frontend):
   Open two terminal windows:
   - Terminal 1 (Backend): `npm run dev:server` (runs on port 3001)
   - Terminal 2 (Frontend): `npm run dev:client` (runs on port 5173)

3. Open your browser and navigate to `http://localhost:5173`

### Deployment

The project includes a `cloudbuild.yaml` and `Dockerfile` for seamless deployment to Google Cloud Run.
To deploy, you can use the Google Cloud SDK:
```bash
gcloud builds submit --config cloudbuild.yaml --project your-project-id
```

## Architecture

```mermaid
graph TD
    %% Define styles
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef database fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef ai fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff;
    classDef external fill:#6b7280,stroke:#374151,stroke-width:2px,color:#fff;

    %% Nodes
    Client["💻 React Frontend (Vite)"]:::frontend
    Server["⚙️ Node.js / Express Backend"]:::backend
    Firebase["🔥 Firebase Auth & Firestore"]:::database
    Gemini["🧠 Google Gemini AI"]:::ai
    GoogleAPI["📅 Google Calendar & Gmail API"]:::external
    CloudRun["☁️ Google Cloud Run"]:::external

    %% Relationships
    Client <-->|REST API| Server
    Client <-->|Authentication| Firebase
    Server <-->|Database Reads/Writes| Firebase
    Server <-->|AI Task Execution| Gemini
    Server <-->|OAuth Scopes| GoogleAPI
    
    %% Grouping
    subgraph "Deployed via Cloud Build"
        CloudRun
        CloudRun -.->|Hosts| Client
        CloudRun -.->|Hosts| Server
    end
```

## Security & Architecture Notes
- The Firebase Client configuration is safe to be public (hardcoded) in `client/src/services/firebase.js`. 
- OAuth redirects are handled via Firebase Auth `signInWithRedirect` to avoid Cross-Origin-Opener-Policy (COOP) issues.

## License
MIT License - anyone is free to use, copy, and modify this project.
