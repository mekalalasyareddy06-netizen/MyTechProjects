import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post("/projects", { name: name.trim(), description });
    setName("");
    setDescription("");
    loadProjects();
  };

  return (
    <div className="dashboard">
      <form className="create-form" onSubmit={handleCreate}>
        <input
          placeholder="New project name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create project</button>
      </form>

      {loading && <p className="loading">Loading projects...</p>}

      <ul className="project-list">
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
            {p.description && <span className="project-desc">{p.description}</span>}
          </li>
        ))}
        {!loading && projects.length === 0 && (
          <p>No projects yet — create one above to get started.</p>
        )}
      </ul>
    </div>
  );
}
