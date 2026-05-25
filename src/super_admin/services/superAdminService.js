import API from "../../common/services/api";

// ─── School Owner ─────────────────────────────────────────────────────────────

/** POST /super-admin/schools/{schoolId}/assign-owner */
export const assignSchoolOwner = (schoolId, data) =>
  API.post(`/super-admin/schools/${schoolId}/assign-owner`, data);

/** GET /super-admin/schools/{schoolId}/owner */
export const getSchoolOwner = (schoolId) =>
  API.get(`/super-admin/schools/${schoolId}/owner`);

// ─── Expenses ─────────────────────────────────────────────────────────────────

/** GET /api/v1/expenses/school/{schoolId}?academicYear=... */
export const getExpenses = (schoolId, params = {}) =>
  API.get(`/expenses/school/${schoolId}`, { params });

/** GET /api/v1/expenses/school/{schoolId}/financial-summary?academicYear=... */
export const getFinancialSummary = (schoolId, academicYear) =>
  API.get(`/expenses/school/${schoolId}/financial-summary`, {
    params: { academicYear },
  });

/** POST /api/v1/expenses/school/{schoolId} */
export const addExpense = (schoolId, data) =>
  API.post(`/expenses/school/${schoolId}`, data);

/** PUT /api/v1/expenses/{expenseId}/status */
export const updateExpenseStatus = (expenseId, data) =>
  API.put(`/expenses/${expenseId}/status`, data);

/** DELETE /api/v1/expenses/{expenseId} */
export const deleteExpense = (expenseId) =>
  API.delete(`/expenses/${expenseId}`);

// ─── Existing school helpers ──────────────────────────────────────────────────

export const getAllSchools = () =>
  API.get("/super-admin/getAllSchoolList");

export const toggleSchoolStatus = (schoolId, active) =>
  API.patch(`/super-admin/${schoolId}/status`, null, { params: { active } });
