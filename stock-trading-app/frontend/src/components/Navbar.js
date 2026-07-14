import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">StockTrade</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {user && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/market">Market</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/portfolio">Portfolio</Link>
              </li>
              {user.role === "ADMIN" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Admin</Link>
                </li>
              )}
            </>
          )}
        </ul>
        <div className="d-flex align-items-center">
          {user ? (
            <>
              <span className="text-light me-3">
                {user.name} &middot; ${Number(user.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm me-2" to="/login">Login</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
