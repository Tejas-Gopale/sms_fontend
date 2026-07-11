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

// ─── Homework Notification Lifecycle  (NEW) ───────────────────────────────────
//
//  These two endpoints track parent engagement with push notifications
//  sent when a teacher assigns homework.
//
//  Flow on the desktop web app:
//    1. Parent opens the Homework page → page loads → markHomeworkNotificationSeen()
//       is called for each homework item on screen.  This records that the parent
//       visited the page and effectively "saw" the notification.
//    2. Parent clicks a homework card to expand it → markHomeworkNotificationRead()
//       is called for that specific homework.  This records that the parent
//       actively opened and read the assignment detail.
//
//  These calls are fire-and-forget — errors are silently swallowed so a
//  network hiccup never breaks the homework view for the parent.

/**
 * POST /homework/{homeworkId}/notification/seen
 *
 * Marks the HomeworkNotificationLog row as seen=true for the authenticated parent.
 * Call when the homework list finishes loading (items are visible on screen).
 * Idempotent — safe to call multiple times.
 *
 * @param {number} homeworkId
 */
export const markHomeworkNotificationSeen = (homeworkId) =>
  API.post(`/homework/${homeworkId}/notification/seen`);

/**
 * POST /homework/{homeworkId}/notification/read
 *
 * Marks the HomeworkNotificationLog row as read=true for the authenticated parent.
 * Also implicitly marks as seen if not already.
 * Call when the parent clicks to open/expand a homework card.
 * Idempotent — safe to call multiple times.
 *
 * @param {number} homeworkId
 */
export const markHomeworkNotificationRead = (homeworkId) =>
  API.post(`/homework/${homeworkId}/notification/read`);

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
