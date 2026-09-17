export default function PresenceList({ users }) {
  return (
    <div className="presence-list">
      <span className="presence-label">Online now:</span>
      {users.length === 0 && <span className="presence-empty">Just you</span>}
      {users.map((u) => (
        <span key={u.userId} className="presence-chip">
          {u.username}
        </span>
      ))}
    </div>
  );
}
