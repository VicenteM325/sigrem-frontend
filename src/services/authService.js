import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

export const login = async (email, password) => {
    const response = await API.post("/login", {
        email,
        password,
    });

    return response.data;
};

export const logout = async (token) => {
  await API.post(
    "/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};