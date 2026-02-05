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

  return auth.role === role ? children : <Navigate to="/login" />;
}
