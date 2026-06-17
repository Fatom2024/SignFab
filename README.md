# SignFab Manager7

An application for managing projects, clients, stock, and production workflows for a sign and printing manufacturing company. Powered by Firebase for authentication, database, and real-time functions.

## Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (installed automatically with Node.js)

### Installation
1. Clone or download the project files to your local system.
2. Open your terminal in the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration
1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the App
Start the development server:
```bash
npm run dev
```

The application will be accessible at: [http://localhost:3000](http://localhost:3000)

## Features
- **Tableau de Bord** (Dashboard): View overall sales, project statistics, and low stock counts.
- **Projets**: Track clients, files, pricing structure, production steps, and payment states.
- **Stock**: Manage consumables/materials with smart quantity tracking, alerting when levels dip below a minimum, and custom pricing per unit.
- **Clients**: Track individual and business clients with interactive cards, contact details, and custom company profiling.
- **Étapes & Tarifs**: Standardize pricing templates and configurations for sign-making processes.
- **Analyseur SVG**: Inline parsing and cost estimations for digital assets.
