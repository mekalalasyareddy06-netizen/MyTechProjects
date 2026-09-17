import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchWorkspace, addCollaborator, clearCurrent, setPresence } from "../store/workspaceSlice";
import { getSocket, disconnectSocket } from "../services/socket";
import PresenceList from "../components/PresenceList";

export default function WorkspacePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const current = useSelector((state) => state.workspaces.current);
  const presence = useSelector((state) => state.workspaces.presence);

  const [content, setContent] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [collabRole, setCollabRole] = useState("editor");
  const [connectionMsg, setConnectionMsg] = useState("Connecting...");

  // Guards against re-broadcasting content we just received from someone else.
  const skipNextEmit = useRef(false);

  useEffect(() => {
    dispatch(fetchWorkspace(id));

    const socket = getSocket();

    socket.emit("join-workspace", { workspaceId: id }, (res) => {
      if (res?.ok) {
        setContent(res.content || "");
        setConnectionMsg("");
      } else {
        setConnectionMsg(res?.message || "Could not join workspace");
      }
    });

    socket.on("content-change", ({ content: incoming }) => {
      skipNextEmit.current = true;
      setContent(incoming);
    });

    socket.on("presence-update", (users) => {
      dispatch(setPresence(users));
    });

    return () => {
      socket.off("content-change");
      socket.off("presence-update");
      dispatch(clearCurrent());
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (skipNextEmit.current) {
      skipNextEmit.current = false;
      return;
    }
    const socket = getSocket();
    socket.emit("content-change", { workspaceId: id, content: value });
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;
    await dispatch(addCollaborator({ id, email: collabEmail.trim(), role: collabRole }));
    setCollabEmail("");
  };

  if (!current) return <p className="loading">Loading workspace...</p>;

  const isViewer = current.role === "viewer";
  const isOwner = current.role === "owner";

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <h2>{current.name}</h2>
        <span className={`role-badge role-${current.role}`}>{current.role}</span>
      </div>

      <PresenceList users={presence} />
      {connectionMsg && <p className="error-text">{connectionMsg}</p>}

      <textarea
        className="editor"
        value={content}
        onChange={handleChange}
        readOnly={isViewer}
        placeholder={isViewer ? "You have view-only access." : "Start typing — everyone connected sees this instantly."}
      />

      {isOwner && (
        <div className="collab-panel">
          <h3>Manage collaborators</h3>
          <form onSubmit={handleAddCollaborator} className="collab-form">
            <input
              type="email"
              placeholder="Collaborator's email"
              value={collabEmail}
              onChange={(e) => setCollabEmail(e.target.value)}
            />
            <select value={collabRole} onChange={(e) => setCollabRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button type="submit">Add / update</button>
          </form>
          <ul className="collab-list">
            {current.collaborators.map((c) => (
              <li key={c.email}>
                {c.username} ({c.email}) — {c.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
