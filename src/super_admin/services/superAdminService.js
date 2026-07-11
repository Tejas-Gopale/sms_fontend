// src/super_admin/services/superAdminService.js
import API from "../../common/services/api";

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** GET /super-admin/getDashboard-data */
export const getDashboardData = () =>
  API.get("/super-admin/getDashboard-data");

// ─── Schools ──────────────────────────────────────────────────────────────────

/** GET /super-admin/getAllSchoolList */
export const getAllSchools = () =>
  API.get("/super-admin/getAllSchoolList");

/** GET /super-admin/active-schools */
export const getActiveSchools = () =>
  API.get("/super-admin/active-schools");

/** GET /super-admin/inactive-schools */
export const getInactiveSchools = () =>
  API.get("/super-admin/inactive-schools");

/** POST /super-admin/create-school */
export const createSchool = (data) =>
  API.post("/super-admin/create-school", data);

/** PATCH /super-admin/{schoolId}/status?active=true|false */
export const toggleSchoolStatus = (schoolId, active) =>
  API.patch(`/super-admin/${schoolId}/status`, null, { params: { active } });

/** PATCH /super-admin/{schoolId}/update-school-info */
export const updateSchoolInfo = (schoolId, data) =>
  API.patch(`/super-admin/${schoolId}/update-school-info`, data);

// ─── School Owner ─────────────────────────────────────────────────────────────

/** POST /super-admin/schools/{schoolId}/assign-owner */
export const assignSchoolOwner = (schoolId, data) =>
  API.post(`/super-admin/schools/${schoolId}/assign-owner`, data);

/** GET /super-admin/schools/{schoolId}/owner */
export const getSchoolOwner = (schoolId) =>
  API.get(`/super-admin/schools/${schoolId}/owner`);

// ─── Students & Teachers ──────────────────────────────────────────────────────

/** GET /super-admin/getAllStudentsList */
export const getAllStudents = () =>
  API.get("/super-admin/getAllStudentsList");

/** GET /super-admin/getAllTeacherList */
export const getAllTeachers = () =>
  API.get("/super-admin/getAllTeacherList");

// ─── Subscription & Razorpay ──────────────────────────────────────────────────

/** GET /super-admin/subscription/dashboard */
export const getSubscriptionDashboard = () =>
  API.get("/super-admin/subscription/dashboard");

/** GET /super-admin/subscription/trusts */
export const getAllTrusts = () =>
  API.get("/super-admin/subscription/trusts");

/** POST /super-admin/subscription/school/{schoolId}/create-order */
export const createOrderForSchool = (schoolId) =>
  API.post(`/super-admin/subscription/school/${schoolId}/create-order`);

/** POST /super-admin/subscription/trust/{trustId}/create-order */
export const createOrderForTrust = (trustId) =>
  API.post(`/super-admin/subscription/trust/${trustId}/create-order`);

/**
 * POST /super-admin/subscription/verify-payment
 * @param {{ paymentRecordId, razorpayOrderId, razorpayPaymentId, razorpaySignature }} data
 */
export const verifyPayment = (data) =>
  API.post("/super-admin/subscription/verify-payment", data);

/** PATCH /super-admin/subscription/school/{schoolId}/payment-status?status=PAID|PENDING|OVERDUE */
export const updateSchoolPaymentStatus = (schoolId, status) =>
  API.patch(`/super-admin/subscription/school/${schoolId}/payment-status`, null, {
    params: { status },
  });

/** PATCH /super-admin/subscription/trust/{trustId}/payment-status?status=PAID|PENDING|OVERDUE */
export const updateTrustPaymentStatus = (trustId, status) =>
  API.patch(`/super-admin/subscription/trust/${trustId}/payment-status`, null, {
    params: { status },
  });

/** GET /super-admin/subscription/settings */
export const getPaymentSettings = () =>
  API.get("/super-admin/subscription/settings");

/** POST /super-admin/subscription/settings */
export const savePaymentSettings = (data) =>
  API.post("/super-admin/subscription/settings", data);

/** POST /super-admin/subscription/run-expiry-check */
export const runExpiryCheck = () =>
  API.post("/super-admin/subscription/run-expiry-check");

// ─── Expenses ─────────────────────────────────────────────────────────────────

/** GET /expenses/school/{schoolId}?academicYear=... */
export const getExpenses = (schoolId, params = {}) =>
  API.get(`/expenses/school/${schoolId}`, { params });

/** GET /expenses/school/{schoolId}/financial-summary?academicYear=... */
export const getFinancialSummary = (schoolId, academicYear) =>
  API.get(`/expenses/school/${schoolId}/financial-summary`, {
    params: { academicYear },
  });

/** POST /expenses/school/{schoolId} */
export const addExpense = (schoolId, data) =>
  API.post(`/expenses/school/${schoolId}`, data);

/** PUT /expenses/{expenseId}/status */
export const updateExpenseStatus = (expenseId, data) =>
  API.put(`/expenses/${expenseId}/status`, data);

/** DELETE /expenses/{expenseId} */
export const deleteExpense = (expenseId) =>
  API.delete(`/expenses/${expenseId}`);