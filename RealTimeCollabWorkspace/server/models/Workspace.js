const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [collaboratorSchema],
  },
  { timestamps: true }
);

// A user can see a workspace if they're the owner or listed as a collaborator.
workspaceSchema.methods.roleFor = function (userId) {
  if (this.owner.toString() === userId.toString()) return "owner";
  const collab = this.collaborators.find((c) => c.user.toString() === userId.toString());
  return collab ? collab.role : null;
};

module.exports = mongoose.model("Workspace", workspaceSchema);
