import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../store/authSlice";

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Collab Workspace
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
