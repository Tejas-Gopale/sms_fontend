import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8085/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // FIXED
    console.log("Attaching token to request:", token); // DEBUG LOG
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;