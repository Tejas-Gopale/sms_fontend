// src/common/services/examService.js
// ─────────────────────────────────────────────────────────────────────────────
// Exam Module — all API calls in one place
// Base URL: /api/v1  (set in api.js via VITE_API_BASE_URL)
// Roles: SCHOOL_ADMIN / PRINCIPAL (write), TEACHER / CLASS_TEACHER (read)
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXAM  →  /exam
// ─────────────────────────────────────────────────────────────────────────────
export const examService = {
  /**
   * POST /exam/create
   * Body: { examName, examType, examTypeString?, standard, startDate, endDate, academicYear? }
   * schoolId resolved from JWT on backend.
   */
  create: (data) => API.post("/exam/create", data),

  /**
   * POST /exam/create-with-schedule
   * Creates exam + all subject slots in ONE request.
   * Body: {
   *   examName, examType, examTypeString?, standard,
   *   startDate, endDate, academicYear?,
   *   schedule: [{ subject, examDate, startTime, endTime, maxMarks }]
   * }
   */
  createWithSchedule: (data) => API.post("/exam/create-with-schedule", data),

  /**
   * GET /exam/all
   * Returns all exams for the logged-in admin's school.
   * Response: Exam[]
   */
  getAll: () => API.get("/exam/all"),

  /**
   * PUT /exam/update/{examId}
   * Partial update: examName, dates, type etc.
   */
  update: (examId, data) => API.put(`/exam/update/${examId}`, data),

  /**
   * DELETE /exam/delete/{examId}
   * Cascades: deletes all ExamSchedule + Result rows for this exam.
   */
  remove: (examId) => API.delete(`/exam/delete/${examId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXAM SCHEDULE  →  /exam-schedule
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleService = {
  /**
   * POST /exam-schedule/add/{examId}
   * Body: { subject, examDate, startTime, endTime, maxMarks? }
   */
  add: (examId, data) => API.post(`/exam-schedule/add/${examId}`, data),

  /**
   * GET /exam-schedule/{examId}
   * Returns List<ExamSchedule> for the exam.
   */
  getByExam: (examId) => API.get(`/exam-schedule/${examId}`),

  /**
   * POST /exam-schedule/upload-exam-schedule   (multipart)
   * Excel columns: examName, examType, standard, subject,
   *                examDate (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm)
   * Optional: examTypeString, academicYear, maxMarks
   * Groups rows by examName+standard to create/reuse exam.
   */
  uploadExcel: (file) => {
    const form = new FormData();
    form.append("file", file);
    return API.post("/exam-schedule/upload-exam-schedule", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** DELETE /exam-schedule/delete/{scheduleId} */
  remove: (scheduleId) =>
    API.delete(`/exam-schedule/delete/${scheduleId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. RESULT  →  /result
// ─────────────────────────────────────────────────────────────────────────────
export const resultService = {
  /**
   * POST /result/enter
   * Body: { exam: { id }, student: { id }, subject, marksObtained, totalMarks }
   * Enter marks for one student-subject pair.
   */
  enter: (data) => API.post("/result/enter", data),

  /**
   * POST /result/upload-excel?examId=  (multipart)
   * Excel columns: studentId, subject, marksObtained, totalMarks
   */
  uploadExcel: (examId, file) => {
    const form = new FormData();
    form.append("file", file);
    return API.post(`/result/upload-excel?examId=${examId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * POST /result/calculate?examId=&studentId=
   * Calculates total marks + grade for ONE student in an exam.
   */
  calculate: (examId, studentId) =>
    API.post("/result/calculate", null, { params: { examId, studentId } }),

  /**
   * POST /result/calculate-all?examId=
   * Batch: calculates totals + grades for ALL students in exam.
   */
  calculateAll: (examId) =>
    API.post("/result/calculate-all", null, { params: { examId } }),

  /**
   * GET /result/student?studentId=&examId=
   * Subject-wise breakdown for one student in one exam.
   * Returns: ResultSummary (with subjects[] array)
   */
  getByStudent: (studentId, examId) =>
    API.get("/result/student", { params: { studentId, examId } }),

  /**
   * GET /result/student/all?studentId=
   * All exam results for a student across every exam.
   * Useful for student report history.
   */
  getAllByStudent: (studentId) =>
    API.get("/result/student/all", { params: { studentId } }),

  /**
   * GET /result/class?examId=
   * All ResultSummary rows for every student in the exam.
   * Used for class results table, rank list, etc.
   */
  getByClass: (examId) =>
    API.get("/result/class", { params: { examId } }),

  /**
   * PUT /result/update/{resultId}
   * Body: { marksObtained, totalMarks, grade }
   */
  update: (resultId, data) =>
    API.put(`/result/update/${resultId}`, data),

  /**
   * GET /result/report-card?studentId=&examId=
   * Full printable report card: subjects, rank, attendance%, remarks, promotion.
   * Returns: ReportCardResponse
   */
  getReportCard: (studentId, examId) =>
    API.get("/result/report-card", { params: { studentId, examId } }),

  /**
   * PUT /result/summary/{summaryId}
   * Body: { teacherRemarks?, principalRemarks?, coScholasticGrades?, promotedToNextClass? }
   * Class teacher / principal adds report-card remarks and promotion decision.
   */
  updateSummary: (summaryId, data) =>
    API.put(`/result/summary/${summaryId}`, data),

  /**
   * POST /result/recalculate-all
   * One-time migration helper — builds ResultSummary for every existing
   * result row in this school. Idempotent.
   */
  recalculateAll: () => API.post("/result/recalculate-all"),
};
// // src/common/services/examService.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Centralized API service for ALL Exam Module endpoints
// // Mapped 1:1 with backend controllers in exam_missing_apis.zip
// // Base URL: http://localhost:8085/api/v1 (configured in api.js)
// // ─────────────────────────────────────────────────────────────────────────────

// import API from "./api";

// // ─────────────────────────────────────────────────────────────────────────────
// // 1. EXAM  →  ExamController.java  [ /exam ]
// //    Roles: SCHOOL_ADMIN, PRINCIPAL
// // ─────────────────────────────────────────────────────────────────────────────
// export const examService = {
//   /** POST /exam/create  – schoolId resolved from JWT on backend */
//   create: (data) => API.post("/exam/create", data),

//   /** GET /exam/all  – returns List<Exam> for the school */
//   getAll: () => API.get("/exam/all"),

//   /** PUT /exam/update/{examId}  – NEW: update exam name/dates/type */
//   update: (examId, data) => API.put(`/exam/update/${examId}`, data),

//   /** DELETE /exam/delete/{examId}  – NEW: cascades schedule + results */
//   remove: (examId) => API.delete(`/exam/delete/${examId}`),
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // 2. EXAM SCHEDULE  →  ExamScheduleController.java  [ /exam-schedule ]
// //    Roles: SCHOOL_ADMIN, PRINCIPAL (write); TEACHER (read)
// // ─────────────────────────────────────────────────────────────────────────────
// export const scheduleService = {
//   /** POST /exam-schedule/add/{examId}  – body: ExamSchedule entity */
//   add: (examId, data) => API.post(`/exam-schedule/add/${examId}`, data),

//   /** GET /exam-schedule/{examId}  – returns List<ExamSchedule> */
//   getByExam: (examId) => API.get(`/exam-schedule/${examId}`),

//   /** POST /exam-schedule/upload-exam-schedule  – multipart Excel upload
//    *  Excel columns: examName, examType, standard, subject, examDate, startTime, endTime
//    */
//   uploadExcel: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return API.post("/exam-schedule/upload-exam-schedule", form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   },

//   /** DELETE /exam-schedule/delete/{scheduleId}  – NEW */
//   remove: (scheduleId) => API.delete(`/exam-schedule/delete/${scheduleId}`),
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // 3. RESULT  →  ResultController.java  [ /result ]
// //    Roles: SCHOOL_ADMIN, TEACHER, CLASS_TEACHER
// // ─────────────────────────────────────────────────────────────────────────────
// export const resultService = {
//   /**
//    * POST /result/enter
//    * Body: { exam: { id }, student: { id }, subject, marksObtained, totalMarks }
//    */
//   enter: (data) => API.post("/result/enter", data),

//   /**
//    * POST /result/upload-excel?examId=
//    * Multipart – Excel columns: studentId, subject, marksObtained, totalMarks
//    */
//   uploadExcel: (examId, file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return API.post(`/result/upload-excel?examId=${examId}`, form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   },

//   /**
//    * POST /result/calculate?examId=&studentId=
//    * Calculates totals + grade for one student in one exam
//    */
//   calculate: (examId, studentId) =>
//     API.post("/result/calculate", null, { params: { examId, studentId } }),

//   /**
//    * POST /result/calculate-all?examId=
//    * Batch-calculates totals + grades for all students in exam
//    */
//   calculateAll: (examId) =>
//     API.post("/result/calculate-all", null, { params: { examId } }),

//   /**
//    * GET /result/student?studentId=&examId=
//    * Subject-wise breakdown for one student in one exam
//    */
//   getByStudent: (studentId, examId) =>
//     API.get("/result/student", { params: { studentId, examId } }),

//   /**
//    * GET /result/class?examId=
//    * All ResultSummary rows for every student in the exam
//    */
//   getByClass: (examId) =>
//     API.get("/result/class", { params: { examId } }),

//   /**
//    * PUT /result/update/{resultId}  – NEW
//    * Body: ResultUpdateRequest { marksObtained, totalMarks, grade }
//    */
//   update: (resultId, data) => API.put(`/result/update/${resultId}`, data),

//   /**
//    * POST /result/recalculate-all  – one-time migration
//    * Builds ResultSummary for every existing result row in this school.
//    * Safe to call multiple times (upserts).
//    */
//   recalculateAll: () =>
//     API.post("/result/recalculate-all"),

//   /**
//    * GET /result/student/all?studentId=  – NEW
//    * All exam results for a student across every exam (used by teacher history tab)
//    */
//   getAllByStudent: (studentId) =>
//     API.get("/result/student/all", { params: { studentId } }),
// };