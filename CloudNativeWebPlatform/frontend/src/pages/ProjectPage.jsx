import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import TaskAttachments from "../components/TaskAttachments";

const STATUSES = ["todo", "in_progress", "done"];
const STATUS_LABELS = { todo: "To do", in_progress: "In progress", done: "Done" };

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const loadAll = async () => {
    const [projectRes, tasksRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
    ]);
    setProject(projectRes.data);
    setTasks(tasksRes.data);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post(`/projects/${id}/tasks`, { title: title.trim() });
    setTitle("");
    loadAll();
  };

  const handleStatusChange = async (taskId, status) => {
    await api.patch(`/projects/${id}/tasks/${taskId}`, { status });
    loadAll();
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/projects/${id}/tasks/${taskId}`);
    loadAll();
  };

  if (!project) return <p className="loading">Loading project...</p>;

  return (
    <div className="project-page">
      <h2>{project.name}</h2>
      {project.description && <p className="project-desc-full">{project.description}</p>}

      <form className="create-form" onSubmit={handleAddTask}>
        <input
          placeholder="New task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add task</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div className="task-row">
              <span className="task-title">{task.title}</span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                className="link-button"
                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              >
                Attachments
              </button>
              <button className="danger-button" onClick={() => handleDeleteTask(task.id)}>
                Delete
              </button>
            </div>
            {expandedTaskId === task.id && (
              <TaskAttachments projectId={id} taskId={task.id} />
            )}
          </li>
        ))}
        {tasks.length === 0 && <p>No tasks yet — add one above.</p>}
      </ul>
    </div>
  );
}
