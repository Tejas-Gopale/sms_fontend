// src/common/services/profileService.js
// Shared profile API calls used by all roles (admin, teacher, student, etc.)

import API from "./api";

const profileService = {
  /** GET /api/v1/user/profile — fetch logged-in user's profile */
  getMyProfile: () => API.get("/user/profile"),

  /** PUT /api/v1/user/profile — update name, phone, address */
  updateMyProfile: (data) => API.put("/user/profile", data),

  /** PUT /api/v1/user/change-password */
  changePassword: (data) => API.put("/user/change-password", data),

  /**
   * POST /api/v1/profile-photo/me — upload own profile photo
   * @param {File} file
   */
  uploadMyPhoto: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/profile-photo/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default profileService;
