import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { getAllSchools, assignSchoolOwner, getSchoolOwner } from "../services/superAdminService";
import {
  Crown, School, User, Mail, Phone, Key, Eye, EyeOff,
  CheckCircle, ChevronDown, Loader2, Copy, Check, AlertCircle,
  Building2, MapPin, Globe, Hash, ArrowRight, RefreshCw
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

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    getAllSchools()
      .then((res) => setSchools(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      setExistingOwner(null); // no owner yet — OK
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

  const filteredSchools = schools.filter((s) => s.active);

  return (
    <div className="flex bg-[#0f1117] min-h-screen font-sans">
      <SuperAdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown size={18} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Assign School Owner
            </h1>
          </div>
          <p className="text-gray-500 ml-12 text-sm">
            Create a <span className="text-amber-400 font-semibold">SCHOOL_OWNER</span> account for any registered school.
            The owner gets read-only financial visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* ── Left: Form ────────────────────────────────── */}
          <div className="space-y-6">
            {/* School Selector */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 block">
                Step 1 — Select School
              </label>

              {loading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
                  <Loader2 size={16} className="animate-spin" />
                  Loading schools...
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
                      </div>
                    ) : (
                      <span className="text-gray-600">Choose an active school…</span>
                    )}
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-[#1a1d27] border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                      {filteredSchools.map((school) => (
                        <button
                          key={school.id}
                          onClick={() => handleSelectSchool(school)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0f1117] transition text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <School size={14} className="text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{school.schoolName}</p>
                            <p className="text-gray-600 text-xs">{school.city} · {school.boardType}</p>
                          </div>
                          <span className="font-mono text-xs text-gray-600 group-hover:text-gray-400">{school.schoolCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* School Detail Card */}
              {selectedSchool && (
                <div className="mt-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800 grid grid-cols-2 gap-3 text-xs">
                  <InfoPill icon={<Hash size={11} />} label="Code" value={selectedSchool.schoolCode} />
                  <InfoPill icon={<Globe size={11} />} label="Board" value={selectedSchool.boardType} />
                  <InfoPill icon={<MapPin size={11} />} label="City" value={selectedSchool.city} />
                  <InfoPill icon={<Building2 size={11} />} label="Est." value={selectedSchool.establishedYear} />
                </div>
              )}
            </div>

            {/* Existing Owner Banner */}
            {ownerLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm px-4 py-3 bg-[#1a1d27] rounded-xl border border-gray-800">
                <Loader2 size={14} className="animate-spin" />
                Checking for existing owner…
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
                <p className="text-gray-500 text-xs mt-2">
                  This school already has an owner. Submitting will create an additional owner account.
                </p>
              </div>
            )}

            {/* Owner Form */}
            {selectedSchool && (
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6 space-y-4">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block">
                  Step 2 — Owner Details
                </label>

                <FormInput
                  icon={<User size={14} />}
                  placeholder="Full Name *"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                />
                <FormInput
                  icon={<Mail size={14} />}
                  placeholder="Email Address *"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
                <FormInput
                  icon={<Phone size={14} />}
                  placeholder="Mobile Number (10 digits)"
                  value={form.phoneNumber}
                  onChange={(v) => setForm({ ...form, phoneNumber: v })}
                />

                {/* Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Key size={14} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password (auto-generate if blank)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-gray-600 text-xs -mt-2">
                  Leave blank to auto-generate a secure password. It will be emailed to the owner.
                </p>

                {/* Error */}
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
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating Owner…</>
                  ) : (
                    <><Crown size={16} /> Assign as School Owner <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Success + All Schools Table ───────── */}
          <div className="space-y-6">
            {/* Success Card */}
            {success && (
              <div className="bg-[#1a1d27] border border-green-500/20 rounded-2xl p-6 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-green-400" />
                  <span className="text-green-400 font-bold text-sm">Owner Created Successfully</span>
                </div>

                {/* School Info */}
                <div className="mb-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">School</p>
                  <p className="text-white font-bold">{success.schoolName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge text={success.schoolCode} />
                    <Badge text={success.boardType} />
                    <Badge text={`${success.city}, ${success.state}`} />
                  </div>
                </div>

                {/* Owner Info */}
                <div className="mb-4 p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Owner</p>
                  <p className="text-white font-bold">{success.ownerFullName}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{success.ownerEmail}</p>
                  {success.phoneNumber && (
                    <p className="text-gray-500 text-xs mt-1">{success.phoneNumber}</p>
                  )}
                </div>

                {/* Temp Password */}
                {success.temporaryPassword && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Temporary Password — Share Once
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-amber-300 font-mono text-sm bg-[#0f1117] px-3 py-2 rounded-lg border border-amber-500/10">
                        {success.temporaryPassword}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="p-2 hover:bg-amber-500/10 rounded-lg transition"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-amber-400" />}
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">
                      This password has been emailed to {success.ownerEmail}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Schools Overview Table */}
            <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">All Active Schools</p>
                  <p className="text-gray-600 text-xs">{filteredSchools.length} schools registered</p>
                </div>
                <button
                  onClick={() => getAllSchools().then((r) => setSchools(r.data))}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <RefreshCw size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">School</th>
                      <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">Board</th>
                      <th className="text-left text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">City</th>
                      <th className="text-center text-xs text-gray-600 font-bold uppercase tracking-widest px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-600">
                          <Loader2 size={20} className="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : filteredSchools.map((school) => (
                      <tr
                        key={school.id}
                        className={`border-b border-gray-800/50 hover:bg-[#0f1117] transition cursor-pointer ${selectedSchool?.id === school.id ? "bg-amber-500/5" : ""}`}
                        onClick={() => handleSelectSchool(school)}
                      >
                        <td className="px-5 py-3">
                          <p className="text-white font-semibold">{school.schoolName}</p>
                          <p className="text-gray-600 text-xs font-mono">{school.schoolCode}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-400">{school.boardType}</td>
                        <td className="px-5 py-3 text-gray-400">{school.city}</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectSchool(school); }}
                            className="text-xs font-bold text-amber-500 hover:text-amber-300 transition inline-flex items-center gap-1"
                          >
                            <Crown size={11} /> Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function FormInput({ icon, placeholder, value, onChange, type = "text" }) {
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
      <span className="text-gray-300 font-semibold truncate">{value}</span>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-medium">{text}</span>
  );
}
