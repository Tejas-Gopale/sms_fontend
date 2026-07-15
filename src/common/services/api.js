import axios from "axios";

// API Instance Configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8085/api/v1",
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

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

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

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${API.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (!accessToken) throw new Error("No access token received");

      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      processQueue(null, accessToken);

      originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
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
// ADMISSION SERVICE (Using common API instance)
// ─────────────────────────────────────────────
export const admissionService = {
  /** Parent submits inquiry */
  submitInquiry: (schoolId, data) =>
    API.post(`/admission/schools/${schoolId}/inquire`, data),


  /** Paginated inquiry list */
  getInquiries: (schoolId, status = "", page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    return API.get(`/admission/schools/${schoolId}`, { params });
  },

  /** Single inquiry by ID */
  getInquiry: (inquiryId) => API.get(`/admission/${inquiryId}`),

  /** Update status — APPROVED / REJECTED etc. */
  updateStatus: (inquiryId, data) =>
    API.put(`/admission/${inquiryId}/status`, data),

  /** Dashboard stats */
  getStats: (schoolId) => API.get(`/admission/schools/${schoolId}/dashboard`),

  /** Convert inquiry to student */
  grantAdmission: (data) => API.post(`/admission/grant`, data),

  /** Direct / Walk-in Admission */
  directAdmit: (data) =>
  API.post(`/admission/direct`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }),

};

// ─────────────────────────────────────────────
// OTHER API CALLS
// ─────────────────────────────────────────────
export const getStudents = async (page = 0, size = 10) => {
  const res = await API.get(`/school-admin/getStudentDetails`, {
    params: { page, size },
  });
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