import { createContext, useState, useEffect } from "react";
import { logout as logoutService } from "@/services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si los valores existen en localStorage y son válidos
    const storedUser = localStorage.getItem("user");
    const storedRoles = localStorage.getItem("roles");
    const storedToken = localStorage.getItem("token");

    // Validar que los datos no sean nulos ni vacíos
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setRoles(storedRoles ? JSON.parse(storedRoles) : []);
        setToken(storedToken);
      } catch (error) {
        console.error("Error al parsear los datos del localStorage", error);
      }
    } else {
      console.log("No se encontraron datos válidos en localStorage");
    }
  }, []);

  const login = (data) => {
    setUser(data.user);
    setRoles(data.roles);
    setToken(data.token);

    // Guardar en localStorage con un manejo de errores
    try {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("roles", JSON.stringify(data.roles));
      localStorage.setItem("token", data.token);
    } catch (error) {
      console.error("Error al guardar los datos en el localStorage", error);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutService(token);
      }
    } catch (error) {
      console.log("Token ya expirado o inválido", error);
    }

    // Limpia el estado y localStorage
    setUser(null);
    setRoles([]);
    setToken(null);

    // Elimina solo los items relevantes del localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, roles, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}