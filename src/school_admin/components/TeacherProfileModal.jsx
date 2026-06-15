import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Edit2, Save, Hash, Calendar, BookOpen, DollarSign, Camera, Loader2 } from "lucide-react";
import API from "../../common/services/api";
import profileService from "../../common/services/profileService";

export default function TeacherProfileModal({ teacher, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(teacher?.profilePhotoUrl || null);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    qualification: "",
    subjectSpecialization: "",
    joiningDate: "",
    salary: "",
    employeeId: "",
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        qualification:         teacher.qualification || "",
        subjectSpecialization: teacher.subjectSpecialization || "",
        joiningDate:           teacher.joiningDate || "",
        salary:                teacher.salary || "",
        employeeId:            teacher.employeeId || "",
      });
      setPhotoUrl(teacher.profilePhotoUrl || null);
    }
  }, [teacher]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== "" && v !== null)
      );
      await API.patch(`/teacher/update-teacher/${teacher.id}`, payload);
      alert("Teacher Updated ✅");
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Error updating teacher ❌");
    } finally {
      setLoading(false);
    }
  };

  // ── Cloudinary photo upload ─────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { data } = await profileService.uploadTeacherPhoto(teacher.id, file);
      setPhotoUrl(data.url);
      onRefresh(); // reflect new photo in the list
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Photo upload failed ❌");
    } finally {
      setPhotoUploading(false);
    }
  };

  const initials = (teacher?.userName || teacher?.fullName || "T")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            {/* Avatar with Cloudinary upload */}
            <div className="relative">
              {photoUploading ? (
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-indigo-500" />
                </div>
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={teacher?.userName || teacher?.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                />
              ) : (
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow transition-all"
              >
                <Camera size={12} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {teacher?.userName || teacher?.fullName}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {formData.subjectSpecialization || "Teacher"} • {formData.employeeId || "No ID"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-100 transition-all disabled:opacity-70"
              >
                <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{teacher?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Employee ID</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{formData.employeeId || "—"}</p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">
            Professional Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Qualification</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. B.Ed, M.Sc"
                  className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Subject Specialization</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="subjectSpecialization"
                  value={formData.subjectSpecialization}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Joining Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Salary (₹)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. 35000"
                  className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
