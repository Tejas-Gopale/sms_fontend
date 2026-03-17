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

export const getStudents = async (page = 0, size = 10) => {
  const res = await API.get(`/school-admin/getStudentDetails?page=${page}&size=${size}`);
  return res.data;
};

export default API;