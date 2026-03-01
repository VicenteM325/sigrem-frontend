import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function RoleRoute({ children, role }) {

  const { roles } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to="/dashboard/home" />;
  }

  return children;
}