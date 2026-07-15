// src/teachers/services/teacherService.js
// ─────────────────────────────────────────────────────────────────
// Centralized API service for ALL Teacher module endpoints
// Base URL: http://localhost:8085/api/v1  (configured in api.js)
// ─────────────────────────────────────────────────────────────────

import API from "../../common/services/api";

// ──────────────────────────────────────────────
// 1. DASHBOARD
// ──────────────────────────────────────────────
export const teacherDashboardService = {
  getDashboardStats: () => API.get("/teacher/getTeachersDetilasForAdmin"),
  getTodayLectures: () => API.get("/teacher/get_todayslects"),
  getWeeklyTimetable: () => API.get("/teacher/my-timetable"),
};

// ──────────────────────────────────────────────
// 2. STUDENT ATTENDANCE
// ──────────────────────────────────────────────
export const studentAttendanceService = {
  markAttendance: (classroomId, data) =>
    API.post(`/attendance/${classroomId}/attendance`, data),
  correctSingleStudent: (classroomId, studentId, data) =>
    API.post(`/attendance/${classroomId}/student/${studentId}`, data),
  getStudentMonthly: (studentId, month, year) =>
    API.get(`/attendance/${studentId}`, { params: { type: "MONTHLY", month, year } }),
  getStudentDaily: (studentId, date) =>
    API.get(`/attendance/${studentId}`, { params: { type: "DAILY", date } }),
};

// ──────────────────────────────────────────────
// 3. TEACHER SELF ATTENDANCE (GPS-based)
// ──────────────────────────────────────────────
export const teacherSelfAttendanceService = {
  markSelfAttendance: (data) => API.post("/teacher-attendance/mark-self", data),
  getTodayStatus: () => API.get("/teacher-attendance/today-status"),
  getTodayLogs: () => API.get("/teacher-attendance/today-logs"),
};

// ──────────────────────────────────────────────
// 4. EXAM & TESTS
// ──────────────────────────────────────────────
export const examService = {
  getExams: () => API.get("/exam/all"),
  createExam: (data) => API.post("/exam/create", data),
  updateExam: (id, data) => API.put(`/exam/update/${id}`, data),
  deleteExam: (id) => API.delete(`/exam/delete/${id}`),
  getResults: (examId) => API.get("/result/class", { params: { examId } }),
  submitResults: (data) => API.post("/result/enter", data),
};

// ──────────────────────────────────────────────
// 5. NOTIFICATIONS
// ──────────────────────────────────────────────
export const teacherNotificationService = {
  getNotifications: (page = 0, size = 10, classRoomId) =>
    API.get("/notice/feed", { params: { audience: "TEACHERS", classRoomId, page, size } }),
  // TODO: backend endpoint missing — no read-tracking route in NoticeController
  markRead: (id) => API.put(`/teacher/notifications/${id}/read`),
};

// ──────────────────────────────────────────────
// 6. HOMEWORK
// ──────────────────────────────────────────────
export const homeworkService = {
  // ── Create ───────────────────────────────────────────────────────

  /** POST /homework/assign  — text only, auto-sends FCM to parents */
  create: (data) => API.post("/homework/assign", data),

  /**
   * POST /homework/assign-with-files  — one-shot with attachments.
   * Max 5 MB per file. Auto-sends FCM push notifications to parents.
   */
  createWithFiles: (formData) =>
    API.post("/homework/assign-with-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * POST /homework/{homeworkId}/upload-files
   * Upload additional files to an existing homework.
   * Max 5 MB per file.
   */
  uploadFiles: (homeworkId, formData) =>
    API.post(`/homework/${homeworkId}/upload-files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // ── Read ─────────────────────────────────────────────────────────

  /** GET /homework/by-teacher  — teacher's own homework list */
  getByTeacher: () => API.get("/homework/by-teacher"),

  /** GET /homework/{id}  — single homework with all attachments */
  getById: (id) => API.get(`/homework/${id}`),

  /** GET /homework/classroom/{classroomId}  — all homework for a class */
  getByClassroom: (classroomId) => API.get(`/homework/classroom/${classroomId}`),

  /** GET /homework/classroom/{classroomId}/pending */
  getPendingByClassroom: (classroomId) =>
    API.get(`/homework/classroom/${classroomId}/pending`),

  // ── Delete ────────────────────────────────────────────────────────

  /** DELETE /homework/{id}  — deletes homework + Cloudinary files */
  delete: (id) => API.delete(`/homework/${id}`),

  /** DELETE /homework/attachment/{attachmentId} */
  deleteAttachment: (attachmentId) =>
    API.delete(`/homework/attachment/${attachmentId}`),

  // ── Notification stats ────────────────────────────────────────────
  //   NEW: track how many parents received / saw / read the notification

  /**
   * GET /homework/{homeworkId}/notification/stats
   *
   * Returns aggregate counts: dispatched, delivered, seen, read + rates.
   *
   * @param homeworkId  - the homework to query
   * @param detail      - if true, includes per-parent rows (seenAt, readAt)
   *
   * Response shape:
   * {
   *   homeworkId, homeworkTitle, subjectName, grade, section,
   *   totalDispatched, totalDelivered, totalSeen, totalRead,
   *   seenRate, readRate,                  ← percentages (0-100)
   *   recipients?: [                        ← only when detail=true
   *     { userId, parentId, recipientType, delivered, seen, read,
   *       sentAt, seenAt, readAt }
   *   ]
   * }
   */
  getNotificationStats: (homeworkId, detail = false) =>
    API.get(`/homework/${homeworkId}/notification/stats`, {
      params: { detail },
    }),
};

// ──────────────────────────────────────────────
// 7. PROFILE
// ──────────────────────────────────────────────
export const teacherProfileService = {
  getProfile: () => API.get("/user/profile"),
  updateProfile: (data) => API.put("/user/profile", data),
  // TODO: backend endpoint missing — no photo upload route in UserController
  uploadPhoto: (formData) =>
    API.post("/teacher/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ──────────────────────────────────────────────
// 8. CLASS TEACHER (for users with CLASS_TEACHER role)
// ──────────────────────────────────────────────
export const classTeacherService = {
  /** GET — class teacher's assigned classroom */
  getMyClassroom: () => API.get("/teacher-dashboard/my-classroom"),

  /** POST — register a new student directly into own classroom */
  createStudent: (data) => API.post("/teacher-dashboard/create-student", data),

  /** GET — students in their classroom (paginated) */
  getStudents: (page = 0, size = 20, sortBy = "id", sortDir = "asc") =>
    API.get("/teacher-dashboard/students", { params: { page, size, sortBy, sortDir } }),

  /** POST — assign existing unassigned students to own classroom */
  assignStudents: (data) => API.post("/teacher-dashboard/assign-students", data),

  /** POST — add a subject to own classroom */
  addSubject: (data) => API.post("/teacher-dashboard/subjects", data),

  /** GET — subjects assigned to their classroom */
  getSubjects: () => API.get("/teacher-dashboard/subjects"),

  /** GET — fee records for their classroom */
  getClassFees: () => API.get("/teacher-dashboard/fees"),

  /** GET — fee record for a single student in their classroom */
  getStudentFee: (studentId) =>
    API.get(`/teacher-dashboard/fees/student/${studentId}`),

  /** GET — school-wide fee heads */
  getFeeHeads: () => API.get("/teacher-dashboard/fees/heads"),

  /** GET — fee structure for their classroom */
  getFeeStructure: () => API.get("/teacher-dashboard/fees/structure"),

  /** POST — finalize roll numbers for their classroom */
  finalizeRollNumbers: () => API.post("/teacher-dashboard/finalize-rolls"),
};

// ──────────────────────────────────────────────
// 9. TEACHER LEAVE MANAGEMENT
// ──────────────────────────────────────────────
export const teacherLeaveService = {
  /** GET — leave balance for a teacher for given year */
  getTeacherBalance: (teacherId, year) =>
    API.get(`/leave/balance/${teacherId}`, { params: { year } }),

  /** GET — full leave application history for a teacher */
  getTeacherHistory: (teacherId) =>
    API.get(`/leave/history/${teacherId}`),

  /** POST — apply for leave */
  applyLeave: (data) => API.post("/leave/apply", data),

  /** POST/PUT — cancel a pending leave application */
  cancelLeave: (leaveId, teacherId) =>
    API.post(`/leave/${leaveId}/cancel`, null, { params: { teacherId } }),
};
// // src/teachers/services/teacherService.js
// // ─────────────────────────────────────────────────────────────────
// // Centralized API service for ALL Teacher module endpoints
// // Base URL: http://localhost:8085/api/v1  (configured in api.js)
// // ─────────────────────────────────────────────────────────────────

// import API from "../../common/services/api";

// // ──────────────────────────────────────────────
// // 1. DASHBOARD
// // ──────────────────────────────────────────────
// export const teacherDashboardService = {
//   getDashboardStats: () => API.get("/teacher/getTeachersDetilasForAdmin"),
//   getTodayLectures: () => API.get("/teacher/get_todayslects"),
//   getWeeklyTimetable: () => API.get("/teacher/my-timetable"),
// };

// // ──────────────────────────────────────────────
// // 2. STUDENT ATTENDANCE
// // ──────────────────────────────────────────────
// export const studentAttendanceService = {
//   markAttendance: (classroomId, data) =>
//     API.post(`/attendance/${classroomId}/attendance`, data),
//   correctSingleStudent: (classroomId, studentId, data) =>
//     API.post(`/attendance/${classroomId}/student/${studentId}`, data),
//   getStudentMonthly: (studentId, month, year) =>
//     API.get(`/attendance/${studentId}`, { params: { type: "MONTHLY", month, year } }),
//   getStudentDaily: (studentId, date) =>
//     API.get(`/attendance/${studentId}`, { params: { type: "DAILY", date } }),
// };

// // ──────────────────────────────────────────────
// // 3. TEACHER SELF ATTENDANCE (GPS-based)
// // ──────────────────────────────────────────────
// export const teacherSelfAttendanceService = {
//   markSelfAttendance: (data) => API.post("/teacher-attendance/mark-self", data),
//   getTodayStatus: () => API.get("/teacher-attendance/today-status"),
//   getTodayLogs: () => API.get("/teacher-attendance/today-logs"),
// };

// // ──────────────────────────────────────────────
// // 4. EXAM & TESTS
// // ──────────────────────────────────────────────
// export const examService = {
//   getExams: () => API.get("/teacher/exams"),
//   createExam: (data) => API.post("/teacher/exams", data),
//   updateExam: (id, data) => API.put(`/teacher/exams/${id}`, data),
//   deleteExam: (id) => API.delete(`/teacher/exams/${id}`),
//   getResults: (examId) => API.get(`/teacher/exams/${examId}/results`),
//   submitResults: (examId, data) => API.post(`/teacher/exams/${examId}/results`, data),
// };

// // ──────────────────────────────────────────────
// // 5. NOTIFICATIONS
// // ──────────────────────────────────────────────
// export const teacherNotificationService = {
//   getNotifications: () => API.get("/teacher/notifications"),
//   markRead: (id) => API.put(`/teacher/notifications/${id}/read`),
// };

// // ──────────────────────────────────────────────
// // 6. HOMEWORK
// // ──────────────────────────────────────────────
// export const homeworkService = {
//   // ── Create ───────────────────────────────────────────────────────

//   /** POST /homework/assign  — text only, auto-sends FCM to parents */
//   create: (data) => API.post("/homework/assign", data),

//   /**
//    * POST /homework/assign-with-files  — one-shot with attachments.
//    * Max 5 MB per file. Auto-sends FCM push notifications to parents.
//    */
//   createWithFiles: (formData) =>
//     API.post("/homework/assign-with-files", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),

//   /**
//    * POST /homework/{homeworkId}/upload-files
//    * Upload additional files to an existing homework.
//    * Max 5 MB per file.
//    */
//   uploadFiles: (homeworkId, formData) =>
//     API.post(`/homework/${homeworkId}/upload-files`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),

//   // ── Read ─────────────────────────────────────────────────────────

//   /** GET /homework/by-teacher  — teacher's own homework list */
//   getByTeacher: () => API.get("/homework/by-teacher"),

//   /** GET /homework/{id}  — single homework with all attachments */
//   getById: (id) => API.get(`/homework/${id}`),

//   /** GET /homework/classroom/{classroomId}  — all homework for a class */
//   getByClassroom: (classroomId) => API.get(`/homework/classroom/${classroomId}`),

//   /** GET /homework/classroom/{classroomId}/pending */
//   getPendingByClassroom: (classroomId) =>
//     API.get(`/homework/classroom/${classroomId}/pending`),

//   // ── Delete ────────────────────────────────────────────────────────

//   /** DELETE /homework/{id}  — deletes homework + Cloudinary files */
//   delete: (id) => API.delete(`/homework/${id}`),

//   /** DELETE /homework/attachment/{attachmentId} */
//   deleteAttachment: (attachmentId) =>
//     API.delete(`/homework/attachment/${attachmentId}`),

//   // ── Notification stats ────────────────────────────────────────────
//   //   NEW: track how many parents received / saw / read the notification

//   /**
//    * GET /homework/{homeworkId}/notification/stats
//    *
//    * Returns aggregate counts: dispatched, delivered, seen, read + rates.
//    *
//    * @param homeworkId  - the homework to query
//    * @param detail      - if true, includes per-parent rows (seenAt, readAt)
//    *
//    * Response shape:
//    * {
//    *   homeworkId, homeworkTitle, subjectName, grade, section,
//    *   totalDispatched, totalDelivered, totalSeen, totalRead,
//    *   seenRate, readRate,                  ← percentages (0-100)
//    *   recipients?: [                        ← only when detail=true
//    *     { userId, parentId, recipientType, delivered, seen, read,
//    *       sentAt, seenAt, readAt }
//    *   ]
//    * }
//    */
//   getNotificationStats: (homeworkId, detail = false) =>
//     API.get(`/homework/${homeworkId}/notification/stats`, {
//       params: { detail },
//     }),
// };

// // ──────────────────────────────────────────────
// // 7. PROFILE
// // ──────────────────────────────────────────────
// export const teacherProfileService = {
//   getProfile: () => API.get("/teacher/profile"),
//   updateProfile: (data) => API.put("/teacher/profile", data),
//   uploadPhoto: (formData) =>
//     API.post("/teacher/profile/photo", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),
// };

// // ──────────────────────────────────────────────
// // 8. CLASS TEACHER (for users with CLASS_TEACHER role)
// // ──────────────────────────────────────────────
// export const classTeacherService = {
//   /** GET — class teacher's assigned classroom */
//   getMyClassroom: () => API.get("/class-teacher/my-classroom"),

//   /** GET — students in their classroom (paginated) */
//   getStudents: (page = 0, size = 10) =>
//     API.get("/class-teacher/students", { params: { page, size } }),

//   /** GET — fee records for their classroom */
//   getClassFees: () => API.get("/class-teacher/fees"),

//   /** GET — subjects assigned to their classroom */
//   getSubjects: () => API.get("/class-teacher/subjects"),
// };

// // ──────────────────────────────────────────────
// // 9. TEACHER LEAVE MANAGEMENT
// // ──────────────────────────────────────────────
// export const teacherLeaveService = {
//   /** GET — leave balance for a teacher for given year */
//   getTeacherBalance: (teacherId, year) =>
//     API.get(`/leave/balance/${teacherId}`, { params: { year } }),

//   /** GET — full leave application history for a teacher */
//   getTeacherHistory: (teacherId) =>
//     API.get(`/leave/history/${teacherId}`),

//   /** POST — apply for leave */
//   applyLeave: (data) => API.post("/leave/apply", data),

//   /** POST/PUT — cancel a pending leave application */
//   cancelLeave: (leaveId, teacherId) =>
//     API.post(`/leave/${leaveId}/cancel`, null, { params: { teacherId } }),
// };
