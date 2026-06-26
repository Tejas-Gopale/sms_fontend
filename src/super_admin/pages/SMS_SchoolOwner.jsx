// src/super_admin/pages/SMS_SchoolOwner.jsx
import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { getAllSchools, assignSchoolOwner, getSchoolOwner } from "../services/superAdminService";
import API from "../../common/services/api";
import {
  Crown, School, User, Mail, Phone, Key, Eye, EyeOff,
  CheckCircle, ChevronDown, Loader2, Copy, Check, AlertCircle,
  Building2, MapPin, Globe, Hash, ArrowRight, RefreshCw,
  ShieldCheck, Power, PowerOff, Search, Users, LayoutGrid,
  List, BadgeCheck, Clock, XCircle, Pencil, Plus, X
} from "lucide-react";

export default function SMS_SchoolOwner() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [existingOwner, setExistingOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("assign"); // assign | owners
  const [allOwners, setAllOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [togglingSchool, setTogglingSchool] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    if (view === "owners") loadAllOwners();
  }, [view]);

  const loadSchools = () => {
    setLoading(true);
    getAllSchools()
      .then((res) => setSchools(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadAllOwners = async () => {
    setOwnersLoading(true);
    try {
      const res = await API.get("/super-admin/getAllSchoolList");
      const schoolsData = res.data;
      const ownerPromises = schoolsData.map(async (school) => {
        try {
          const ownerRes = await API.get(`/super-admin/schools/${school.id}/owner`);
          return { school, owner: ownerRes.data };
        } catch {
          return { school, owner: null };
        }
      });
      const results = await Promise.all(ownerPromises);
      setAllOwners(results);
    } catch (e) {
      console.error(e);
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleSelectSchool = async (school) => {
    setSelectedSchool(school);
    setDropdownOpen(false);
    setSuccess(null);
    setError("");
    setExistingOwner(null);
    setOwnerLoading(true);
    try {
      const res = await getSchoolOwner(school.id);
      setExistingOwner(res.data);
    } catch {
      setExistingOwner(null);
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSchool) return setError("Please select a school first.");
    if (!form.fullName.trim()) return setError("Owner full name is required.");
    if (!form.email.trim()) return setError("Owner email is required.");
    setSubmitting(true);
    setError("");
    try {
      const res = await assignSchoolOwner(selectedSchool.id, form);
      setSuccess(res.data);
      setExistingOwner(res.data);
      setForm({ fullName: "", email: "", password: "", phoneNumber: "" });
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (success?.temporaryPassword) {
      navigator.clipboard.writeText(success.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSchool = async (schoolId, currentActive) => {
    setTogglingSchool(schoolId);
    try {
      await API.patch(`/super-admin/${schoolId}/status`, null, { params: { active: !currentActive } });
      setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, active: !currentActive } : s));
      if (allOwners.length > 0) {
        setAllOwners(prev => prev.map(item =>
          item.school.id === schoolId ? { ...item, school: { ...item.school, active: !currentActive } } : item
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingSchool(null);
    }
  };

  const activeSchools = schools.filter(s => s.active);
  const inactiveSchools = schools.filter(s => !s.active);

  const filteredSchools = schools.filter(s =>
    s.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.schoolCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOwners = allOwners.filter(item =>
    item.school.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.owner?.ownerFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.owner?.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-[#0f1117] min-h-screen font-sans">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* ── Top Header ─────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Crown size={18} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">School Owners</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage owner accounts & school access control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-[#1a1d27] border border-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setView("assign")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "assign" ? "bg-amber-500 text-black" : "text-gray-500 hover:text-gray-300"}`}
                >
                  <Plus size={13} /> Assign Owner
                </button>
                <button
                  onClick={() => setView("owners")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "owners" ? "bg-amber-500 text-black" : "text-gray-500 hover:text-gray-300"}`}
                >
                  <Users size={13} /> All Owners
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">

          {/* ── Stats Row ─────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Schools", value: schools.length, icon: <School size={16} className="text-blue-400" />, accent: "blue" },
              { label: "Active", value: activeSchools.length, icon: <CheckCircle size={16} className="text-green-400" />, accent: "green" },
              { label: "Inactive", value: inactiveSchools.length, icon: <XCircle size={16} className="text-red-400" />, accent: "red" },
            ].map(({ label, value, icon, accent }) => (
              <div key={label} className={`bg-[#1a1d27] border border-gray-800 rounded-2xl p-5 flex items-center gap-4`}>
                <div className={`w-10 h-10 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 flex items-center justify-center`}>{icon}</div>
                <div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── View: Assign Owner ─────────────────────────── */}
          {view === "assign" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left: Form */}
              <div className="space-y-5">

                {/* School Selector */}
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Step 1 — Select School</p>
                  {loading ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
                      <Loader2 size={16} className="animate-spin" /> Loading schools...
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-300 hover:border-amber-500/50 transition-all"
                      >
                        {selectedSchool ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <School size={13} className="text-blue-400" />
                            </div>
                            <span className="font-semibold text-white">{selectedSchool.schoolName}</span>
                            <span className="text-gray-600 font-mono text-xs">{selectedSchool.schoolCode}</span>
                            {selectedSchool.active
                              ? <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                              : <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Inactive</span>
                            }
                          </div>
                        ) : (
                          <span className="text-gray-600">Choose a school…</span>
                        )}
                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full bg-[#1a1d27] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                          <div className="p-2 border-b border-gray-800">
                            <div className="relative">
                              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input
                                placeholder="Search schools..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-[#0f1117] border border-gray-700 rounded-lg text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredSchools.map((school) => (
                              <button
                                key={school.id}
                                onClick={() => { handleSelectSchool(school); setSearchQuery(""); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0f1117] transition text-left group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <School size={14} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-semibold truncate">{school.schoolName}</p>
                                  <p className="text-gray-600 text-xs">{school.city} · {school.boardType}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-gray-600">{school.schoolCode}</span>
                                  {school.active
                                    ? <span className="w-2 h-2 rounded-full bg-green-400" />
                                    : <span className="w-2 h-2 rounded-full bg-red-400" />
                                  }
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* School Detail Pills */}
                  {selectedSchool && (
                    <div className="mt-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <InfoPill icon={<Hash size={11} />} label="Code" value={selectedSchool.schoolCode} />
                        <InfoPill icon={<Globe size={11} />} label="Board" value={selectedSchool.boardType} />
                        <InfoPill icon={<MapPin size={11} />} label="City" value={selectedSchool.city} />
                        <InfoPill icon={<Building2 size={11} />} label="Est." value={selectedSchool.establishedYear} />
                      </div>
                      {/* Service Control */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <div>
                          <p className="text-xs font-semibold text-gray-300">Service Access</p>
                          <p className="text-xs text-gray-600">Enable / disable school platform access</p>
                        </div>
                        <button
                          onClick={() => handleToggleSchool(selectedSchool.id, selectedSchool.active)}
                          disabled={togglingSchool === selectedSchool.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSchool.active
                              ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                              : "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {togglingSchool === selectedSchool.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : selectedSchool.active ? <><PowerOff size={13} /> Deactivate</> : <><Power size={13} /> Activate</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Owner Banner */}
                {ownerLoading && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm px-4 py-3 bg-[#1a1d27] rounded-xl border border-gray-800">
                    <Loader2 size={14} className="animate-spin" /> Checking for existing owner…
                  </div>
                )}
                {existingOwner && !success && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={14} className="text-amber-400" />
                      <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Existing Owner</span>
                    </div>
                    <p className="text-white text-sm font-semibold">{existingOwner.ownerFullName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{existingOwner.ownerEmail}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      This school already has an owner. Submitting will create an additional owner account.
                    </p>
                  </div>
                )}

                {/* Owner Form */}
                {selectedSchool && (
                  <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Step 2 — Owner Details</p>

                    <DarkInput icon={<User size={14} />} placeholder="Full Name *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                    <DarkInput icon={<Mail size={14} />} placeholder="Email Address *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                    <DarkInput icon={<Phone size={14} />} placeholder="Mobile Number (10 digits)" value={form.phoneNumber} onChange={(v) => setForm({ ...form, phoneNumber: v })} />

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Key size={14} /></div>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Password (auto-generate if blank)"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs -mt-2">Leave blank to auto-generate. It will be emailed to the owner.</p>

                    {error && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm transition-all active:scale-95"
                    >
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating Owner…</> : <><Crown size={16} /> Assign as School Owner <ArrowRight size={16} /></>}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Success + Schools Table */}
              <div className="space-y-5">
                {success && (
                  <div className="bg-[#1a1d27] border border-green-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-green-400 font-bold text-sm">Owner Created Successfully</span>
                    </div>
                    <div className="mb-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">School</p>
                      <p className="text-white font-bold">{success.schoolName}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[success.schoolCode, success.boardType, `${success.city}, ${success.state}`].filter(Boolean).map(t => (
                          <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Owner</p>
                      <p className="text-white font-bold">{success.ownerFullName}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{success.ownerEmail}</p>
                      {success.phoneNumber && <p className="text-gray-500 text-xs mt-1">{success.phoneNumber}</p>}
                    </div>
                    {success.temporaryPassword && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Temporary Password — Share Once</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-amber-300 font-mono text-sm bg-[#0f1117] px-3 py-2 rounded-lg border border-amber-500/10">{success.temporaryPassword}</code>
                          <button onClick={copyPassword} className="p-2 hover:bg-amber-500/10 rounded-lg transition">
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-amber-400" />}
                          </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-2">Emailed to {success.ownerEmail}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* All Schools Table */}
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">All Schools</p>
                      <p className="text-gray-600 text-xs">{schools.length} registered · {activeSchools.length} active</p>
                    </div>
                    <button onClick={loadSchools} className="p-2 hover:bg-gray-800 rounded-lg transition">
                      <RefreshCw size={14} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">School</th>
                          <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">Board</th>
                          <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">Status</th>
                          <th className="text-center text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={4} className="text-center py-10 text-gray-600"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
                        ) : schools.map((school) => (
                          <tr
                            key={school.id}
                            className={`border-b border-gray-800/50 hover:bg-[#0f1117] transition cursor-pointer ${selectedSchool?.id === school.id ? "bg-amber-500/5" : ""}`}
                            onClick={() => handleSelectSchool(school)}
                          >
                            <td className="px-5 py-3">
                              <p className="text-white font-semibold text-sm">{school.schoolName}</p>
                              <p className="text-gray-600 text-xs font-mono">{school.schoolCode}</p>
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-sm">{school.boardType}</td>
                            <td className="px-5 py-3">
                              {school.active
                                ? <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                                : <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Inactive</span>
                              }
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSelectSchool(school); }}
                                  className="text-xs font-bold text-amber-500 hover:text-amber-300 transition inline-flex items-center gap-1"
                                >
                                  <Crown size={11} /> Assign
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleSchool(school.id, school.active); }}
                                  disabled={togglingSchool === school.id}
                                  className={`text-xs font-bold transition inline-flex items-center gap-1 ${school.active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}
                                >
                                  {togglingSchool === school.id ? <Loader2 size={11} className="animate-spin" /> : school.active ? <><PowerOff size={11} /></> : <><Power size={11} /></>}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── View: All Owners ───────────────────────────── */}
          {view === "owners" && (
            <div className="space-y-5">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  placeholder="Search by school or owner name / email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1d27] border border-gray-800 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>

              {ownersLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 size={32} className="animate-spin text-amber-500 mb-4" />
                  <p className="text-gray-500 text-sm">Loading owners & schools...</p>
                </div>
              ) : (
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <p className="text-white font-bold text-sm">Schools & Owner Status</p>
                    <span className="text-xs text-gray-600">{filteredOwners.length} schools</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          {["School", "Owner", "Contact", "Service", "Actions"].map(h => (
                            <th key={h} className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOwners.map(({ school, owner }) => (
                          <tr key={school.id} className="border-b border-gray-800/50 hover:bg-[#0f1117] transition group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <School size={14} className="text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-sm">{school.schoolName}</p>
                                  <p className="text-gray-600 text-xs font-mono">{school.schoolCode} · {school.boardType}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {owner ? (
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <Crown size={12} className="text-amber-400" />
                                    <p className="text-white text-sm font-semibold">{owner.ownerFullName}</p>
                                  </div>
                                  <p className="text-gray-500 text-xs">{owner.ownerEmail}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 italic">No owner assigned</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {owner?.phoneNumber
                                ? <p className="text-gray-400 text-sm">{owner.phoneNumber}</p>
                                : <span className="text-gray-700 text-xs">—</span>
                              }
                            </td>
                            <td className="px-5 py-4">
                              {school.active
                                ? <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold">Active</span>
                                : <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-semibold">Suspended</span>
                              }
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setView("assign"); handleSelectSchool(school); }}
                                  className="text-xs font-bold text-amber-500 hover:text-amber-300 transition inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-500/10"
                                >
                                  <Crown size={11} /> {owner ? "Add Owner" : "Assign"}
                                </button>
                                <button
                                  onClick={() => handleToggleSchool(school.id, school.active)}
                                  disabled={togglingSchool === school.id}
                                  className={`text-xs font-bold transition inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                                    school.active
                                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                      : "text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                  }`}
                                >
                                  {togglingSchool === school.id
                                    ? <Loader2 size={11} className="animate-spin" />
                                    : school.active ? <><PowerOff size={11} /> Disable</> : <><Power size={11} /> Enable</>
                                  }
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function DarkInput({ icon, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition"
      />
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-600">{icon}</span>
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-300 font-semibold truncate">{value || "—"}</span>
    </div>
  );
}