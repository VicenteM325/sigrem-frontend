import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import GuestRoute from "@/components/GuestRoute";

function App() {
  return (
    <Routes>

      {/* RUTAS PRIVADAS */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* RUTAS PUBLICAS SOLO PARA INVITADOS */}
      <Route
        path="/auth/*"
        element={
          <GuestRoute>
            <Auth />
          </GuestRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />

    </Routes>
  );
}

export default App;
