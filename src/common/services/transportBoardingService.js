// src/common/services/transportBoardingService.js
// ─────────────────────────────────────────────────────────────────────────────
// Bus Boarding / De-boarding API Service
// Base: /schools/{schoolId}/transport
// Auth: JWT required on all endpoints
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

const BASE = (schoolId) => `/schools/${schoolId}/transport`;

export const transportBoardingService = {
  /** POST /transport/routes/{routeId}/boarding — BUS_DRIVER/BUS_CONDUCTOR/TRANSPORT_MANAGER/SCHOOL_ADMIN */
  markBoarding: (schoolId, routeId, data) =>
    API.post(`${BASE(schoolId)}/routes/${routeId}/boarding`, data),

  /** GET /transport/routes/{routeId}/boarding/today */
  getTodayLogsForRoute: (schoolId, routeId) =>
    API.get(`${BASE(schoolId)}/routes/${routeId}/boarding/today`),

  /** GET /transport/boarding/today — school-wide oversight (TRANSPORT_MANAGER/SCHOOL_ADMIN) */
  getTodayLogsForSchool: (schoolId) => API.get(`${BASE(schoolId)}/boarding/today`),

  /** GET /transport/students/{studentId}/boarding-history — parent/admin */
  getStudentHistory: (schoolId, studentId) =>
    API.get(`${BASE(schoolId)}/students/${studentId}/boarding-history`),

  /** GET /transport/students/{studentId}/boarding-status — "is he on the bus?" */
  getStudentTodayStatus: (schoolId, studentId) =>
    API.get(`${BASE(schoolId)}/students/${studentId}/boarding-status`),
};

export const BOARDING_TYPE = ["BOARDED", "DEBOARDED"];

export default transportBoardingService;
