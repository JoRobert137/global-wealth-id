# 📘 VibeLog.md  
Documenting my usage of AI agents (Cline) to build the **“Global Wealth ID”** project

---

## 🏁 Overview  
This log captures how I used **Cline** as my AI pair programmer to build the entire **Global Wealth ID** application *from scratch*.  
I did **not** use create-react-app, Vite CLI, or Next.js generators.  
All files were generated manually by interacting with Cline and iteratively refining the code.

This document includes:

- Real prompts  
- AI output summaries  
- Bug fixes  
- Architecture decisions  
- Screenshots (added in submission)  

---

# 1️⃣ Initial Setup Prompt

### **My prompt to Cline**
```md
⚠ VERY IMPORTANT:
- Do NOT run create-react-app, Vite CLI, Next.js CLI, or any boilerplate generators.
- Instead, generate the minimal React + TypeScript + bundler setup by directly creating the files and config (you may use Vite/webpack style configs, but write them yourself as code).

Tech stack:
- Frontend: React + TypeScript (SPA) in /frontend
- Backend: Node.js + Express in /backend

Functional requirements:

1. Frontend (in /frontend):
   - A single page app with:
     - An input form:
       - Country A (dropdown, e.g., US, UK, India, Canada)
       - Country B (dropdown, same options)
       - Credit Score (number input)
     - On submit:
       - Call backend POST http://localhost:3001/api/convert with JSON: { countryFrom, countryTo, score }
       - Show the converted score returned by the backend.
     - Below the form:
       - A "Recent Checks" section
       - This calls backend GET http://localhost:3001/api/history
       - Displays the last 10 conversions with: timestamp, fromCountry, toCountry, originalScore, convertedScore.

2. Backend (in /backend):
   - Express server listening on port 3001.
   - In-memory array to store conversions.
   - POST /api/convert:
       - Accepts { countryFrom, countryTo, score }.
       - Uses a mocked conversion logic:
         - Base mapping per country: { US: 1.0, UK: 0.9, India: 0.8, Canada: 0.95 }
         - Converts by normalizing and reconverting.
       - Creates an object:
         { id, timestamp, countryFrom, countryTo, originalScore, convertedScore }
       - Keeps only the last 10 items.
   - GET /api/history → returns last 10 records.

Project structure in root:
- /frontend
- /backend
- Dockerfile
- package.json (optional root scripts)
- README.md

Docker requirements:
- Multi-stage build (frontend → backend → runtime)
- Serve frontend static files
- Backend runs on port 3000
- HEALTHCHECK on /health
```

---

## ✔️ What Cline Generated (Summary)

Cline generated the complete project skeleton, including:

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/index.html`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `backend/src/index.ts` (Express TypeScript server)
- Separate `package.json` files for frontend and backend
- A multi-stage `Dockerfile` skeleton

This served as the foundation of the entire project.

---

# 2️⃣ Bug Encounter #1 — Duplicate Server File

### **Issue Identified**
After generation, Cline unintentionally created a **server.js** at the project root.  
This conflicted with the actual backend entry point:  
`/backend/src/index.ts`.

---

### **My Prompt**
```md
Cline, I see a server.js at project root AND a TypeScript backend inside /backend/src/index.ts.
This is wrong. Remove the root server.js and confirm the correct backend entry is backend/dist/index.js after build.
```

---

### **AI Output Summary**

- Acknowledged the duplicate `server.js` file as a mistake  
- Explained the conflict between the root `server.js` and the TypeScript backend inside `/backend`  
- Removed the incorrect root-level `server.js` from the project design  
- Updated the Dockerfile to correctly point to the real backend entry:

```dockerfile
CMD ["node", "backend/dist/index.js"]
```
---

## Result

✔ Clean backend structure

✔ Single, correct entry point

✔ No runtime conflicts