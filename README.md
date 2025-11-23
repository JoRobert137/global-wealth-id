# Global Wealth ID

A complete full-stack application for credit score conversion between countries.

## Project Structure

- `/frontend` - React + TypeScript SPA
- `/backend` - Node.js + Express API server
- `Dockerfile` - Multi-stage container build for Azure Container Apps

## Features

### Frontend
- Single page application with credit score conversion form
- Dropdown selectors for countries (US, UK, India, Canada)
- Real-time conversion results display
- Recent checks history (last 10 conversions)

### Backend
- Express server on port 3001
- Mock credit score conversion logic
- In-memory history storage
- RESTful API endpoints

## Quick Start

### Development Mode

1. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start frontend (in another terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Docker Build & Run

```bash
# Build the Docker image
docker build -t global-wealth-id .

# Run the container
docker run -p 3000:3000 global-wealth-id

# Access the application at http://localhost:3000
```

## API Endpoints

- `POST /api/convert` - Convert credit score between countries
- `GET /api/history` - Get conversion history
- `GET /health` - Health check endpoint

## Conversion Logic

The application uses a base mapping system:
- US: 1.0 (base reference)
- UK: 0.9
- India: 0.8
- Canada: 0.95

Scores are normalized to the base and then converted to the target country.

---
## GitHub Repository
You can view the full source code here:  
https://github.com/JoRobert137/global-wealth-id.git

## Live Demo Link :

https://gwid-app.delightfulglacier-ac7cdb6a.eastus.azurecontainerapps.io/