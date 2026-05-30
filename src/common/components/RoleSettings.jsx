// src/common/pages/RoleSettings.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Universal Settings page — works for EVERY role that uses RoleSidebar.
// Covers: SCHOOL_OWNER, COUNSELOR, STUDENT, PARENT, ACCOUNTANT, CASHIER,
//         TRANSPORT_MANAGER, BUS_DRIVER, BUS_CONDUCTOR, LIBRARIAN,
//         RECEPTIONIST, NURSE, SECURITY, HOUSEKEEPING, CANTEEN_STAFF, IT_ADMIN
// (SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, TEACHER have their own dedicated pages)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import RoleSidebar from "../components/RoleSidebar";
import API from "../services/api";
import { getUserData } from "../utils/tokenStorage";
import {
  User, Lock, Bell, Shield, Monitor, ChevronRight,
  Eye, EyeOff, Check, AlertCircle, Loader2, Smartphone,
  Mail, Globe, Moon, Sun, LogOut, Clock, Download, Trash2,
  Camera, X,
} from "lucide-react";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300
            ${t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
        >
          {t.type === "success" ? <Check size={15} /> : t.type === "error" ? <AlertCircle size={15} /> : <Loader2 size={15} className="animate-spin" />}
          {t.msg}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={13} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: "8+ characters",  ok: password.length >= 8 },
    { label: "Uppercase",      ok: /[A-Z]/.test(password) },
    { label: "Lowercase",      ok: /[a-z]/.test(password) },
    { label: "Number",         ok: /\d/.test(password) },
    { label: "Special char",   ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const label = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score];
  const color = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][score];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-emerald-600" : "text-gray-400"}`}>
            <Check size={10} className={c.ok ? "opacity-100" : "opacity-0"} />{c.label}
          </span>
        ))}
        <span className={`text-xs font-semibold ml-auto ${color.replace("bg-", "text-")}`}>{label}</span>
      </div>
    </div>
  );
}

// ─── Reusable primitives ──────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children, accent = "blue" }) {
  const accents = {
    blue:    "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    violet:  "from-violet-500 to-violet-600",
    amber:   "from-amber-500 to-amber-600",
    red:     "from-red-500 to-red-600",
    slate:   "from-slate-500 to-slate-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={17} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={15} /></div>}
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-xl py-2.5 pr-4 text-sm text-gray-800 bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150
          ${Icon ? "pl-9" : "pl-4"} ${props.className || ""}`}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

// ─── Nav tabs ─────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "security",      label: "Security",      icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences",   label: "Preferences",   icon: Monitor },
  { id: "privacy",       label: "Privacy",       icon: Shield },
  { id: "account",       label: "Account",       icon: LogOut },
];

// ─── Role label helper ────────────────────────────────────────────────────────
const ROLE_LABELS = {
  SCHOOL_OWNER:      "School Owner",
  COUNSELOR:         "Counselor",
  STUDENT:           "Student",
  PARENT:            "Parent",
  ACCOUNTANT:        "Accountant",
  CASHIER:           "Cashier",
  TRANSPORT_MANAGER: "Transport Manager",
  BUS_DRIVER:        "Bus Driver",
  BUS_CONDUCTOR:     "Bus Conductor",
  LIBRARIAN:         "Librarian",
  RECEPTIONIST:      "Receptionist",
  NURSE:             "Nurse",
  SECURITY:          "Security",
  HOUSEKEEPING:      "Housekeeping",
  CANTEEN_STAFF:     "Canteen Staff",
  IT_ADMIN:          "IT Admin",
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RoleSettings() {
  const [tab, setTab]       = useState("profile");
  const [toasts, setToasts] = useState([]);
  const toastId             = useRef(0);

  const userData    = getUserData();
  const primaryRole = userData?.roles?.[0] || "";
  const roleLabel   = ROLE_LABELS[primaryRole] || primaryRole.replace(/_/g, " ");

  const addToast = (msg, type = "success") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <RoleSidebar />
      <Toast toasts={toasts} remove={removeToast} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>{roleLabel} Panel</span>
            <ChevronRight size={12} />
            <span className="text-blue-600 font-medium">Settings</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your profile, security, and preferences</p>
        </div>

        <div className="flex flex-1 gap-0">
          {/* Sidebar nav */}
          <aside className="w-56 bg-white border-r border-gray-100 py-4 flex-shrink-0">
            {NAV_TABS.map((t) => {
              const Icon   = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150
                    ${active ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  <Icon size={16} className={active ? "text-blue-600" : "text-gray-400"} />
                  {t.label}
                </button>
              );
            })}
          </aside>

          {/* Tab content */}
          <main className="flex-1 p-8 max-w-3xl">
            {tab === "profile"       && <ProfileTab       addToast={addToast} roleLabel={roleLabel} />}
            {tab === "security"      && <SecurityTab      addToast={addToast} />}
            {tab === "notifications" && <NotificationsTab addToast={addToast} />}
            {tab === "preferences"   && <PreferencesTab   addToast={addToast} />}
            {tab === "privacy"       && <PrivacyTab       addToast={addToast} />}
            {tab === "account"       && <AccountTab       addToast={addToast} />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: PROFILE
// GET /user/profile  →  UserProfileResponse
// PUT /user/profile  →  UserProfileRequest
// ═════════════════════════════════════════════
function ProfileTab({ addToast, roleLabel }) {
  const userData = getUserData();

  const [form, setForm] = useState({
    fullName:         userData?.fullName || "",
    email:            userData?.email    || "",
    phoneNumber:      "",
    designation:      "",
    bio:              "",
    dateOfBirth:      "",
    emergencyContact: "",
    addressLine1:     "",
    addressLine2:     "",
    city:             "",
    state:            "",
    country:          "",
    pincode:          "",
  });
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/user/profile")
      .then((r) => {
        const d = r.data;
        setForm((p) => ({
          ...p,
          fullName:         d.fullName         || p.fullName,
          email:            d.email            || p.email,
          phoneNumber:      d.phoneNumber      || "",
          designation:      d.designation      || "",
          bio:              d.bio              || "",
          dateOfBirth:      d.dateOfBirth      || "",
          emergencyContact: d.emergencyContact || "",
          addressLine1:     d.addressLine1     || "",
          addressLine2:     d.addressLine2     || "",
          city:             d.city             || "",
          state:            d.state            || "",
          country:          d.country          || "",
          pincode:          d.pincode          || "",
        }));
      })
      .catch(() => addToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (!form.fullName.trim()) { addToast("Full name is required", "error"); return; }
    setSaving(true);
    try {
      await API.put("/user/profile", {
        fullName:         form.fullName,
        phoneNumber:      form.phoneNumber,
        designation:      form.designation,
        bio:              form.bio,
        dateOfBirth:      form.dateOfBirth || null,
        emergencyContact: form.emergencyContact,
        addressLine1:     form.addressLine1,
        addressLine2:     form.addressLine2,
        city:             form.city,
        state:            form.state,
        country:          form.country,
        pincode:          form.pincode,
      });
      addToast("Profile updated successfully");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="space-y-6">
      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow"
            style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition-colors">
            <Camera size={11} className="text-white" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{form.fullName || "User"}</p>
          <p className="text-xs text-gray-400">{form.email}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Role</p>
          <p className="text-sm font-semibold text-gray-700">{roleLabel}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
      ) : (
        <Section icon={User} title="Personal Information" subtitle="Your basic profile details" accent="blue">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <Input name="fullName" value={form.fullName} onChange={handle} placeholder="Enter full name" />
            </Field>
            <Field label="Email Address" hint="Email cannot be changed">
              <Input icon={Mail} name="email" value={form.email} disabled />
            </Field>
            <Field label="Phone Number">
              <Input icon={Smartphone} name="phoneNumber" value={form.phoneNumber} onChange={handle} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Designation">
              <Input name="designation" value={form.designation} onChange={handle} placeholder="Your job title" />
            </Field>
            <Field label="Date of Birth">
              <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handle} />
            </Field>
            <Field label="Emergency Contact">
              <Input icon={Smartphone} name="emergencyContact" value={form.emergencyContact} onChange={handle} placeholder="Emergency number" />
            </Field>

            <div className="col-span-2">
              <Field label="Address Line 1">
                <Input name="addressLine1" value={form.addressLine1} onChange={handle} placeholder="House / Flat No., Street" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Address Line 2" hint="Optional">
                <Input name="addressLine2" value={form.addressLine2} onChange={handle} placeholder="Area / Landmark" />
              </Field>
            </div>
            <Field label="City">
              <Input name="city" value={form.city} onChange={handle} placeholder="City" />
            </Field>
            <Field label="State">
              <Input name="state" value={form.state} onChange={handle} placeholder="State" />
            </Field>
            <Field label="Country">
              <Input name="country" value={form.country} onChange={handle} placeholder="Country" />
            </Field>
            <Field label="Pincode">
              <Input name="pincode" value={form.pincode} onChange={handle} placeholder="400001" />
            </Field>

            <div className="col-span-2">
              <Field label="Bio / About" hint="Brief description visible on your profile">
                <textarea
                  name="bio" value={form.bio} onChange={handle} rows={3}
                  placeholder="A short bio about you..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white resize-none transition-all duration-150"
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Save Changes
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: SECURITY
// PUT  /user/change-password
// GET  /user/sessions  (X-Refresh-Token header)
// DELETE /user/sessions/{id}
// DELETE /user/sessions/all-others
// ═════════════════════════════════════════════
function SecurityTab({ addToast }) {
  const [pw,   setPw]   = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [saving,         setSaving]         = useState(false);
  const [sessions,       setSessions]       = useState([]);
  const [sessionsLoading,setSessionsLoading]= useState(true);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    API.get("/user/sessions", { headers: { "X-Refresh-Token": refreshToken } })
      .then((r) => setSessions(r.data))
      .catch(() => addToast("Could not load sessions", "error"))
      .finally(() => setSessionsLoading(false));
  }, []);

  const handlePw = (e) => setPw({ ...pw, [e.target.name]: e.target.value });

  const changePassword = async () => {
    if (!pw.current || !pw.newPw || !pw.confirm) { addToast("Please fill all fields", "error"); return; }
    if (pw.newPw !== pw.confirm)   { addToast("New passwords do not match", "error"); return; }
    if (pw.newPw.length < 8)       { addToast("Password must be at least 8 characters", "error"); return; }
    setSaving(true);
    try {
      await API.put("/user/change-password", {
        currentPassword: pw.current,
        newPassword:     pw.newPw,
        confirmPassword: pw.confirm,
      });
      addToast("Password changed successfully");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await API.delete(`/user/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      addToast("Session revoked");
    } catch { addToast("Failed to revoke session", "error"); }
  };

  const revokeAllOthers = async () => {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    try {
      await API.delete("/user/sessions/all-others", { headers: { "X-Refresh-Token": refreshToken } });
      setSessions((prev) => prev.filter((s) => s.current));
      addToast("All other sessions revoked");
    } catch { addToast("Failed to sign out other sessions", "error"); }
  };

  const PasswordInput = ({ name, placeholder }) => (
    <div className="relative">
      <input name={name} type={show[name] ? "text" : "password"} value={pw[name]} onChange={handlePw}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
      />
      <button type="button" onClick={() => setShow((p) => ({ ...p, [name]: !p[name] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show[name] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Section icon={Lock} title="Change Password" subtitle="Use a strong, unique password" accent="violet">
        <div className="space-y-4">
          <Field label="Current Password"><PasswordInput name="current" placeholder="Enter current password" /></Field>
          <Field label="New Password">
            <PasswordInput name="newPw" placeholder="Enter new password" />
            <PasswordStrength password={pw.newPw} />
          </Field>
          <Field label="Confirm New Password">
            <PasswordInput name="confirm" placeholder="Re-enter new password" />
            {pw.confirm && pw.newPw !== pw.confirm && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> Passwords do not match</p>
            )}
            {pw.confirm && pw.newPw === pw.confirm && pw.confirm.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Check size={11} /> Passwords match</p>
            )}
          </Field>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1"><Shield size={12} /> Password Tips</p>
          <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
            <li>Never share your password with anyone</li>
            <li>Use a mix of letters, numbers, and symbols</li>
            <li>Don't reuse passwords from other accounts</li>
          </ul>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={changePassword} disabled={saving}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            Update Password
          </button>
        </div>
      </Section>

      <Section icon={Monitor} title="Active Sessions" subtitle="Devices currently signed in to your account" accent="slate">
        {sessionsLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-400" size={20} /></div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No active sessions found.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.sessionId} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.current ? "bg-emerald-100" : "bg-gray-100"}`}>
                    <Monitor size={15} className={s.current ? "text-emerald-600" : "text-gray-500"} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.deviceInfo || "Unknown Device"}
                      {s.current && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Current</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.ipAddress || "Unknown IP"}
                      {s.createdAt ? ` · ${new Date(s.createdAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <button onClick={() => revokeSession(s.sessionId)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={revokeAllOthers}
          className="mt-4 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline">
          <LogOut size={12} /> Sign out all other sessions
        </button>
      </Section>

      <Section icon={Smartphone} title="Two-Factor Authentication" subtitle="Add an extra layer of security" accent="amber">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Authenticator App</p>
            <p className="text-xs text-gray-400 mt-0.5">Use Google Authenticator or Authy</p>
          </div>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Not Enabled</span>
        </div>
        <button onClick={() => addToast("2FA setup coming soon", "info")}
          className="mt-4 text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
          <Shield size={13} /> Enable Two-Factor Authentication
        </button>
      </Section>
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: NOTIFICATIONS
// GET /user/notification-preferences
// PUT /user/notification-preferences
// ═════════════════════════════════════════════
function NotificationsTab({ addToast }) {
  const defaultPrefs = {
    emailGeneral: true,  emailLeave: true,  emailPayroll: true, emailNewsletter: false,
    pushGeneral:  true,  pushLeave:  true,  pushPayroll:  false,
    inAppAll:     true,  inAppAlerts: true,
  };
  const [prefs,   setPrefs]   = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    API.get("/user/notification-preferences")
      .then((r) => setPrefs({ ...defaultPrefs, ...r.data }))
      .catch(() => addToast("Could not load notification preferences", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await API.put("/user/notification-preferences", prefs);
      addToast("Notification preferences saved");
    } catch { addToast("Failed to save preferences", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={24} /></div>;

  return (
    <div className="space-y-6">
      <Section icon={Mail} title="Email Notifications" subtitle="Receive alerts in your inbox" accent="blue">
        <Toggle checked={prefs.emailGeneral}    onChange={() => toggle("emailGeneral")}    label="General Alerts"        sub="Important announcements and updates" />
        <Toggle checked={prefs.emailLeave}      onChange={() => toggle("emailLeave")}      label="Leave Request Updates"  sub="Status changes on your leave applications" />
        <Toggle checked={prefs.emailPayroll}    onChange={() => toggle("emailPayroll")}    label="Salary / Payroll"       sub="Notified when salary is credited" />
        <Toggle checked={prefs.emailNewsletter} onChange={() => toggle("emailNewsletter")} label="School Newsletter"      sub="Monthly newsletter and announcements" />
      </Section>
      <Section icon={Bell} title="Push Notifications" subtitle="Browser and mobile push alerts" accent="violet">
        <Toggle checked={prefs.pushGeneral} onChange={() => toggle("pushGeneral")} label="General Alerts"   sub="Real-time important alerts" />
        <Toggle checked={prefs.pushLeave}   onChange={() => toggle("pushLeave")}   label="Leave Updates"    sub="Instant notification on leave status" />
        <Toggle checked={prefs.pushPayroll} onChange={() => toggle("pushPayroll")} label="Payroll Alerts"   sub="Push alert on salary credit" />
      </Section>
      <Section icon={Bell} title="In-App Notifications" subtitle="Alerts inside the dashboard" accent="emerald">
        <Toggle checked={prefs.inAppAll}    onChange={() => toggle("inAppAll")}    label="All Notifications" sub="Master switch for in-app alerts" />
        <Toggle checked={prefs.inAppAlerts} onChange={() => toggle("inAppAlerts")} label="Action Alerts"     sub="Alerts requiring your attention" />
      </Section>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: PREFERENCES
// GET /user/preferences  →  UserPreferencesResponse
// PUT /user/preferences  →  UserPreferencesRequest
// ═════════════════════════════════════════════
function PreferencesTab({ addToast }) {
  const defaultPrefs = {
    theme: "light", language: "en", timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY", timeFormat: "12h",
    compactMode: false, defaultPageSize: 20,
  };
  const [prefs,   setPrefs]   = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/user/preferences")
      .then((r) => setPrefs({ ...defaultPrefs, ...r.data }))
      .catch(() => addToast("Could not load preferences", "error"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  const save = async () => {
    try {
      await API.put("/user/preferences", { ...prefs, defaultPageSize: parseInt(prefs.defaultPageSize, 10) });
      addToast("Preferences saved");
    } catch { addToast("Failed to save preferences", "error"); }
  };

  const SelectField = ({ value, onChange, options }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={24} /></div>;

  return (
    <div className="space-y-6">
      <Section icon={Sun} title="Appearance" subtitle="Customize the look and feel" accent="amber">
        <div className="space-y-4">
          <Field label="Theme">
            <div className="flex gap-3">
              {[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "auto", label: "System", icon: Monitor }]
                .map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => set("theme", value)}
                    className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all
                      ${prefs.theme === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>
                    <Icon size={18} />{label}
                  </button>
                ))}
            </div>
          </Field>
          <Toggle checked={prefs.compactMode} onChange={(v) => set("compactMode", v)} label="Compact Mode" sub="Reduces spacing for more information density" />
        </div>
      </Section>

      <Section icon={Globe} title="Language & Region" subtitle="Set your locale preferences" accent="blue">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Language">
            <SelectField value={prefs.language} onChange={(v) => set("language", v)}
              options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "mr", label: "Marathi" }, { value: "gu", label: "Gujarati" }, { value: "ta", label: "Tamil" }]} />
          </Field>
          <Field label="Timezone">
            <SelectField value={prefs.timezone} onChange={(v) => set("timezone", v)}
              options={[{ value: "Asia/Kolkata", label: "IST — Kolkata" }, { value: "Asia/Mumbai", label: "IST — Mumbai" }, { value: "UTC", label: "UTC" }]} />
          </Field>
          <Field label="Date Format">
            <SelectField value={prefs.dateFormat} onChange={(v) => set("dateFormat", v)}
              options={[{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" }, { value: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }]} />
          </Field>
          <Field label="Time Format">
            <SelectField value={prefs.timeFormat} onChange={(v) => set("timeFormat", v)}
              options={[{ value: "12h", label: "12-hour (AM/PM)" }, { value: "24h", label: "24-hour" }]} />
          </Field>
        </div>
      </Section>

      <Section icon={Clock} title="Dashboard Defaults" subtitle="Default views and pagination" accent="slate">
        <Field label="Records Per Page" hint="How many records to show per page">
          <SelectField value={String(prefs.defaultPageSize)} onChange={(v) => set("defaultPageSize", parseInt(v, 10))}
            options={[{ value: "10", label: "10 per page" }, { value: "20", label: "20 per page" }, { value: "50", label: "50 per page" }, { value: "100", label: "100 per page" }]} />
        </Field>
      </Section>

      <div className="flex justify-end">
        <button onClick={save}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Check size={15} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: PRIVACY
// GET /user/privacy-settings
// PUT /user/privacy-settings
// ═════════════════════════════════════════════
function PrivacyTab({ addToast }) {
  const defaultPrefs = {
    showPhoneToOthers:  false,
    showEmailToOthers:  false,
    showOnlineStatus:   true,
    activityLog:        true,
    allowMessages:      true,
  };
  const [prefs,   setPrefs]   = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/user/privacy-settings")
      .then((r) => setPrefs({ ...defaultPrefs, ...r.data }))
      .catch(() => addToast("Could not load privacy settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    try {
      await API.put("/user/privacy-settings", prefs);
      addToast("Privacy settings saved");
    } catch { addToast("Failed to save settings", "error"); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={24} /></div>;

  return (
    <div className="space-y-6">
      <Section icon={Shield} title="Contact Visibility" subtitle="Who can see your contact information" accent="violet">
        <Toggle checked={prefs.showPhoneToOthers} onChange={() => toggle("showPhoneToOthers")} label="Show Phone Number" sub="Others can see your phone number in the portal" />
        <Toggle checked={prefs.showEmailToOthers} onChange={() => toggle("showEmailToOthers")} label="Show Email Address" sub="Others can see your email address in the portal" />
      </Section>
      <Section icon={Bell} title="Communication & Activity" subtitle="Control your visibility and logging" accent="blue">
        <Toggle checked={prefs.showOnlineStatus} onChange={() => toggle("showOnlineStatus")} label="Show Online Status" sub="Others can see when you're active" />
        <Toggle checked={prefs.activityLog}      onChange={() => toggle("activityLog")}      label="Activity Logging"   sub="Log your activity for audit purposes" />
        <Toggle checked={prefs.allowMessages}    onChange={() => toggle("allowMessages")}    label="Allow Messages"     sub="Allow others to send you messages via the portal" />
      </Section>
      <Section icon={Download} title="Data & Activity" subtitle="Your data and how it is used" accent="slate">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Download My Data</p>
            <p className="text-xs text-gray-400">Export your profile and activity data</p>
          </div>
          <button
            onClick={async () => {
              try {
                await API.post("/user/data-export");
                addToast("Data export request submitted. You'll receive an email.", "info");
              } catch { addToast("Failed to submit export request", "error"); }
            }}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
      </Section>
      <div className="flex justify-end">
        <button onClick={save}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Check size={15} /> Save Settings
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// TAB: ACCOUNT
// POST /auth/logout-all  (existing)
// GET  /user/profile     (reused for account info)
// ═════════════════════════════════════════════
function AccountTab({ addToast }) {
  const userData = getUserData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText,    setDeleteText]    = useState("");

  const handleLogoutAll = async () => {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    try {
      await API.delete("/user/sessions/all-others", { headers: { "X-Refresh-Token": refreshToken } });
      addToast("Signed out from all other devices");
    } catch { addToast("Failed to sign out all devices", "error"); }
  };

  return (
    <div className="space-y-6">
      <Section icon={User} title="Account Information" subtitle="Your account details" accent="blue">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Account Type", value: userData?.roles?.map((r) => r.replace(/_/g, " ")).join(", ") || "—" },
            { label: "User ID",      value: `#${userData?.userId || "—"}` },
            { label: "Email",        value: userData?.email    || "—" },
            { label: "School ID",    value: userData?.schoolId || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={LogOut} title="Sign Out" subtitle="Log out from your current or all sessions" accent="slate">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Sign Out All Other Devices</p>
            <p className="text-xs text-gray-400">Log out from every other device where you're signed in</p>
          </div>
          <button onClick={handleLogoutAll}
            className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
            <LogOut size={12} /> Sign Out All
          </button>
        </div>
      </Section>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-red-50 bg-red-50/50">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={17} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-700 text-sm">Danger Zone</h3>
            <p className="text-xs text-red-400">These actions are irreversible. Proceed with caution.</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Deactivate Account</p>
              <p className="text-xs text-gray-500 mt-0.5">Temporarily disable your account. Contact the School Admin to reactivate.</p>
            </div>
            <button onClick={() => setConfirmDelete(true)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-red-600 font-semibold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Deactivate
            </button>
          </div>
          {confirmDelete && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-red-700">
                ⚠️ Type <span className="font-mono bg-red-100 px-1 rounded">DEACTIVATE</span> to confirm
              </p>
              <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="Type DEACTIVATE"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300" />
              <div className="flex gap-2">
                <button disabled={deleteText !== "DEACTIVATE"}
                  onClick={() => addToast("Deactivation request sent to admin", "info")}
                  className="flex-1 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all">
                  Confirm Deactivate
                </button>
                <button onClick={() => { setConfirmDelete(false); setDeleteText(""); }}
                  className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}   