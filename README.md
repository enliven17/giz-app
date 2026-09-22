# Nexum

Each application lives in its own top-level folder:

- `frontend/`: React, TypeScript, and Vite web app.
- `mobile/`: Expo / React Native mobile app. See [mobile setup](mobile/README.md).
- `backend/`: Reserved for the future backend server.
- `landing/`: Reserved for the landing website.

## Run the frontend

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).
The current frontend uses mock data and simulated authentication; no backend
or environment variables are required.

To build and preview the frontend:

```bash
npm run build
npm run preview
```
