// src/common/services/housekeepingService.js
// ─────────────────────────────────────────────────────────────────────────────
// Housekeeping API Service
// Base: /schools/{schoolId}/housekeeping
// Auth: JWT required on all endpoints
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

const BASE = (schoolId) => `/schools/${schoolId}/housekeeping`;

export const housekeepingService = {
  // ── Tasks ─────────────────────────────────────────────────────────
  /** POST /housekeeping/tasks — SCHOOL_ADMIN/PRINCIPAL/VICE_PRINCIPAL */
  createTask: (schoolId, data) => API.post(`${BASE(schoolId)}/tasks`, data),

  /** GET /housekeeping/tasks — admin/principal oversight */
  getAllTasks: (schoolId) => API.get(`${BASE(schoolId)}/tasks`),

  /** GET /housekeeping/tasks/my — housekeeping staff's own worklist */
  getMyTasks: (schoolId) => API.get(`${BASE(schoolId)}/tasks/my`),

  /** PATCH /housekeeping/tasks/{taskId}/status */
  updateTaskStatus: (schoolId, taskId, data) =>
    API.patch(`${BASE(schoolId)}/tasks/${taskId}/status`, data),

  /** DELETE /housekeeping/tasks/{taskId} — SCHOOL_ADMIN/SUPER_ADMIN */
  deleteTask: (schoolId, taskId) => API.delete(`${BASE(schoolId)}/tasks/${taskId}`),

  // ── Complaints ────────────────────────────────────────────────────
  /** POST /housekeeping/complaints — any staff */
  raiseComplaint: (schoolId, data) => API.post(`${BASE(schoolId)}/complaints`, data),

  /** GET /housekeeping/complaints */
  getAllComplaints: (schoolId) => API.get(`${BASE(schoolId)}/complaints`),

  /** PATCH /housekeeping/complaints/{complaintId}/resolve */
  resolveComplaint: (schoolId, complaintId, data) =>
    API.patch(`${BASE(schoolId)}/complaints/${complaintId}/resolve`, data),

  // ── Stats ─────────────────────────────────────────────────────────
  getStats: (schoolId) => API.get(`${BASE(schoolId)}/stats`),
};

export const TASK_PRIORITY = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const TASK_STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
export const COMPLAINT_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default housekeepingService;
