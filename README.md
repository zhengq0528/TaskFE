# TaskFE — Frontend (React + TypeScript + Vite)

A simple frontend dashboard for managing tasks.  
Supports CRUD UI, sorting, filtering, tags, CSV import/export, and optional WebSocket updates.

---

## 📦 Libraries Used

- **React 18**
- **TypeScript**
- **Vite**
- **Axios** – API requests
- **PapaParse** – CSV import/export
- **FileSaver** – CSV download
- **@testing-library/react** – Component testing
- **@testing-library/jest-dom** – Test matchers
- **Vitest** – Test runner

---

##  Setup (from scratch)

### 1. Install dependencies
```bash
npm install

npm run dev

http://localhost:5173
```

### 2. Testing
```bash 

npm test

```

## API config

VITE_API_BASE_URL=http://localhost:4000
VITE_API_BASE_URL=https://your-backend-url.up.railway.app