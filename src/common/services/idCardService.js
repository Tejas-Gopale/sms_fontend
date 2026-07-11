// src/common/services/idCardService.js
// ─────────────────────────────────────────────────────────────────────────────
// Identity Card API Service
// Base: /api/v1/identity-card
// Auth: JWT required on all endpoints
// 🔒 = backend resolves schoolId from JWT (SCHOOL_ADMIN / PRINCIPAL / SUPER_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

const BASE = "/identity-card";

// ─────────────────────────────────────────────────────────────────────────────
// 1. TEMPLATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const templateService = {
  /**
   * 1.1  POST /identity-card/template  🔒
   * Create a new ID card template for the logged-in admin's school.
   * Body: IdCardTemplateRequest
   * Required: templateName, holderType ("STUDENT" | "TEACHER" | "STAFF")
   * Optional: isActive, cardOrientation, cardStyle, logoPosition,
   *           primaryColor, secondaryColor, backgroundColor, textColor,
   *           accentColor, backgroundImageUrl, showPhoto, showDateOfBirth,
   *           showGender, showBloodGroup, showPhone, showEmergencyContact,
   *           showBusRoute, showSchoolAddress, showSchoolWebsite,
   *           showSchoolPhone, showSchoolEmail, showValidityDates,
   *           showQrCode, footerText
   * Returns: IdCardTemplateResponse (201)
   * NOTE: if isActive=true, any other active template for same holderType
   *       is automatically deactivated.
   */
  create: (data) => API.post(`${BASE}/template`, data),

  /**
   * 1.2  GET /identity-card/template/school/{schoolId}
   * All templates (active + inactive, all holderTypes) for a school.
   * Used for "Manage Templates" list page.
   * Returns: IdCardTemplateResponse[]
   */
  getAllBySchool: (schoolId) =>
    API.get(`${BASE}/template/school/${schoolId}`),

  /**
   * 1.3  GET /identity-card/template/school/{schoolId}/active?holderType=STUDENT
   * Active template for a given holderType.
   * Never 404s — returns system default if none configured (templateId: null).
   * holderType: "STUDENT" | "TEACHER" | "STAFF"  (default: "STUDENT")
   * Returns: IdCardTemplateResponse
   */
  getActive: (schoolId, holderType = "STUDENT") =>
    API.get(`${BASE}/template/school/${schoolId}/active`, {
      params: { holderType },
    }),

  /**
   * 1.4  PUT /identity-card/template/{templateId}  🔒
   * Partial update — only fields present in body are changed.
   * holderType cannot be changed; create a new template instead.
   * Returns: IdCardTemplateResponse
   */
  update: (templateId, data) =>
    API.put(`${BASE}/template/${templateId}`, data),

  /**
   * 1.5  PATCH /identity-card/template/{templateId}/activate  🔒
   * Make this the active template for its holderType.
   * Automatically deactivates the previous active template.
   * Returns: IdCardTemplateResponse
   */
  activate: (templateId) =>
    API.patch(`${BASE}/template/${templateId}/activate`),

  /**
   * 1.6  DELETE /identity-card/template/{templateId}  🔒
   * Delete a template. If it was active, no active template remains
   * until another is activated (system default used in meantime).
   * Returns: 204 No Content
   */
  remove: (templateId) =>
    API.delete(`${BASE}/template/${templateId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CARD RENDER  (data + active template — use these for printing)
// Returns: IdentityCardResponse  { data: IdentityCardData, template: IdCardTemplateResponse }
// Or array of IdentityCardResponse[] for bulk endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const renderService = {
  /**
   * 2.1  GET /identity-card/student/{studentId}/render
   * Single student card with data + active STUDENT template.
   */
  student: (studentId) =>
    API.get(`${BASE}/student/${studentId}/render`),

  /**
   * 2.2  GET /identity-card/teacher/{teacherId}/render
   * Single teacher card with data + active TEACHER template.
   */
  teacher: (teacherId) =>
    API.get(`${BASE}/teacher/${teacherId}/render`),

  /**
   * 2.3  GET /identity-card/staff/{staffId}/render
   * Single staff card with data + active STAFF template.
   */
  staff: (staffId) =>
    API.get(`${BASE}/staff/${staffId}/render`),

  /**
   * 2.4  GET /identity-card/students/class/{classRoomId}/render
   * All students in a classroom. Returns [] if class has no students.
   */
  studentsByClass: (classRoomId) =>
    API.get(`${BASE}/students/class/${classRoomId}/render`),

  /**
   * 2.5  GET /identity-card/students/school/{schoolId}/render
   *      GET /identity-card/students/school/{schoolId}/render?classRoomId=12
   * ⭐ One-click bulk print — all students OR filtered by classRoomId.
   */
  studentsBySchool: (schoolId, classRoomId = null) =>
    API.get(`${BASE}/students/school/${schoolId}/render`, {
      params: classRoomId ? { classRoomId } : {},
    }),

  /**
   * 2.6  GET /identity-card/teachers/school/{schoolId}/render
   * ⭐ All teachers in a school.
   */
  teachersBySchool: (schoolId) =>
    API.get(`${BASE}/teachers/school/${schoolId}/render`),

  /**
   * 2.7  GET /identity-card/staff/school/{schoolId}/render
   * ⭐ All staff in a school.
   */
  staffBySchool: (schoolId) =>
    API.get(`${BASE}/staff/school/${schoolId}/render`),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. RAW DATA ONLY (no template — backward compatible)
// Returns: IdentityCardData (or IdentityCardData[])
// ─────────────────────────────────────────────────────────────────────────────
export const rawDataService = {
  student:          (studentId)    => API.get(`${BASE}/student/${studentId}`),
  teacher:          (teacherId)    => API.get(`${BASE}/teacher/${teacherId}`),
  staff:            (staffId)      => API.get(`${BASE}/staff/${staffId}`),
  studentsByClass:  (classRoomId)  => API.get(`${BASE}/students/class/${classRoomId}`),
  teachersBySchool: (schoolId)     => API.get(`${BASE}/teachers/school/${schoolId}`),
  staffBySchool:    (schoolId)     => API.get(`${BASE}/staff/school/${schoolId}`),
};