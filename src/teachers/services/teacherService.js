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
// Controller: TeacherGeoAttendanceController
// Endpoints:
//   POST /teacher-attendance/mark-self
//   GET  /teacher-attendance/today-status
//   GET  /teacher-attendance/today-logs
// ──────────────────────────────────────────────
export const teacherSelfAttendanceService = {
  /**
   * POST /teacher-attendance/mark-self
   * 
   * Multi-punch flow:
   *   1. First POST → MARKED (logIndex=1)
   *   2. Subsequent POST → ALREADY_MARKED (logIndex=2,3...)
   * 
   * Request: {
   *   latitude, longitude, accuracyMeters,
   *   checkInTime (optional), checkOutTime (optional), remarks (optional)
   * }
   * 
   * Response: {
   *   status: "MARKED" | "ALREADY_MARKED" | "LOCATION_MISMATCH",
   *   distanceFromSchoolMeters, withinRadius, logIndex,
   *   checkInTime, message, totalPunchesToday
   * }
   */
  markGpsAttendance: (payload) =>
    API.post("/teacher-attendance/mark-self", payload),

  /**
   * GET /teacher-attendance/today-status
   * 
   * Returns today's first punch status + all punches list
   * 
   * Response: {
   *   status: "PRESENT" | "LATE" | "NOT_MARKED",
   *   totalPunchesToday: number,
   *   checkInTime: "HH:MM:SS",
   *   todayLogs: [
   *     { logIndex, checkInTime, checkOutTime, remarks, distanceFromSchoolMeters },
   *     ...
   *   ]
   * }
   */
  getTodayStatus: () =>
    API.get("/teacher-attendance/today-status"),

  /**
   * GET /teacher-attendance/today-logs
   * 
   * Aaj ke saare punch logs as a flat list (raw timeline)
   * 
   * Response: AttendanceLogResponse[] = [
   *   { logIndex, checkInTime, checkOutTime, remarks, distanceFromSchoolMeters, accuracy },
   *   ...
   * ]
   */
  getTodayLogs: () =>
    API.get("/teacher-attendance/today-logs"),

  /**
   * GET /staff-attendance/teacher/{teacherId}/monthly
   * Monthly attendance records for historical view
   */
  getMonthlyRecords: (teacherId, month, year) =>
    API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),

  /**
   * GET /staff-attendance/teacher/{teacherId}/summary
   * Monthly summary: present days, absent days, LOP, etc.
   */
  getMonthlySummary: (teacherId, month, year) =>
    API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
};

// ──────────────────────────────────────────────
// 4. LEAVE MANAGEMENT
// ──────────────────────────────────────────────
export const teacherLeaveService = {
  applyLeave: (data) => API.post("/leave/apply", data),
  cancelLeave: (leaveId, userId) =>
    API.post(`/leave/${leaveId}/cancel`, null, {
      params: { requestedByUserId: userId },
    }),
  getTeacherHistory: (teacherId) =>
    API.get(`/leave/history/teacher/${teacherId}`),
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
  create: (data) => API.post("/homework/assign", data),
  createWithFiles: (formData) =>
    API.post("/homework/assign-with-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getByTeacher: () => API.get("/homework/by-teacher"),
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

// ══════════════════════════════════════════════════════════════════
// 9. CLASS TEACHER — /teacher-dashboard/* endpoints
//    Sirf un teachers ke liye jo CLASS_TEACHER role mein hain.
//    Backend automatically classroom restrict karta hai.
// ══════════════════════════════════════════════════════════════════
export const classTeacherService = {
  getMyClassroom: () =>
    API.get("/teacher-dashboard/my-classroom"),

  getStudents: (page = 0, size = 20, sortBy = "id", sortDir = "asc") =>
    API.get("/teacher-dashboard/students", {
      params: { page, size, sortBy, sortDir },
    }),

  createStudent: (data) =>
    API.post("/teacher-dashboard/create-student", data),

  assignStudents: (studentIds) =>
    API.post("/teacher-dashboard/assign-students", { studentIds }),

  finalizeRollNumbers: () =>
    API.post("/teacher-dashboard/finalize-rolls"),

  getSubjects: () =>
    API.get("/teacher-dashboard/subjects"),

  addSubject: (data) =>
    API.post("/teacher-dashboard/subjects", data),

  getClassFees: () =>
    API.get("/teacher-dashboard/fees"),

  getStudentFees: (studentId) =>
    API.get(`/teacher-dashboard/fees/student/${studentId}`),

  getFeeHeads: () =>
    API.get("/teacher-dashboard/fees/heads"),

  getFeeStructure: () =>
    API.get("/teacher-dashboard/fees/structure"),
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
//   markGpsAttendance: (payload) =>
//     API.post("/teacher-attendance/mark-self", payload),
//   getTodayStatus: () => API.get("/teacher-attendance/today-status"),
//   getMonthlyRecords: (teacherId, month, year) =>
//     API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),
//   getMonthlySummary: (teacherId, month, year) =>
//     API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
// };

// // ──────────────────────────────────────────────
// // 4. LEAVE MANAGEMENT
// // ──────────────────────────────────────────────
// export const teacherLeaveService = {
//   applyLeave: (data) => API.post("/leave/apply", data),
//   cancelLeave: (leaveId, userId) =>
//     API.post(`/leave/${leaveId}/cancel`, null, {
//       params: { requestedByUserId: userId },
//     }),
//   getTeacherHistory: (teacherId) =>
//     API.get(`/leave/history/teacher/${teacherId}`),
//   getTeacherBalance: (teacherId, year) =>
//     API.get(`/leave/balance/teacher/${teacherId}`, { params: { year } }),
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
// // 6. HOMEWORK
// // ──────────────────────────────────────────────
// export const homeworkService = {
//   create: (data) => API.post("/homework/assign", data),
//   createWithFiles: (formData) =>
//     API.post("/homework/assign-with-files", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),
//   getByTeacher: () => API.get("/homework/by-teacher"),
//   delete: (id) => API.delete(`/homework/${id}`),
// };

// // ──────────────────────────────────────────────
// // 7. PROFILE
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
// // 8. NOTIFICATIONS
// // ──────────────────────────────────────────────
// export const teacherNotificationService = {
//   getNotices: (page = 0, size = 10) =>
//     API.get("/notice/feed", { params: { audience: "TEACHERS", page, size } }),
//   markAsRead: (id) => API.put(`/notifications/${id}/read`),
// };

// // ══════════════════════════════════════════════════════════════════
// // 9. CLASS TEACHER — /teacher-dashboard/* endpoints
// //    Sirf un teachers ke liye jo CLASS_TEACHER role mein hain.
// //    Backend automatically classroom restrict karta hai.
// // ══════════════════════════════════════════════════════════════════
// export const classTeacherService = {

//   // ── CLASSROOM ────────────────────────────────────────────────

//   /**
//    * GET /teacher-dashboard/my-classroom
//    * Returns: ClassRoom { id, grade, section, subjects[], classTeacher, school }
//    */
//   getMyClassroom: () =>
//     API.get("/teacher-dashboard/my-classroom"),

//   // ── STUDENTS ─────────────────────────────────────────────────

//   /**
//    * GET /teacher-dashboard/students?page=0&size=20&sortBy=id&sortDir=asc
//    * Returns: Page<StudentWithParentDTO>
//    */
//   getStudents: (page = 0, size = 20, sortBy = "id", sortDir = "asc") =>
//     API.get("/teacher-dashboard/students", {
//       params: { page, size, sortBy, sortDir },
//     }),

//   /**
//    * POST /teacher-dashboard/create-student
//    * Body: CreateStudentRequest { firstName, lastName, email, password,
//    *       admissionNumber, dateOfBirth, gender, rollNumber, section }
//    * Note: classRoomId is auto-set by backend
//    */
//   createStudent: (data) =>
//     API.post("/teacher-dashboard/create-student", data),

//   /**
//    * POST /teacher-dashboard/assign-students
//    * Body: { studentIds: [1, 2, 3] }
//    * Assigns existing students to class teacher's classroom.
//    */
//   assignStudents: (studentIds) =>
//     API.post("/teacher-dashboard/assign-students", { studentIds }),

//   /**
//    * POST /teacher-dashboard/finalize-rolls
//    * Finalizes roll numbers for all students in classroom.
//    */
//   finalizeRollNumbers: () =>
//     API.post("/teacher-dashboard/finalize-rolls"),

//   // ── SUBJECTS ─────────────────────────────────────────────────

//   /**
//    * GET /teacher-dashboard/subjects
//    * Returns: Subject[] — subjects assigned to this classroom
//    */
//   getSubjects: () =>
//     API.get("/teacher-dashboard/subjects"),

//   /**
//    * POST /teacher-dashboard/subjects
//    * Body: { subjectName: string, teacherId?: number }
//    * Adds a new subject to class teacher's classroom.
//    */
//   addSubject: (data) =>
//     API.post("/teacher-dashboard/subjects", data),

//   // ── FEES ─────────────────────────────────────────────────────

//   /**
//    * GET /teacher-dashboard/fees
//    * Returns: StudentFee[] — all students' fee status in this classroom
//    */
//   getClassFees: () =>
//     API.get("/teacher-dashboard/fees"),

//   /**
//    * GET /teacher-dashboard/fees/student/{studentId}
//    * Returns: StudentFee[] — fee detail for one student
//    */
//   getStudentFees: (studentId) =>
//     API.get(`/teacher-dashboard/fees/student/${studentId}`),

//   /**
//    * GET /teacher-dashboard/fees/heads
//    * Returns: FeeHead[] — school fee categories (Tuition, Transport, etc.)
//    */
//   getFeeHeads: () =>
//     API.get("/teacher-dashboard/fees/heads"),

//   /**
//    * GET /teacher-dashboard/fees/structure
//    * Returns: FeeStructure — fee structure set by admin for this classroom
//    */
//   getFeeStructure: () =>
//     API.get("/teacher-dashboard/fees/structure"),
// };