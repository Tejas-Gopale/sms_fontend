import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Edit2, Save, User, Mail, Phone, Hash, Calendar,
  Briefcase, Heart, UserPlus, Loader2, ChevronLeft
} from "lucide-react";
import API from "../../common/services/api";

// ─── Main Modal ────────────────────────────────────────────────────────────
export default function StudentProfileModal({ student, classrooms, onClose, onRefresh }) {
  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showAssignParent, setShowAssignParent] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", studentEmail: "",
    admissionNumber: "", dateOfBirth: "", gender: "",
    classRoomId: "", section: "", rollNumber: "",
    isUsingBus: false, academicYear: "", active: true,
  });

  const [parentData, setParentData] = useState(student?.parent || null);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName:       student.firstName       || "",
        lastName:        student.lastName        || "",
        studentEmail:    student.studentEmail    || "",
        admissionNumber: student.admissionNumber || "",
        dateOfBirth:     student.dateOfBirth     || "",
        gender:          student.gender          || "male",
        classRoomId:     student.classRoom?.id   || "",
        section:         student.section         || "",
        rollNumber:      student.rollNumber      || "",
        isUsingBus:      student.isUsingBus      || false,
        academicYear:    student.academicYear    || "",
        active:          student.active          ?? true,
      });
      setParentData(student.parent || null);
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await API.patch(`/school-admin/update-student/${student.id}`, formData);
      alert("Student Information Updated ✅");
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Error updating student ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleParentAssigned = (newParent) => {
    setParentData(newParent);
    setShowAssignParent(false);
    onRefresh();
  };

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
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            {showAssignParent && (
              <button
                onClick={() => setShowAssignParent(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {showAssignParent ? "Assign Parent" : `${formData.firstName} ${formData.lastName}`}
              </h3>
              {!showAssignParent && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    formData.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {formData.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                  <span>•</span>
                  <span>Adm No: {formData.admissionNumber}</span>
                  {formData.academicYear && <><span>•</span><span>AY: {formData.academicYear}</span></>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!showAssignParent && (
              !isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all">
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <button onClick={handleUpdate} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-100 transition-all disabled:opacity-70">
                  <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                </button>
              )
            )}
            <button onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">

            {showAssignParent ? (
              <motion.div key="assign"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.2 }}>
                <AssignParentPanel
                  studentId={student.id}
                  onSuccess={handleParentAssigned}
                  onCancel={() => setShowAssignParent(false)}
                />
              </motion.div>
            ) : (
              <motion.div key="profile"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="p-6 space-y-8">

                {/* Personal + Academic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Personal */}
                  <div className="space-y-4">
                    <SectionTitle>Personal Information</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name">
                        <input name="firstName" value={formData.firstName} onChange={handleChange}
                          disabled={!isEditing} className={inputCls(!isEditing)} />
                      </Field>
                      <Field label="Last Name">
                        <input name="lastName" value={formData.lastName} onChange={handleChange}
                          disabled={!isEditing} className={inputCls(!isEditing)} />
                      </Field>
                    </div>
                    <Field label="Date of Birth">
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                          onChange={handleChange} disabled={!isEditing}
                          className={`${inputCls(!isEditing)} pl-10`} />
                      </div>
                    </Field>
                    <Field label="Gender">
                      <select name="gender" value={formData.gender} onChange={handleChange}
                        disabled={!isEditing} className={inputCls(!isEditing)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                    <Field label="Student Email">
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input value={formData.studentEmail} disabled
                          className={`${inputCls(true)} pl-10`} />
                      </div>
                    </Field>
                  </div>

                  {/* Academic */}
                  <div className="space-y-4">
                    <SectionTitle>Academic Details</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Admission Number">
                        <div className="relative">
                          <Hash size={16} className="absolute left-3 top-3 text-slate-400" />
                          <input value={formData.admissionNumber} disabled
                            className={`${inputCls(true)} pl-10 cursor-not-allowed`} />
                        </div>
                      </Field>
                      <Field label="Classroom">
                        <select name="classRoomId" value={formData.classRoomId}
                          onChange={handleChange} disabled={!isEditing}
                          className={inputCls(!isEditing)}>
                          <option value="">Select Class</option>
                          {classrooms.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              Grade {cls.grade} {cls.section}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Section">
                        <input name="section" value={formData.section || ""} onChange={handleChange}
                          disabled={!isEditing} className={inputCls(!isEditing)} placeholder="e.g. A" />
                      </Field>
                      <Field label="Roll Number">
                        <input name="rollNumber" value={formData.rollNumber || ""} onChange={handleChange}
                          disabled={!isEditing} type="number" className={inputCls(!isEditing)} />
                      </Field>
                    </div>
                    <Field label="Academic Year">
                      <input name="academicYear" value={formData.academicYear} onChange={handleChange}
                        disabled={!isEditing} className={inputCls(!isEditing)} placeholder="e.g. 2026-2027" />
                    </Field>
                    <div className="flex flex-col gap-2 pt-1">
                      <CheckboxField id="isUsingBus" name="isUsingBus" checked={formData.isUsingBus}
                        onChange={handleChange} disabled={!isEditing} label="Using School Bus" />
                      <CheckboxField id="active" name="active" checked={formData.active}
                        onChange={handleChange} disabled={!isEditing} label="Account Active" />
                    </div>
                  </div>
                </div>

                {/* ── Parent Section ── */}
                <div>
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <SectionTitle noMargin>👨‍👩‍👧 Parent / Guardian</SectionTitle>
                    {parentData ? (
                      <button onClick={() => setShowAssignParent(true)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition">
                        Change Parent
                      </button>
                    ) : (
                      <button onClick={() => setShowAssignParent(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all">
                        <UserPlus size={15} /> Assign Parent
                      </button>
                    )}
                  </div>

                  {parentData ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Full Name">
                          <div className="relative"><User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.fullName || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                        <Field label="Relation">
                          <div className="relative"><Heart size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.relationType || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                        <Field label="Occupation">
                          <div className="relative"><Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.occupation || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                        <Field label="Email">
                          <div className="relative"><Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.email || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                        <Field label="Phone">
                          <div className="relative"><Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.phoneNumber || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                        <Field label="Alternate Phone">
                          <div className="relative"><Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input value={parentData.alternatePhoneNumber || ""} disabled className={`${inputCls(true)} pl-10`} />
                          </div>
                        </Field>
                      </div>
                      <p className="text-xs text-slate-400 italic mt-3">
                        * To edit parent details, go to Parent Management section.
                      </p>
                    </>
                  ) : (
                    <div className="bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center">
                      <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserPlus size={24} className="text-indigo-500" />
                      </div>
                      <p className="text-slate-700 font-semibold text-sm">No parent linked yet</p>
                      <p className="text-slate-400 text-xs mt-1 mb-4">
                        Assign a parent to enable home-school communication.
                      </p>
                      <button onClick={() => setShowAssignParent(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all">
                        <UserPlus size={15} /> Assign Parent Now
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Assign Parent Panel ───────────────────────────────────────────────────
function AssignParentPanel({ studentId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    phoneNumber: "", alternatePhoneNumber: "",
    occupation: "", relationType: "Father",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email) {
      setError("Full Name and Email are required.");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/school-admin/student/${studentId}/assign-parent`, form);
      onSuccess({
        fullName:             form.fullName,
        email:                form.email,
        phoneNumber:          form.phoneNumber,
        alternatePhoneNumber: form.alternatePhoneNumber,
        occupation:           form.occupation,
        relationType:         form.relationType,
      });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to assign parent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        💡 Enter the parent's email. If the account already exists, it will be linked automatically.
        Otherwise, a new parent account will be created.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *">
          <div className="relative">
            <User size={16} className="absolute left-3 top-3 text-slate-400" />
            <input name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="e.g. Ramesh Sharma" className={`${inputCls(false)} pl-10`} />
          </div>
        </Field>

        <Field label="Relation Type *">
          <div className="relative">
            <Heart size={16} className="absolute left-3 top-3 text-slate-400" />
            <select name="relationType" value={form.relationType} onChange={handleChange}
              className={`${inputCls(false)} pl-10`}>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </Field>

        <Field label="Email Address *">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="parent@gmail.com" className={`${inputCls(false)} pl-10`} />
          </div>
        </Field>

        <Field label="Password (new accounts only)">
          <input name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Leave blank if account already exists" className={inputCls(false)} />
        </Field>

        <Field label="Phone Number">
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
              placeholder="+91 9876543210" className={`${inputCls(false)} pl-10`} />
          </div>
        </Field>

        <Field label="Alternate Phone">
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
            <input name="alternatePhoneNumber" value={form.alternatePhoneNumber} onChange={handleChange}
              placeholder="+91 9123456789" className={`${inputCls(false)} pl-10`} />
          </div>
        </Field>

        <Field label="Occupation">
          <div className="relative">
            <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
            <input name="occupation" value={form.occupation} onChange={handleChange}
              placeholder="e.g. Engineer, Teacher" className={`${inputCls(false)} pl-10`} />
          </div>
        </Field>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Assigning...</> : "Assign Parent"}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function SectionTitle({ children, noMargin }) {
  return (
    <h4 className={`text-xs font-bold text-indigo-600 uppercase tracking-wider ${noMargin ? "" : "mb-4"}`}>
      {children}
    </h4>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({ id, name, checked, onChange, disabled, label }) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed" />
      <label htmlFor={id} className="text-sm text-slate-600 font-medium">{label}</label>
    </div>
  );
}

function inputCls(disabled) {
  return `w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition
    ${disabled ? "bg-slate-50 text-slate-500" : "bg-white text-slate-800"}`;
}
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { X, Edit2, Save, User, Mail, Phone, Hash, Calendar, Briefcase, Heart } from "lucide-react";
// import API from "../../common/services/api";

// export default function StudentProfileModal({ student, classrooms, onClose, onRefresh }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     studentEmail: "",
//     admissionNumber: "",
//     dateOfBirth: "",
//     gender: "",
//     classRoomId: "",
//     section: "",
//     rollNumber: "",
//     isUsingBus: false,
//     academicYear: "",
//     active: true,
//   });

//   // Parent is read-only — shown separately, not editable from here
//   const parent = student?.parent || null;

//   useEffect(() => {
//     if (student) {
//       setFormData({
//         firstName: student.firstName || "",
//         lastName: student.lastName || "",
//         studentEmail: student.studentEmail || "",
//         admissionNumber: student.admissionNumber || "",
//         dateOfBirth: student.dateOfBirth || "",
//         gender: student.gender || "male",
//         // ✅ classRoom is now an object: { id, grade, section }
//         classRoomId: student.classRoom?.id || "",
//         section: student.section || "",
//         rollNumber: student.rollNumber || "",
//         isUsingBus: student.isUsingBus || false,
//         academicYear: student.academicYear || "",
//         active: student.active ?? true,
//       });
//     }
//   }, [student]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleUpdate = async () => {
//     setLoading(true);
//     try {
//       await API.patch(`/school-admin/update-student/${student.id}`, formData);
//       alert("Student Information Updated ✅");
//       setIsEditing(false);
//       onRefresh();
//     } catch (err) {
//       console.error(err);
//       alert("Error updating student ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <motion.div
//         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//         onClick={onClose}
//         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
//       />

//       {/* Modal */}
//       <motion.div
//         initial={{ scale: 0.95, opacity: 0, y: 20 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.95, opacity: 0, y: 20 }}
//         className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
//       >
//         {/* ── Header ── */}
//         <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
//               {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
//             </div>
//             <div>
//               <h3 className="text-2xl font-bold text-slate-800">
//                 {formData.firstName} {formData.lastName}
//               </h3>
//               <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
//                 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
//                   formData.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                 }`}>
//                   {formData.active ? "ACTIVE" : "INACTIVE"}
//                 </span>
//                 <span>•</span>
//                 <span>Adm No: {formData.admissionNumber}</span>
//                 {formData.academicYear && (
//                   <>
//                     <span>•</span>
//                     <span>AY: {formData.academicYear}</span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {!isEditing ? (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
//               >
//                 <Edit2 size={16} /> Edit Profile
//               </button>
//             ) : (
//               <button
//                 onClick={handleUpdate}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-100 transition-all disabled:opacity-70"
//               >
//                 <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
//               </button>
//             )}
//             <button
//               onClick={onClose}
//               className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* ── Body ── */}
//         <div className="p-6 overflow-y-auto space-y-8">

//           {/* Row 1: Personal + Academic */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//             {/* Section 1: Personal Info */}
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">
//                 Personal Information
//               </h4>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="First Name">
//                   <input name="firstName" value={formData.firstName} onChange={handleChange}
//                     disabled={!isEditing} className={inputCls(!isEditing)} />
//                 </Field>
//                 <Field label="Last Name">
//                   <input name="lastName" value={formData.lastName} onChange={handleChange}
//                     disabled={!isEditing} className={inputCls(!isEditing)} />
//                 </Field>
//               </div>

//               <Field label="Date of Birth">
//                 <div className="relative">
//                   <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
//                   <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
//                     onChange={handleChange} disabled={!isEditing}
//                     className={`${inputCls(!isEditing)} pl-10`} />
//                 </div>
//               </Field>

//               <Field label="Gender">
//                 <select name="gender" value={formData.gender} onChange={handleChange}
//                   disabled={!isEditing} className={inputCls(!isEditing)}>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </Field>

//               <Field label="Student Email">
//                 <div className="relative">
//                   <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
//                   {/* studentEmail is read-only — tied to User account */}
//                   <input value={formData.studentEmail} disabled
//                     className={`${inputCls(true)} pl-10`}
//                     title="Email is linked to user account and cannot be changed here" />
//                 </div>
//               </Field>
//             </div>

//             {/* Section 2: Academic Info */}
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">
//                 Academic Details
//               </h4>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Admission Number">
//                   <div className="relative">
//                     <Hash size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input name="admissionNumber" value={formData.admissionNumber} disabled
//                       className={`${inputCls(true)} pl-10 cursor-not-allowed`}
//                       title="Admission number cannot be changed" />
//                   </div>
//                 </Field>

//                 <Field label="Assigned Classroom">
//                   <select name="classRoomId" value={formData.classRoomId}
//                     onChange={handleChange} disabled={!isEditing}
//                     className={inputCls(!isEditing)}>
//                     <option value="">Select Class</option>
//                     {classrooms.map((cls) => (
//                       <option key={cls.id} value={cls.id}>
//                         Grade {cls.grade} {cls.section}
//                       </option>
//                     ))}
//                   </select>
//                 </Field>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Section">
//                   <input name="section" value={formData.section || ""} onChange={handleChange}
//                     disabled={!isEditing} className={inputCls(!isEditing)} placeholder="e.g. A" />
//                 </Field>
//                 <Field label="Roll Number">
//                   <input name="rollNumber" value={formData.rollNumber || ""} onChange={handleChange}
//                     disabled={!isEditing} type="number" className={inputCls(!isEditing)} />
//                 </Field>
//               </div>

//               <Field label="Academic Year">
//                 <input name="academicYear" value={formData.academicYear} onChange={handleChange}
//                   disabled={!isEditing} className={inputCls(!isEditing)} placeholder="e.g. 2026-2027" />
//               </Field>

//               <div className="flex items-center gap-3 pt-1">
//                 <input type="checkbox" id="isUsingBus" name="isUsingBus"
//                   checked={formData.isUsingBus} onChange={handleChange}
//                   disabled={!isEditing}
//                   className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed" />
//                 <label htmlFor="isUsingBus" className="text-sm text-slate-600 font-medium">
//                   Using School Bus
//                 </label>
//               </div>

//               <div className="flex items-center gap-3">
//                 <input type="checkbox" id="active" name="active"
//                   checked={formData.active} onChange={handleChange}
//                   disabled={!isEditing}
//                   className="w-4 h-4 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed" />
//                 <label htmlFor="active" className="text-sm text-slate-600 font-medium">
//                   Account Active
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* ── Section 3: Parent Info (Read-Only) ── */}
//           <div>
//             <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2 mb-4">
//               👨‍👩‍👧 Parent / Guardian Details
//             </h4>

//             {parent ? (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <Field label="Full Name">
//                   <div className="relative">
//                     <User size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.fullName || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>

//                 <Field label="Relation">
//                   <div className="relative">
//                     <Heart size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.relationType || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>

//                 <Field label="Occupation">
//                   <div className="relative">
//                     <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.occupation || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>

//                 <Field label="Email">
//                   <div className="relative">
//                     <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.email || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>

//                 <Field label="Phone Number">
//                   <div className="relative">
//                     <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.phoneNumber || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>

//                 <Field label="Alternate Phone">
//                   <div className="relative">
//                     <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
//                     <input value={parent.alternatePhoneNumber || ""} disabled className={`${inputCls(true)} pl-10`} />
//                   </div>
//                 </Field>
//               </div>
//             ) : (
//               <div className="bg-slate-50 rounded-xl p-6 text-center border border-dashed border-slate-200">
//                 <p className="text-slate-400 text-sm">No parent linked to this student.</p>
//                 <p className="text-slate-400 text-xs mt-1">
//                   Link a parent from the Parent Management section.
//                 </p>
//               </div>
//             )}

//             {parent && (
//               <p className="text-xs text-slate-400 italic mt-3">
//                 * Parent details can only be updated from the Parent Management section.
//               </p>
//             )}
//           </div>

//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ── Helpers ──────────────────────────────────────────────
// function Field({ label, children }) {
//   return (
//     <div className="space-y-1">
//       <label className="text-xs font-semibold text-slate-500">{label}</label>
//       {children}
//     </div>
//   );
// }

// function inputCls(disabled) {
//   return `w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition
//     ${disabled ? "bg-slate-50 text-slate-500" : "bg-white text-slate-800"}`;
// }