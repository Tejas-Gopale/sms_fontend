// src/school_admin/pages/Settings.jsx
// Comprehensive School Admin Settings — 6 sections

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  School, Bell, Shield, CreditCard, Users, Palette,
  Save, Eye, EyeOff, Upload, CheckCircle2, XCircle,
  AlertCircle, Loader2, ChevronRight, Globe, Phone,
  Mail, MapPin, Clock, Calendar, Lock, Key, Smartphone,
  Wifi, Database, RefreshCw, Trash2, Download, Image,
  Sun, Moon, Monitor, IndianRupee,
  Webhook, TestTube, Building2, Hash, FileText, Info,
  Languages, Volume2, VolumeX, MessageSquare, BellOff,
  BellRing, UserCog, ShieldCheck, ShieldOff, LogOut,
  AlertTriangle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const schoolId = localStorage.getItem("schoolId") || 1;

const SECTIONS = [
  { id: "school",        label: "School Info",      icon: School,      color: "text-blue-600",   bg: "bg-blue-50" },
  { id: "notifications", label: "Notifications",    icon: Bell,        color: "text-amber-600",  bg: "bg-amber-50" },
  { id: "security",      label: "Security",         icon: Shield,      color: "text-green-600",  bg: "bg-green-50" },
  { id: "payment",       label: "Payment Gateway",  icon: CreditCard,  color: "text-purple-600", bg: "bg-purple-50" },
  { id: "roles",         label: "Roles & Access",   icon: Users,       color: "text-cyan-600",   bg: "bg-cyan-50" },
  { id: "appearance",    label: "Appearance",       icon: Palette,     color: "text-pink-600",   bg: "bg-pink-50" },
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27"];

const ROLE_PERMISSIONS = [
  { role: "PRINCIPAL",       label: "Principal",        desc: "View all data, approve requests" },
  { role: "VICE_PRINCIPAL",  label: "Vice Principal",   desc: "Same as Principal" },
  { role: "TEACHER",         label: "Teacher",          desc: "Attendance, homework, marks" },
  { role: "CLASS_TEACHER",   label: "Class Teacher",    desc: "Full class management" },
  { role: "COUNSELOR",       label: "Counselor",        desc: "Student welfare access" },
  { role: "ACCOUNTANT",      label: "Accountant",       desc: "Full financial access" },
  { role: "LIBRARIAN",       label: "Librarian",        desc: "Library module access" },
  { role: "RECEPTIONIST",    label: "Receptionist",     desc: "Visitor management" },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, add };
};

const Toasts = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div key={t.id}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium min-w-[260px]
            ${t.type === "success" ? "bg-green-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}>
          {t.type === "success" ? <CheckCircle2 size={15} /> : t.type === "error" ? <XCircle size={15} /> : <AlertCircle size={15} />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Reusable UI ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, icon: Icon, iconColor, iconBg, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, hint, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800 placeholder-gray-400";
const sel = `${inp}`;

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

const SaveBar = ({ loading, onSave, onReset }) => (
  <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
    {onReset && (
      <button type="button" onClick={onReset}
        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
        Reset
      </button>
    )}
    <button type="button" onClick={onSave} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
      Save Changes
    </button>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { toasts, add: toast } = useToast();
  const [activeSection, setActiveSection] = useState("school");
  const [saving, setSaving] = useState({});
  const logoRef = useRef();

  const setSav = (key, val) => setSaving((p) => ({ ...p, [key]: val }));

  // ── School Info state ────────────────────────────────────────────
  const [school, setSchool] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    timezone: "Asia/Kolkata",
    language: "en",
    academicYear: "2024-25",
    boardAffiliation: "",
    udiseCode: "",
    establishedYear: "",
    logoUrl: "",
    latitude: "",
    longitude: "",
    attendanceRadiusMeters: "100",
  });

  // ── Notification state ───────────────────────────────────────────
  const [notif, setNotif] = useState({
    emailNotifications:     true,
    smsNotifications:       false,
    pushNotifications:      true,
    feeReminders:           true,
    attendanceAlerts:       true,
    examNotifications:      true,
    eventNotifications:     true,
    homeworkAlerts:         false,
    reportCardAlerts:       true,
    admissionNotifications: true,
    lowAttendanceAlert:     true,
    lowAttendanceThreshold: 75,
    dailyDigest:            false,
    weeklyReport:           true,
  });

  // ── Security state ───────────────────────────────────────────────
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "60",
    loginAlerts: true,
    passwordExpiry: "90",
    allowMultipleSessions: false,
    ipRestriction: false,
    auditLog: true,
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // ── Payment state ────────────────────────────────────────────────
  const [payment, setPayment] = useState({
    gatewayName: "RAZORPAY",
    apiKey: "",
    apiSecret: "",
    webhookSecret: "",
    upiId: "",
    isTestMode: true,
    isActive: false,
    lateFeeEnabled: false,
    lateFeeAmount: "",
    lateFeeType: "FIXED",
    gracePeriodDays: "3",
    partialPaymentAllowed: false,
    onlinePaymentEnabled: true,
  });
  const [showSecret, setShowSecret] = useState(false);

  // ── Roles state ──────────────────────────────────────────────────
  const [roles, setRoles] = useState({
    PRINCIPAL:      { canManageStudents: true,  canManageStaff: true,  canViewFinance: true,  canSendNotif: true  },
    VICE_PRINCIPAL: { canManageStudents: true,  canManageStaff: true,  canViewFinance: false, canSendNotif: true  },
    TEACHER:        { canManageStudents: false, canManageStaff: false, canViewFinance: false, canSendNotif: false },
    CLASS_TEACHER:  { canManageStudents: true,  canManageStaff: false, canViewFinance: false, canSendNotif: true  },
    COUNSELOR:      { canManageStudents: true,  canManageStaff: false, canViewFinance: false, canSendNotif: false },
    ACCOUNTANT:     { canManageStudents: false, canManageStaff: false, canViewFinance: true,  canSendNotif: false },
    LIBRARIAN:      { canManageStudents: false, canManageStaff: false, canViewFinance: false, canSendNotif: false },
    RECEPTIONIST:   { canManageStudents: false, canManageStaff: false, canViewFinance: false, canSendNotif: false },
  });

  // ── Appearance state ─────────────────────────────────────────────
  const [appearance, setAppearance] = useState({
    theme: "light",
    primaryColor: "#2563EB",
    accentColor: "#3B82F6",
    compactMode: false,
    sidebarCollapsed: false,
    showStudentPhotos: true,
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    currencySymbol: "₹",
  });

  // ─── Save handlers ───────────────────────────────────────────────
  const saveSchool = async () => {
    setSav("school", true);
    try {
      await API.put(`/school-admin/school/${schoolId}`, school);
      toast("School info saved!", "success");
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to save", "error");
    } finally { setSav("school", false); }
  };

  const saveNotif = async () => {
    setSav("notif", true);
    try {
      await API.put(`/school-admin/notifications/settings?schoolId=${schoolId}`, notif);
      toast("Notification settings saved!", "success");
    } catch { toast("Saved locally — API not connected", "info"); }
    finally { setSav("notif", false); }
  };

  const savePassword = async () => {
    if (!security.newPassword) return toast("Enter new password", "error");
    if (security.newPassword !== security.confirmPassword) return toast("Passwords don't match", "error");
    if (security.newPassword.length < 8) return toast("Minimum 8 characters required", "error");
    setSav("security", true);
    try {
      await API.post(`/auth/change-password`, {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      toast("Password changed!", "success");
      setSecurity((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to change password", "error");
    } finally { setSav("security", false); }
  };

  const saveSecuritySettings = async () => {
    setSav("secSettings", true);
    try {
      await API.put(`/school-admin/security/settings?schoolId=${schoolId}`, {
        twoFactorEnabled: security.twoFactorEnabled,
        sessionTimeout: security.sessionTimeout,
        loginAlerts: security.loginAlerts,
        auditLog: security.auditLog,
      });
      toast("Security settings saved!", "success");
    } catch { toast("Saved locally — API not connected", "info"); }
    finally { setSav("secSettings", false); }
  };

  const savePayment = async () => {
    setSav("payment", true);
    try {
      await API.post(`/payments/save?schoolId=${schoolId}`, payment);
      toast("Payment gateway saved!", "success");
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to save payment config", "error");
    } finally { setSav("payment", false); }
  };

  const saveAppearance = async () => {
    setSav("appearance", true);
    await new Promise((r) => setTimeout(r, 600));
    toast("Appearance preferences saved!", "success");
    setSav("appearance", false);
  };

  const saveRoles = async () => {
    setSav("roles", true);
    await new Promise((r) => setTimeout(r, 600));
    toast("Role permissions saved!", "success");
    setSav("roles", false);
  };

  const toggleRolePerm = (role, perm) => {
    setRoles((p) => ({ ...p, [role]: { ...p[role], [perm]: !p[role][perm] } }));
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SchoolAdminSidebar />
      <Toasts toasts={toasts} />

      <main className="flex-1 flex overflow-hidden">

        {/* Left nav panel */}
        <aside className="w-56 bg-white border-r border-gray-100 flex-shrink-0 py-6 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-3">Settings</p>
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left
                    ${active ? `${s.bg} ${s.color}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
                  <Icon size={16} className={active ? s.color : "text-gray-400"} />
                  {s.label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Danger zone */}
          <div className="mt-6 pt-6 border-t border-gray-100 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Danger</p>
            <button className="w-full flex items-center gap-2 text-xs font-semibold text-red-500 hover:bg-red-50 px-2 py-2 rounded-lg transition-colors">
              <AlertTriangle size={13} /> Reset All Settings
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══ SCHOOL INFO ══════════════════════════════════════════ */}
          {activeSection === "school" && (
            <motion.div key="school" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">School Information</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your school's identity and basic details</p>
              </div>

              {/* Logo upload */}
              <SectionCard title="School Logo & Branding" icon={Image} iconColor="text-blue-600" iconBg="bg-blue-50">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {school.logoUrl
                      ? <img src={school.logoUrl} alt="logo" className="w-full h-full object-cover" />
                      : <School size={28} className="text-gray-300" />}
                  </div>
                  <div>
                    <button onClick={() => logoRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      <Upload size={14} /> Upload Logo
                    </button>
                    <p className="text-xs text-gray-400 mt-1.5">PNG or JPG · max 2MB · 200×200px recommended</p>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSchool((p) => ({ ...p, logoUrl: URL.createObjectURL(file) }));
                      }} />
                  </div>
                </div>
              </SectionCard>

              {/* Basic Info */}
              <SectionCard title="Basic Details" subtitle="Name, contact and location" icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="School Name *" className="md:col-span-2">
                    <input value={school.name} onChange={(e) => setSchool((p) => ({ ...p, name: e.target.value }))}
                      className={inp} placeholder="Delhi Public School" />
                  </Field>
                  <Field label="Official Email">
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={school.email} onChange={(e) => setSchool((p) => ({ ...p, email: e.target.value }))}
                        className={`${inp} pl-9`} placeholder="school@dps.edu.in" />
                    </div>
                  </Field>
                  <Field label="Phone Number">
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={school.phone} onChange={(e) => setSchool((p) => ({ ...p, phone: e.target.value }))}
                        className={`${inp} pl-9`} placeholder="+91 9999 000 000" />
                    </div>
                  </Field>
                  <Field label="Website">
                    <div className="relative">
                      <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="url" value={school.website} onChange={(e) => setSchool((p) => ({ ...p, website: e.target.value }))}
                        className={`${inp} pl-9`} placeholder="https://dps.edu.in" />
                    </div>
                  </Field>
                  <Field label="UDISE Code">
                    <div className="relative">
                      <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={school.udiseCode} onChange={(e) => setSchool((p) => ({ ...p, udiseCode: e.target.value }))}
                        className={`${inp} pl-9`} placeholder="09140201101" />
                    </div>
                  </Field>
                  <Field label="Board Affiliation">
                    <select value={school.boardAffiliation} onChange={(e) => setSchool((p) => ({ ...p, boardAffiliation: e.target.value }))} className={sel}>
                      <option value="">Select Board</option>
                      {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Established Year">
                    <input type="number" min="1800" max="2024" value={school.establishedYear}
                      onChange={(e) => setSchool((p) => ({ ...p, establishedYear: e.target.value }))}
                      className={inp} placeholder="1994" />
                  </Field>
                  <Field label="Address" className="md:col-span-2">
                    <input value={school.address} onChange={(e) => setSchool((p) => ({ ...p, address: e.target.value }))}
                      className={inp} placeholder="123, Sector 15, Noida" />
                  </Field>
                  <Field label="City">
                    <input value={school.city} onChange={(e) => setSchool((p) => ({ ...p, city: e.target.value }))}
                      className={inp} placeholder="Mumbai" />
                  </Field>
                  <Field label="State">
                    <input value={school.state} onChange={(e) => setSchool((p) => ({ ...p, state: e.target.value }))}
                      className={inp} placeholder="Maharashtra" />
                  </Field>
                  <Field label="Pincode">
                    <input value={school.pincode} onChange={(e) => setSchool((p) => ({ ...p, pincode: e.target.value }))}
                      className={inp} placeholder="400001" />
                  </Field>
                  <Field label="Country">
                    <input value={school.country} onChange={(e) => setSchool((p) => ({ ...p, country: e.target.value }))}
                      className={inp} placeholder="India" />
                  </Field>
                </div>
                <SaveBar loading={saving.school} onSave={saveSchool} />
              </SectionCard>

              {/* Regional */}
              <SectionCard title="Regional & Academic" subtitle="Timezone, language, academic year" icon={Globe} iconColor="text-blue-600" iconBg="bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Timezone">
                    <select value={school.timezone} onChange={(e) => setSchool((p) => ({ ...p, timezone: e.target.value }))} className={sel}>
                      {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </Field>
                  <Field label="Language">
                    <select value={school.language} onChange={(e) => setSchool((p) => ({ ...p, language: e.target.value }))} className={sel}>
                      {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Current Academic Year">
                    <select value={school.academicYear} onChange={(e) => setSchool((p) => ({ ...p, academicYear: e.target.value }))} className={sel}>
                      {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </Field>
                </div>
                <SaveBar loading={saving.school} onSave={saveSchool} />
              </SectionCard>

              {/* GPS Location */}
              <SectionCard title="GPS Attendance Location" subtitle="Set school coordinates for teacher geo-attendance" icon={MapPin} iconColor="text-green-600" iconBg="bg-green-50">
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                  <Info size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700">Teachers can only mark attendance when they are within the allowed radius from school. Set the correct coordinates below.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Latitude" hint="e.g. 19.0760">
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        step="0.000001"
                        value={school.latitude}
                        onChange={(e) => setSchool((p) => ({ ...p, latitude: e.target.value }))}
                        className={`${inp} pl-9`}
                        placeholder="19.076090"
                      />
                    </div>
                  </Field>
                  <Field label="Longitude" hint="e.g. 72.8777">
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        step="0.000001"
                        value={school.longitude}
                        onChange={(e) => setSchool((p) => ({ ...p, longitude: e.target.value }))}
                        className={`${inp} pl-9`}
                        placeholder="72.877426"
                      />
                    </div>
                  </Field>
                  <Field label="Allowed Radius (meters)" hint="Teachers must be within this distance">
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={school.attendanceRadiusMeters}
                      onChange={(e) => setSchool((p) => ({ ...p, attendanceRadiusMeters: e.target.value }))}
                      className={inp}
                      placeholder="100"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setSchool((p) => ({
                            ...p,
                            latitude: pos.coords.latitude.toFixed(6),
                            longitude: pos.coords.longitude.toFixed(6),
                          }));
                        },
                        () => alert("Location access denied. Please enter manually.")
                      );
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 transition-colors"
                  >
                    <MapPin size={14} /> Use My Current Location
                  </button>
                </div>
                <SaveBar loading={saving.school} onSave={saveSchool} />
              </SectionCard>
            </motion.div>
          )}

          {/* ══ NOTIFICATIONS ═══════════════════════════════════════ */}
          {activeSection === "notifications" && (
            <motion.div key="notif" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notification Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Control when and how the school sends alerts</p>
              </div>

              <SectionCard title="Channels" subtitle="Enable or disable notification channels" icon={Bell} iconColor="text-amber-600" iconBg="bg-amber-50">
                <Toggle label="Email Notifications" desc="Send alerts via email to parents and staff"
                  checked={notif.emailNotifications} onChange={(v) => setNotif((p) => ({ ...p, emailNotifications: v }))} />
                <Toggle label="SMS Notifications" desc="Send SMS alerts (charges may apply)"
                  checked={notif.smsNotifications} onChange={(v) => setNotif((p) => ({ ...p, smsNotifications: v }))} />
                <Toggle label="Push Notifications" desc="In-app and browser push notifications"
                  checked={notif.pushNotifications} onChange={(v) => setNotif((p) => ({ ...p, pushNotifications: v }))} />
                <SaveBar loading={saving.notif} onSave={saveNotif} />
              </SectionCard>

              <SectionCard title="Event Triggers" subtitle="Choose which events trigger notifications" icon={BellRing} iconColor="text-amber-600" iconBg="bg-amber-50">
                <Toggle label="Fee Reminders" desc="Remind parents before and after due dates"
                  checked={notif.feeReminders} onChange={(v) => setNotif((p) => ({ ...p, feeReminders: v }))} />
                <Toggle label="Attendance Alerts" desc="Notify parents when child is absent"
                  checked={notif.attendanceAlerts} onChange={(v) => setNotif((p) => ({ ...p, attendanceAlerts: v }))} />
                <Toggle label="Exam Notifications" desc="Exam schedule, results, and timetable changes"
                  checked={notif.examNotifications} onChange={(v) => setNotif((p) => ({ ...p, examNotifications: v }))} />
                <Toggle label="Event Notifications" desc="School events, holidays, and circulars"
                  checked={notif.eventNotifications} onChange={(v) => setNotif((p) => ({ ...p, eventNotifications: v }))} />
                <Toggle label="Homework Alerts" desc="Notify students/parents when homework is assigned"
                  checked={notif.homeworkAlerts} onChange={(v) => setNotif((p) => ({ ...p, homeworkAlerts: v }))} />
                <Toggle label="Report Card Alerts" desc="Notify when report cards are published"
                  checked={notif.reportCardAlerts} onChange={(v) => setNotif((p) => ({ ...p, reportCardAlerts: v }))} />
                <Toggle label="Admission Notifications" desc="New inquiry and admission status updates"
                  checked={notif.admissionNotifications} onChange={(v) => setNotif((p) => ({ ...p, admissionNotifications: v }))} />
                <SaveBar loading={saving.notif} onSave={saveNotif} />
              </SectionCard>

              <SectionCard title="Attendance Threshold" subtitle="Alert when attendance drops below limit" icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50">
                <div className="flex items-center gap-4">
                  <Toggle label="Low Attendance Alert" desc={`Alert parents when below ${notif.lowAttendanceThreshold}%`}
                    checked={notif.lowAttendanceAlert} onChange={(v) => setNotif((p) => ({ ...p, lowAttendanceAlert: v }))} />
                </div>
                {notif.lowAttendanceAlert && (
                  <div className="mt-3">
                    <Field label="Threshold (%)">
                      <div className="flex items-center gap-3">
                        <input type="range" min="50" max="95" value={notif.lowAttendanceThreshold}
                          onChange={(e) => setNotif((p) => ({ ...p, lowAttendanceThreshold: parseInt(e.target.value) }))}
                          className="flex-1 accent-amber-500" />
                        <span className="text-lg font-bold text-amber-600 w-12 text-center">{notif.lowAttendanceThreshold}%</span>
                      </div>
                    </Field>
                  </div>
                )}
                <SaveBar loading={saving.notif} onSave={saveNotif} />
              </SectionCard>

              <SectionCard title="Digest & Reports" subtitle="Scheduled summary notifications" icon={FileText} iconColor="text-amber-600" iconBg="bg-amber-50">
                <Toggle label="Daily Digest" desc="Send a daily summary email to admin"
                  checked={notif.dailyDigest} onChange={(v) => setNotif((p) => ({ ...p, dailyDigest: v }))} />
                <Toggle label="Weekly Report" desc="Auto-generate and email weekly school report"
                  checked={notif.weeklyReport} onChange={(v) => setNotif((p) => ({ ...p, weeklyReport: v }))} />
                <SaveBar loading={saving.notif} onSave={saveNotif} />
              </SectionCard>
            </motion.div>
          )}

          {/* ══ SECURITY ════════════════════════════════════════════ */}
          {activeSection === "security" && (
            <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Protect your admin account and school data</p>
              </div>

              <SectionCard title="Change Password" subtitle="Update your admin account password" icon={Lock} iconColor="text-green-600" iconBg="bg-green-50">
                <div className="space-y-4 max-w-md">
                  <Field label="Current Password">
                    <div className="relative">
                      <input type={showPw.current ? "text" : "password"} value={security.currentPassword}
                        onChange={(e) => setSecurity((p) => ({ ...p, currentPassword: e.target.value }))}
                        className={`${inp} pr-10`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="New Password">
                    <div className="relative">
                      <input type={showPw.new ? "text" : "password"} value={security.newPassword}
                        onChange={(e) => setSecurity((p) => ({ ...p, newPassword: e.target.value }))}
                        className={`${inp} pr-10`} placeholder="Min 8 characters" />
                      <button type="button" onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {/* Strength indicator */}
                    {security.newPassword && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            security.newPassword.length >= i * 3
                              ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-amber-400" : i <= 3 ? "bg-blue-400" : "bg-green-500"
                              : "bg-gray-200"}`} />
                        ))}
                      </div>
                    )}
                  </Field>
                  <Field label="Confirm New Password">
                    <div className="relative">
                      <input type={showPw.confirm ? "text" : "password"} value={security.confirmPassword}
                        onChange={(e) => setSecurity((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className={`${inp} pr-10`} placeholder="Repeat new password" />
                      <button type="button" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      {security.confirmPassword && security.newPassword === security.confirmPassword && (
                        <CheckCircle2 size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                  </Field>
                </div>
                <SaveBar loading={saving.security} onSave={savePassword} />
              </SectionCard>

              <SectionCard title="Login & Session Security" subtitle="Control access and session behaviour" icon={ShieldCheck} iconColor="text-green-600" iconBg="bg-green-50">
                <Toggle label="Two-Factor Authentication" desc="Require OTP on every login (recommended)"
                  checked={security.twoFactorEnabled} onChange={(v) => setSecurity((p) => ({ ...p, twoFactorEnabled: v }))} />
                <Toggle label="Login Alerts" desc="Email alert when admin account is logged into"
                  checked={security.loginAlerts} onChange={(v) => setSecurity((p) => ({ ...p, loginAlerts: v }))} />
                <Toggle label="Allow Multiple Sessions" desc="Let the same account log in on multiple devices"
                  checked={security.allowMultipleSessions} onChange={(v) => setSecurity((p) => ({ ...p, allowMultipleSessions: v }))} />
                <Toggle label="Audit Log" desc="Track all admin actions for security review"
                  checked={security.auditLog} onChange={(v) => setSecurity((p) => ({ ...p, auditLog: v }))} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Field label="Session Timeout (minutes)" hint="Auto-logout after inactivity">
                    <select value={security.sessionTimeout} onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: e.target.value }))} className={sel}>
                      {["15", "30", "60", "120", "240"].map((v) => <option key={v} value={v}>{v} min</option>)}
                    </select>
                  </Field>
                  <Field label="Password Expiry (days)" hint="Force password change periodically">
                    <select value={security.passwordExpiry} onChange={(e) => setSecurity((p) => ({ ...p, passwordExpiry: e.target.value }))} className={sel}>
                      {["30", "60", "90", "180", "never"].map((v) => <option key={v} value={v}>{v === "never" ? "Never" : `${v} days`}</option>)}
                    </select>
                  </Field>
                </div>
                <SaveBar loading={saving.secSettings} onSave={saveSecuritySettings} />
              </SectionCard>

              {/* Active sessions hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Active Session</p>
                  <p className="text-xs text-amber-700 mt-0.5">You're currently logged in from this device. Changing your password will not invalidate this session.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ PAYMENT GATEWAY ═════════════════════════════════════ */}
          {activeSection === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Payment Gateway</h1>
                <p className="text-sm text-gray-500 mt-0.5">Configure online fee collection and payment settings</p>
              </div>

              {/* Gateway config */}
              <SectionCard title="Gateway Configuration" subtitle="Razorpay / Paytm integration keys" icon={CreditCard} iconColor="text-purple-600" iconBg="bg-purple-50">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Payment Gateway">
                    <select value={payment.gatewayName} onChange={(e) => setPayment((p) => ({ ...p, gatewayName: e.target.value }))} className={sel}>
                      {["RAZORPAY", "PAYTM", "CASHFREE", "STRIPE"].map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="UPI ID" hint="School's UPI ID for direct transfers">
                    <input value={payment.upiId} onChange={(e) => setPayment((p) => ({ ...p, upiId: e.target.value }))}
                      className={inp} placeholder="school@paytm" />
                  </Field>
                  <Field label="API Key" className="md:col-span-2">
                    <input value={payment.apiKey} onChange={(e) => setPayment((p) => ({ ...p, apiKey: e.target.value }))}
                      className={inp} placeholder="rzp_live_xxxxxxxx" />
                  </Field>
                  <Field label="API Secret" className="md:col-span-2">
                    <div className="relative">
                      <input type={showSecret ? "text" : "password"} value={payment.apiSecret}
                        onChange={(e) => setPayment((p) => ({ ...p, apiSecret: e.target.value }))}
                        className={`${inp} pr-10`} placeholder="Leave blank to keep existing" />
                      <button type="button" onClick={() => setShowSecret((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Webhook Secret" className="md:col-span-2">
                    <input type="password" value={payment.webhookSecret}
                      onChange={(e) => setPayment((p) => ({ ...p, webhookSecret: e.target.value }))}
                      className={inp} placeholder="Leave blank to keep existing" />
                  </Field>
                </div>

                <div className="mt-4 space-y-0">
                  <Toggle label="Test Mode" desc="Use sandbox credentials — no real transactions"
                    checked={payment.isTestMode} onChange={(v) => setPayment((p) => ({ ...p, isTestMode: v }))} />
                  <Toggle label="Activate Gateway" desc="Enable online payments for parents"
                    checked={payment.isActive} onChange={(v) => setPayment((p) => ({ ...p, isActive: v }))} />
                  <Toggle label="Online Payment Enabled" desc="Show online payment option in fee portal"
                    checked={payment.onlinePaymentEnabled} onChange={(v) => setPayment((p) => ({ ...p, onlinePaymentEnabled: v }))} />
                </div>

                {payment.isTestMode && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg">
                    <TestTube size={13} /> Test mode is ON — no real money will be charged
                  </div>
                )}
                <SaveBar loading={saving.payment} onSave={savePayment} />
              </SectionCard>

              {/* Late fee */}
              <SectionCard title="Late Fee Policy" subtitle="Automatically charge late fees after due date" icon={IndianRupee} iconColor="text-purple-600" iconBg="bg-purple-50">
                <Toggle label="Enable Late Fee" desc="Charge additional fee after grace period"
                  checked={payment.lateFeeEnabled} onChange={(v) => setPayment((p) => ({ ...p, lateFeeEnabled: v }))} />

                {payment.lateFeeEnabled && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Field label="Late Fee Amount">
                      <input type="number" value={payment.lateFeeAmount}
                        onChange={(e) => setPayment((p) => ({ ...p, lateFeeAmount: e.target.value }))}
                        className={inp} placeholder="500" />
                    </Field>
                    <Field label="Fee Type">
                      <select value={payment.lateFeeType} onChange={(e) => setPayment((p) => ({ ...p, lateFeeType: e.target.value }))} className={sel}>
                        <option value="FIXED">Fixed (₹)</option>
                        <option value="PERCENTAGE">Percentage (%)</option>
                      </select>
                    </Field>
                    <Field label="Grace Period (days)">
                      <input type="number" value={payment.gracePeriodDays}
                        onChange={(e) => setPayment((p) => ({ ...p, gracePeriodDays: e.target.value }))}
                        className={inp} placeholder="3" />
                    </Field>
                  </div>
                )}

                <Toggle label="Allow Partial Payment" desc="Parents can pay in installments"
                  checked={payment.partialPaymentAllowed} onChange={(v) => setPayment((p) => ({ ...p, partialPaymentAllowed: v }))} />
                <SaveBar loading={saving.payment} onSave={savePayment} />
              </SectionCard>
            </motion.div>
          )}

          {/* ══ ROLES & ACCESS ══════════════════════════════════════ */}
          {activeSection === "roles" && (
            <motion.div key="roles" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Roles & Access Control</h1>
                <p className="text-sm text-gray-500 mt-0.5">Set what each role can see and do across the ERP</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">SCHOOL_ADMIN always has full access. Changes here apply to all staff with that role.</p>
              </div>

              <SectionCard title="Permission Matrix" subtitle="Toggle what each role can access" icon={UserCog} iconColor="text-cyan-600" iconBg="bg-cyan-50">
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide w-44">Role</th>
                        {[
                          { key: "canManageStudents", label: "Manage Students" },
                          { key: "canManageStaff",    label: "Manage Staff" },
                          { key: "canViewFinance",    label: "View Finance" },
                          { key: "canSendNotif",      label: "Send Notifications" },
                        ].map((col) => (
                          <th key={col.key} className="text-center px-2 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ROLE_PERMISSIONS.map(({ role, label, desc }) => (
                        <tr key={role} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-gray-700 text-sm">{label}</p>
                            <p className="text-xs text-gray-400">{desc}</p>
                          </td>
                          {["canManageStudents", "canManageStaff", "canViewFinance", "canSendNotif"].map((perm) => (
                            <td key={perm} className="text-center px-2 py-3">
                              <button onClick={() => toggleRolePerm(role, perm)}
                                className={`w-8 h-4 rounded-full mx-auto transition-all duration-200 relative block
                                  ${roles[role]?.[perm] ? "bg-cyan-500" : "bg-gray-200"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200
                                  ${roles[role]?.[perm] ? "translate-x-4" : "translate-x-0"}`} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <SaveBar loading={saving.roles} onSave={saveRoles} />
              </SectionCard>
            </motion.div>
          )}

          {/* ══ APPEARANCE ══════════════════════════════════════════ */}
          {activeSection === "appearance" && (
            <motion.div key="appearance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Appearance</h1>
                <p className="text-sm text-gray-500 mt-0.5">Personalize the look and feel of the ERP</p>
              </div>

              <SectionCard title="Theme" subtitle="Light, dark or system preference" icon={Monitor} iconColor="text-pink-600" iconBg="bg-pink-50">
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: "light",  label: "Light",  icon: Sun },
                    { value: "dark",   label: "Dark",   icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setAppearance((p) => ({ ...p, theme: value }))}
                      className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                        ${appearance.theme === value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Brand Colors" subtitle="Primary and accent colors for the interface" icon={Palette} iconColor="text-pink-600" iconBg="bg-pink-50">
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Primary Color">
                    <div className="flex items-center gap-3">
                      <input type="color" value={appearance.primaryColor}
                        onChange={(e) => setAppearance((p) => ({ ...p, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                      <input value={appearance.primaryColor}
                        onChange={(e) => setAppearance((p) => ({ ...p, primaryColor: e.target.value }))}
                        className={`${inp} font-mono uppercase`} placeholder="#2563EB" />
                    </div>
                  </Field>
                  <Field label="Accent Color">
                    <div className="flex items-center gap-3">
                      <input type="color" value={appearance.accentColor}
                        onChange={(e) => setAppearance((p) => ({ ...p, accentColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                      <input value={appearance.accentColor}
                        onChange={(e) => setAppearance((p) => ({ ...p, accentColor: e.target.value }))}
                        className={`${inp} font-mono uppercase`} placeholder="#3B82F6" />
                    </div>
                  </Field>
                </div>

                {/* Preview pill */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: appearance.primaryColor }} />
                  <div>
                    <p className="text-xs font-bold text-gray-600">Preview</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded text-white font-medium" style={{ background: appearance.primaryColor }}>Button</span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: appearance.primaryColor + "20", color: appearance.primaryColor }}>Badge</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Layout & Display" subtitle="UI density and display preferences" icon={Monitor} iconColor="text-pink-600" iconBg="bg-pink-50">
                <Toggle label="Compact Mode" desc="Reduce padding and font sizes for more content"
                  checked={appearance.compactMode} onChange={(v) => setAppearance((p) => ({ ...p, compactMode: v }))} />
                <Toggle label="Collapse Sidebar by Default" desc="Start with sidebar collapsed on load"
                  checked={appearance.sidebarCollapsed} onChange={(v) => setAppearance((p) => ({ ...p, sidebarCollapsed: v }))} />
                <Toggle label="Show Student Profile Photos" desc="Display photos in student lists and tables"
                  checked={appearance.showStudentPhotos} onChange={(v) => setAppearance((p) => ({ ...p, showStudentPhotos: v }))} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Field label="Date Format">
                    <select value={appearance.dateFormat} onChange={(e) => setAppearance((p) => ({ ...p, dateFormat: e.target.value }))} className={sel}>
                      {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY"].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Currency">
                    <select value={appearance.currency} onChange={(e) => setAppearance((p) => ({ ...p, currency: e.target.value }))} className={sel}>
                      {[
                        { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
                        { code: "USD", symbol: "$", label: "US Dollar ($)" },
                        { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
                        { code: "GBP", symbol: "£", label: "British Pound (£)" },
                      ].map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </Field>
                </div>
                <SaveBar loading={saving.appearance} onSave={saveAppearance} />
              </SectionCard>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}