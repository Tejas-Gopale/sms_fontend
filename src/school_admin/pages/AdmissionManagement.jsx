import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import {
  Users, CheckCircle, XCircle, Clock,
  Search, Filter, Edit3, Calendar,
  ChevronLeft, ChevronRight, X, Info,
  GraduationCap, UserPlus, BookOpen, BadgeCheck,
  AlertCircle, Loader2, ChevronDown, Wallet, Zap
} from "lucide-react";
import { admissionService } from "../../common/services/api";
import API from "../../common/services/api";
import DirectAdmissionModal from "./DirectAdmissionModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["PENDING", "REVIEWED", "WAITLISTED", "APPROVED", "REJECTED"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdmissionManagement() {
  const schoolId = 1;

  const [showDirectModal, setShowDirectModal] = useState(false);
  const [inquiries, setInquiries]         = useState([]);
  const [classrooms, setClassrooms]       = useState([]);
  const [stats, setStats]                 = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]             = useState(true);
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);

  // Modal state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalMode, setModalMode]             = useState(null); // "status" | "grant"

  // Status update form
  const [statusForm, setStatusForm]   = useState({
    status: "", reviewerRemarks: "", interviewDate: "",
    nextFollowUpDate: "", nextFollowUpRemarks: "", meritRank: "",
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError]     = useState("");

  // Grant admission form
  const [grantForm, setGrantForm]     = useState({ classRoomId: "", section: "", admissionNumber: "" });
  const [grantLoading, setGrantLoading]   = useState(false);
  const [grantError, setGrantError]       = useState("");
  const [grantResult, setGrantResult]     = useState(null); // success response

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, [filterStatus, page]);
  useEffect(() => {
    API.get("/school-admin/getClassRoom")
      .then((res) => setClassrooms(res.data?.content || []))
      .catch(() => setClassrooms([]));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        admissionService.getStats(schoolId),
        admissionService.getInquiries(schoolId, filterStatus, page),
      ]);
      setStats(statsRes.data);
      setInquiries(listRes.data.content || []);
      setTotalPages(listRes.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching admission data", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Open Modals ────────────────────────────────────────────────────────────
  const openStatusModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusForm({
      status: inquiry.status,
      reviewerRemarks: inquiry.reviewerRemarks || "",
      interviewDate: inquiry.interviewDate || "",
      nextFollowUpDate: inquiry.nextFollowUpDate || "",
      nextFollowUpRemarks: inquiry.nextFollowUpRemarks || "",
      meritRank: inquiry.meritRank ?? "",
    });
    setStatusError("");
    setModalMode("status");
  };

  const openGrantModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setGrantForm({ classRoomId: "", section: "", admissionNumber: "" });
    setGrantError("");
    setGrantResult(null);
    setModalMode("grant");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedInquiry(null);
    setGrantResult(null);
  };

  // ── Update Status Handler ──────────────────────────────────────────────────
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    setStatusError("");
    try {
      const payload = {
        ...statusForm,
        meritRank: statusForm.meritRank === "" ? undefined : Number(statusForm.meritRank),
        nextFollowUpDate: statusForm.nextFollowUpDate || undefined,
        nextFollowUpRemarks: statusForm.nextFollowUpRemarks || undefined,
      };
      await admissionService.updateStatus(selectedInquiry.id, payload);
      closeModal();
      fetchData();
    } catch (err) {
      setStatusError(err?.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Grant Admission Handler ────────────────────────────────────────────────
  const handleGrantAdmission = async (e) => {
    e.preventDefault();
    if (!grantForm.classRoomId) {
      setGrantError("Please select a classroom.");
      return;
    }
    setGrantLoading(true);
    setGrantError("");
    try {
      const payload = {
        inquiryId:       selectedInquiry.id,
        classRoomId:     Number(grantForm.classRoomId),
        section:         grantForm.section || undefined,
        admissionNumber: grantForm.admissionNumber || undefined,
      };
      const res = await admissionService.grantAdmission(payload);
      setGrantResult(res.data);
      fetchData(); // refresh table + stats
    } catch (err) {
      setGrantError(err?.response?.data?.message || "Admission grant failed. Please try again.");
    } finally {
      setGrantLoading(false);
    }
  };

  // ── Filtered inquiries (client-side search) ────────────────────────────────
  const filtered = inquiries.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.studentFirstName?.toLowerCase().includes(q) ||
      item.studentLastName?.toLowerCase().includes(q)  ||
      item.parentName?.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F0F4FF]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold text-slate-800 tracking-tight"
            >
              Admission Management
            </motion.h1>
            <p className="text-slate-500 mt-1 text-sm">Review inquiries, update status, and grant full admissions.</p>
          </div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowDirectModal(true)}
            className="flex items-center gap-2.5 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-violet-100"
          >
            <Zap size={16} />
            Walk-in Admission
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total"    value={stats.total}    icon={<Users size={20}/>}        color="indigo" />
          <StatCard title="Pending"  value={stats.pending}  icon={<Clock size={20}/>}         color="amber"  />
          <StatCard title="Approved" value={stats.approved} icon={<CheckCircle size={20}/>}   color="emerald"/>
          <StatCard title="Rejected" value={stats.rejected} icon={<XCircle size={20}/>}       color="rose"   />
        </div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
        >
          {/* Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search student or parent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Student", "Applying For", "Parent / Phone", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === "Status" || h === "Actions" ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Info size={36} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400 text-sm">No inquiries found.</p>
                    </td>
                  </tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{item.studentFirstName} {item.studentLastName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.gender} • DOB: {item.dateOfBirth}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                        {item.applyingForGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{item.parentName}</p>
                      <p className="text-xs text-blue-500 mt-0.5">{item.parentPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Process / Update Status */}
                        <button
                          onClick={() => openStatusModal(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
                        >
                          <Edit3 size={13} /> Update
                        </button>

                        {/* Grant Admission — only for APPROVED inquiries not yet converted */}
                        {item.status === "APPROVED" && !item.createdStudentId && (
                          <button
                            onClick={() => openGrantModal(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all shadow-sm shadow-indigo-200"
                          >
                            <UserPlus size={13} /> Grant
                          </button>
                        )}

                        {/* Already converted */}
                        {item.createdStudentId && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                            <BadgeCheck size={13} /> Admitted
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-700">{page + 1}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition">
                <ChevronLeft size={18} />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Update Status Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalMode === "status" && selectedInquiry && (
          <Modal onClose={closeModal}>
            <ModalHeader
              title="Update Inquiry Status"
              subtitle={`${selectedInquiry.studentFirstName} ${selectedInquiry.studentLastName}`}
              onClose={closeModal}
              icon={<Edit3 size={18} className="text-slate-600" />}
            />

            <form onSubmit={handleUpdateStatus} className="space-y-5 mt-6">
              <Field label="Decision Status">
                <div className="relative">
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl p-3 pr-9 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm font-medium"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Interview Date">
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={statusForm.interviewDate}
                    onChange={e => setStatusForm(f => ({ ...f, interviewDate: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                  />
                </div>
              </Field>

              <Field label="Reviewer Remarks">
                <textarea
                  rows={3}
                  value={statusForm.reviewerRemarks}
                  onChange={e => setStatusForm(f => ({ ...f, reviewerRemarks: e.target.value }))}
                  placeholder="Add notes or observations..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm resize-none"
                />
              </Field>

              <Field label="Admission Merit Rank" hint="Optional — if test/merit-based admission">
                <input
                  type="number"
                  min="1"
                  value={statusForm.meritRank}
                  onChange={e => setStatusForm(f => ({ ...f, meritRank: e.target.value }))}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Next Follow-up Date">
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={statusForm.nextFollowUpDate}
                      onChange={e => setStatusForm(f => ({ ...f, nextFollowUpDate: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                    />
                  </div>
                </Field>
                <Field label="Follow-up Notes">
                  <input
                    type="text"
                    value={statusForm.nextFollowUpRemarks}
                    onChange={e => setStatusForm(f => ({ ...f, nextFollowUpRemarks: e.target.value }))}
                    placeholder="e.g. Call parent again"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                  />
                </Field>
              </div>

              {statusError && <ErrorBox message={statusError} />}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={statusLoading}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-2xl font-semibold text-sm hover:bg-slate-900 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {statusLoading && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Direct Walk-in Admission Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showDirectModal && (
          <DirectAdmissionModal
            onClose={() => setShowDirectModal(false)}
            onSuccess={() => { fetchData(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Grant Admission Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalMode === "grant" && selectedInquiry && (
          <Modal onClose={closeModal} wide>
            <ModalHeader
              title="Grant Full Admission"
              subtitle={`${selectedInquiry.studentFirstName} ${selectedInquiry.studentLastName} • ${selectedInquiry.applyingForGrade}`}
              onClose={closeModal}
              icon={<GraduationCap size={18} className="text-indigo-600" />}
              accent
            />

            {/* What will happen info strip */}
            <div className="mt-5 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">This action will automatically:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <UserPlus size={14}/>,  label: "Create Student & User account" },
                  { icon: <Users size={14}/>,     label: "Create / link Parent account"  },
                  { icon: <BookOpen size={14}/>,  label: "Assign ClassRoom & Subjects"   },
                  { icon: <Wallet size={14}/>,    label: "Generate Fee record"            },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-indigo-800 font-medium">
                    <span className="text-indigo-500">{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>

            {grantResult ? (
              /* ── Success State ── */
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <BadgeCheck size={28} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Admission Granted Successfully!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Welcome emails sent to student and parent.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <ResultRow label="Student ID"       value={grantResult.studentId} />
                  <ResultRow label="Admission No."    value={grantResult.admissionNumber} />
                  <ResultRow label="Class / Section"  value={`${grantResult.grade} — ${grantResult.section}`} />
                  <ResultRow label="Subjects"         value={`${grantResult.subjectsAssigned} assigned`} />
                  <ResultRow label="Student Email"    value={grantResult.studentEmail} span />
                  <ResultRow label="Parent Email"     value={grantResult.parentEmail} span />
                  <ResultRow label="Fee Record"       value={grantResult.feeRecordCreated ? "✓ Created" : "No structure found"} />
                </div>

                <button onClick={closeModal}
                  className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition mt-2">
                  Done
                </button>
              </div>
            ) : (
              /* ── Form State ── */
              <form onSubmit={handleGrantAdmission} className="mt-6 space-y-5">
                <Field label="Classroom *" hint="Select the target class and section">
                  <select
                    value={grantForm.classRoomId}
                    onChange={e => setGrantForm(f => ({ ...f, classRoomId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                    required
                  >
                    <option value="">Select classroom</option>
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Grade {cls.grade}{cls.section ? ` - ${cls.section}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Section" hint="Optional — defaults to classroom section">
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={grantForm.section}
                      onChange={e => setGrantForm(f => ({ ...f, section: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                    />
                  </Field>

                  <Field label="Admission Number" hint="Optional — auto-generated if blank">
                    <input
                      type="text"
                      placeholder="e.g. KST2025001"
                      value={grantForm.admissionNumber}
                      onChange={e => setGrantForm(f => ({ ...f, admissionNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400/30 text-sm"
                    />
                  </Field>
                </div>

                {grantError && <ErrorBox message={grantError} />}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-sm hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={grantLoading}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-60">
                    {grantLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      : <><GraduationCap size={16} /> Grant Admission</>
                    }
                  </button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Reusable Sub-components ──────────────────────────────────────────────────

function StatCard({ title, value, icon, color }) {
  const palette = {
    indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600"  },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600"   },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600"    },
  };
  const c = palette[color] || palette.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <div className={`w-11 h-11 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-800 leading-none mt-0.5">{value ?? "—"}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    APPROVED:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED:   "bg-rose-50 text-rose-700 ring-rose-200",
    PENDING:    "bg-amber-50 text-amber-700 ring-amber-200",
    REVIEWED:   "bg-blue-50 text-blue-700 ring-blue-200",
    WAITLISTED: "bg-purple-50 text-purple-700 ring-purple-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset ${map[status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>
      {status}
    </span>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`bg-white rounded-3xl ${wide ? "w-full max-w-lg" : "w-full max-w-md"} p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, icon, accent }) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? "bg-indigo-50" : "bg-slate-100"}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition">
        <X size={18} />
      </button>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3">
      <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-rose-700 font-medium">{message}</p>
    </div>
  );
}

function ResultRow({ label, value, span }) {
  return (
    <div className={`bg-slate-50 rounded-xl p-3 border border-slate-100 ${span ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value ?? "—"}</p>
    </div>
  );
}