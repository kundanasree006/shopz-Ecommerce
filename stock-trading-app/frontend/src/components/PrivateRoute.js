import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a route element to require login, and optionally a specific role.
// Usage: <PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PrivateRoute;
