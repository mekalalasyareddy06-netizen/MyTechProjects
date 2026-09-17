import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchWorkspaces, createWorkspace } from "../store/workspaceSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.workspaces);
  const [name, setName] = useState("");

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await dispatch(createWorkspace(name.trim()));
    setName("");
  };

  return (
    <div className="dashboard">
      <form className="create-form" onSubmit={handleCreate}>
        <input
          placeholder="New workspace name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create workspace</button>
      </form>

      <ul className="workspace-list">
        {list.map((ws) => (
          <li key={ws.id}>
            <Link to={`/workspace/${ws.id}`}>{ws.name}</Link>
            <span className={`role-badge role-${ws.role}`}>{ws.role}</span>
          </li>
        ))}
        {list.length === 0 && <p>No workspaces yet — create one above to get started.</p>}
      </ul>
    </div>
  );
}
