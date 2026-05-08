import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import {
  Search, Plus, X, ChevronLeft, ChevronRight,
  Calendar, Clock, Send, XCircle, CheckCircle2,
  Users, GraduationCap, BookOpen,
  RefreshCw, AlertCircle, Loader2,
  MoreVertical, Ban, Pencil,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_ID = 1; // Replace with value from auth context

const EVENT_TYPES = [
  { value: "GENERAL",          label: "General" },
  { value: "TRIP",             label: "Trip" },
  { value: "LAB_SESSION",      label: "Lab Session" },
  { value: "INDUSTRIAL_VISIT", label: "Industrial Visit" },
  { value: "SPORTS",           label: "Sports" },
  { value: "CULTURAL",         label: "Cultural" },
  { value: "EXAM",             label: "Exam" },
  { value: "MEETING",          label: "Meeting" },
  { value: "HOLIDAY",          label: "Holiday" },
  { value: "OTHER",            label: "Other" },
];

const EVENT_TYPE_EMOJI = {
  GENERAL: "📢", TRIP: "🚌", LAB_SESSION: "🔬",
  INDUSTRIAL_VISIT: "🏭", SPORTS: "🏆", CULTURAL: "🎭",
  EXAM: "📝", MEETING: "🤝", HOLIDAY: "🎉", OTHER: "📌",
};

const STATUS_CONFIG = {
  SCHEDULED: { label: "Scheduled", bg: "bg-blue-50",   text: "text-blue-700",  ring: "ring-blue-700/10",  Icon: Clock },
  NOTIFIED:  { label: "Notified",  bg: "bg-green-50",  text: "text-green-700", ring: "ring-green-700/10", Icon: CheckCircle2 },
  COMPLETED: { label: "Completed", bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-500/10", Icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-600",   ring: "ring-red-600/10",   Icon: Ban },
};

const STATUS_TABS = ["ALL", "SCHEDULED", "NOTIFIED", "COMPLETED", "CANCELLED"];

const toLocalDT = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const isoToLocalDT = (isoStr) => {
  if (!isoStr) return toLocalDT(new Date(Date.now() + 86400000));
  const d = new Date(isoStr);
  return toLocalDT(d);
};

const fmt = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Toast ────────────────────────────────────────────────────────────────────

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
};

const Toasts = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div key={t.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            ${t.type === "success" ? "bg-green-600 text-white"
            : t.type === "error"   ? "bg-red-600 text-white"
            : "bg-slate-800 text-white"}`}
        >
          {t.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
            <X size={13} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Confirm Dialog (with optional cancel reason textarea) ────────────────────

const ConfirmDialog = ({
  open, title, message, confirmLabel, danger,
  onConfirm, onCancel,
  showReasonInput, reasonValue, onReasonChange,
}) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-indigo-50"}`}>
            <AlertCircle size={22} className={danger ? "text-red-500" : "text-indigo-500"} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 mb-4">{message}</p>

          {/* Optional reason textarea — shown only for cancel action */}
          {showReasonInput && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason{" "}
                <span className="normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="e.g. Venue unavailable, rescheduling to next week..."
                value={reasonValue}
                onChange={(e) => onReasonChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none
                  resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400
                  hover:border-slate-300 transition-all placeholder:text-slate-300 text-slate-700"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {(reasonValue || "").length}/500
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              Back
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition shadow-sm
                ${danger
                  ? "bg-red-600 hover:bg-red-700 shadow-red-100"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── Event Detail Modal ───────────────────────────────────────────────────────

const DetailModal = ({ event, onClose, onCancelFromDetail, onEditFromDetail }) => {
  if (!event) return null;
  const s = STATUS_CONFIG[event.status] || STATUS_CONFIG.SCHEDULED;

  // SCHEDULED → can edit + cancel | NOTIFIED → can cancel only
  const isEditable    = event.status === "SCHEDULED";
  const isCancellable = event.status === "SCHEDULED" || event.status === "NOTIFIED";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
        >
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{EVENT_TYPE_EMOJI[event.eventType] || "📌"}</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{event.title}</h2>
                <p className="text-xs text-slate-400">EVT-{event.id} · {event.createdByEmail}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Event Date",    value: fmt(event.eventDate) },
                { label: "Notify At",     value: fmt(event.notifyAt) },
                { label: "Venue",         value: event.venue || "—" },
                { label: "Notify Before", value: `${event.notifyBeforeHours}h before` },
                { label: "Scope",         value: event.scope === "SCHOOL_WIDE" ? "School Wide" : "Class Wise" },
                {
                  label: "Status",
                  value: (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
                      <s.Icon size={11} /> {s.label}
                    </span>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <div className="font-semibold text-slate-700">{value}</div>
                </div>
              ))}
              {event.scope === "CLASS_WISE" && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Class IDs</p>
                  <p className="font-semibold text-slate-700">{event.targetClassIds?.join(", ") || "—"}</p>
                </div>
              )}
              {event.attachmentUrl && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Attachment</p>
                  <a href={event.attachmentUrl} target="_blank" rel="noreferrer"
                    className="text-indigo-600 underline text-xs font-semibold">View File</a>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-3">Notification Recipients</p>
              <div className="flex gap-3">
                {[
                  ["Teachers", event.notifyTeachers],
                  ["Parents",  event.notifyParents],
                  ["Students", event.notifyStudents],
                ].map(([label, active]) => (
                  <span key={label}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
                      ${active
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-700/10"
                        : "bg-slate-100 text-slate-400 ring-slate-500/10 line-through"}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 font-semibold mb-1">Emails Sent</p>
                <p className="text-2xl font-extrabold text-green-700">{event.emailsSent}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-500 font-semibold mb-1">Emails Failed</p>
                <p className="text-2xl font-extrabold text-red-600">{event.emailsFailed}</p>
              </div>
            </div>

            {event.description && (
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Description</p>
                <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Footer — Edit for SCHEDULED, Cancel for SCHEDULED + NOTIFIED */}
          {(isEditable || isCancellable) && (
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              {isEditable && (
                <button
                  onClick={() => { onClose(); onEditFromDetail(event); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 transition"
                >
                  <Pencil size={15} /> Edit Event
                </button>
              )}
              {isCancellable && (
                <button
                  onClick={() => { onClose(); onCancelFromDetail(event.id, event.title); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
                >
                  <XCircle size={15} /> Cancel This Event
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Shared Form Fields ───────────────────────────────────────────────────────

const inpCls = (err) =>
  `w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all
   focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
   ${err ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"}`;

const Field = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    {children}
    {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ─── EventFormModal (shared by Create + Edit) ─────────────────────────────────

const BLANK_FORM = {
  title: "", description: "", eventType: "GENERAL", scope: "SCHOOL_WIDE",
  eventDate: toLocalDT(new Date(Date.now() + 86400000)),
  notifyBeforeHours: 0, venue: "", attachmentUrl: "",
  notifyTeachers: true, notifyParents: true, notifyStudents: true,
  targetClassIds: "",
};

const eventToForm = (ev) => ({
  title:             ev.title             ?? "",
  description:       ev.description       ?? "",
  eventType:         ev.eventType         ?? "GENERAL",
  scope:             ev.scope             ?? "SCHOOL_WIDE",
  eventDate:         isoToLocalDT(ev.eventDate),
  notifyBeforeHours: ev.notifyBeforeHours ?? 0,
  venue:             ev.venue             ?? "",
  attachmentUrl:     ev.attachmentUrl     ?? "",
  notifyTeachers:    ev.notifyTeachers    ?? true,
  notifyParents:     ev.notifyParents     ?? true,
  notifyStudents:    ev.notifyStudents    ?? true,
  targetClassIds:    Array.isArray(ev.targetClassIds)
                       ? ev.targetClassIds.join(", ")
                       : (ev.targetClassIds ?? ""),
});

const EventFormModal = ({ mode = "create", initialData = null, onClose, onSaved }) => {
  const isEdit = mode === "edit";

  const [form, setForm]             = useState(isEdit && initialData ? eventToForm(initialData) : BLANK_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())      e.title = "Title is required";
    if (form.title.length > 200) e.title = "Max 200 characters";
    if (!form.eventDate)         e.eventDate = "Required";
    else if (!isEdit && new Date(form.eventDate) <= new Date())
                                 e.eventDate = "Must be in the future";
    if (Number(form.notifyBeforeHours) < 0) e.notifyBeforeHours = "Must be ≥ 0";
    if (form.scope === "CLASS_WISE" && !form.targetClassIds.trim())
                                 e.targetClassIds = "Required for Class Wise";
    return e;
  };

  const buildPayload = () => ({
    title:             form.title.trim(),
    description:       form.description.trim() || undefined,
    eventType:         form.eventType,
    scope:             form.scope,
    eventDate:         new Date(form.eventDate).toISOString().slice(0, 19),
    notifyBeforeHours: Number(form.notifyBeforeHours),
    venue:             form.venue.trim() || undefined,
    attachmentUrl:     form.attachmentUrl.trim() || undefined,
    notifyTeachers:    form.notifyTeachers,
    notifyParents:     form.notifyParents,
    notifyStudents:    form.notifyStudents,
    targetClassIds:    form.scope === "CLASS_WISE"
      ? form.targetClassIds.split(",").map((s) => Number(s.trim())).filter(Boolean)
      : undefined,
  });

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await API.put(`/events/school/${SCHOOL_ID}/${initialData.id}`, buildPayload());
      } else {
        res = await API.post(`/events/school/${SCHOOL_ID}`, buildPayload());
      }
      onSaved(res.data);
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} event` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              {isEdit ? (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Editing</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Edit Event</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EVT-{initialData?.id} · Only SCHEDULED events can be edited
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-800">Create New Event</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Schedule event and configure email notifications</p>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {errors.submit && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} /> {errors.submit}
              </div>
            )}

            <Field label="Event Title *" error={errors.title}>
              <input type="text" placeholder="e.g. Annual Sports Day"
                value={form.title} onChange={(e) => set("title", e.target.value)}
                className={inpCls(errors.title)} maxLength={200} />
            </Field>

            <Field label="Description">
              <textarea placeholder="Brief description of the event..."
                value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={3} className={inpCls()} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Event Type *" error={errors.eventType}>
                <select value={form.eventType} onChange={(e) => set("eventType", e.target.value)} className={inpCls(errors.eventType)}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Scope *" error={errors.scope}>
                <select value={form.scope} onChange={(e) => set("scope", e.target.value)} className={inpCls(errors.scope)}>
                  <option value="SCHOOL_WIDE">School Wide</option>
                  <option value="CLASS_WISE">Class Wise</option>
                </select>
              </Field>
            </div>

            {form.scope === "CLASS_WISE" && (
              <Field label="Target Class IDs *" error={errors.targetClassIds} hint="Comma-separated e.g. 1, 2, 5">
                <input type="text" placeholder="1, 2, 5"
                  value={form.targetClassIds} onChange={(e) => set("targetClassIds", e.target.value)}
                  className={inpCls(errors.targetClassIds)} />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Event Date & Time *" error={errors.eventDate}>
                <input type="datetime-local" value={form.eventDate}
                  onChange={(e) => set("eventDate", e.target.value)}
                  className={inpCls(errors.eventDate)} />
              </Field>
              <Field label="Notify Before (hours)" error={errors.notifyBeforeHours} hint="0 = notify immediately on creation">
                <input type="number" min={0} value={form.notifyBeforeHours}
                  onChange={(e) => set("notifyBeforeHours", e.target.value)}
                  className={inpCls(errors.notifyBeforeHours)} />
              </Field>
            </div>

            <Field label="Venue">
              <input type="text" placeholder="e.g. School Ground, Room 101"
                value={form.venue} onChange={(e) => set("venue", e.target.value)}
                className={inpCls()} />
            </Field>

            <Field label="Attachment URL">
              <input type="url" placeholder="https://..."
                value={form.attachmentUrl} onChange={(e) => set("attachmentUrl", e.target.value)}
                className={inpCls()} />
            </Field>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Notification Recipients</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "notifyTeachers", label: "Teachers", Icon: GraduationCap },
                  { key: "notifyParents",  label: "Parents",  Icon: Users },
                  { key: "notifyStudents", label: "Students", Icon: BookOpen },
                ].map(({ key, label, Icon }) => (
                  <button key={key} type="button" onClick={() => set(key, !form[key])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                      ${form[key]
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"}`}
                  >
                    <Icon size={14} /> {label}
                    {form[key] && <CheckCircle2 size={13} className="text-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-100 justify-end">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition disabled:opacity-60
                ${isEdit
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"}`}
            >
              {submitting
                ? <Loader2 size={15} className="animate-spin" />
                : isEdit ? <Pencil size={15} /> : <Plus size={15} />
              }
              {submitting
                ? (isEdit ? "Saving..." : "Creating...")
                : (isEdit ? "Save Changes" : "Create Event")
              }
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Action Button ────────────────────────────────────────────────────────────

const ActionBtn = ({ onClick, loading, title, cls, icon }) => (
  <button onClick={onClick} disabled={loading} title={title}
    className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${cls}`}>
    {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventManagement() {
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [filterStatus, setFilterStatus]   = useState("ALL");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(0);
  const itemsPerPage                      = 10;

  const [showCreate, setShowCreate]       = useState(false);
  const [editEvent, setEditEvent]         = useState(null);
  const [detailEvent, setDetailEvent]     = useState(null);
  const [confirm, setConfirm]             = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Kept outside confirm object so the onConfirm closure reads latest typed value
  const [cancelReason, setCancelReason]   = useState("");

  const { toasts, add: toast, remove: removeToast } = useToast();

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered   = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    `evt-${e.id}`.includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated  = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const stats = {
    total:      events.length,
    scheduled:  events.filter((e) => e.status === "SCHEDULED").length,
    notified:   events.filter((e) => e.status === "NOTIFIED").length,
    emailsSent: events.reduce((a, e) => a + (e.emailsSent || 0), 0),
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const url = filterStatus === "ALL"
        ? `/events/school/${SCHOOL_ID}`
        : `/events/school/${SCHOOL_ID}/by-status?status=${filterStatus}`;
      const res = await API.get(url);
      setEvents(res.data);
      setPage(0);
    } catch {
      toast("Failed to load events", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDispatch = (id) => setConfirm({
    title: "Dispatch Emails Now?",
    message: "This will immediately send email notifications to all targeted recipients. This cannot be undone.",
    confirmLabel: "Dispatch",
    danger: false,
    showReasonInput: false,
    onConfirm: async () => {
      setConfirm(null);
      setActionLoading((p) => ({ ...p, [id]: "dispatch" }));
      try {
        const res = await API.post(`/events/school/${SCHOOL_ID}/${id}/dispatch-now`);
        setEvents((p) => p.map((e) => (e.id === id ? res.data : e)));
        toast("Emails dispatched successfully!", "success");
      } catch (err) {
        toast(err?.response?.data?.message || "Dispatch failed", "error");
      } finally {
        setActionLoading((p) => ({ ...p, [id]: null }));
      }
    },
  });

  const handleCancel = (id, title) => {
    setCancelReason(""); // fresh slate every time dialog opens
    setConfirm({
      title: "Cancel Event?",
      message: `Are you sure you want to cancel "${title}"? This cannot be undone.`,
      confirmLabel: "Yes, Cancel Event",
      danger: true,
      showReasonInput: true,
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading((p) => ({ ...p, [id]: "cancel" }));
        try {
          // Send body only when a reason was typed.
          // Matches @RequestBody(required = false) on the Spring PATCH endpoint.
          const trimmed = cancelReason.trim();
          const payload = trimmed ? { reason: trimmed } : undefined;
          const res = await API.patch(`/events/school/${SCHOOL_ID}/${id}/cancel`, payload);
          setEvents((p) => p.map((e) => (e.id === id ? res.data : e)));
          toast("Event has been cancelled.", "info");
        } catch (err) {
          toast(err?.response?.data?.message || "Failed to cancel event", "error");
        } finally {
          setActionLoading((p) => ({ ...p, [id]: null }));
          setCancelReason("");
        }
      },
    });
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEditOpen = async (event) => {
    try {
      const res = await API.get(`/events/school/${SCHOOL_ID}/${event.id}`);
      setEditEvent(res.data);
    } catch {
      setEditEvent(event);
    }
  };

  const handleEdited = (updatedEvent) => {
    setEditEvent(null);
    setEvents((p) => p.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    toast("Event updated successfully!", "success");
  };

  const handleViewDetail = async (event) => {
    try {
      const res = await API.get(`/events/school/${SCHOOL_ID}/${event.id}`);
      setDetailEvent(res.data);
    } catch {
      setDetailEvent(event);
    }
  };

  const handleCreated = (newEvent) => {
    setShowCreate(false);
    setEvents((p) => [newEvent, ...p]);
    toast("Event created successfully!", "success");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold text-slate-800 tracking-tight"
            >
              Event Management
            </motion.h1>
            <p className="text-slate-500 mt-1">Schedule events and manage automated email notifications.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchEvents(true)} disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
            >
              <Plus size={18} /> Create Event
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events", value: stats.total,                      icon: <Calendar size={20} />,     color: "bg-indigo-50 text-indigo-600" },
            { label: "Scheduled",    value: stats.scheduled,                   icon: <Clock size={20} />,        color: "bg-amber-50 text-amber-600"   },
            { label: "Notified",     value: stats.notified,                    icon: <CheckCircle2 size={20} />, color: "bg-green-50 text-green-600"   },
            { label: "Emails Sent",  value: stats.emailsSent.toLocaleString(), icon: <Send size={20} />,         color: "bg-blue-50 text-blue-600"     },
          ].map(({ label, value, icon, color }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* TOOLBAR */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text" placeholder="Search by title or EVT-ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {STATUS_TABS.map((s) => (
                <button key={s}
                  onClick={() => { setFilterStatus(s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${filterStatus === s
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                >
                  {s === "ALL" ? "All" : (STATUS_CONFIG[s]?.label || s)}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["Event", "Type", "Event Date", "Notify At", "Emails", "Status", "Actions"].map((h) => (
                    <th key={h}
                      className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider
                        ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">

                {/* Loading skeleton */}
                {loading && [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Empty state */}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Calendar size={48} className="mb-2" />
                        <p className="text-lg font-medium text-slate-600">No events found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting filters or create a new event</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Event rows */}
                {!loading && paginated.map((event) => {
                  const s             = STATUS_CONFIG[event.status] || STATUS_CONFIG.SCHEDULED;
                  const acting        = actionLoading[event.id];
                  const isScheduled   = event.status === "SCHEDULED";
                  // Cancel button shows for both SCHEDULED and NOTIFIED
                  const isCancellable = event.status === "SCHEDULED" || event.status === "NOTIFIED";

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors group">

                      <td className="px-6 py-4">
                        <button onClick={() => handleViewDetail(event)} className="text-left">
                          <p className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">EVT-{event.id}</p>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <span>{EVENT_TYPE_EMOJI[event.eventType]}</span>
                          <span>{EVENT_TYPES.find((t) => t.value === event.eventType)?.label || event.eventType}</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          {event.scope === "SCHOOL_WIDE" ? "School Wide" : "Class Wise"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {fmt(event.eventDate)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {fmt(event.notifyAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs font-semibold">
                          <span className="text-green-600">✓ {event.emailsSent}</span>
                          {event.emailsFailed > 0 && (
                            <span className="text-red-500">✗ {event.emailsFailed}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
                          <s.Icon size={11} /> {s.label}
                        </span>
                      </td>

                      {/* ── ACTIONS ── */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-1">

                          {/* Dispatch Now — SCHEDULED only */}
                          {isScheduled && (
                            <ActionBtn
                              onClick={() => handleDispatch(event.id)}
                              loading={acting === "dispatch"}
                              title="Dispatch Now"
                              cls="text-indigo-600 hover:bg-indigo-50"
                              icon={<Send size={15} />}
                            />
                          )}

                          {/* Edit — SCHEDULED only */}
                          {isScheduled && (
                            <ActionBtn
                              onClick={() => handleEditOpen(event)}
                              loading={acting === "edit"}
                              title="Edit Event"
                              cls="text-amber-500 hover:bg-amber-50"
                              icon={<Pencil size={15} />}
                            />
                          )}

                          {/* Cancel — SCHEDULED or NOTIFIED */}
                          {isCancellable && (
                            <ActionBtn
                              onClick={() => handleCancel(event.id, event.title)}
                              loading={acting === "cancel"}
                              title="Cancel Event"
                              cls="text-red-500 hover:bg-red-50"
                              icon={<XCircle size={15} />}
                            />
                          )}

                          {/* View Details — always */}
                          <ActionBtn
                            onClick={() => handleViewDetail(event)}
                            title="View Details"
                            cls="text-slate-400 hover:bg-slate-100"
                            icon={<MoreVertical size={15} />}
                          />

                        </div>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">{paginated.length}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
              events
              {filterStatus !== "ALL" && ` · ${STATUS_CONFIG[filterStatus]?.label}`}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
                      ${page === i
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "hover:bg-slate-100 text-slate-600"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── MODALS ── */}
      {showCreate && (
        <EventFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={handleCreated}
        />
      )}

      {editEvent && (
        <EventFormModal
          mode="edit"
          initialData={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={handleEdited}
        />
      )}

      {detailEvent && (
        <DetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onCancelFromDetail={(id, title) => handleCancel(id, title)}
          onEditFromDetail={(ev) => { setDetailEvent(null); handleEditOpen(ev); }}
        />
      )}

      {/* ConfirmDialog — wired with cancelReason for the optional reason textarea */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        showReasonInput={confirm?.showReasonInput}
        reasonValue={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={confirm?.onConfirm}
        onCancel={() => {
          setConfirm(null);
          setCancelReason(""); // clean up on back/dismiss
        }}
      />

      <Toasts toasts={toasts} remove={removeToast} />
    </div>
  );
}
 
// import { useEffect, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import API from "../../common/services/api";
// import {
//   Search, Plus, X, ChevronLeft, ChevronRight,
//   Calendar, Clock, Send, XCircle, CheckCircle2,
//   Users, GraduationCap, BookOpen,
//   RefreshCw, AlertCircle, Loader2,
//   MoreVertical, Ban,
// } from "lucide-react";

// // ─── Constants ────────────────────────────────────────────────────────────────

// const SCHOOL_ID = 1; // Replace with value from auth context

// const EVENT_TYPES = [
//   { value: "GENERAL",          label: "General" },
//   { value: "TRIP",             label: "Trip" },
//   { value: "LAB_SESSION",      label: "Lab Session" },
//   { value: "INDUSTRIAL_VISIT", label: "Industrial Visit" },
//   { value: "SPORTS",           label: "Sports" },
//   { value: "CULTURAL",         label: "Cultural" },
//   { value: "EXAM",             label: "Exam" },
//   { value: "MEETING",          label: "Meeting" },
//   { value: "HOLIDAY",          label: "Holiday" },
//   { value: "OTHER",            label: "Other" },
// ];

// const EVENT_TYPE_EMOJI = {
//   GENERAL: "📢", TRIP: "🚌", LAB_SESSION: "🔬",
//   INDUSTRIAL_VISIT: "🏭", SPORTS: "🏆", CULTURAL: "🎭",
//   EXAM: "📝", MEETING: "🤝", HOLIDAY: "🎉", OTHER: "📌",
// };

// const STATUS_CONFIG = {
//   SCHEDULED: { label: "Scheduled", bg: "bg-blue-50",   text: "text-blue-700",  ring: "ring-blue-700/10",  Icon: Clock },
//   NOTIFIED:  { label: "Notified",  bg: "bg-green-50",  text: "text-green-700", ring: "ring-green-700/10", Icon: CheckCircle2 },
//   COMPLETED: { label: "Completed", bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-500/10", Icon: CheckCircle2 },
//   CANCELLED: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-600",   ring: "ring-red-600/10",   Icon: Ban },
// };

// const STATUS_TABS = ["ALL", "SCHEDULED", "NOTIFIED", "COMPLETED", "CANCELLED"];

// const toLocalDT = (d = new Date()) => {
//   const p = (n) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
// };

// const fmt = (s) => {
//   if (!s) return "—";
//   return new Date(s).toLocaleString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   });
// };

// // ─── Toast ────────────────────────────────────────────────────────────────────

// const useToast = () => {
//   const [toasts, setToasts] = useState([]);
//   const add = useCallback((message, type = "info") => {
//     const id = Date.now();
//     setToasts((p) => [...p, { id, message, type }]);
//     setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
//   }, []);
//   const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
//   return { toasts, add, remove };
// };

// const Toasts = ({ toasts, remove }) => (
//   <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
//     <AnimatePresence>
//       {toasts.map((t) => (
//         <motion.div key={t.id}
//           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
//           className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
//             ${t.type === "success" ? "bg-green-600 text-white"
//             : t.type === "error"   ? "bg-red-600 text-white"
//             : "bg-slate-800 text-white"}`}
//         >
//           {t.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
//           {t.message}
//           <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
//             <X size={13} />
//           </button>
//         </motion.div>
//       ))}
//     </AnimatePresence>
//   </div>
// );

// // ─── Confirm Dialog ───────────────────────────────────────────────────────────

// const ConfirmDialog = ({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) => (
//   <AnimatePresence>
//     {open && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
//         <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10"
//         >
//           <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-indigo-50"}`}>
//             <AlertCircle size={22} className={danger ? "text-red-500" : "text-indigo-500"} />
//           </div>
//           <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
//           <p className="text-sm text-slate-500 mb-6">{message}</p>
//           <div className="flex gap-3 justify-end">
//             <button onClick={onCancel}
//               className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
//               Back
//             </button>
//             <button onClick={onConfirm}
//               className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition shadow-sm
//                 ${danger ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"}`}>
//               {confirmLabel}
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// // ─── Event Detail Modal ───────────────────────────────────────────────────────

// const DetailModal = ({ event, onClose, onCancelFromDetail }) => {
//   if (!event) return null;
//   const s = STATUS_CONFIG[event.status] || STATUS_CONFIG.SCHEDULED;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
//         <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
//         >
//           <div className="flex items-start justify-between p-6 border-b border-slate-100">
//             <div className="flex items-center gap-3">
//               <span className="text-2xl">{EVENT_TYPE_EMOJI[event.eventType] || "📌"}</span>
//               <div>
//                 <h2 className="text-lg font-bold text-slate-800">{event.title}</h2>
//                 <p className="text-xs text-slate-400">EVT-{event.id} · {event.createdByEmail}</p>
//               </div>
//             </div>
//             <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
//               <X size={18} className="text-slate-400" />
//             </button>
//           </div>

//           <div className="p-6 space-y-5">
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               {[
//                 { label: "Event Date",    value: fmt(event.eventDate) },
//                 { label: "Notify At",     value: fmt(event.notifyAt) },
//                 { label: "Venue",         value: event.venue || "—" },
//                 { label: "Notify Before", value: `${event.notifyBeforeHours}h before` },
//                 { label: "Scope",         value: event.scope === "SCHOOL_WIDE" ? "School Wide" : "Class Wise" },
//                 { label: "Status",        value: (
//                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
//                     <s.Icon size={11} /> {s.label}
//                   </span>
//                 )},
//               ].map(({ label, value }) => (
//                 <div key={label}>
//                   <p className="text-xs text-slate-400 mb-0.5">{label}</p>
//                   <div className="font-semibold text-slate-700">{value}</div>
//                 </div>
//               ))}
//               {event.scope === "CLASS_WISE" && (
//                 <div>
//                   <p className="text-xs text-slate-400 mb-0.5">Class IDs</p>
//                   <p className="font-semibold text-slate-700">{event.targetClassIds?.join(", ") || "—"}</p>
//                 </div>
//               )}
//               {event.attachmentUrl && (
//                 <div>
//                   <p className="text-xs text-slate-400 mb-0.5">Attachment</p>
//                   <a href={event.attachmentUrl} target="_blank" rel="noreferrer"
//                     className="text-indigo-600 underline text-xs font-semibold">View File</a>
//                 </div>
//               )}
//             </div>

//             <div className="bg-slate-50 rounded-xl p-4">
//               <p className="text-xs text-slate-400 font-semibold uppercase mb-3">Notification Recipients</p>
//               <div className="flex gap-3">
//                 {[
//                   ["Teachers", event.notifyTeachers],
//                   ["Parents",  event.notifyParents],
//                   ["Students", event.notifyStudents],
//                 ].map(([label, active]) => (
//                   <span key={label}
//                     className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
//                       ${active
//                         ? "bg-indigo-50 text-indigo-700 ring-indigo-700/10"
//                         : "bg-slate-100 text-slate-400 ring-slate-500/10 line-through"}`}>
//                     {label}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-green-50 rounded-xl p-4">
//                 <p className="text-xs text-green-600 font-semibold mb-1">Emails Sent</p>
//                 <p className="text-2xl font-extrabold text-green-700">{event.emailsSent}</p>
//               </div>
//               <div className="bg-red-50 rounded-xl p-4">
//                 <p className="text-xs text-red-500 font-semibold mb-1">Emails Failed</p>
//                 <p className="text-2xl font-extrabold text-red-600">{event.emailsFailed}</p>
//               </div>
//             </div>

//             {event.description && (
//               <div>
//                 <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Description</p>
//                 <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
//               </div>
//             )}
//           </div>

//           {/* Cancel button in footer — only for SCHEDULED events */}
//           {event.status === "SCHEDULED" && (
//             <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
//               <button
//                 onClick={() => { onClose(); onCancelFromDetail(event.id, event.title); }}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
//               >
//                 <XCircle size={15} /> Cancel This Event
//               </button>
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// };

// // ─── Create Event Modal ───────────────────────────────────────────────────────

// const INIT_FORM = {
//   title: "", description: "", eventType: "GENERAL", scope: "SCHOOL_WIDE",
//   eventDate: toLocalDT(new Date(Date.now() + 86400000)),
//   notifyBeforeHours: 0, venue: "", attachmentUrl: "",
//   notifyTeachers: true, notifyParents: true, notifyStudents: true,
//   targetClassIds: "",
// };

// const inpCls = (err) =>
//   `w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all
//    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
//    ${err ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"}`;

// const Field = ({ label, error, hint, children }) => (
//   <div>
//     <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
//     {children}
//     {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
//     {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//   </div>
// );

// const CreateModal = ({ onClose, onCreated }) => {
//   const [form, setForm] = useState(INIT_FORM);
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const set = (k, v) => {
//     setForm((p) => ({ ...p, [k]: v }));
//     setErrors((p) => ({ ...p, [k]: undefined }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim())         e.title = "Title is required";
//     if (form.title.length > 200)    e.title = "Max 200 characters";
//     if (!form.eventDate)            e.eventDate = "Required";
//     else if (new Date(form.eventDate) <= new Date()) e.eventDate = "Must be in the future";
//     if (Number(form.notifyBeforeHours) < 0) e.notifyBeforeHours = "Must be ≥ 0";
//     if (form.scope === "CLASS_WISE" && !form.targetClassIds.trim()) e.targetClassIds = "Required for Class Wise";
//     return e;
//   };

//   const handleSubmit = async () => {
//     const errs = validate();
//     if (Object.keys(errs).length) { setErrors(errs); return; }
//     setSubmitting(true);
//     try {
//       const payload = {
//         title:             form.title.trim(),
//         description:       form.description.trim() || undefined,
//         eventType:         form.eventType,
//         scope:             form.scope,
//         eventDate:         new Date(form.eventDate).toISOString().slice(0, 19),
//         notifyBeforeHours: Number(form.notifyBeforeHours),
//         venue:             form.venue.trim() || undefined,
//         attachmentUrl:     form.attachmentUrl.trim() || undefined,
//         notifyTeachers:    form.notifyTeachers,
//         notifyParents:     form.notifyParents,
//         notifyStudents:    form.notifyStudents,
//         targetClassIds:    form.scope === "CLASS_WISE"
//           ? form.targetClassIds.split(",").map((s) => Number(s.trim())).filter(Boolean)
//           : undefined,
//       };
//       const res = await API.post(`/events/school/${SCHOOL_ID}`, payload);
//       onCreated(res.data);
//     } catch (err) {
//       setErrors({ submit: err?.response?.data?.message || "Failed to create event" });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
//         <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10"
//         >
//           <div className="flex items-center justify-between p-6 border-b border-slate-100">
//             <div>
//               <h3 className="text-xl font-bold text-slate-800">Create New Event</h3>
//               <p className="text-xs text-slate-400 mt-0.5">Schedule event and configure email notifications</p>
//             </div>
//             <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
//               <X size={20} className="text-slate-400" />
//             </button>
//           </div>

//           <div className="p-6 space-y-5">
//             {errors.submit && (
//               <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
//                 <AlertCircle size={15} /> {errors.submit}
//               </div>
//             )}

//             <Field label="Event Title *" error={errors.title}>
//               <input type="text" placeholder="e.g. Annual Sports Day"
//                 value={form.title} onChange={(e) => set("title", e.target.value)}
//                 className={inpCls(errors.title)} maxLength={200} />
//             </Field>

//             <Field label="Description">
//               <textarea placeholder="Brief description of the event..."
//                 value={form.description} onChange={(e) => set("description", e.target.value)}
//                 rows={3} className={inpCls()} />
//             </Field>

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Event Type *" error={errors.eventType}>
//                 <select value={form.eventType} onChange={(e) => set("eventType", e.target.value)} className={inpCls(errors.eventType)}>
//                   {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
//                 </select>
//               </Field>
//               <Field label="Scope *" error={errors.scope}>
//                 <select value={form.scope} onChange={(e) => set("scope", e.target.value)} className={inpCls(errors.scope)}>
//                   <option value="SCHOOL_WIDE">School Wide</option>
//                   <option value="CLASS_WISE">Class Wise</option>
//                 </select>
//               </Field>
//             </div>

//             {form.scope === "CLASS_WISE" && (
//               <Field label="Target Class IDs *" error={errors.targetClassIds} hint="Comma-separated e.g. 1, 2, 5">
//                 <input type="text" placeholder="1, 2, 5"
//                   value={form.targetClassIds} onChange={(e) => set("targetClassIds", e.target.value)}
//                   className={inpCls(errors.targetClassIds)} />
//               </Field>
//             )}

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Event Date & Time *" error={errors.eventDate}>
//                 <input type="datetime-local" value={form.eventDate}
//                   onChange={(e) => set("eventDate", e.target.value)}
//                   className={inpCls(errors.eventDate)} />
//               </Field>
//               <Field label="Notify Before (hours)" error={errors.notifyBeforeHours} hint="0 = notify immediately on creation">
//                 <input type="number" min={0} value={form.notifyBeforeHours}
//                   onChange={(e) => set("notifyBeforeHours", e.target.value)}
//                   className={inpCls(errors.notifyBeforeHours)} />
//               </Field>
//             </div>

//             <Field label="Venue">
//               <input type="text" placeholder="e.g. School Ground, Room 101"
//                 value={form.venue} onChange={(e) => set("venue", e.target.value)}
//                 className={inpCls()} />
//             </Field>

//             <Field label="Attachment URL">
//               <input type="url" placeholder="https://..."
//                 value={form.attachmentUrl} onChange={(e) => set("attachmentUrl", e.target.value)}
//                 className={inpCls()} />
//             </Field>

//             <div>
//               <p className="text-sm font-medium text-slate-700 mb-2">Notification Recipients</p>
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   { key: "notifyTeachers", label: "Teachers", Icon: GraduationCap },
//                   { key: "notifyParents",  label: "Parents",  Icon: Users },
//                   { key: "notifyStudents", label: "Students", Icon: BookOpen },
//                 ].map(({ key, label, Icon }) => (
//                   <button key={key} type="button" onClick={() => set(key, !form[key])}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
//                       ${form[key]
//                         ? "bg-indigo-50 border-indigo-300 text-indigo-700"
//                         : "bg-slate-50 border-slate-200 text-slate-400"}`}
//                   >
//                     <Icon size={14} /> {label}
//                     {form[key] && <CheckCircle2 size={13} className="text-indigo-500" />}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-3 p-6 border-t border-slate-100 justify-end">
//             <button onClick={onClose}
//               className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
//               Cancel
//             </button>
//             <button onClick={handleSubmit} disabled={submitting}
//               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-60">
//               {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
//               {submitting ? "Creating..." : "Create Event"}
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// };

// // ─── Action Button ────────────────────────────────────────────────────────────

// const ActionBtn = ({ onClick, loading, title, cls, icon }) => (
//   <button onClick={onClick} disabled={loading} title={title}
//     className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${cls}`}>
//     {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
//   </button>
// );

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function EventManagement() {
//   const [events, setEvents]               = useState([]);
//   const [loading, setLoading]             = useState(true);
//   const [refreshing, setRefreshing]       = useState(false);
//   const [filterStatus, setFilterStatus]   = useState("ALL");
//   const [search, setSearch]               = useState("");
//   const [page, setPage]                   = useState(0);
//   const itemsPerPage                      = 10;

//   const [showCreate, setShowCreate]       = useState(false);
//   const [detailEvent, setDetailEvent]     = useState(null);
//   const [confirm, setConfirm]             = useState(null);
//   const [actionLoading, setActionLoading] = useState({});

//   const { toasts, add: toast, remove: removeToast } = useToast();

//   // ── Derived ────────────────────────────────────────────────────────────────

//   const filtered   = events.filter((e) =>
//     e.title.toLowerCase().includes(search.toLowerCase()) ||
//     `evt-${e.id}`.includes(search.toLowerCase())
//   );
//   const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
//   const paginated  = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

//   const stats = {
//     total:      events.length,
//     scheduled:  events.filter((e) => e.status === "SCHEDULED").length,
//     notified:   events.filter((e) => e.status === "NOTIFIED").length,
//     emailsSent: events.reduce((a, e) => a + (e.emailsSent || 0), 0),
//   };

//   // ── Fetch ──────────────────────────────────────────────────────────────────

//   const fetchEvents = useCallback(async (silent = false) => {
//     silent ? setRefreshing(true) : setLoading(true);
//     try {
//       const url = filterStatus === "ALL"
//         ? `/events/school/${SCHOOL_ID}`
//         : `/events/school/${SCHOOL_ID}/by-status?status=${filterStatus}`;
//       const res = await API.get(url);
//       setEvents(res.data);
//       setPage(0);
//     } catch {
//       toast("Failed to load events", "error");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [filterStatus]);

//   useEffect(() => { fetchEvents(); }, [fetchEvents]);

//   // ── Actions ────────────────────────────────────────────────────────────────

//   const handleDispatch = (id) => setConfirm({
//     title: "Dispatch Emails Now?",
//     message: "This will immediately send email notifications to all targeted recipients. This cannot be undone.",
//     confirmLabel: "Dispatch", danger: false,
//     onConfirm: async () => {
//       setConfirm(null);
//       setActionLoading((p) => ({ ...p, [id]: "dispatch" }));
//       try {
//         const res = await API.post(`/events/school/${SCHOOL_ID}/${id}/dispatch-now`);
//         setEvents((p) => p.map((e) => (e.id === id ? res.data : e)));
//         toast("Emails dispatched successfully!", "success");
//       } catch (err) {
//         toast(err?.response?.data?.message || "Dispatch failed", "error");
//       } finally {
//         setActionLoading((p) => ({ ...p, [id]: null }));
//       }
//     },
//   });

//   // ── Cancel Event ─────────────────────────────────────────────────────────
//   // API: PATCH /events/school/{schoolId}/{eventId}/cancel
//   // Only shows for SCHEDULED events — sets status to CANCELLED on backend
//   const handleCancel = (id, title) => setConfirm({
//     title: "Cancel Event?",
//     message: `Are you sure you want to cancel "${title}"? This cannot be undone.`,
//     confirmLabel: "Yes, Cancel Event", danger: true,
//     onConfirm: async () => {
//       setConfirm(null);
//       setActionLoading((p) => ({ ...p, [id]: "cancel" }));
//       try {
//         const res = await API.patch(`/events/school/${SCHOOL_ID}/${id}/cancel`);
//         setEvents((p) => p.map((e) => (e.id === id ? res.data : e)));
//         toast("Event has been cancelled.", "info");
//       } catch (err) {
//         toast(err?.response?.data?.message || "Failed to cancel event", "error");
//       } finally {
//         setActionLoading((p) => ({ ...p, [id]: null }));
//       }
//     },
//   });

//   const handleViewDetail = async (event) => {
//     try {
//       const res = await API.get(`/events/school/${SCHOOL_ID}/${event.id}`);
//       setDetailEvent(res.data);
//     } catch {
//       setDetailEvent(event);
//     }
//   };

//   const handleCreated = (newEvent) => {
//     setShowCreate(false);
//     setEvents((p) => [newEvent, ...p]);
//     toast("Event created successfully!", "success");
//   };

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="flex min-h-screen bg-[#F8FAFC]">
//       <SchoolAdminSidebar />

//       <main className="flex-1 p-8">
//         {/* HEADER */}
//         <div className="flex justify-between items-end mb-8">
//           <div>
//             <motion.h1
//               initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//               className="text-3xl font-extrabold text-slate-800 tracking-tight"
//             >
//               Event Management
//             </motion.h1>
//             <p className="text-slate-500 mt-1">Schedule events and manage automated email notifications.</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => fetchEvents(true)} disabled={refreshing}
//               className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium disabled:opacity-60"
//             >
//               <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
//               Refresh
//             </button>
//             <button
//               onClick={() => setShowCreate(true)}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
//             >
//               <Plus size={18} /> Create Event
//             </button>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {[
//             { label: "Total Events", value: stats.total,                      icon: <Calendar size={20} />,     color: "bg-indigo-50 text-indigo-600" },
//             { label: "Scheduled",    value: stats.scheduled,                   icon: <Clock size={20} />,        color: "bg-amber-50 text-amber-600"   },
//             { label: "Notified",     value: stats.notified,                    icon: <CheckCircle2 size={20} />, color: "bg-green-50 text-green-600"   },
//             { label: "Emails Sent",  value: stats.emailsSent.toLocaleString(), icon: <Send size={20} />,         color: "bg-blue-50 text-blue-600"     },
//           ].map(({ label, value, icon, color }, i) => (
//             <motion.div key={label}
//               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
//               className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
//             >
//               <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
//               <div>
//                 <p className="text-xs text-slate-400 font-medium">{label}</p>
//                 <p className="text-xl font-extrabold text-slate-800 mt-0.5">{value}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* MAIN CARD */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
//         >
//           {/* TOOLBAR */}
//           <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="relative w-full md:w-96">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//               <input
//                 type="text" placeholder="Search by title or EVT-ID..."
//                 value={search}
//                 onChange={(e) => { setSearch(e.target.value); setPage(0); }}
//                 className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
//               />
//               {search && (
//                 <button onClick={() => setSearch("")}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
//                   <X size={14} />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
//               {STATUS_TABS.map((s) => (
//                 <button key={s}
//                   onClick={() => { setFilterStatus(s); setPage(0); }}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
//                     ${filterStatus === s
//                       ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
//                       : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
//                 >
//                   {s === "ALL" ? "All" : (STATUS_CONFIG[s]?.label || s)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* TABLE */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50/50">
//                   {["Event", "Type", "Event Date", "Notify At", "Emails", "Status", "Actions"].map((h) => (
//                     <th key={h}
//                       className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider
//                         ${h === "Actions" ? "text-right" : ""}`}
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">

//                 {/* Loading skeleton */}
//                 {loading && [...Array(5)].map((_, i) => (
//                   <tr key={i} className="animate-pulse">
//                     {[...Array(7)].map((_, j) => (
//                       <td key={j} className="px-6 py-4">
//                         <div className="h-4 bg-slate-100 rounded w-full" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//                 {/* Empty state */}
//                 {!loading && paginated.length === 0 && (
//                   <tr>
//                     <td colSpan={7} className="py-20 text-center">
//                       <div className="flex flex-col items-center opacity-40">
//                         <Calendar size={48} className="mb-2" />
//                         <p className="text-lg font-medium text-slate-600">No events found</p>
//                         <p className="text-sm text-slate-400 mt-1">Try adjusting filters or create a new event</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {/* Event rows */}
//                 {!loading && paginated.map((event) => {
//                   const s           = STATUS_CONFIG[event.status] || STATUS_CONFIG.SCHEDULED;
//                   const acting      = actionLoading[event.id];
//                   const isScheduled = event.status === "SCHEDULED";

//                   return (
//                     <tr key={event.id} className="hover:bg-slate-50/80 transition-colors group">

//                       <td className="px-6 py-4">
//                         <button onClick={() => handleViewDetail(event)} className="text-left">
//                           <p className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
//                             {event.title}
//                           </p>
//                           <p className="text-xs text-slate-400 mt-0.5">EVT-{event.id}</p>
//                         </button>
//                       </td>

//                       <td className="px-6 py-4">
//                         <span className="flex items-center gap-1.5 text-sm text-slate-600">
//                           <span>{EVENT_TYPE_EMOJI[event.eventType]}</span>
//                           <span>{EVENT_TYPES.find((t) => t.value === event.eventType)?.label || event.eventType}</span>
//                         </span>
//                         <span className="text-xs text-slate-400">
//                           {event.scope === "SCHOOL_WIDE" ? "School Wide" : "Class Wise"}
//                         </span>
//                       </td>

//                       <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
//                         {fmt(event.eventDate)}
//                       </td>

//                       <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
//                         {fmt(event.notifyAt)}
//                       </td>

//                       <td className="px-6 py-4">
//                         <div className="flex flex-col gap-0.5 text-xs font-semibold">
//                           <span className="text-green-600">✓ {event.emailsSent}</span>
//                           {event.emailsFailed > 0 && (
//                             <span className="text-red-500">✗ {event.emailsFailed}</span>
//                           )}
//                         </div>
//                       </td>

//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
//                           <s.Icon size={11} /> {s.label}
//                         </span>
//                       </td>

//                       {/* ── ACTIONS ── */}
//                       <td className="px-6 py-4">
//                         <div className="flex justify-end items-center gap-1">

//                           {/* Dispatch Now — SCHEDULED only */}
//                           {isScheduled && (
//                             <ActionBtn
//                               onClick={() => handleDispatch(event.id)}
//                               loading={acting === "dispatch"}
//                               title="Dispatch Now"
//                               cls="text-indigo-600 hover:bg-indigo-50"
//                               icon={<Send size={15} />}
//                             />
//                           )}

//                           {/* Cancel Event — SCHEDULED only
//                               API: PATCH /events/school/{schoolId}/{eventId}/cancel */}
//                           {isScheduled && (
//                             <ActionBtn
//                               onClick={() => handleCancel(event.id, event.title)}
//                               loading={acting === "cancel"}
//                               title="Cancel Event"
//                               cls="text-red-500 hover:bg-red-50"
//                               icon={<XCircle size={15} />}
//                             />
//                           )}

//                           {/* View Details — always visible */}
//                           <ActionBtn
//                             onClick={() => handleViewDetail(event)}
//                             title="View Details"
//                             cls="text-slate-400 hover:bg-slate-100"
//                             icon={<MoreVertical size={15} />}
//                           />

//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}

//               </tbody>
//             </table>
//           </div>

//           {/* PAGINATION */}
//           <div className="p-5 border-t border-slate-100 flex items-center justify-between">
//             <p className="text-sm text-slate-500">
//               Showing{" "}
//               <span className="font-semibold text-slate-700">{paginated.length}</span>{" "}
//               of{" "}
//               <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
//               events
//               {filterStatus !== "ALL" && ` · ${STATUS_CONFIG[filterStatus]?.label}`}
//             </p>
//             <div className="flex gap-2">
//               <button
//                 disabled={page === 0} onClick={() => setPage((p) => p - 1)}
//                 className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <div className="flex gap-1">
//                 {[...Array(totalPages)].map((_, i) => (
//                   <button key={i} onClick={() => setPage(i)}
//                     className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
//                       ${page === i
//                         ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
//                         : "hover:bg-slate-100 text-slate-600"}`}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>
//               <button
//                 disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
//                 className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* MODALS */}
//       {showCreate  && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
//       {detailEvent && (
//         <DetailModal
//           event={detailEvent}
//           onClose={() => setDetailEvent(null)}
//           onCancelFromDetail={(id, title) => handleCancel(id, title)}
//         />
//       )}
//       <ConfirmDialog
//         open={!!confirm}
//         title={confirm?.title}
//         message={confirm?.message}
//         confirmLabel={confirm?.confirmLabel}
//         danger={confirm?.danger}
//         onConfirm={confirm?.onConfirm}
//         onCancel={() => setConfirm(null)}
//       />
//       <Toasts toasts={toasts} remove={removeToast} />
//     </div>
//   );
// }