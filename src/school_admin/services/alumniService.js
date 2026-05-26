// src/school_admin/services/alumniService.js
//
// Fully synced with AlumniController.java
// Base URL comes from axios instance — adjust import path if needed.

import api from "../../common/services/api"; // your axios instance with JWT interceptor

const BASE = "/alumni";

// ══════════════════════════════════════════════════════════════
//  ALUMNI MANAGEMENT
// ══════════════════════════════════════════════════════════════

/** POST /alumni/schools/{schoolId} — Manually add alumni */
export const addAlumni = (schoolId, data) =>
  api.post(`${BASE}/schools/${schoolId}`, data);

/** GET /alumni/schools/{schoolId} — All alumni */
export const getAllAlumni = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}`);

/** GET /alumni/schools/{schoolId}/year/{year} — Filter by passout year */
export const getAlumniByYear = (schoolId, year) =>
  api.get(`${BASE}/schools/${schoolId}/year/${year}`);

/** GET /alumni/schools/{schoolId}/status/{status} — Filter by status */
export const getAlumniByStatus = (schoolId, status) =>
  api.get(`${BASE}/schools/${schoolId}/status/${status}`);

/** PATCH /alumni/{alumniId}/status?status=ACTIVE — Update status */
export const updateAlumniStatus = (alumniId, status) =>
  api.patch(`${BASE}/${alumniId}/status`, null, { params: { status } });

/** GET /alumni/schools/{schoolId}/stats — Dashboard stats */
export const getDashboardStats = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/stats`);

/** GET /alumni/schools/{schoolId}/passout-years */
export const getPassoutYears = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/passout-years`);

/** GET /alumni/{alumniId} — Single alumni profile */
export const getAlumniById = (alumniId) =>
  api.get(`${BASE}/${alumniId}`);

/** PUT /alumni/{alumniId}/profile — Alumni updates own profile */
export const updateAlumniProfile = (alumniId, data) =>
  api.put(`${BASE}/${alumniId}/profile`, data);

// ══════════════════════════════════════════════════════════════
//  MENTORS
// ══════════════════════════════════════════════════════════════

/** GET /alumni/schools/{schoolId}/mentors */
export const getMentors = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/mentors`);

/** POST /alumni/mentorship/request?alumniId=&studentId=&message= */
export const sendMentorshipRequest = (alumniId, studentId, message) =>
  api.post(`${BASE}/mentorship/request`, null, {
    params: { alumniId, studentId, message },
  });

/** PATCH /alumni/mentorship/{requestId}/respond?accept=true&responseNote= */
export const respondToMentorshipRequest = (requestId, accept, responseNote = "") =>
  api.patch(`${BASE}/mentorship/${requestId}/respond`, null, {
    params: { accept, responseNote },
  });

/** GET /alumni/{alumniId}/mentorship/requests */
export const getMentorshipRequestsByAlumni = (alumniId) =>
  api.get(`${BASE}/${alumniId}/mentorship/requests`);

/** GET /alumni/mentorship/student/{studentId} */
export const getMentorshipRequestsByStudent = (studentId) =>
  api.get(`${BASE}/mentorship/student/${studentId}`);

// ══════════════════════════════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════════════════════════════

/**
 * POST /alumni/schools/{schoolId}/events — Create event
 *
 * ⚠️  Backend expects LocalDate / LocalTime:
 *   eventDate             → "YYYY-MM-DD"  (HTML date input value is already this format ✅)
 *   eventTime             → "HH:mm:ss"    (HTML time input gives "HH:mm" — we append ":00" below)
 *   registrationDeadline  → "YYYY-MM-DD"  ✅
 */
export const createEvent = (schoolId, formData) => {
  const payload = {
    ...formData,
    // Ensure time has seconds — backend LocalTime requires "HH:mm:ss"
    eventTime: formData.eventTime
      ? formData.eventTime.length === 5
        ? `${formData.eventTime}:00`
        : formData.eventTime
      : null,
    // Convert empty strings to null for optional date fields
    registrationDeadline: formData.registrationDeadline || null,
    maxParticipants: formData.maxParticipants
      ? parseInt(formData.maxParticipants, 10)
      : null,
  };
  return api.post(`${BASE}/schools/${schoolId}/events`, payload);
};

/** GET /alumni/schools/{schoolId}/events — All events */
export const getEvents = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/events`);

/** GET /alumni/schools/{schoolId}/events/upcoming */
export const getUpcomingEvents = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/events/upcoming`);

/** POST /alumni/events/{eventId}/register/{alumniId} */
export const registerForEvent = (eventId, alumniId) =>
  api.post(`${BASE}/events/${eventId}/register/${alumniId}`);

/** PATCH /alumni/events/{eventId}/attendance/{alumniId} */
export const markAttendance = (eventId, alumniId) =>
  api.patch(`${BASE}/events/${eventId}/attendance/${alumniId}`);

// ══════════════════════════════════════════════════════════════
//  COMMUNITY POSTS
// ══════════════════════════════════════════════════════════════

/** POST /alumni/{alumniId}/posts */
export const createPost = (alumniId, data) =>
  api.post(`${BASE}/${alumniId}/posts`, data);

/** PATCH /alumni/posts/{postId}/approve */
export const approvePost = (postId) =>
  api.patch(`${BASE}/posts/${postId}/approve`);

/** DELETE /alumni/posts/{postId} */
export const deletePost = (postId) =>
  api.delete(`${BASE}/posts/${postId}`);

/** GET /alumni/schools/{schoolId}/posts — Approved posts */
export const getApprovedPosts = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/posts`);

/** GET /alumni/schools/{schoolId}/posts/pending */
export const getPendingPosts = (schoolId) =>
  api.get(`${BASE}/schools/${schoolId}/posts/pending`);

/** GET /alumni/{alumniId}/posts */
export const getPostsByAlumni = (alumniId) =>
  api.get(`${BASE}/${alumniId}/posts`);

/** PATCH /alumni/posts/{postId}/pin */
export const togglePinPost = (postId) =>
  api.patch(`${BASE}/posts/${postId}/pin`);
// // src/school_admin/services/alumniService.js
// // Alumni module API service — matches SchoolSaaS Alumni API v1

// import apiClient from "../../common/utils/apiClient";

// const BASE = "/alumni";

// // ─── Admin ────────────────────────────────────────────────────────────────────

// export const addAlumni = (schoolId, data) =>
//   apiClient.post(`${BASE}/schools/${schoolId}`, data);

// export const getAllAlumni = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}`);

// export const getAlumniByYear = (schoolId, year) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/year/${year}`);

// export const getAlumniByStatus = (schoolId, status) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/status/${status}`);

// export const updateAlumniStatus = (alumniId, status) =>
//   apiClient.patch(`${BASE}/${alumniId}/status`, null, { params: { status } });

// export const getDashboardStats = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/stats`);

// export const getPassoutYears = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/passout-years`);

// // ─── Self-Service ─────────────────────────────────────────────────────────────

// export const getAlumniById = (alumniId) =>
//   apiClient.get(`${BASE}/${alumniId}`);

// export const updateAlumniProfile = (alumniId, data) =>
//   apiClient.put(`${BASE}/${alumniId}/profile`, data);

// // ─── Mentorship ───────────────────────────────────────────────────────────────

// export const getMentors = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/mentors`);

// export const sendMentorshipRequest = (alumniId, studentId, message) =>
//   apiClient.post(`${BASE}/mentorship/request`, null, {
//     params: { alumniId, studentId, message },
//   });

// export const respondToMentorshipRequest = (requestId, accept, responseNote = "") =>
//   apiClient.patch(`${BASE}/mentorship/${requestId}/respond`, null, {
//     params: { accept, responseNote },
//   });

// export const getMentorshipRequestsByAlumni = (alumniId) =>
//   apiClient.get(`${BASE}/${alumniId}/mentorship/requests`);

// export const getMentorshipRequestsByStudent = (studentId) =>
//   apiClient.get(`${BASE}/mentorship/student/${studentId}`);

// // ─── Events ───────────────────────────────────────────────────────────────────

// export const createEvent = (schoolId, data) =>
//   apiClient.post(`${BASE}/schools/${schoolId}/events`, data);

// export const getEvents = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/events`);

// export const getUpcomingEvents = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/events/upcoming`);

// export const registerForEvent = (eventId, alumniId) =>
//   apiClient.post(`${BASE}/events/${eventId}/register/${alumniId}`);

// export const markAttendance = (eventId, alumniId) =>
//   apiClient.patch(`${BASE}/events/${eventId}/attendance/${alumniId}`);

// // ─── Community Posts ──────────────────────────────────────────────────────────

// export const createPost = (alumniId, data) =>
//   apiClient.post(`${BASE}/${alumniId}/posts`, data);

// export const approvePost = (postId) =>
//   apiClient.patch(`${BASE}/posts/${postId}/approve`);

// export const togglePinPost = (postId) =>
//   apiClient.patch(`${BASE}/posts/${postId}/pin`);

// export const getApprovedPosts = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/posts`);

// export const getPendingPosts = (schoolId) =>
//   apiClient.get(`${BASE}/schools/${schoolId}/posts/pending`);

// export const getPostsByAlumni = (alumniId) =>
//   apiClient.get(`${BASE}/${alumniId}/posts`);

// export const deletePost = (postId) =>
//   apiClient.delete(`${BASE}/posts/${postId}`);
