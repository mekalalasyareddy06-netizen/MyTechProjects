import { useEffect, useState } from "react";
import api from "../api";

export default function TaskAttachments({ projectId, taskId }) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const base = `/projects/${projectId}/tasks/${taskId}/attachments`;

  const load = async () => {
    const { data } = await api.get(base);
    setAttachments(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(base, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (attachmentId) => {
    await api.delete(`${base}/${attachmentId}`);
    load();
  };

  return (
    <div className="attachments">
      <div className="attachments-list">
        {attachments.map((a) => (
          <div key={a.id} className="attachment-chip">
            <a href={a.download_url} target="_blank" rel="noreferrer">
              {a.filename}
            </a>
            <span className="attachment-size">{(a.size_bytes / 1024).toFixed(1)} KB</span>
            <button onClick={() => handleDelete(a.id)} title="Remove attachment">
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="upload-label">
        {uploading ? "Uploading..." : "+ Attach file"}
        <input type="file" onChange={handleUpload} disabled={uploading} hidden />
      </label>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
