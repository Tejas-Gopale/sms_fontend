import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, GraduationCap, User, Users, MapPin, FileText,
  Loader2, BadgeCheck, AlertCircle, ChevronRight, ChevronLeft,
  Wallet, BookOpen, Mail, Phone, Hash, Calendar, Briefcase,
  Building2, UserPlus
} from "lucide-react";
import { admissionService } from "../../common/services/api";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Student",  icon: User        },
  { id: 2, label: "Enroll",   icon: GraduationCap },
  { id: 3, label: "Parent",   icon: Users       },
  { id: 4, label: "Address",  icon: MapPin      },
];

/** Auto-resolve academic year: June onwards = new year starts */
function getDefaultAcademicYear() {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

const EMPTY_FORM = {
  // Student
  studentFirstName: "", studentLastName: "", dateOfBirth: "", gender: "", photoUrl: "",
  // Enroll
  classRoomId: "", section: "", admissionNumber: "",
  academicYear: getDefaultAcademicYear(), // ✅ auto-filled
  // Parent
  parentName: "", parentPhone: "", parentEmail: "", parentOccupation: "", relation: "",
  // Address
  address: "", city: "", pincode: "",
  // Academic background
  previousSchool: "", previousGrade: "", previousMarksPercent: "",
  // Docs
  birthCertificateUrl: "", previousMarksheetUrl: "", transferCertificateUrl: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DirectAdmissionModal({ onClose, onSuccess }) {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const next = () => { setError(""); setStep((s) => Math.min(s + 1, STEPS.length)); };
  const back = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  // Basic per-step validation
  const validate = () => {
    if (step === 1) {
      if (!form.studentFirstName.trim()) return "First name is required.";
      if (!form.studentLastName.trim())  return "Last name is required.";
      if (!form.gender)                  return "Please select a gender.";
    }
    if (step === 2) {
      if (!form.classRoomId)   return "Classroom ID is required.";
      if (!form.academicYear.trim()) return "Academic year is required.";
    }
    if (step === 3) {
      if (!form.parentName.trim())  return "Parent name is required.";
      if (!form.parentPhone.trim()) return "Parent phone is required.";
      if (!form.relation)           return "Please select relation.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { setError(err); return; }
    next();
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        classRoomId:  Number(form.classRoomId),
        dateOfBirth:  form.dateOfBirth  || undefined,
        section:      form.section      || undefined,
        admissionNumber: form.admissionNumber || undefined,
        parentEmail:  form.parentEmail  || undefined,
        photoUrl:     form.photoUrl     || undefined,
        academicYear: form.academicYear.trim(),
      };
      const res = await admissionService.directAdmit(payload);
      setResult(res.data);
      onSuccess?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Admission failed. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative z-10 bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center">
              <UserPlus size={20} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Direct Walk-in Admission</h2>
              <p className="text-xs text-slate-500 mt-0.5">Admit a student on the spot — no prior inquiry needed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        {!result && (
          <div className="px-8 pt-5 pb-4 flex-shrink-0">
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done   = step > s.id;
                const active = step === s.id;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                        ${done   ? "bg-violet-600 text-white"
                        : active ? "bg-violet-50 text-violet-700 ring-2 ring-violet-200"
                                 : "bg-slate-100 text-slate-400"}`}>
                        {done ? <BadgeCheck size={17} /> : <Icon size={16} />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide
                        ${active ? "text-violet-700" : done ? "text-violet-500" : "text-slate-400"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-5 rounded transition-all
                        ${step > s.id ? "bg-violet-400" : "bg-slate-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {result ? (
            <SuccessView result={result} onClose={onClose} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && <StepStudent form={form} set={set} />}
                {step === 2 && <StepEnroll  form={form} set={set} />}
                {step === 3 && <StepParent  form={form} set={set} />}
                {step === 4 && <StepAddress form={form} set={set} />}
              </motion.div>
            </AnimatePresence>
          )}

          {error && !result && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3 mt-4">
              <AlertCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!result && (
          <div className="px-8 pb-7 pt-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
            {step > 1 && (
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm hover:bg-slate-50 transition"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <div className="flex-1" />

            {step < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm hover:bg-violet-700 transition shadow-lg shadow-violet-100"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm hover:bg-violet-700 transition shadow-lg shadow-violet-100 disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  : <><GraduationCap size={16} /> Confirm Admission</>
                }
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Step 1: Student Info ─────────────────────────────────────────────────────
function StepStudent({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<User size={16}/>} title="Student Details" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name *">
          <Input icon={<User size={14}/>} placeholder="e.g. Riya" value={form.studentFirstName} onChange={set("studentFirstName")} />
        </Field>
        <Field label="Last Name *">
          <Input icon={<User size={14}/>} placeholder="e.g. Sharma" value={form.studentLastName} onChange={set("studentLastName")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of Birth">
          <Input icon={<Calendar size={14}/>} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        </Field>
        <Field label="Gender *">
          <Select value={form.gender} onChange={set("gender")} options={["Male","Female","Other"]} placeholder="Select gender" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Previous School">
          <Input icon={<Building2 size={14}/>} placeholder="Previous school name" value={form.previousSchool} onChange={set("previousSchool")} />
        </Field>
        <Field label="Previous Grade">
          <Input placeholder="e.g. Class 4" value={form.previousGrade} onChange={set("previousGrade")} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Enrollment ───────────────────────────────────────────────────────
function StepEnroll({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<GraduationCap size={16}/>} title="Enrollment Details" />

      {/* Info strip */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">Auto-assigned on admit:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Users size={13}/>,   text: "Student + Parent accounts" },
            { icon: <BookOpen size={13}/>, text: "All classroom subjects"    },
            { icon: <Wallet size={13}/>,   text: "Fee record from structure" },
            { icon: <Mail size={13}/>,     text: "Welcome emails dispatched" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-violet-800 font-medium">
              <span className="text-violet-400">{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Academic Year — shown prominently */}
      <Field label="Academic Year *" hint='Format: "2025-2026". Auto-filled based on current date.'>
        <Input
          icon={<Calendar size={14}/>}
          placeholder="e.g. 2025-2026"
          value={form.academicYear}
          onChange={set("academicYear")}
        />
      </Field>

      <Field label="Classroom ID *" hint="Numeric ID of the target classroom">
        <Input icon={<Hash size={14}/>} type="number" placeholder="e.g. 7" value={form.classRoomId} onChange={set("classRoomId")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Section" hint="Optional — uses classroom default">
          <Input placeholder="e.g. A" value={form.section} onChange={set("section")} />
        </Field>
        <Field label="Admission No." hint="Optional — auto-generated">
          <Input icon={<Hash size={14}/>} placeholder="e.g. KST2025001" value={form.admissionNumber} onChange={set("admissionNumber")} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 3: Parent Info ──────────────────────────────────────────────────────
function StepParent({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<Users size={16}/>} title="Parent / Guardian" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Parent Name *">
          <Input icon={<User size={14}/>} placeholder="e.g. Neha Sharma" value={form.parentName} onChange={set("parentName")} />
        </Field>
        <Field label="Relation *">
          <Select value={form.relation} onChange={set("relation")} options={["Father","Mother","Guardian","Other"]} placeholder="Select relation" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone *">
          <Input icon={<Phone size={14}/>} placeholder="e.g. 9876543210" value={form.parentPhone} onChange={set("parentPhone")} />
        </Field>
        <Field label="Email" hint="Used for parent portal login">
          <Input icon={<Mail size={14}/>} type="email" placeholder="parent@email.com" value={form.parentEmail} onChange={set("parentEmail")} />
        </Field>
      </div>
      <Field label="Occupation">
        <Input icon={<Briefcase size={14}/>} placeholder="e.g. Software Engineer" value={form.parentOccupation} onChange={set("parentOccupation")} />
      </Field>
    </div>
  );
}

// ─── Step 4: Address ──────────────────────────────────────────────────────────
function StepAddress({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<MapPin size={16}/>} title="Address & Documents" />
      <Field label="Street Address">
        <Input icon={<MapPin size={14}/>} placeholder="House no, street name..." value={form.address} onChange={set("address")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City">
          <Input placeholder="e.g. Pune" value={form.city} onChange={set("city")} />
        </Field>
        <Field label="Pincode">
          <Input placeholder="e.g. 411001" value={form.pincode} onChange={set("pincode")} />
        </Field>
      </div>
      <div className="border-t border-slate-100 pt-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Document URLs (optional)</p>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Birth Certificate URL">
            <Input icon={<FileText size={14}/>} placeholder="https://..." value={form.birthCertificateUrl} onChange={set("birthCertificateUrl")} />
          </Field>
          <Field label="Previous Marksheet URL">
            <Input icon={<FileText size={14}/>} placeholder="https://..." value={form.previousMarksheetUrl} onChange={set("previousMarksheetUrl")} />
          </Field>
          <Field label="Transfer Certificate URL">
            <Input icon={<FileText size={14}/>} placeholder="https://..." value={form.transferCertificateUrl} onChange={set("transferCertificateUrl")} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Success View ─────────────────────────────────────────────────────────────
function SuccessView({ result, onClose }) {
  return (
    <div className="py-2 space-y-5">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <BadgeCheck size={36} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Admission Confirmed!</h3>
          <p className="text-sm text-slate-500 mt-1">Welcome emails sent to student and parent.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ResultRow label="Student ID"        value={result.studentId} />
        <ResultRow label="Admission No."     value={result.admissionNumber} />
        <ResultRow label="Class"             value={`${result.grade}${result.section ? " — " + result.section : ""}`} />
        <ResultRow label="Academic Year"     value={result.academicYear} />
        <ResultRow label="Subjects"          value={`${result.subjectsAssigned} assigned`} />
        <ResultRow label="Fee Record"        value={result.feeRecordCreated ? "✓ Created" : "No structure found"} />
        <ResultRow label="Student Email"     value={result.studentEmail} span />
        <ResultRow label="Temp Password (Student)" value={result.studentTempPassword} span highlight />
        <ResultRow label="Parent Email"      value={result.parentEmail} span />
        <ResultRow label="Temp Password (Parent)"  value={result.parentTempPassword} span highlight />
      </div>

      <p className="text-xs text-center text-slate-400">
        Please note down / print the credentials and hand them to the student.
      </p>

      <button
        onClick={onClose}
        className="w-full py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm hover:bg-violet-700 transition"
      >
        Done
      </button>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-7 h-7 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">{icon}</div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm outline-none
          focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 transition
          ${icon ? "pl-9 pr-4" : "px-4"}`}
      />
    </div>
  );
}

function Select({ options, placeholder, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none
        focus:ring-2 focus:ring-violet-400/30 appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ResultRow({ label, value, span, highlight }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"} ${span ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold mt-0.5 truncate ${highlight ? "text-amber-800 font-mono" : "text-slate-800"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}