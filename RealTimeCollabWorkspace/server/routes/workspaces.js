const express = require("express");
const Workspace = require("../models/Workspace");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// List every workspace the current user owns or collaborates on.
router.get("/", async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: req.userId }, { "collaborators.user": req.userId }],
  })
    .select("name updatedAt owner collaborators")
    .sort({ updatedAt: -1 });

  const shaped = workspaces.map((w) => ({
    id: w._id,
    name: w.name,
    updatedAt: w.updatedAt,
    role: w.roleFor(req.userId),
  }));
  res.json(shaped);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "name is required" });

  const workspace = await Workspace.create({ name, owner: req.userId, content: "" });
  res.status(201).json({ id: workspace._id, name: workspace.name, role: "owner" });
});

router.get("/:id", async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).populate(
    "collaborators.user",
    "username email"
  );
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });

  const role = workspace.roleFor(req.userId);
  if (!role) return res.status(403).json({ message: "You don't have access to this workspace" });

  res.json({
    id: workspace._id,
    name: workspace.name,
    content: workspace.content,
    role,
    collaborators: workspace.collaborators.map((c) => ({
      username: c.user.username,
      email: c.user.email,
      role: c.role,
    })),
  });
});

// Owner-only: add or update a collaborator's role by email.
router.post("/:id/collaborators", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "email and a valid role (editor|viewer) are required" });
  }

  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  if (workspace.owner.toString() !== req.userId) {
    return res.status(403).json({ message: "Only the owner can manage collaborators" });
  }

  const targetUser = await User.findOne({ email });
  if (!targetUser) return res.status(404).json({ message: "No user with that email" });

  const existing = workspace.collaborators.find((c) => c.user.toString() === targetUser._id.toString());
  if (existing) {
    existing.role = role;
  } else {
    workspace.collaborators.push({ user: targetUser._id, role });
  }
  await workspace.save();
  res.json({ message: "Collaborator updated" });
});

module.exports = router;
