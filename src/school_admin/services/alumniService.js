// src/school_admin/services/alumniService.js
// Alumni module API service — matches SchoolSaaS Alumni API v1

import apiClient from "../../common/utils/apiClient";

const BASE = "/alumni";

// ─── Admin ────────────────────────────────────────────────────────────────────

export const addAlumni = (schoolId, data) =>
  apiClient.post(`${BASE}/schools/${schoolId}`, data);

export const getAllAlumni = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}`);

export const getAlumniByYear = (schoolId, year) =>
  apiClient.get(`${BASE}/schools/${schoolId}/year/${year}`);

export const getAlumniByStatus = (schoolId, status) =>
  apiClient.get(`${BASE}/schools/${schoolId}/status/${status}`);

export const updateAlumniStatus = (alumniId, status) =>
  apiClient.patch(`${BASE}/${alumniId}/status`, null, { params: { status } });

export const getDashboardStats = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/stats`);

export const getPassoutYears = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/passout-years`);

// ─── Self-Service ─────────────────────────────────────────────────────────────

export const getAlumniById = (alumniId) =>
  apiClient.get(`${BASE}/${alumniId}`);

export const updateAlumniProfile = (alumniId, data) =>
  apiClient.put(`${BASE}/${alumniId}/profile`, data);

// ─── Mentorship ───────────────────────────────────────────────────────────────

export const getMentors = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/mentors`);

export const sendMentorshipRequest = (alumniId, studentId, message) =>
  apiClient.post(`${BASE}/mentorship/request`, null, {
    params: { alumniId, studentId, message },
  });

export const respondToMentorshipRequest = (requestId, accept, responseNote = "") =>
  apiClient.patch(`${BASE}/mentorship/${requestId}/respond`, null, {
    params: { accept, responseNote },
  });

export const getMentorshipRequestsByAlumni = (alumniId) =>
  apiClient.get(`${BASE}/${alumniId}/mentorship/requests`);

export const getMentorshipRequestsByStudent = (studentId) =>
  apiClient.get(`${BASE}/mentorship/student/${studentId}`);

// ─── Events ───────────────────────────────────────────────────────────────────

export const createEvent = (schoolId, data) =>
  apiClient.post(`${BASE}/schools/${schoolId}/events`, data);

export const getEvents = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/events`);

export const getUpcomingEvents = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/events/upcoming`);

export const registerForEvent = (eventId, alumniId) =>
  apiClient.post(`${BASE}/events/${eventId}/register/${alumniId}`);

export const markAttendance = (eventId, alumniId) =>
  apiClient.patch(`${BASE}/events/${eventId}/attendance/${alumniId}`);

// ─── Community Posts ──────────────────────────────────────────────────────────

export const createPost = (alumniId, data) =>
  apiClient.post(`${BASE}/${alumniId}/posts`, data);

export const approvePost = (postId) =>
  apiClient.patch(`${BASE}/posts/${postId}/approve`);

export const togglePinPost = (postId) =>
  apiClient.patch(`${BASE}/posts/${postId}/pin`);

export const getApprovedPosts = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/posts`);

export const getPendingPosts = (schoolId) =>
  apiClient.get(`${BASE}/schools/${schoolId}/posts/pending`);

export const getPostsByAlumni = (alumniId) =>
  apiClient.get(`${BASE}/${alumniId}/posts`);

export const deletePost = (postId) =>
  apiClient.delete(`${BASE}/posts/${postId}`);
