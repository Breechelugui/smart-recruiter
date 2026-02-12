import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RoleRoute({ role, children }) {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (auth.loading || !auth.user) {
    return null;
  }

  // Convert expected role to uppercase for comparison
  const expectedRole = role.toUpperCase();
  return auth.role === expectedRole ? children : <Navigate to="/login" />;
}
