// src/nurse/pages/NurseHealthRecords.jsx
// Role: NURSE — student health records (create/update/view)

import { useEffect, useState } from "react";
import RoleSidebar from "../../common/components/RoleSidebar";
import StudentPicker from "../../common/components/StudentPicker";
import { getUserData } from "../../common/utils/tokenStorage";
import { healthService } from "../../common/services/healthService";
import { Plus, X, Loader, HeartPulse, Search, Save } from "lucide-react";

const emptyForm = {
  studentId: null, bloodGroup: "", heightCm: "", weightKg: "", allergies: "",
  chronicConditions: "", currentMedications: "", vaccinationStatus: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
  doctorName: "", doctorPhone: "", lastCheckupDate: "", notes: "",
};

export default function NurseHealthRecords() {
  const userData = getUserData();
  const schoolId = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await healthService.getAllRecords(schoolId);
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("error", "Records load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (schoolId) fetchAll(); }, [schoolId]);

  const openNew = () => { setForm(emptyForm); setShowForm(true); };

  const openEdit = async (studentId) => {
    try {
      const res = await healthService.getRecord(schoolId, studentId);
      const r = res.data;
      setForm({
        studentId: r.studentId, bloodGroup: r.bloodGroup || "", heightCm: r.heightCm ?? "",
        weightKg: r.weightKg ?? "", allergies: r.allergies || "", chronicConditions: r.chronicConditions || "",
        currentMedications: r.currentMedications || "", vaccinationStatus: r.vaccinationStatus || "",
        emergencyContactName: r.emergencyContactName || "", emergencyContactPhone: r.emergencyContactPhone || "",
        emergencyContactRelation: r.emergencyContactRelation || "", doctorName: r.doctorName || "",
        doctorPhone: r.doctorPhone || "", lastCheckupDate: r.lastCheckupDate || "", notes: r.notes || "",
      });
      setShowForm(true);
    } catch {
      showToast("error", "Record load nahi ho paayi");
    }
  };

  const handleSave = async () => {
    if (!form.studentId) { showToast("error", "Student select karo"); return; }
    setSubmitting(true);
    try {
      await healthService.upsertRecord(schoolId, {
        ...form,
        heightCm: form.heightCm === "" ? null : Number(form.heightCm),
        weightKg: form.weightKg === "" ? null : Number(form.weightKg),
        lastCheckupDate: form.lastCheckupDate || null,
      });
      showToast("success", "Health record saved");
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Save nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = records.filter((r) =>
    !search.trim() || (r.studentName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Health Records</h1>
            <p className="text-sm text-gray-400 mt-0.5">Master list of student health profiles</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400"
          >
            <Plus size={16} /> Add / Update Record
          </button>
        </div>

        <div className="p-8 space-y-5">
          {toast && (
            <div className={`px-4 py-2.5 rounded-lg text-sm ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {toast.msg}
            </div>
          )}

          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-10 flex justify-center"><Loader className="animate-spin text-gray-400" /></div>
            ) : filtered.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400">No health records found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Student", "Blood Group", "Allergies", "Chronic Conditions", "Last Checkup", ""].map((h) => (
                      <th key={h} className="text-left py-2.5 px-4 text-gray-400 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                        <HeartPulse size={14} className="text-red-400" /> {r.studentName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{r.bloodGroup || "-"}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{r.allergies || "-"}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{r.chronicConditions || "-"}</td>
                      <td className="py-3 px-4 text-gray-500">{r.lastCheckupDate || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => openEdit(r.studentId)} className="text-xs text-yellow-600 font-medium hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Health Record</h3>
              <X size={18} className="cursor-pointer text-gray-400" onClick={() => setShowForm(false)} />
            </div>

            <div className="mb-3">
              <label className="text-xs font-medium text-gray-500">Student</label>
              <StudentPicker value={form.studentId} onChange={(id) => setForm((f) => ({ ...f, studentId: id }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["bloodGroup", "Blood Group", "text"],
                ["heightCm", "Height (cm)", "number"],
                ["weightKg", "Weight (kg)", "number"],
                ["vaccinationStatus", "Vaccination Status", "text"],
                ["emergencyContactName", "Emergency Contact Name", "text"],
                ["emergencyContactPhone", "Emergency Contact Phone", "text"],
                ["emergencyContactRelation", "Relation", "text"],
                ["doctorName", "Doctor Name", "text"],
                ["doctorPhone", "Doctor Phone", "text"],
                ["lastCheckupDate", "Last Checkup Date", "date"],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-500">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
              ))}
            </div>

            {[
              ["allergies", "Allergies"],
              ["chronicConditions", "Chronic Conditions"],
              ["currentMedications", "Current Medications"],
              ["notes", "Notes"],
            ].map(([key, label]) => (
              <div key={key} className="mt-3">
                <label className="text-xs font-medium text-gray-500">{label}</label>
                <textarea
                  rows={2}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                disabled={submitting}
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-60"
              >
                <Save size={14} /> {submitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
