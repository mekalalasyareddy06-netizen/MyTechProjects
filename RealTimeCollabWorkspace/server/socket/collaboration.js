const Workspace = require("../models/Workspace");
const { verifySocketToken } = require("../middleware/auth");

// In-memory presence map: workspaceId -> Map<socketId, { userId, username }>
const presence = new Map();

// Debounced-save timers so every keystroke doesn't hit MongoDB.
const saveTimers = new Map();
const SAVE_DEBOUNCE_MS = 400;

function getPresenceList(workspaceId) {
  const room = presence.get(workspaceId);
  if (!room) return [];
  return Array.from(room.values());
}

function scheduleSave(workspaceId, content) {
  clearTimeout(saveTimers.get(workspaceId));
  const timer = setTimeout(async () => {
    try {
      await Workspace.findByIdAndUpdate(workspaceId, { content });
    } catch (err) {
      console.error("Failed to persist workspace content:", err.message);
    }
  }, SAVE_DEBOUNCE_MS);
  saveTimers.set(workspaceId, timer);
}

function registerCollaborationHandlers(io) {
  // Authenticate every socket connection using the JWT sent from the client.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const payload = token ? verifySocketToken(token) : null;
    if (!payload) return next(new Error("Unauthorized"));
    socket.user = { userId: payload.userId, username: payload.username };
    next();
  });

  io.on("connection", (socket) => {
    let currentWorkspaceId = null;

    socket.on("join-workspace", async ({ workspaceId }, ack) => {
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return ack?.({ ok: false, message: "Workspace not found" });

        const role = workspace.roleFor(socket.user.userId);
        if (!role) return ack?.({ ok: false, message: "Access denied" });

        currentWorkspaceId = workspaceId;
        socket.join(workspaceId);

        if (!presence.has(workspaceId)) presence.set(workspaceId, new Map());
        presence.get(workspaceId).set(socket.id, {
          userId: socket.user.userId,
          username: socket.user.username,
        });

        io.to(workspaceId).emit("presence-update", getPresenceList(workspaceId));
        ack?.({ ok: true, content: workspace.content, role });
      } catch (err) {
        ack?.({ ok: false, message: "Failed to join workspace" });
      }
    });

    // Broadcasts a content change to everyone else in the room, then
    // debounce-persists it. Viewers are rejected server-side, not just
    // hidden in the UI, so read-only access can't be bypassed.
    socket.on("content-change", async ({ workspaceId, content }) => {
      if (workspaceId !== currentWorkspaceId) return;

      const workspace = await Workspace.findById(workspaceId).select("owner collaborators");
      if (!workspace) return;
      const role = workspace.roleFor(socket.user.userId);
      if (role === "viewer" || !role) return;

      socket.to(workspaceId).emit("content-change", {
        content,
        from: socket.user.username,
      });
      scheduleSave(workspaceId, content);
    });

    // Lightweight, non-persisted cursor position broadcast.
    socket.on("cursor-position", ({ workspaceId, position }) => {
      if (workspaceId !== currentWorkspaceId) return;
      socket.to(workspaceId).emit("cursor-position", {
        userId: socket.user.userId,
        username: socket.user.username,
        position,
      });
    });

    socket.on("disconnect", () => {
      if (!currentWorkspaceId) return;
      const room = presence.get(currentWorkspaceId);
      if (room) {
        room.delete(socket.id);
        io.to(currentWorkspaceId).emit("presence-update", getPresenceList(currentWorkspaceId));
        if (room.size === 0) presence.delete(currentWorkspaceId);
      }
    });
  });
}

module.exports = registerCollaborationHandlers;
