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
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          🍔 Hungrilla
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/cart">🛒 Cart</Link>
          <Link to="/orders">My Orders</Link>
          <span style={{ color: "#333", fontWeight: 600 }}>
            Hi, {user?.name?.split(" ")[0]}
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
