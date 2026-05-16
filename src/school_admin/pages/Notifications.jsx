import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import {
  Bell, Plus, X, Send, Trash2, Eye, RefreshCw,
  AlertCircle, CheckCircle2, Clock, Loader2,
  Users, GraduationCap, BookOpen, Megaphone, FileText, Calendar,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { value: "ALL",            label: "Everyone",      Icon: Users,          color: "bg-indigo-100 text-indigo-700" },
  { value: "TEACHERS",       label: "Teachers Only", Icon: BookOpen,       color: "bg-green-100 text-green-700"   },
  { value: "STUDENTS",       label: "Students Only", Icon: GraduationCap,  color: "bg-blue-100 text-blue-700"     },
  { value: "PARENTS",        label: "Parents Only",  Icon: Users,          color: "bg-orange-100 text-orange-700" },
  { value: "STAFF",          label: "All Staff",     Icon: Megaphone,      color: "bg-purple-100 text-purple-700" },
  { value: "CLASS_SPECIFIC", label: "Specific Class",Icon: GraduationCap,  color: "bg-yellow-100 text-yellow-700" },
];

const CATEGORY_OPTIONS = [
  { value: "GENERAL",  label: "General",  emoji: "📢" },
  { value: "EXAM",     label: "Exam",     emoji: "📝" },
  { value: "HOMEWORK", label: "Homework", emoji: "📖" },
  { value: "EVENT",    label: "Event",    emoji: "📅" },
  { value: "ALERT",    label: "Alert",    emoji: "🚨" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Low",    color: "border-blue-400 text-blue-700 bg-blue-50"     },
  { value: "MEDIUM", label: "Medium", color: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  { value: "HIGH",   label: "High",   color: "border-red-500 text-red-700 bg-red-50"         },
];

const PRIORITY_BORDER = {
  HIGH:   "border-l-red-500",
  MEDIUM: "border-l-yellow-400",
  LOW:    "border-l-blue-400",
};

const STATUS_CFG = {
  true:  { label: "Published",  Icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  false: { label: "Scheduled",  Icon: Clock,        color: "text-blue-600 bg-blue-50"   },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Toast hook ──────────────────────────────────────────────────────────────

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, add };
};

const TOAST_STYLE = {
  success: "bg-green-600",
  error:   "bg-red-600",
  info:    "bg-blue-600",
};

const Toasts = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`${TOAST_STYLE[t.type]} text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs`}
        >
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = () => ({
  title: "", content: "",
  audience: "ALL", priority: "MEDIUM", category: "GENERAL",
  classRoomId: "", publishDate: "", expiresDate: "", attachmentUrl: "",
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminNotifications() {
 
  const { toasts, add: toast } = useToast();

  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(blankForm());
  const [page, setPage]         = useState(0);
  const [totalPages, setTotal]  = useState(0);
  const [search, setSearch]     = useState("");
  const [classRooms, setClassRooms] = useState([]);

  // Resolve schoolId from localStorage (set during login)
  const schoolId = localStorage.getItem("schoolId") || 1;

  useEffect(() => { fetchNotices(); }, [page]);
  useEffect(() => { fetchClassRooms(); }, []);

  // create() method ke end mein add karo:


  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notice/admin", { params: { page, size: 10 } });
      const data = res.data;
      setNotices(data.content || data || []);
      setTotal(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      toast("Failed to load notices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassRooms = async () => {
    try {
      const res = await API.get("/school-admin/getClassRoom");
      setClassRooms(res.data || []);
    } catch { /* non-critical */ }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast("Title and content are required", "error");
      return;
    }
    if (form.audience === "CLASS_SPECIFIC" && !form.classRoomId) {
      toast("Please select a class for class-specific notice", "error");
      return;
    }

    setSub(true);
    try {
      const payload = {
        title:         form.title.trim(),
        content:       form.content.trim(),
        audience:      form.audience,
        priority:      form.priority,
        category:      form.category,
        classRoomId:   form.audience === "CLASS_SPECIFIC" ? Number(form.classRoomId) : null,
        publishDate:   form.publishDate  || null,
        expiresDate:   form.expiresDate  || null,
        attachmentUrl: form.attachmentUrl || null,
      };

      await API.post("/notice", payload);
      toast("Notice published successfully! ✅", "success");
      setShowForm(false);
      setForm(blankForm());
      setPage(0);
      fetchNotices();
    } catch (err) {
      console.error(err);
      toast("Failed to publish notice", "error");
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await API.delete(`/notice/${id}`);
      toast("Notice deleted", "info");
      fetchNotices();
    } catch {
      toast("Delete failed", "error");
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const filteredNotices = notices.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SchoolAdminSidebar />
      <Toasts toasts={toasts} />

      <div className="flex-1 p-6">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notice Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Push notices to teachers, students, and parents
            </p>
          </div>

          <button
            onClick={() => { setShowForm(true); setForm(blankForm()); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                       px-4 py-2.5 rounded-xl text-sm font-semibold shadow transition"
          >
            <Plus size={16} /> New Notice
          </button>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Notices",   value: notices.length,                                  color: "bg-blue-50 text-blue-700" },
            { label: "Published",       value: notices.filter((n) => n.isPublished).length,     color: "bg-green-50 text-green-700" },
            { label: "Scheduled",       value: notices.filter((n) => !n.isPublished).length,    color: "bg-orange-50 text-orange-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-75">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none
                       focus:border-blue-400 bg-white shadow-sm"
          />
        </div>

        {/* ── Notice List ──────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border-l-4 border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notices yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a notice to broadcast to your school</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((n) => {
              const border  = PRIORITY_BORDER[n.priority]  || "border-l-gray-300";
              const statCfg = STATUS_CFG[String(n.isPublished)] || STATUS_CFG["false"];
              const StatIcon = statCfg.Icon;
              const aud     = AUDIENCE_OPTIONS.find((a) => a.value === n.audience);

              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${border} p-5
                              hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800">{n.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statCfg.color}`}>
                          <StatIcon size={11} className="inline mr-0.5" />
                          {statCfg.label}
                        </span>
                        {aud && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${aud.color}`}>
                            {aud.label}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {n.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{n.content}</p>

                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>Published: {formatDate(n.publishDate)}</span>
                        {n.expiresDate && <span className="text-orange-500">Expires: {formatDate(n.expiresDate)}</span>}
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {n.viewCount ?? 0} views
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0 mt-0.5"
                      title="Delete notice"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm
                         disabled:opacity-40 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm
                         disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Create Notice Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                    <Send size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Push Notice</h2>
                    <p className="text-xs text-gray-500">Broadcast to your school community</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={set("title")}
                    placeholder="e.g. Staff Meeting Tomorrow at 10 AM"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>  

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notice Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={set("content")}
                    placeholder="Write the full notice here..."
                    rows={4}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none"
                  />
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Send To <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AUDIENCE_OPTIONS.map((a) => {
                      const AIcon = a.Icon;
                      return (
                        <button
                          key={a.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, audience: a.value }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm
                                      font-medium transition text-left
                                      ${form.audience === a.value
                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                        : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                        >
                          <AIcon size={14} />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Class selector — only if CLASS_SPECIFIC */}
                {form.audience === "CLASS_SPECIFIC" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.classRoomId}
                      onChange={set("classRoomId")}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none
                                 focus:border-blue-400"
                    >
                      <option value="">-- Select Class --</option>
                      {classRooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          Grade {c.grade} - {c.section}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Priority + Category row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition
                                      ${form.priority === p.value ? p.color : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={set("category")}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none
                                 focus:border-blue-400"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.emoji} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      value={form.publishDate}
                      onChange={set("publishDate")}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none
                                 focus:border-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank = publish now</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={form.expiresDate}
                      onChange={set("expiresDate")}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none
                                 focus:border-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank = never expires</p>
                  </div>
                </div>

                {/* Attachment URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attachment URL (optional)
                  </label>
                  <input
                    value={form.attachmentUrl}
                    onChange={set("attachmentUrl")}
                    placeholder="https://..."
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none
                               focus:border-blue-400"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                             text-white font-semibold py-3 rounded-xl flex items-center
                             justify-center gap-2 transition"
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                    : <><Send size={16} /> Publish Notice</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}