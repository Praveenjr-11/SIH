# LAND STACK – Integrated GIS-based DPI for Land Governance

Production-grade, decoupled enterprise architecture for land governance, cadastral GIS mapping, and GSI (Geological Survey of India) geoscientific risk integration.

---

## 📁 Repository File Structure

```
d:\SIH\land-stack\
├── backend/                  # Standalone TypeScript REST API Server
│   ├── src/
│   │   ├── controllers/      # Parcels, GSI layers, Mutations, Analytics controllers
│   │   ├── routes/           # Express API routers (/api/v1/parcels, /api/v1/gsi, etc.)
│   │   ├── data/             # Mock DB & Sriperumbudur GeoJSON spatial store
│   │   ├── types/            # Backend TypeScript data interfaces
│   │   └── server.ts         # Express server bootstrap (Port 5000)
│   ├── package.json          # Backend dependencies (express, cors, tsx, typescript)
│   └── tsconfig.json         # Backend TypeScript config
│
├── frontend/                 # Standalone Next.js 15 Client Web Application
│   ├── src/
│   │   ├── app/              # Next.js app routes (/, /registry, /mutation, /analytics, /architecture)
│   │   ├── components/       # GIS MapView, ParcelInspector, DigitalTitleCard, Navbar
│   │   ├── services/         # API Client (api.ts targeting http://localhost:5000/api/v1)
│   │   └── types/            # Client TypeScript definitions
│   ├── package.json          # Frontend dependencies (next, react, leaflet, recharts, tailwindcss)
│   └── tsconfig.json         # Client TypeScript config
│
├── .gitignore                # Git ignore configuration
├── package.json              # Monorepo root runner scripts
└── README.md                 # Project documentation
```

---

## 🚀 How to Run

### 1. Run Backend Server (REST API on Port 5000)
```bash
cd backend
npm run dev
# OR from root: npm run dev:backend
```
- **Health Check**: `http://localhost:5000/api/v1/health`
- **Parcels GeoJSON**: `http://localhost:5000/api/v1/parcels`
- **GSI Advisory Layers**: `http://localhost:5000/api/v1/gsi/layers`

### 2. Run Frontend Web App (Next.js on Port 3000)
```bash
cd frontend
npm run dev
# OR from root: npm run dev:frontend
```
- **Web App**: `http://localhost:3000`

---

## 🏛️ GSI Integration Disclaimer
**GSI (Geological Survey of India)** data is provided purely as an external geoscientific, lithological, and geohazard advisory layer (`/api/v1/gsi/layers`) for land-use and infrastructure planning. Cadastral ownership, RoR, registration, and ULPIN records are managed under State Revenue Authority endpoints (`/api/v1/parcels`).
