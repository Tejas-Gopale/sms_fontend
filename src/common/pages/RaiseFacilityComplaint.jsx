// src/common/pages/RaiseFacilityComplaint.jsx
// Any staff role — raise a facility/housekeeping complaint

import { useState } from "react";
import RoleSidebar from "../components/RoleSidebar";
import { getUserData } from "../utils/tokenStorage";
import { housekeepingService } from "../services/housekeepingService";
import { AlertCircle, Send } from "lucide-react";

export default function RaiseFacilityComplaint() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [form, setForm] = useState({ location: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleSubmit = async () => {
    if (!form.location.trim() || !form.description.trim()) {
      showToast("error", "Location aur description dono required hain");
      return;
    }
    setSubmitting(true);
    try {
      await housekeepingService.raiseComplaint(schoolId, form);
      showToast("success", "Complaint raised. Housekeeping team will look into it.");
      setForm({ location: "", description: "" });
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Complaint raise nahi ho paayi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle size={20} className="text-yellow-500" /> Report a Facility Issue
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Raise a complaint for the housekeeping team</p>
        </div>

        <div className="p-8 max-w-md">
          {toast && (
            <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Staff Room 2nd Floor, Block B Washroom"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60"
            >
              <Send size={14} /> {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
