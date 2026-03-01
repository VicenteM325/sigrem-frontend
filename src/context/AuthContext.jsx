import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRoles = localStorage.getItem("roles");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setRoles(JSON.parse(storedRoles));
      setToken(storedToken);
    }
  }, []);

  const login = (data) => {
    setUser(data.user);
    setRoles(data.roles);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("roles", JSON.stringify(data.roles));
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setToken(null);

    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, roles, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}