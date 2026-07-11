// src/common/services/payrollService.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized service for ALL Payroll endpoints (Manual + Scheduler)
// Backend prefix: /api/v1/payroll  (already handled by API baseURL)
// ─────────────────────────────────────────────────────────────────────────────

import API from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL PAYROLL — /api/v1/payroll/manual
// Roles: SCHOOL_ADMIN, SUPER_ADMIN, ACCOUNTANT (+ TEACHER for read-only)
// ─────────────────────────────────────────────────────────────────────────────

export const manualPayrollService = {

  /**
   * POST /payroll/manual/teacher/{teacherId}
   * Single teacher ka salary calculate karo (preview — DB mein save nahi hota).
   * Returns { salarySlip, leaveBreakdown }
   *
   * @param {number} teacherId
   * @param {number} month   1–12
   * @param {number} year
   */
  calculateForTeacher: (teacherId, month, year) =>
    API.post(`/payroll/manual/teacher/${teacherId}`, { month, year }),

  /**
   * POST /payroll/manual/school/{schoolId}
   * Poore school ka payroll DRAFT create karo manually.
   * Returns PayrollRecordResponse
   *
   * @param {number} schoolId
   * @param {number} month
   * @param {number} year
   * @param {number|null} totalWorkingDays  — null = auto-resolve via holidays
   */
  calculateForSchool: (schoolId, month, year, totalWorkingDays = null) =>
    API.post(`/payroll/manual/school/${schoolId}`, {
      month,
      year,
      totalWorkingDays,
    }),

  /**
   * GET /payroll/manual/teacher/{teacherId}/leave-summary
   * Teacher ki annual leave balance + used/remaining summary.
   *
   * @param {number} teacherId
   * @param {number} year
   */
  getTeacherLeaveSummary: (teacherId, year) =>
    API.get(`/payroll/manual/teacher/${teacherId}/leave-summary`, {
      params: { year },
    }),

  /**
   * GET /payroll/manual/teacher/{teacherId}/slip
   * Teacher ka existing salary slip fetch karo by month/year.
   * Returns SalarySlipResponse (ya 404 agar nahi bana)
   *
   * @param {number} teacherId
   * @param {number} month
   * @param {number} year
   */
  getTeacherSlip: (teacherId, month, year) =>
    API.get(`/payroll/manual/teacher/${teacherId}/slip`, {
      params: { month, year },
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYROLL SCHEDULER — /api/v1/payroll/scheduler
// Roles: SUPER_ADMIN only
// ─────────────────────────────────────────────────────────────────────────────

export const payrollSchedulerService = {

  /**
   * POST /payroll/scheduler/trigger?month=5&year=2026
   * Manually trigger the scheduled job for all active schools.
   * SUPER_ADMIN only.
   *
   * @param {number} month
   * @param {number} year
   */
  triggerScheduler: (month, year) =>
    API.post(`/payroll/scheduler/trigger`, null, {
      params: { month, year },
    }),
};

export const salaryStructureService = {

  /**
   * POST /salary-structure
   * Naya salary structure create karo.
   */
  create: (payload) =>
    API.post("/salary-structure", payload),

  /**
   * GET /salary-structure/school/{schoolId}
   * School ke saare active structures fetch karo.
   */
  getBySchool: (schoolId) =>
    API.get(`/salary-structure/school/${schoolId}`),

  /**
   * PUT /salary-structure/{id}
   * Existing structure update karo.
   */
  update: (id, payload) =>
    API.put(`/salary-structure/${id}`, payload),

  /**
   * DELETE /salary-structure/{id}
   * Soft delete (inactive mark).
   */
  delete: (id) =>
    API.delete(`/salary-structure/${id}`),

  /**
   * POST /salary-structure/assign
   * Teacher ko salary structure assign karo.
   * payload: { teacherId, structureId, bankAccountNumber?, ifscCode?, bankName?, branchName? }
   */
  assign: (payload) =>
    API.post("/salary-structure/assign", payload),
};
