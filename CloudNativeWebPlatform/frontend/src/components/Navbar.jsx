import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Cloud-Native Platform
      </Link>
      {user && (
        <div className="nav-right">
          <span>{user.username}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </nav>
  );
}
