import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit2, Save, User, Mail, Phone, MapPin, Hash, Calendar } from "lucide-react";
import API from "../../common/services/api";

export default function StudentProfileModal({ student, classrooms, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize form with student data. Added extra fields for a complete profile.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "",
    classRoomId: "",
    guardianName: "", // Added extra field
    contactNumber: "", // Added extra field
    address: "",      // Added extra field
    status: "active"  // Added extra field
  });

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        admissionNumber: student.admissionNumber || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender || "male",
        classRoomId: student.classRoomId || (student.classroom ? student.classroom.id : ""),
        guardianName: student.guardianName || "",
        contactNumber: student.contactNumber || "",
        address: student.address || "",
        status: student.status || "active"
      });
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Assuming your Spring Boot backend has a PUT endpoint for updates
      await API.put(`/school-admin/update-student/${student.id}`, formData);
      alert("Student Information Updated ✅");
      setIsEditing(false);
      onRefresh(); // Re-fetch the table data in the parent component
    } catch (err) {
      console.error(err);
      alert("Error updating student ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {formData.firstName} {formData.lastName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {formData.status.toUpperCase()}
                </span>
                <span>•</span>
                <span>Adm No: {formData.admissionNumber}</span>
              </div>
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

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Date of Birth</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Section 2: Academic & Contact Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">Academic & Contact</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Admission Number</label>
                  <div className="relative">
                     <Hash size={16} className="absolute left-3 top-3 text-slate-400" />
                     <input name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} disabled={true} className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed outline-none" title="Admission numbers cannot be changed" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assigned Classroom</label>
                  <select name="classRoomId" value={formData.classRoomId} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="">Select Class</option>
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>Grade {cls.grade} {cls.section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Guardian Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input name="guardianName" value={formData.guardianName} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="e.g. Robert Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student/Parent Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="+91 9876543210" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-4">
                  <label className="text-xs font-semibold text-slate-500">Account Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} disabled={!isEditing} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}