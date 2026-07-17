// src/common/services/counselingService.js
// ─────────────────────────────────────────────────────────────────────────────
// Counseling API Service
// Base: /schools/{schoolId}/counseling
// Auth: JWT required on all endpoints
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

const BASE = (schoolId) => `/schools/${schoolId}/counseling`;

export const counselingService = {
  // ── Referrals ─────────────────────────────────────────────────────
  /** POST /counseling/referrals — TEACHER/CLASS_TEACHER/PARENT/SCHOOL_ADMIN/PRINCIPAL/VICE_PRINCIPAL */
  raiseReferral: (schoolId, data) => API.post(`${BASE(schoolId)}/referrals`, data),

  /** GET /counseling/referrals — COUNSELOR/PRINCIPAL/SCHOOL_ADMIN */
  getAllReferrals: (schoolId) => API.get(`${BASE(schoolId)}/referrals`),

  /** PATCH /counseling/referrals/{referralId}/status — COUNSELOR/SCHOOL_ADMIN */
  updateReferralStatus: (schoolId, referralId, data) =>
    API.patch(`${BASE(schoolId)}/referrals/${referralId}/status`, data),

  // ── Sessions ──────────────────────────────────────────────────────
  /** POST /counseling/sessions — COUNSELOR only */
  logSession: (schoolId, data) => API.post(`${BASE(schoolId)}/sessions`, data),

  /** GET /counseling/sessions/{studentId} — confidential, COUNSELOR/PRINCIPAL/SCHOOL_ADMIN */
  getStudentSessions: (schoolId, studentId) =>
    API.get(`${BASE(schoolId)}/sessions/${studentId}`),

  /** PATCH /counseling/sessions/{sessionId} — COUNSELOR/SCHOOL_ADMIN */
  updateSession: (schoolId, sessionId, data) =>
    API.patch(`${BASE(schoolId)}/sessions/${sessionId}`, data),

  /** GET /counseling/sessions/upcoming — COUNSELOR's schedule */
  getUpcomingSessions: (schoolId) => API.get(`${BASE(schoolId)}/sessions/upcoming`),

  // ── Stats ─────────────────────────────────────────────────────────
  /** GET /counseling/stats */
  getStats: (schoolId) => API.get(`${BASE(schoolId)}/stats`),
};

export const REFERRAL_URGENCY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const REFERRAL_STATUS = ["PENDING", "IN_PROGRESS", "CLOSED"];
export const SESSION_STATUS = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default counselingService;
