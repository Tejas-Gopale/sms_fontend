import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { Settings, Save, Eye, EyeOff } from "lucide-react";
import { getUserData } from "../../common/utils/tokenStorage";

export default function TeacherSettings() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setForm((prev) => ({
        ...prev,
        fullName: userData.fullName || "",
        email: userData.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSaveProfile = async () => {
    if (!form.fullName || !form.email) {
      setErrorMsg("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await API.put("/user/profile", {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      });
      setSuccessMsg("Profile updated successfully ✅");
    } catch (err) {
      setErrorMsg("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword) {
      setErrorMsg("Please fill all password fields");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await API.put("/user/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccessMsg("Password changed successfully ✅");
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to change password ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={28} className="text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        </div>

        <div className="max-w-lg space-y-6">
          {/* Profile Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-gray-700 mb-4">Profile Information</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg"
            >
              <Save size={16} />
              Save Profile
            </button>
          </div>

          {/* Password Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-gray-700 mb-4">Change Password</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPw ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-2 rounded-lg"
            >
              <Save size={16} />
              Change Password
            </button>
          </div>

          {/* Feedback */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}