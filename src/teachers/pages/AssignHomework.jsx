import { useState, useEffect, useCallback } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API, { getClassrooms } from "../../common/services/api";
import { homeworkService } from "../services/teacherService";
import {
  BookOpen, Trash2, Upload, X, Plus, Bell,
  BarChart2, Users, Eye, CheckCircle, AlertTriangle,
  Loader2, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB hard limit (matches backend)

const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "jpg", "jpeg", "png", "gif", "webp", "txt", "zip", "rar",
];

// ─── File helpers ─────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024)      return `${bytes} B`;
  if (bytes < 1048576)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function validateFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}" — file type .${ext} is not allowed.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" — ${formatBytes(file.size)} exceeds the 5 MB limit.`;
  }
  return null; // valid
}

// ─── Notification Stats Modal ─────────────────────────────────────────────────

function NotificationStatsModal({ homework, onClose }) {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load summary stats on open
  useEffect(() => {
    setLoading(true);
    setError(null);
    homeworkService
      .getNotificationStats(homework.id, false)
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load notification stats."))
      .finally(() => setLoading(false));
  }, [homework.id]);

  // Load per-parent detail when user expands
  const loadDetail = useCallback(() => {
    if (stats?.recipients) { setShowDetail(true); return; }
    setDetailLoading(true);
    homeworkService
      .getNotificationStats(homework.id, true)
      .then((res) => { setStats(res.data); setShowDetail(true); })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [homework.id, stats]);

  const metric = (label, value, color, icon) => (
    <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-1 min-w-0">
      <span className={`text-2xl font-bold ${color}`}>{value ?? "—"}</span>
      <span className="text-xs text-gray-500 text-center">{label}</span>
      <span className={`mt-1 ${color} opacity-60`}>{icon}</span>
    </div>
  );

  const progressBar = (label, value, total, colorClass) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{label}</span>
          <span className="font-semibold">{value}/{total} &nbsp;({pct}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <Bell size={18} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                Notification Stats
              </p>
              <p className="text-xs text-gray-400 truncate">
                {homework.title} · {homework.grade}-{homework.section}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin text-blue-500" size={36} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {metric("Sent to Parents",  stats.totalDispatched, "text-gray-700",  <Users size={16} />)}
                {metric("Delivered",        stats.totalDelivered,  "text-blue-600",  <Bell size={16} />)}
                {metric(`Seen (${stats.seenRate ?? 0}%)`, stats.totalSeen, "text-amber-600", <Eye size={16} />)}
                {metric(`Read (${stats.readRate ?? 0}%)`, stats.totalRead, "text-green-600", <CheckCircle size={16} />)}
              </div>

              {/* Engagement funnel */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Engagement funnel
                </p>
                {progressBar("Delivered",  stats.totalDelivered, stats.totalDispatched, "bg-blue-500")}
                {progressBar("Seen",       stats.totalSeen,      stats.totalDispatched, "bg-amber-400")}
                {progressBar("Read",       stats.totalRead,      stats.totalDispatched, "bg-green-500")}
              </div>

              {/* Per-parent detail toggle */}
              <button
                onClick={showDetail ? () => setShowDetail(false) : loadDetail}
                disabled={detailLoading}
                className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 mb-3 disabled:opacity-50"
              >
                {detailLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                }
                {showDetail ? "Hide" : "Show"} per-parent detail
              </button>

              {/* Detail table */}
              {showDetail && stats.recipients && stats.recipients.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">#</th>
                        <th className="px-3 py-2 text-center font-semibold">Delivered</th>
                        <th className="px-3 py-2 text-center font-semibold">Seen</th>
                        <th className="px-3 py-2 text-center font-semibold">Read</th>
                        <th className="px-3 py-2 text-left font-semibold">Read at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recipients.map((r, i) => (
                        <tr key={r.userId} className="border-t">
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2 text-center">
                            {r.delivered
                              ? <CheckCircle size={13} className="text-blue-500 mx-auto" />
                              : <X size={13} className="text-gray-300 mx-auto" />}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {r.seen
                              ? <CheckCircle size={13} className="text-amber-500 mx-auto" />
                              : <X size={13} className="text-gray-300 mx-auto" />}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {r.read
                              ? <CheckCircle size={13} className="text-green-500 mx-auto" />
                              : <X size={13} className="text-gray-300 mx-auto" />}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {r.readAt
                              ? new Date(r.readAt).toLocaleString("en-IN", {
                                  day: "2-digit", month: "short",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showDetail && (!stats.recipients || stats.recipients.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4">
                  No recipient data available.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssignHomework() {
  const [classrooms,       setClassrooms]       = useState([]);
  const [subjects,         setSubjects]         = useState([]);
  const [homeworkList,     setHomeworkList]      = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [fetchingHomework, setFetchingHomework] = useState(true);
  const [files,            setFiles]            = useState([]);
  const [fileErrors,       setFileErrors]       = useState([]);   // per-file validation msgs
  const [activeTab,        setActiveTab]        = useState("assign");
  const [successInfo,      setSuccessInfo]      = useState(null); // { title, classInfo }
  const [statsModal,       setStatsModal]       = useState(null); // homework object for modal

  const [formData, setFormData] = useState({
    classroomId: "",
    subjectId:   "",
    title:       "",
    description: "",
    dueDate:     "",
    maxMarks:    "",
  });

  // ── Load classrooms & homework on mount ────────────────────────────────────
  useEffect(() => {
    getClassrooms()
      .then((data) => setClassrooms(data?.content || data || []))
      .catch((err) => console.error("Error fetching classrooms:", err));
    fetchHomeworkHistory();
  }, []);

  const handleClassroomChange = (e) => {
    const id  = e.target.value;
    const cls = classrooms.find((c) => String(c.id) === String(id));
    setFormData({ ...formData, classroomId: id, subjectId: "" });
    setSubjects(cls?.subjects || []);
  };

  const fetchHomeworkHistory = async () => {
    setFetchingHomework(true);
    try {
      const res = await API.get("/homework/by-teacher");
      setHomeworkList(res.data || []);
    } catch (err) {
      console.error("Error fetching homework history:", err);
    } finally {
      setFetchingHomework(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── File selection with 5 MB validation ───────────────────────────────────
  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files);
    const errs     = [];
    const valid    = [];

    incoming.forEach((f) => {
      const msg = validateFile(f);
      if (msg) errs.push(msg);
      else     valid.push(f);
    });

    setFileErrors(errs);
    // Prevent duplicate file names
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const deduped = valid.filter((f) => !existingNames.has(f.name));
      return [...prev, ...deduped];
    });
    e.target.value = ""; // reset so same file can be re-selected after removal
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileErrors([]);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.classroomId || !formData.subjectId || !formData.title || !formData.dueDate) {
      alert("Please fill all required fields ⚠️");
      return;
    }
    if (fileErrors.length > 0) {
      alert("Remove invalid files before submitting.");
      return;
    }

    const cls = classrooms.find((c) => String(c.id) === String(formData.classroomId));
    const classInfo = cls ? `${cls.grade}-${cls.section}` : "";

    setLoading(true);
    try {
      if (files.length > 0) {
        const fd = new FormData();
        fd.append("title",       formData.title);
        fd.append("description", formData.description);
        fd.append("classroomId", formData.classroomId);
        fd.append("subjectId",   formData.subjectId);
        fd.append("dueDate",     formData.dueDate);
        if (formData.maxMarks) fd.append("maxMarks", formData.maxMarks);
        files.forEach((f) => fd.append("files", f));

        await homeworkService.createWithFiles(fd);
      } else {
        await homeworkService.create({
          title:       formData.title,
          description: formData.description,
          classroomId: Number(formData.classroomId),
          subjectId:   Number(formData.subjectId),
          dueDate:     formData.dueDate,
          maxMarks:    formData.maxMarks ? Number(formData.maxMarks) : null,
        });
      }

      // Show success banner with notification dispatch info
      setSuccessInfo({ title: formData.title, classInfo });

      // Reset form
      setFormData({ classroomId: "", subjectId: "", title: "", description: "", dueDate: "", maxMarks: "" });
      setFiles([]);
      setFileErrors([]);

      await fetchHomeworkHistory();
      setActiveTab("history");

      // Auto-dismiss the success banner after 6 seconds
      setTimeout(() => setSuccessInfo(null), 6000);
    } catch (err) {
      console.error("Error assigning homework:", err);
      const msg = err?.response?.data?.message || "Failed to assign homework ❌";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework and all its attachments?")) return;
    try {
      await homeworkService.delete(id);
      setHomeworkList(homeworkList.filter((h) => h.id !== id));
    } catch {
      alert("Failed to delete ❌");
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
  const isOverdue  = (d) => d && new Date(d) < new Date();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Homework Manager</h2>
        </div>

        {/* ── Success Banner ──────────────────────────────────────────────── */}
        {successInfo && (
          <div className="flex items-start justify-between gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-5">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 text-sm">
                  Homework assigned successfully!
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  <strong>"{successInfo.title}"</strong> for Class{" "}
                  <strong>{successInfo.classInfo}</strong> has been saved.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-green-700 text-xs">
                  <Bell size={12} />
                  <span>
                    Push notification dispatched to all parents in this classroom.
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSuccessInfo(null)}
              className="text-green-400 hover:text-green-600 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["assign", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              {tab === "assign" ? "Assign Homework" : "My Homework"}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ASSIGN TAB                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "assign" && (
          <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              New Homework Assignment
            </h3>

            {/* Classroom + Subject */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Classroom *</label>
                <select
                  name="classroomId"
                  value={formData.classroomId}
                  onChange={handleClassroomChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject *</label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  disabled={!subjects.length}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subjectName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Title *</label>
              <input
                type="text" name="title" placeholder="e.g. Chapter 3 Exercise"
                value={formData.title} onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                name="description" placeholder="Homework instructions..."
                value={formData.description} onChange={handleChange}
                rows={4}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Due Date + Max Marks */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Date *</label>
                <input
                  type="date" name="dueDate" value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Marks</label>
                <input
                  type="number" name="maxMarks" placeholder="e.g. 10"
                  value={formData.maxMarks} onChange={handleChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* File Upload — 5 MB limit ──────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-600">
                  Attachments{" "}
                  <span className="text-gray-400 text-xs">(optional — max 5 MB per file)</span>
                </label>
              </div>

              <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 px-4 py-3 rounded cursor-pointer hover:border-blue-400 transition">
                <Upload size={18} className="text-gray-400" />
                <span className="text-gray-500 text-sm">
                  Click to upload (PDF, Images, Word, Excel… — max 5 MB each)
                </span>
                <input
                  type="file" multiple className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar"
                />
              </label>

              {/* Per-file validation errors */}
              {fileErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fileErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Valid selected files */}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-gray-50 border border-gray-100 px-3 py-1.5 rounded text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate max-w-xs text-gray-700">{f.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatBytes(f.size)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notification hint */}
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
              <Bell size={13} />
              <span>
                Parents of all students in the selected classroom will automatically
                receive a push notification when homework is assigned.
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || fileErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Assigning...</>
              ) : (
                <><Plus size={16} /> Assign Homework</>
              )}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HISTORY TAB                                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Table header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-700">
                {homeworkList.length} homework record{homeworkList.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={fetchHomeworkHistory}
                disabled={fetchingHomework}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition disabled:opacity-40"
              >
                <RefreshCw size={13} className={fetchingHomework ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {fetchingHomework ? (
              <div className="flex justify-center items-center py-16 gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-sm">Loading...</span>
              </div>
            ) : homeworkList.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No homework assigned yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Assigned</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-center">Marks</th>
                      <th className="px-4 py-3 text-center">Files</th>
                      {/* NEW column — notification stats */}
                      <th className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Bell size={12} />
                          <span>Notif. Stats</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {homeworkList.map((hw) => (
                      <tr key={hw.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px]">
                          <span className="line-clamp-2">{hw.title}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {hw.grade} - {hw.section}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{hw.subjectName}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(hw.assignedDate)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${
                              isOverdue(hw.dueDate) ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {formatDate(hw.dueDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">
                          {hw.maxMarks ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-semibold rounded-full w-6 h-6">
                            {hw.attachments?.length ?? 0}
                          </span>
                        </td>

                        {/* Stats button — NEW */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setStatsModal(hw)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition font-medium"
                            title="View notification engagement stats"
                          >
                            <BarChart2 size={13} />
                            Stats
                          </button>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(hw.id)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Stats Modal */}
      {statsModal && (
        <NotificationStatsModal
          homework={statsModal}
          onClose={() => setStatsModal(null)}
        />
      )}
    </div>
  );
}
