# InsideNaija — Render Deployment Package

This package is deliberately small for uploading from an Android phone to GitHub.

Files:
- package.json
- server.js
- render.yaml

Render settings:
- Service: Web Service
- Runtime: Node
- Build Command: npm install
- Start Command: npm start
- Plan: Free

After deployment Render supplies an HTTPS onrender.com URL.

IMPORTANT: this deployment package is for getting the game live and testing the browser/multiplayer shell. It uses an in-memory player/chat store, so player accounts/progress are not yet durable across a server restart. For the full production economy, connect PostgreSQL/Supabase before accepting real player purchases or valuable progress.
