// src/super_admin/pages/SMS_Schools.jsx
import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  getAllSchools,
  toggleSchoolStatus,
  updateSchoolInfo,
  createSchool,
} from "../services/superAdminService";
import {
  Plus,
  Search,
  Pencil,
  School,
  CheckCircle,
  XCircle,
  MapPin,
  Globe,
  Power,
  PowerOff,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ─── Reusable Components ────────────────────────────────────────────────────

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        {icon}
      </div>
    </div>
  );
}

function FormInput({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
        {children}
      </h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Edit School Modal ───────────────────────────────────────────────────────

function EditSchoolModal({ school, onClose, onSaved }) {
  const [form, setForm] = useState({
    schoolName:      school.schoolName      || "",
    schoolCode:      school.schoolCode      || "",
    boardType:       school.boardType       || "",
    establishedYear: school.establishedYear || "",
    schoolEmail:     school.schoolEmail     || "",
    contactNumber:   school.contactNumber   || school.phoneNumber || "",
    websiteUrl:      school.websiteUrl      || "",
    addressLine1:    school.addressLine1    || "",
    addressLine2:    school.addressLine2    || "",
    city:            school.city            || "",
    state:           school.state           || "",
    country:         school.country         || "",
    pincode:         school.pincode         || "",
    subscriptionPlan: school.subscriptionPlan || "BASIC",
    studentCapacity: school.studentCapacity || "",
    enableSms:       school.enableSms       ?? false,
    enableMobileAppAccess: school.enableMobileAppAccess ?? true,
  });

  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.schoolName.trim()) return setError("School name is required.");
    if (!form.boardType.trim())  return setError("Board type is required.");
    if (!form.city.trim())       return setError("City is required.");

    setSaving(true);
    try {
      await updateSchoolInfo(school.id, form);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Failed to update school info. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Pencil size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit School Info</h2>
              <p className="text-xs text-gray-400">{school.schoolName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-1">
          {/* School Details */}
          <SectionTitle>School Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <FormInput label="School Name"      name="schoolName"      value={form.schoolName}      onChange={handleChange} />
            <FormInput label="School Code"      name="schoolCode"      value={form.schoolCode}      onChange={handleChange} />
            <FormInput label="Board Type"       name="boardType"       value={form.boardType}       onChange={handleChange} placeholder="CBSE / ICSE / STATE" />
            <FormInput label="Established Year" name="establishedYear" value={form.establishedYear} onChange={handleChange} type="number" />
            <FormInput label="School Email"     name="schoolEmail"     value={form.schoolEmail}     onChange={handleChange} type="email" />
            <FormInput label="Contact Number"   name="contactNumber"   value={form.contactNumber}   onChange={handleChange} />
            <FormInput label="Website URL"      name="websiteUrl"      value={form.websiteUrl}      onChange={handleChange} />
          </div>

          {/* Address */}
          <SectionTitle>Address Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <FormInput label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} />
            <FormInput label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} />
            <FormInput label="City"    name="city"    value={form.city}    onChange={handleChange} />
            <FormInput label="State"   name="state"   value={form.state}   onChange={handleChange} />
            <FormInput label="Country" name="country" value={form.country} onChange={handleChange} />
            <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
          </div>

          {/* Subscription */}
          <SectionTitle>Subscription</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Plan
              </label>
              <select
                name="subscriptionPlan"
                value={form.subscriptionPlan}
                onChange={handleChange}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="BASIC">BASIC</option>
                <option value="STANDARD">STANDARD</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>
            <FormInput
              label="Student Capacity"
              name="studentCapacity"
              value={form.studentCapacity}
              onChange={handleChange}
              type="number"
            />
          </div>

          {/* Feature Toggles */}
          <SectionTitle>Features</SectionTitle>
          <div className="flex gap-8">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="enableSms"
                checked={form.enableSms}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600 font-medium">Enable SMS</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="enableMobileAppAccess"
                checked={form.enableMobileAppAccess}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600 font-medium">
                Enable Mobile App
              </span>
            </label>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mt-4">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mt-4">
              <CheckCircle size={15} />
              School updated successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || success}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle size={15} />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Confirmation Modal ───────────────────────────────────────────────

function ToggleConfirmModal({ school, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const newStatus = !school.active;

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await toggleSchoolStatus(school.id, newStatus);
      onConfirmed(school.id, newStatus);
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message || "Failed to update status. Try again."
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              newStatus
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {newStatus ? (
              <Power size={20} className="text-green-600" />
            ) : (
              <PowerOff size={20} className="text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {newStatus ? "Activate School" : "Deactivate School"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to{" "}
              <span className={`font-semibold ${newStatus ? "text-green-600" : "text-red-600"}`}>
                {newStatus ? "activate" : "deactivate"}
              </span>{" "}
              <span className="font-semibold text-gray-700">{school.schoolName}</span>?
              {!newStatus && (
                <span className="block mt-1 text-xs text-red-500">
                  Deactivating will prevent all school users from logging in.
                </span>
              )}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 ${
              newStatus
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Updating...
              </>
            ) : newStatus ? (
              "Yes, Activate"
            ) : (
              "Yes, Deactivate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Schools() {
  const [schools,       setSchools]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [editSchool,    setEditSchool]    = useState(null);
  const [toggleSchool,  setToggleSchool]  = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getAllSchools();
      setSchools(res.data);
    } catch (error) {
      console.error("Error fetching schools", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // After toggle confirmed — update local state (no re-fetch needed)
  const handleToggleConfirmed = (schoolId, newActive) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, active: newActive } : s))
    );
  };

  // After edit saved — re-fetch to get latest data
  const handleEditSaved = () => {
    fetchSchools(true);
  };

  // Derived stats
  const totalSchools    = schools.length;
  const activeCount     = schools.filter((s) => s.active).length;
  const inactiveCount   = totalSchools - activeCount;

  // Filtered list
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
      school.schoolCode?.toLowerCase().includes(search.toLowerCase()) ||
      school.city?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "ACTIVE"
        ? school.active
        : !school.active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <main className="flex-1 p-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Schools Management
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Oversee and manage institutional registration and status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSchools(true)}
              disabled={refreshing}
              className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
              <Plus size={20} />
              Add New School
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Schools"
            value={totalSchools}
            icon={<School className="text-blue-600" />}
          />
          <StatCard
            title="Active Units"
            value={activeCount}
            icon={<CheckCircle className="text-green-600" />}
          />
          <StatCard
            title="Inactive / Pending"
            value={inactiveCount}
            icon={<XCircle className="text-red-600" />}
          />
        </div>

        {/* ── Search + Filter ─────────────────────────────────────── */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by school name, code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-gray-700 font-medium"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 flex-shrink-0">
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? status === "ACTIVE"
                      ? "bg-green-600 text-white shadow-sm"
                      : status === "INACTIVE"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-semibold italic">
                Syncing school database...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-5">School Info</th>
                    <th className="p-5">Code</th>
                    <th className="p-5">Board</th>
                    <th className="p-5">Location</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="group hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      {/* School Name */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                            <School size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 block">
                              {school.schoolName}
                            </span>
                            {school.subscriptionPlan && (
                              <span className="text-xs text-gray-400 font-medium">
                                {school.subscriptionPlan}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="p-5">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {school.schoolCode}
                        </span>
                      </td>

                      {/* Board */}
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <Globe size={14} className="text-gray-400" />
                          {school.boardType}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-5 text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-gray-400" />
                          {school.city}
                          {school.state && (
                            <span className="text-gray-400">, {school.state}</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset transition-all ${
                            school.active
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-red-600/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              school.active ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                          {school.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => setEditSchool(school)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center gap-1.5 font-semibold text-xs"
                            title="Edit school info"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => setToggleSchool(school)}
                            className={`p-2 rounded-lg transition-all inline-flex items-center gap-1.5 font-semibold text-xs ${
                              school.active
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              school.active
                                ? "Deactivate school"
                                : "Activate school"
                            }
                          >
                            {school.active ? (
                              <>
                                <PowerOff size={14} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power size={14} />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredSchools.length === 0 && (
            <div className="py-20 text-center">
              <Search className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-medium">
                No schools match your search criteria.
              </p>
            </div>
          )}
        </div>

        {/* Row count */}
        {!loading && filteredSchools.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right font-medium">
            Showing {filteredSchools.length} of {totalSchools} schools
          </p>
        )}
      </main>

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      {editSchool && (
        <EditSchoolModal
          school={editSchool}
          onClose={() => setEditSchool(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* ── Toggle Confirm Modal ──────────────────────────────────── */}
      {toggleSchool && (
        <ToggleConfirmModal
          school={toggleSchool}
          onClose={() => setToggleSchool(null)}
          onConfirmed={handleToggleConfirmed}
        />
      )}
    </div>
  );
}
