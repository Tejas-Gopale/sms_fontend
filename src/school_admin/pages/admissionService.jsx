import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8085/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const admissionService = {

  // ── Existing APIs ─────────────────────────────────────────────────────────

  /** PUBLIC — Parent submits inquiry from school website */
  submitInquiry: (schoolId, data) =>
    api.post(`/admission/schools/${schoolId}/inquire`, data),

  /** Paginated inquiry list with optional status filter */
  getInquiries: (schoolId, status = "", page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    return api.get(`/admission/schools/${schoolId}`, { params });
  },

  /** Single inquiry by ID */
  getInquiry: (inquiryId) => api.get(`/admission/${inquiryId}`),

  /** Update status — APPROVED / REJECTED / REVIEWED / WAITLISTED */
  updateStatus: (inquiryId, data) =>
    api.put(`/admission/${inquiryId}/status`, data),

  /** Dashboard stat counts */
  getStats: (schoolId) =>
    api.get(`/admission/schools/${schoolId}/dashboard`),

  // ── Grant admission (inquiry → student) ──────────────────────────────────

  /**
   * Convert an APPROVED inquiry into a live student account.
   * POST /admission/grant
   * Body: { inquiryId, classRoomId, section?, admissionNumber? }
   */
  grantAdmission: (data) => api.post(`/admission/grant`, data),

  // ── NEW: Direct / Walk-in Admission ──────────────────────────────────────

  /**
   * Admit a walk-in student directly — no prior inquiry needed.
   * Admin fills all details on the spot; full onboarding runs in one call.
   * POST /admission/direct
   * Body: DirectAdmissionRequest
   */
  directAdmit: (data) => api.post(`/admission/direct`, data),
};