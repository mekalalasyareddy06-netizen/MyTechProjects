# Real-Time Collaborative Project Workspace

A multi-user workspace where everyone connected to the same document sees each
other's edits instantly. Built with **React, Node.js, Socket.io, MongoDB,
Redux, and JWT** — the same document can be opened by several people at once,
each with an **owner / editor / viewer** role that's enforced on the server,
not just hidden in the UI.

## What it does

- **Real-time sync** — every keystroke in a workspace is broadcast over a
  Socket.io WebSocket connection to everyone else viewing it, with no polling.
- **Presence** — see who else is currently in the workspace with you.
- **Role-based access** — the owner can invite collaborators as either
  `editor` or `viewer`. Viewers can't edit; that rule is enforced in the
  Socket.io handler itself, so it can't be bypassed by a modified client.
- **JWT authentication** — stateless auth on both the REST API and the
  WebSocket handshake.
- **Redux (Redux Toolkit)** — auth state and workspace state (including the
  live document content and presence list) are managed centrally, with the
  content synced to the DB on a short debounce so a browser refresh never
  loses the latest text.

## Architecture

```
client/  React + Redux Toolkit + socket.io-client
   -> REST calls (login, register, list/create workspaces, manage collaborators)
   -> WebSocket (join-workspace, content-change, cursor-position, presence-update)

server/  Express + Socket.io + Mongoose
   routes/auth.js         register/login, issues JWTs
   routes/workspaces.js   CRUD + collaborator management (REST)
   socket/collaboration.js  real-time sync, presence tracking, role enforcement
   models/                User, Workspace (with embedded collaborator roles)
```

## Running it locally

You'll need Node.js 18+ and a MongoDB instance (a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine, or a local
`mongod`).

**1. Server**

```bash
cd server
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev            # starts on http://localhost:5000
```

**2. Client**

```bash
cd client
cp .env.example .env   # defaults already point at localhost:5000
npm install
npm run dev            # starts on http://localhost:5173
```

Open two different browsers (or one normal + one incognito window) at
`http://localhost:5173`, register two accounts, create a workspace with one
of them, add the second account as a collaborator, and open the same
workspace in both — typing in one shows up in the other immediately.

## Tests

`server/tests/auth-and-roles.test.js` covers password hashing, JWT
sign/verify, and the owner/editor/viewer role resolution logic without
needing a live database:

```bash
cd server
node tests/auth-and-roles.test.js
```

## Notes

- Content is broadcast immediately over the socket and persisted to MongoDB
  on a 400ms debounce, so rapid typing doesn't hammer the database while
  still never losing data on disconnect.
- This is a portfolio/demo project — for production use you'd want
  refresh tokens, rate limiting, and a proper CRDT/OT algorithm for
  conflict resolution if two people ever type in the exact same spot at the
  exact same moment (this version uses simple last-write-wins broadcasting).
