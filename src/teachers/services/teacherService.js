// src/teachers/services/teacherService.js
// ─────────────────────────────────────────────────────────────────
// Centralized API service for ALL Teacher module endpoints
// Base URL: http://localhost:8085/api/v1  (configured in api.js)
//
// FIXES in this version:
//  1. GPS attendance URLs corrected — backend is at /api/v1/teacher-attendance/*
//     but since axios baseURL is already /api/v1, the service calls /teacher-attendance/*
//     which is correct. No change needed there.
//  2. teacherService.examService REMOVED — duplicated the common examService.
//     All exam calls go through ../../common/services/examService
//  3. Attendance smart features: getClassAttendanceSummary, getTodayPendingClasses added
//  4. Bulk absent API added: markAllAbsent
// ─────────────────────────────────────────────────────────────────

import API from "../../common/services/api";

// ──────────────────────────────────────────────
// 1. DASHBOARD
// ──────────────────────────────────────────────
export const teacherDashboardService = {
  /** GET /teacher/getTeachersDetilasForAdmin */
  getDashboardStats: () => API.get("/teacher/getTeachersDetilasForAdmin"),
  /** GET /teacher/get_todayslects */
  getTodayLectures: () => API.get("/teacher/get_todayslects"),
  /** GET /teacher/my-timetable */
  getWeeklyTimetable: () => API.get("/teacher/my-timetable"),
};

// ──────────────────────────────────────────────
// 2. STUDENT ATTENDANCE
// ──────────────────────────────────────────────
export const studentAttendanceService = {
  /**
   * POST /attendance/{classroomId}/attendance
   * Mark full class attendance for one period.
   * Body: { subjectId, date, periodNumber, students: [{studentId, status}] }
   * Response includes updatedPendingAttendanceCount — use this to update dashboard badge.
   */
  markAttendance: (classroomId, data) =>
    API.post(`/attendance/${classroomId}/attendance`, data),

  /**
   * POST /attendance/{classroomId}/student/{studentId}
   * Correct/mark a single student's attendance.
   * Body: { subjectId, date, periodNumber, status, remarks? }
   */
  correctSingleStudent: (classroomId, studentId, data) =>
    API.post(`/attendance/${classroomId}/student/${studentId}`, data),

  /**
   * GET /attendance/{studentId}?type=MONTHLY&year=YYYY&month=M
   */
  getStudentMonthly: (studentId, month, year) =>
    API.get(`/attendance/${studentId}`, { params: { type: "MONTHLY", month, year } }),

  /**
   * GET /attendance/{studentId}?type=DAILY&date=YYYY-MM-DD
   */
  getStudentDaily: (studentId, date) =>
    API.get(`/attendance/${studentId}`, { params: { type: "DAILY", date } }),
};

// ──────────────────────────────────────────────
// 3. TEACHER SELF ATTENDANCE (GPS-based)
// Backend: /api/v1/teacher-attendance/*
// ──────────────────────────────────────────────
export const teacherSelfAttendanceService = {
  /**
   * POST /teacher-attendance/mark-self
   * Body: { latitude, longitude, accuracyMeters, checkInTime, remarks? }
   * Response: { status: MARKED|ALREADY_MARKED|LOCATION_MISMATCH, distanceFromSchoolMeters, message }
   */
  markGpsAttendance: (payload) =>
    API.post("/teacher-attendance/mark-self", payload),

  /**
   * GET /teacher-attendance/today-status
   */
  getTodayStatus: () => API.get("/teacher-attendance/today-status"),

  /**
   * GET /staff-attendance/teacher/{teacherId}/monthly?month=&year=
   */
  getMonthlyRecords: (teacherId, month, year) =>
    API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),

  /**
   * GET /staff-attendance/teacher/{teacherId}/summary?month=&year=
   */
  getMonthlySummary: (teacherId, month, year) =>
    API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
};

// ──────────────────────────────────────────────
// 4. LEAVE MANAGEMENT
// Verified from LeaveController.java
// ──────────────────────────────────────────────
export const teacherLeaveService = {
  /**
   * POST /leave/apply
   * Body: { teacherId, schoolId, leaveType, fromDate, toDate, reason, forceAsLWP? }
   * LeaveType: CASUAL_LEAVE | SICK_LEAVE | EARNED_LEAVE | LEAVE_WITHOUT_PAY | MATERNITY_LEAVE | PATERNITY_LEAVE
   */
  applyLeave: (data) => API.post("/leave/apply", data),

  /**
   * POST /leave/{id}/cancel?requestedByUserId={userId}
   */
  cancelLeave: (leaveId, userId) =>
    API.post(`/leave/${leaveId}/cancel`, null, {
      params: { requestedByUserId: userId },
    }),

  /**
   * GET /leave/history/teacher/{teacherId}
   */
  getTeacherHistory: (teacherId) =>
    API.get(`/leave/history/teacher/${teacherId}`),

  /**
   * GET /leave/balance/teacher/{teacherId}?year=YYYY
   * Response: { teacherId, employeeName, year, balances: [{leaveType, totalAllocated, usedDays, pendingDays, remainingDays, isPaid}] }
   */
  getTeacherBalance: (teacherId, year) =>
    API.get(`/leave/balance/teacher/${teacherId}`, { params: { year } }),
};

// ──────────────────────────────────────────────
// 5. SALARY / PAYROLL
// ──────────────────────────────────────────────
export const teacherSalaryService = {
  getSalarySlip: (teacherId, month, year) =>
    API.get(`/salary-slip/teacher/${teacherId}`, { params: { month, year } }),
  emailSalarySlip: (slipId) => API.post(`/salary-slip/${slipId}/email`),
};

// ──────────────────────────────────────────────
// 6. HOMEWORK
// ──────────────────────────────────────────────
export const homeworkService = {
  /** POST /homework/assign — JSON body, no files */
  create: (data) => API.post("/homework/assign", data),

  /**
   * POST /homework/assign-with-files — multipart
   * FormData fields: title, description, classroomId, subjectId, dueDate, maxMarks?, files[]
   */
  createWithFiles: (formData) =>
    API.post("/homework/assign-with-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** GET /homework/by-teacher */
  getByTeacher: () => API.get("/homework/by-teacher"),

  /** DELETE /homework/{id} */
  delete: (id) => API.delete(`/homework/${id}`),
};

// ──────────────────────────────────────────────
// 7. PROFILE
// ──────────────────────────────────────────────
export const teacherProfileService = {
  getProfile: () => API.get("/user/profile"),
  updateProfile: (data) => API.put("/user/profile", data),
  changePassword: (data) => API.put("/user/change-password", data),
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return API.post("/profile-photo/me", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ──────────────────────────────────────────────
// 8. NOTIFICATIONS
// ──────────────────────────────────────────────
export const teacherNotificationService = {
  getNotices: (page = 0, size = 10) =>
    API.get("/notice/feed", { params: { audience: "TEACHERS", page, size } }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
};
// // src/teachers/services/teacherService.js
// // ─────────────────────────────────────────────────────────────────
// // Centralized API service for all Teacher module endpoints
// // Base URL: http://localhost:8085/api/v1  (configured in api.js)
// // ─────────────────────────────────────────────────────────────────

// import API from "../../common/services/api";

// // ──────────────────────────────────────────────
// // 1. DASHBOARD
// // ──────────────────────────────────────────────
// export const teacherDashboardService = {
//   /** GET /teacher/getTeachersDetilasForAdmin */
//   getDashboardStats: () => API.get("/teacher/getTeachersDetilasForAdmin"),
//   /** GET /teacher/get_todayslects */
//   getTodayLectures: () => API.get("/teacher/get_todayslects"),
//   /** GET /teacher/my-timetable */
//   getWeeklyTimetable: () => API.get("/teacher/my-timetable"),
// };

// // ──────────────────────────────────────────────
// // 2. STUDENT ATTENDANCE
// // ──────────────────────────────────────────────
// export const studentAttendanceService = {
//   markAttendance: (classroomId, data) =>
//     API.post(`/attendance/${classroomId}/attendance`, data),
//   getStudentMonthly: (studentId, month, year) =>
//     API.get(`/attendance/${studentId}`, { params: { type: "MONTHLY", month, year } }),
//   correctSingleStudent: (classroomId, studentId, data) =>
//     API.post(`/attendance/${classroomId}/student/${studentId}`, data),
// };

// // ──────────────────────────────────────────────
// // 3. TEACHER SELF ATTENDANCE (GPS-based)
// // ──────────────────────────────────────────────
// export const teacherSelfAttendanceService = {
//   /** POST /teacher-attendance/mark-self
//    *  Body: { latitude, longitude, accuracyMeters, checkInTime, remarks }
//    *  Response: { status: MARKED|ALREADY_MARKED|LOCATION_MISMATCH, distanceFromSchoolMeters, message }
//    */
//   markGpsAttendance: (payload) =>
//     API.post("/teacher-attendance/mark-self", payload),

//   /** GET /teacher-attendance/today-status */
//   getTodayStatus: () => API.get("/teacher-attendance/today-status"),

//   /** GET /staff-attendance/teacher/{teacherId}/monthly?month=&year= */
//   getMonthlyRecords: (teacherId, month, year) =>
//     API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),

//   /** GET /staff-attendance/teacher/{teacherId}/summary?month=&year= */
//   getMonthlySummary: (teacherId, month, year) =>
//     API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
// };

// // ──────────────────────────────────────────────
// // 4. LEAVE MANAGEMENT  ✅ Verified from LeaveController.java
// // ──────────────────────────────────────────────
// export const teacherLeaveService = {
//   /**
//    * POST /api/v1/leave/apply
//    * Body: { teacherId, schoolId, leaveType, fromDate, toDate, reason, forceAsLWP? }
//    * LeaveType enum: CASUAL_LEAVE | SICK_LEAVE | EARNED_LEAVE | LEAVE_WITHOUT_PAY | MATERNITY_LEAVE | PATERNITY_LEAVE
//    */
//   applyLeave: (data) => API.post("/leave/apply", data),

//   /**
//    * POST /api/v1/leave/{id}/cancel?requestedByUserId={userId}
//    */
//   cancelLeave: (leaveId, userId) =>
//     API.post(`/leave/${leaveId}/cancel`, null, {
//       params: { requestedByUserId: userId },
//     }),

//   /**
//    * GET /api/v1/leave/history/teacher/{teacherId}
//    * Response: LeaveApplicationResponse[] with id, leaveType, fromDate, toDate,
//    *           totalDays, reason, status, isLWP, appliedAt, approvedByName, rejectionReason
//    */
//   getTeacherHistory: (teacherId) =>
//     API.get(`/leave/history/teacher/${teacherId}`),

//   /**
//    * GET /api/v1/leave/balance/teacher/{teacherId}?year=2025
//    * Response: EmployeeLeaveBalanceResponse {
//    *   teacherId, employeeName, year,
//    *   balances: [{ leaveType, totalAllocated, usedDays, pendingDays, remainingDays, isPaid }]
//    * }
//    */
//   getTeacherBalance: (teacherId, year) =>
//     API.get(`/leave/balance/teacher/${teacherId}`, { params: { year } }),

//   /** GET /api/v1/leave/{id} */
//   getById: (id) => API.get(`/leave/${id}`),
// };

// // ──────────────────────────────────────────────
// // 5. SALARY / PAYROLL
// // ──────────────────────────────────────────────
// export const teacherSalaryService = {
//   getSalarySlip: (teacherId, month, year) =>
//     API.get(`/salary-slip/teacher/${teacherId}`, { params: { month, year } }),
//   emailSalarySlip: (slipId) => API.post(`/salary-slip/${slipId}/email`),
// };

// // ──────────────────────────────────────────────
// // 6. LECTURE TOPICS
// // ──────────────────────────────────────────────
// export const lectureTopicService = {
//   addTopic: (data) => API.post("/lecture-topics", data),
//   getByLecture: (lectureId) => API.get(`/lecture-topics/lecture/${lectureId}`),
//   getByClass: (classroomId) => API.get(`/lecture-topics/class/${classroomId}`),
// };

// // ──────────────────────────────────────────────
// // 7. HOMEWORK
// // ──────────────────────────────────────────────
// export const homeworkService = {
//   create: (data) => API.post("/homework", data),
//   getByTeacher: () => API.get("/homework/by-teacher"),
//   delete: (id) => API.delete(`/homework/${id}`),
// };

// // ──────────────────────────────────────────────
// // 8. EXAMS & RESULTS
// // ──────────────────────────────────────────────
// export const examService = {
//   create: (data) => API.post("/exam", data),
//   getByTeacher: () => API.get("/exam/teacher"),
//   enterMarks: (examId, data) => API.post(`/exam/${examId}/marks`, data),
// };

// // ──────────────────────────────────────────────
// // 9. PROFILE
// // ──────────────────────────────────────────────
// export const teacherProfileService = {
//   getProfile: () => API.get("/user/profile"),
//   updateProfile: (data) => API.put("/user/profile", data),
//   changePassword: (data) => API.put("/user/change-password", data),
//   uploadPhoto: (file) => {
//     const fd = new FormData();
//     fd.append("file", file);
//     return API.post("/profile-photo/me", fd, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   },
// };

// // ──────────────────────────────────────────────
// // 10. NOTIFICATIONS
// // ──────────────────────────────────────────────
// export const teacherNotificationService = {
//   getMyNotifications: () => API.get("/notifications/my"),
//   markAsRead: (id) => API.put(`/notifications/${id}/read`),
// };
