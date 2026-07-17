// src/common/services/healthService.js
// ─────────────────────────────────────────────────────────────────────────────
// Health / Infirmary API Service
// Base: /schools/{schoolId}/health
// Auth: JWT required on all endpoints
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

const BASE = (schoolId) => `/schools/${schoolId}/health`;

export const healthService = {
  // ── Health Records ────────────────────────────────────────────────
  /** PUT /health/records — NURSE/SCHOOL_ADMIN — create or update (upsert) */
  upsertRecord: (schoolId, data) => API.put(`${BASE(schoolId)}/records`, data),

  /** GET /health/records/{studentId} */
  getRecord: (schoolId, studentId) => API.get(`${BASE(schoolId)}/records/${studentId}`),

  /** GET /health/records — nurse's master list */
  getAllRecords: (schoolId) => API.get(`${BASE(schoolId)}/records`),

  // ── Sick Visits ───────────────────────────────────────────────────
  /** POST /health/visits — NURSE/SCHOOL_ADMIN */
  logVisit: (schoolId, data) => API.post(`${BASE(schoolId)}/visits`, data),

  /** PUT /health/visits/{visitId} */
  updateVisit: (schoolId, visitId, data) =>
    API.put(`${BASE(schoolId)}/visits/${visitId}`, data),

  /** GET /health/visits/{studentId} — visit history for a student */
  getVisitHistory: (schoolId, studentId) =>
    API.get(`${BASE(schoolId)}/visits/${studentId}`),

  /** GET /health/visits/today — infirmary daily log */
  getTodayVisits: (schoolId) => API.get(`${BASE(schoolId)}/visits/today`),

  /** GET /health/visits/pending-followup */
  getPendingFollowUps: (schoolId) => API.get(`${BASE(schoolId)}/visits/pending-followup`),

  /** DELETE /health/visits/{visitId} — SCHOOL_ADMIN/SUPER_ADMIN only */
  deleteVisit: (schoolId, visitId) => API.delete(`${BASE(schoolId)}/visits/${visitId}`),

  // ── Stats ─────────────────────────────────────────────────────────
  getStats: (schoolId) => API.get(`${BASE(schoolId)}/stats`),
};

export const HEALTH_VISIT_STATUS = ["REPORTED", "TREATED", "REFERRED", "RESOLVED"];

export default healthService;
