import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8085/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// Refresh handling state
// ─────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR (REFRESH LOGIC)
// ─────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ If not 401 → reject
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ❌ Ignore refresh API itself
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    // ─────────────────────────────
    // Queue requests if refresh running
    // ─────────────────────────────
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return API(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ─────────────────────────────
    // Start refresh
    // ─────────────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        "http://localhost:8085/api/v1/auth/refresh-token",
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Refresh Response:", response.data);

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token received");
      }

      // Save tokens
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update axios default header
      API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

      // Process queue
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return API(originalRequest);

    } catch (err) {
      processQueue(err, null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────
// LOGOUT FUNCTION
// ─────────────────────────────────────────────
function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("schoolId");
  window.location.href = "/login";
}

// ─────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────
export const getStudents = async (page = 0, size = 10) => {
  const res = await API.get(
    `/school-admin/getStudentDetails?page=${page}&size=${size}`
  );
  return res.data;
};

export const getClassrooms = async () => {
  const res = await API.get("/school-admin/getClassRoom");
  return res.data;
};

export const getStudentsByClassroom = async (classroomId) => {
  const res = await API.get(`/classroom/${classroomId}/students`);
  return res.data;
};

export default API;

// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8085/api/v1",
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken"); // FIXED
//     console.log("Attaching token to request:", token); // DEBUG LOG
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
  
//   (error) => Promise.reject(error)
// );

// export const getStudents = async (page = 0, size = 10) => {
//   const res = await API.get(`/school-admin/getStudentDetails?page=${page}&size=${size}`);
//   return res.data;
// };

// // Get all classrooms
// export const getClassrooms = async () => {
//   const res = await API.get("/school-admin/getClassRoom");
//   return res.data;
// };

// // Get students by classroom
// export const getStudentsByClassroom = async (classroomId) => {
//   const res = await API.get(`/classroom/${classroomId}/students`);
//   return res.data;
// };
// export default API;