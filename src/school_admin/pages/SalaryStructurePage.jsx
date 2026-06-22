// src/school_admin/pages/SalaryStructurePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL_ADMIN + ACCOUNTANT — Salary Structure Management
//
// Tabs:
//   1. Structures   — List + Create + Edit + Delete (soft)
//   2. Assign       — Salary structure kisi teacher/staff ko assign karo
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { salaryStructureService } from "../../common/services/payrollService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  IndianRupee,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  Banknote,
  LayoutGrid,
  UserCheck,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (v) =>
  v != null && v !== 0
    ? `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`
    : "—";

const fmtFull = (v) =>
  v != null
    ? `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "—";

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  structureName: "",
  designation: "",
  grossSalary: "",
  basicPercent: "",
  hraPercent: "",
  daPercent: "",
  basicFixed: "",
  hraFixed: "",
  daFixed: "",
  ta: "",
  medical: "",
  specialAllowance: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  FIX: FieldInput + PctInput defined HERE (module level), NOT inside
//     StructureModal. Defining them inside caused React to remount them on
//     every keystroke → input lost focus after each character typed.
// ─────────────────────────────────────────────────────────────────────────────

function FieldInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₹</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder || "0"}
          className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function PctInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="0"
          className="w-full pr-7 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-xs">%</span>
      </div>
    </div>
  );
}

// ─── Live Preview Panel ───────────────────────────────────────────────────────
function LivePreview({ form, mode }) {
  const gross = parseFloat(form.grossSalary) || 0;

  const resolve = (fixed, pct) => {
    const f = parseFloat(fixed);
    const p = parseFloat(pct);
    if (!isNaN(f) && fixed !== "") return f;
    if (!isNaN(p) && pct !== "" && gross > 0) return (p / 100) * gross;
    return 0;
  };

  const basic = resolve(form.basicFixed, form.basicPercent);
  const hra   = resolve(form.hraFixed,   form.hraPercent);
  const da    = resolve(form.daFixed,    form.daPercent);
  const ta    = parseFloat(form.ta) || 0;
  const med   = parseFloat(form.medical) || 0;
  const spec  = parseFloat(form.specialAllowance) || 0;

  const total = mode === "percent"
    ? gross
    : basic + hra + da + ta + med + spec;

  const rows = [
    { label: "Basic Salary",      value: basic, pct: mode === "percent" && gross ? ((basic / gross) * 100).toFixed(1) : null },
    { label: "HRA",               value: hra,   pct: mode === "percent" && gross ? ((hra   / gross) * 100).toFixed(1) : null },
    { label: "DA",                value: da,    pct: mode === "percent" && gross ? ((da    / gross) * 100).toFixed(1) : null },
    { label: "TA",                value: ta },
    { label: "Medical",           value: med },
    { label: "Special Allowance", value: spec },
  ].filter((r) => r.value > 0);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={14} className="text-blue-500" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Live Preview</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-blue-400 text-center py-3">Values enter karo preview ke liye</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map(({ label, value, pct }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{label}</span>
              <div className="flex items-center gap-2">
                {pct && <span className="text-xs text-gray-400">{pct}%</span>}
                <span className="font-semibold text-gray-800">{fmtFull(value)}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-blue-800">Gross Total</span>
            <span className="text-base font-bold text-blue-700">{fmtFull(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function StructureModal({ schoolId, editData, onClose, onSaved }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [mode, setMode]       = useState("percent");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        structureName:    editData.structureName || "",
        designation:      editData.designation   || "",
        grossSalary:      editData.grossSalary   != null ? String(editData.grossSalary)   : "",
        basicPercent:     "",
        hraPercent:       "",
        daPercent:        "",
        basicFixed:       editData.basicSalary   != null ? String(editData.basicSalary)   : "",
        hraFixed:         editData.hra           != null ? String(editData.hra)           : "",
        daFixed:          editData.da            != null ? String(editData.da)            : "",
        ta:               editData.ta            != null ? String(editData.ta)            : "",
        medical:          editData.medical       != null ? String(editData.medical)       : "",
        specialAllowance: editData.specialAllowance != null ? String(editData.specialAllowance) : "",
      });
      setMode("fixed");
    } else {
      setForm(EMPTY_FORM);
      setMode("percent");
    }
  }, [editData]);

  // ⚠️ FIX: setField passed as prop to FieldInput/PctInput instead of
  //    defining new component functions inside this render scope.
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async () => {
    if (!form.structureName.trim()) { setError("Structure name required hai."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        schoolId:         parseInt(schoolId),
        structureName:    form.structureName.trim(),
        designation:      form.designation.trim() || null,
        grossSalary:      form.grossSalary      ? parseFloat(form.grossSalary)      : null,
        basicPercent:     form.basicPercent     ? parseFloat(form.basicPercent)     : null,
        hraPercent:       form.hraPercent       ? parseFloat(form.hraPercent)       : null,
        daPercent:        form.daPercent        ? parseFloat(form.daPercent)        : null,
        basicFixed:       form.basicFixed       ? parseFloat(form.basicFixed)       : null,
        hraFixed:         form.hraFixed         ? parseFloat(form.hraFixed)         : null,
        daFixed:          form.daFixed          ? parseFloat(form.daFixed)          : null,
        ta:               form.ta               ? parseFloat(form.ta)               : null,
        medical:          form.medical          ? parseFloat(form.medical)          : null,
        specialAllowance: form.specialAllowance ? parseFloat(form.specialAllowance) : null,
      };
      if (editData?.id) {
        await salaryStructureService.update(editData.id, payload);
      } else {
        await salaryStructureService.create(payload);
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Save nahi ho saka, retry karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            <h2 className="font-bold text-gray-800 text-lg">
              {editData ? "Edit Salary Structure" : "New Salary Structure"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name + Designation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Structure Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.structureName}
                onChange={(e) => setField("structureName", e.target.value)}
                placeholder="e.g. Teacher Grade A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Designation (optional)</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                placeholder="e.g. Primary Teacher"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Salary Input Method</p>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {[
                { key: "percent", label: "Gross + Percentages" },
                { key: "fixed",   label: "Fixed Amounts" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    mode === key
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Percentage mode */}
          {mode === "percent" && (
            <div className="space-y-4">
              <FieldInput
                label="Gross Salary (CTC)"
                name="grossSalary"
                value={form.grossSalary}
                onChange={setField}
                placeholder="50000"
              />
              <div className="grid grid-cols-3 gap-3">
                <PctInput label="Basic %" name="basicPercent" value={form.basicPercent} onChange={setField} />
                <PctInput label="HRA %"   name="hraPercent"   value={form.hraPercent}   onChange={setField} />
                <PctInput label="DA %"    name="daPercent"    value={form.daPercent}    onChange={setField} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="TA (Fixed)"         name="ta"               value={form.ta}               onChange={setField} />
                <FieldInput label="Medical (Fixed)"    name="medical"          value={form.medical}          onChange={setField} />
                <FieldInput label="Special Allowance"  name="specialAllowance" value={form.specialAllowance} onChange={setField} />
              </div>
            </div>
          )}

          {/* Fixed mode */}
          {mode === "fixed" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                Direct amounts enter karo. Gross automatically sum ho jayega.
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="Basic Salary"   name="basicFixed"       value={form.basicFixed}       onChange={setField} />
                <FieldInput label="HRA"            name="hraFixed"         value={form.hraFixed}         onChange={setField} />
                <FieldInput label="DA"             name="daFixed"          value={form.daFixed}          onChange={setField} />
                <FieldInput label="TA"             name="ta"               value={form.ta}               onChange={setField} />
                <FieldInput label="Medical"        name="medical"          value={form.medical}          onChange={setField} />
                <FieldInput label="Special Allow." name="specialAllowance" value={form.specialAllowance} onChange={setField} />
              </div>
            </div>
          )}

          {/* Live Preview */}
          <LivePreview form={form} mode={mode} />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {loading ? "Saving..." : editData ? "Update Structure" : "Create Structure"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Structure Card ───────────────────────────────────────────────────────────
function StructureCard({ s, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const components = [
    { label: "Basic",   value: s.basicSalary },
    { label: "HRA",     value: s.hra },
    { label: "DA",      value: s.da },
    { label: "TA",      value: s.ta },
    { label: "Medical", value: s.medical },
    { label: "Special", value: s.specialAllowance },
  ].filter((c) => c.value && c.value > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{s.structureName}</h3>
            {s.designation && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                {s.designation}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(s)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(s)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg px-4 py-3">
          <IndianRupee size={16} className="text-green-600" />
          <div>
            <p className="text-xs text-green-600 font-medium">Gross CTC / Month</p>
            <p className="text-xl font-bold text-green-700">{fmt(s.grossSalary)}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-3 font-medium"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Hide breakdown" : "Show breakdown"}
        </button>
      </div>

      {expanded && components.length > 0 && (
        <div className="border-t border-gray-50 px-5 pb-4 pt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {components.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-700">{fmt(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 1: Structures List ───────────────────────────────────────────────────
function StructuresTab({ schoolId }) {
  const [structures,    setStructures]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [editData,      setEditData]      = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [search,        setSearch]        = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError("");
    try {
      const res = await salaryStructureService.getBySchool(schoolId);
      setStructures(res.data || []);
    } catch {
      setError("Structures load nahi ho sake. Refresh karo.");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = () => {
    setShowModal(false);
    setEditData(null);
    setSuccessMsg("Structure saved successfully! ✅");
    setTimeout(() => setSuccessMsg(""), 3000);
    load();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await salaryStructureService.delete(deleteTarget.id);
      setSuccessMsg(`"${deleteTarget.structureName}" delete ho gaya.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setDeleteTarget(null);
      load();
    } catch {
      setError("Delete nahi ho saka, retry karo.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = structures.filter((s) =>
    s.structureName.toLowerCase().includes(search.toLowerCase()) ||
    (s.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Structure
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-4">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading structures...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Layers size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? "Koi structure match nahi hua." : "Abhi koi salary structure nahi hai."}
          </p>
          {!search && (
            <button
              onClick={() => { setEditData(null); setShowModal(true); }}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline"
            >
              <Plus size={14} /> Pehla structure banao
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StructureCard
              key={s.id}
              s={s}
              onEdit={(s) => { setEditData(s); setShowModal(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showModal && (
        <StructureModal
          schoolId={schoolId}
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800">Structure Delete Karo?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              <strong>"{deleteTarget.structureName}"</strong> ko inactive mark kar diya jayega.
              Ye action reversible hai (backend se re-activate ho sakta hai).
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Deleting..." : "Haan, Delete Karo"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Assign Structure ──────────────────────────────────────────────────
function AssignTab({ schoolId }) {
  const [structures,       setStructures]       = useState([]);
  const [teachers,         setTeachers]         = useState([]);
  const [search,           setSearch]           = useState("");
  const [selectedPerson,   setSelectedPerson]   = useState(null);
  const [selectedStructId, setSelectedStructId] = useState("");
  const [bankDetails,      setBankDetails]      = useState({ accountNumber: "", ifsc: "", bankName: "", branchName: "" });
  const [showBank,         setShowBank]         = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [loadingData,      setLoadingData]      = useState(false);
  const [error,            setError]            = useState("");
  const [success,          setSuccess]          = useState("");

  useEffect(() => {
    if (!schoolId) return;
    setLoadingData(true);
    Promise.all([
      salaryStructureService.getBySchool(schoolId),
      API.get("/teacher/getTeachersDetilas"),
    ])
      .then(([sRes, tRes]) => {
        setStructures(sRes.data || []);
        const list = Array.isArray(tRes.data) ? tRes.data : tRes.data?.teachers || [];
        setTeachers(list);
      })
      .catch(() => setError("Data load nahi ho saka."))
      .finally(() => setLoadingData(false));
  }, [schoolId]);

  const filteredTeachers = teachers.filter((t) => {
    const name = t.fullName || t.name || t.user?.fullName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAssign = async () => {
    if (!selectedPerson)   { setError("Pehle ek teacher select karo."); return; }
    if (!selectedStructId) { setError("Salary structure select karo."); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        teacherId:   selectedPerson.id,
        structureId: parseInt(selectedStructId),
        ...(showBank && bankDetails.accountNumber ? {
          bankAccountNumber: bankDetails.accountNumber,
          ifscCode:          bankDetails.ifsc,
          bankName:          bankDetails.bankName,
          branchName:        bankDetails.branchName,
        } : {}),
      };
      await salaryStructureService.assign(payload);
      const tName = selectedPerson.fullName || selectedPerson.name || selectedPerson.user?.fullName || "Teacher";
      const sName = structures.find((s) => s.id === parseInt(selectedStructId))?.structureName || "";
      setSuccess(`✅ "${sName}" successfully "${tName}" ko assign ho gaya!`);
      setSelectedPerson(null);
      setSelectedStructId("");
      setBankDetails({ accountNumber: "", ifsc: "", bankName: "", branchName: "" });
      setShowBank(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Assign nahi ho saka.";
      setError(typeof msg === "string" ? msg : "Error aayi, retry karo.");
    } finally {
      setLoading(false);
    }
  };

  const teacherName = (t) => t.fullName || t.name || t.user?.fullName || `#${t.id}`;
  const selectedStructure = structures.find((s) => s.id === parseInt(selectedStructId));

  return (
    <div className="flex gap-6 flex-wrap">
      {/* Left — Teacher picker */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Select Teacher
          </h3>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {loadingData ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 size={16} className="animate-spin mr-2" /> Loading...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No teachers found.</p>
            ) : (
              filteredTeachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedPerson(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedPerson?.id === t.id
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {teacherName(t)}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right — Assign form */}
      <div className="flex-1 min-w-0 space-y-4">
        {!selectedPerson ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <UserCheck size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Left side se teacher select karo</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 font-medium">Selected Teacher</p>
                <p className="font-bold text-blue-800">{teacherName(selectedPerson)}</p>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="text-blue-400 hover:text-blue-600 p-1">
                <X size={16} />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">
                Select Salary Structure <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedStructId}
                onChange={(e) => setSelectedStructId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Structure choose karo --</option>
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.structureName} {s.designation ? `(${s.designation})` : ""} — {fmt(s.grossSalary)}/mo
                  </option>
                ))}
              </select>

              {selectedStructure && (
                <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-green-700 mb-2">Structure Details</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: "Gross",   v: selectedStructure.grossSalary },
                      { l: "Basic",   v: selectedStructure.basicSalary },
                      { l: "HRA",     v: selectedStructure.hra },
                      { l: "DA",      v: selectedStructure.da },
                      { l: "TA",      v: selectedStructure.ta },
                      { l: "Medical", v: selectedStructure.medical },
                    ].filter((r) => r.v && r.v > 0).map(({ l, v }) => (
                      <div key={l} className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">{l}</p>
                        <p className="text-sm font-bold text-gray-700">{fmt(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <button
                onClick={() => setShowBank((b) => !b)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full"
              >
                <Banknote size={16} className="text-blue-500" />
                Bank Details (Optional)
                {showBank ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
              </button>
              {showBank && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { key: "accountNumber", label: "Account Number",  placeholder: "1234567890" },
                    { key: "ifsc",          label: "IFSC Code",       placeholder: "SBIN0001234" },
                    { key: "bankName",      label: "Bank Name",       placeholder: "State Bank of India" },
                    { key: "branchName",    label: "Branch Name",     placeholder: "Thane Main Branch" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input
                        type="text"
                        value={bankDetails[key]}
                        onChange={(e) => setBankDetails((b) => ({ ...b, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                <AlertCircle size={15} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
                <CheckCircle size={15} /> {success}
              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={loading || !selectedStructId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
              {loading ? "Assigning..." : "Assign Structure"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalaryStructurePage() {
  const [activeTab, setActiveTab] = useState("structures");
  const [schoolId,  setSchoolId]  = useState(null);

  useEffect(() => {
    const userData = getUserData();
    if (userData?.schoolId) setSchoolId(userData.schoolId);
  }, []);

  const tabs = [
    { key: "structures", label: "Salary Structures", icon: LayoutGrid },
    { key: "assign",     label: "Assign to Teacher", icon: UserCheck  },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SchoolAdminSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layers size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Salary Structures</h1>
            <p className="text-sm text-gray-500">Salary templates banao aur teachers ko assign karo</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "structures" && <StructuresTab schoolId={schoolId} />}
        {activeTab === "assign"     && <AssignTab     schoolId={schoolId} />}
      </div>
    </div>
  );
}