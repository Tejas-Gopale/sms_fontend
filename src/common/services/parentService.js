import API from "./api";

// ─── Parent Dashboard ────────────────────────────────────────────────────────
export const getParentDashboard = () =>
  API.get("/parent/dashboard");

export const getDashboardStats = (studentId) =>
  API.get(`/parent/dashboard/stats/${studentId}`);

// ─── Attendance ──────────────────────────────────────────────────────────────
export const getStudentAttendance = (studentId, year, month) =>
  API.get(`/parent/attendance/${studentId}`, { params: { year, month } });

// ─── Homework ────────────────────────────────────────────────────────────────
export const getStudentHomework = (studentId, status) =>
  API.get(`/parent/homework/${studentId}`, {
    params: status ? { status } : {},
  });

export const getHomeworkDetail = (homeworkId) =>
  API.get(`/parent/homework/detail/${homeworkId}`);

// ─── Exam Results ────────────────────────────────────────────────────────────
export const getExamResults = (studentId) =>
  API.get(`/parent/exams/${studentId}`);

export const getExamDetail = (examId, studentId) =>
  API.get(`/parent/exams/detail/${examId}/${studentId}`);

// ─── Bus Tracking ────────────────────────────────────────────────────────────
export const getBusTracking = (studentId) =>
  API.get(`/parent/bus/tracking/${studentId}`);

// ─── Fees ────────────────────────────────────────────────────────────────────
export const getStudentFees = (studentId) =>
  API.get(`/parent/fees/${studentId}`);

// ─── Timetable ───────────────────────────────────────────────────────────────
export const getStudentTimetable = (studentId, date) =>
  API.get(`/parent/timetable/${studentId}`, {
    params: date ? { date } : {},
  });

// ─── Teacher Remarks ─────────────────────────────────────────────────────────
export const getTeacherRemarks = (studentId, category) =>
  API.get(`/parent/remarks/${studentId}`, {
    params: category ? { category } : {},
  });

// ─── Notifications ───────────────────────────────────────────────────────────
export const getParentNotifications = (unreadOnly) =>
  API.get("/parent/notifications", {
    params: unreadOnly != null ? { unreadOnly } : {},
  });

export const markNotificationRead = (notificationId) =>
  API.put(`/parent/notifications/${notificationId}/read`);
