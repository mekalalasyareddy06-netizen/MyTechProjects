process.env.JWT_SECRET = "test-secret";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verifySocketToken } = require("../middleware/auth");
const Workspace = require("../models/Workspace"); // schema-only, no DB call made here

(async () => {
  // 1. Password hashing round-trip
  const plain = "pw12345";
  const hash = await bcrypt.hash(plain, 10);
  const match = await bcrypt.compare(plain, hash);
  const noMatch = await bcrypt.compare("wrong-pw", hash);
  console.log("Password hash round-trip:", match === true && noMatch === false ? "PASS" : "FAIL");

  // 2. JWT sign/verify round-trip (mirrors signToken() in routes/auth.js)
  const token = jwt.sign({ userId: "u1", username: "alice" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const decoded = verifySocketToken(token);
  console.log("JWT verify valid token:", decoded?.username === "alice" ? "PASS" : "FAIL");

  const badDecoded = verifySocketToken(token + "tampered");
  console.log("JWT reject tampered token:", badDecoded === null ? "PASS" : "FAIL");

  // 3. Workspace.roleFor() logic, using a plain (unsaved) document — no DB needed
  const ownerId = "507f1f77bcf86cd799439011";
  const viewerId = "507f1f77bcf86cd799439012";
  const strangerId = "507f1f77bcf86cd799439013";
  const ws = new Workspace({
    name: "Test",
    owner: ownerId,
    collaborators: [{ user: viewerId, role: "viewer" }],
  });
  console.log("roleFor(owner):", ws.roleFor(ownerId) === "owner" ? "PASS" : "FAIL");
  console.log("roleFor(viewer):", ws.roleFor(viewerId) === "viewer" ? "PASS" : "FAIL");
  console.log("roleFor(stranger):", ws.roleFor(strangerId) === null ? "PASS" : "FAIL");
})();
