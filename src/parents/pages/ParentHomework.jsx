import { useEffect, useState, useRef, useCallback } from "react";
import ParentSidebar from "../components/ParentSidebar";
import {
  Loader2, AlertCircle, BookOpen, FileText, Image,
  FileSpreadsheet, Presentation, File, Download, Eye, X,
  Calendar, User, Clock, ChevronDown, ChevronUp, Bell,
} from "lucide-react";
import { getStudentHomework } from "../../common/services/parentService";
import {
  markHomeworkNotificationSeen,
  markHomeworkNotificationRead,
} from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Homework assigned within this many hours is shown with a "New" badge. */
const NEW_BADGE_HOURS = 48;

// ─── Attachment helpers ───────────────────────────────────────────────────────

const ATTACH_CONFIG = {
  PDF:        { icon: FileText,        color: "text-red-500",    bg: "bg-red-50",    label: "PDF"   },
  IMAGE:      { icon: Image,           color: "text-emerald-500",bg: "bg-emerald-50",label: "Image" },
  WORD:       { icon: FileText,        color: "text-blue-500",   bg: "bg-blue-50",   label: "Word"  },
  EXCEL:      { icon: FileSpreadsheet, color: "text-green-600",  bg: "bg-green-50",  label: "Excel" },
  POWERPOINT: { icon: Presentation,    color: "text-orange-500", bg: "bg-orange-50", label: "PPT"   },
  OTHER:      { icon: File,            color: "text-slate-500",  bg: "bg-slate-50",  label: "File"  },
};

function getAttachConfig(type) {
  return ATTACH_CONFIG[type] || ATTACH_CONFIG.OTHER;
}

function formatBytes(bytes) {
  if (!bytes)          return "";
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function isNewHomework(assignedDate) {
  if (!assignedDate) return false;
  const diff = Date.now() - new Date(assignedDate).getTime();
  return diff < NEW_BADGE_HOURS * 60 * 60 * 1000;
}

// ─── File Viewer Modal ────────────────────────────────────────────────────────

function FileViewerModal({ attachment, onClose }) {
  const isImage = attachment.attachmentType === "IMAGE";
  const isPDF   = attachment.attachmentType === "PDF";

  const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    attachment.fileUrl
  )}&embedded=true`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href     = attachment.fileUrl;
    a.download = attachment.originalFileName;
    a.target   = "_blank";
    a.rel      = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {(() => {
              const cfg  = getAttachConfig(attachment.attachmentType);
              const Icon = cfg.icon;
              return (
                <span className={`p-2 rounded-lg ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </span>
              );
            })()}
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {attachment.originalFileName}
              </p>
              <p className="text-xs text-slate-400">{formatBytes(attachment.fileSizeBytes)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewer body */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {isPDF && (
            <iframe
              src={pdfViewerUrl}
              title={attachment.originalFileName}
              className="w-full h-full min-h-[65vh]"
              style={{ border: "none" }}
            />
          )}
          {isImage && (
            <div className="flex items-center justify-center p-6 min-h-[65vh]">
              <img
                src={attachment.fileUrl}
                alt={attachment.originalFileName}
                className="max-w-full max-h-[65vh] rounded-xl shadow-md object-contain"
              />
            </div>
          )}
          {!isPDF && !isImage && (
            <div className="flex flex-col items-center justify-center min-h-[65vh] gap-5 p-8">
              {(() => {
                const cfg  = getAttachConfig(attachment.attachmentType);
                const Icon = cfg.icon;
                return (
                  <span className={`p-6 rounded-2xl ${cfg.bg}`}>
                    <Icon size={48} className={cfg.color} />
                  </span>
                );
              })()}
              <div className="text-center">
                <p className="font-semibold text-slate-700 mb-1">
                  {attachment.originalFileName}
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This file type cannot be previewed in the browser.
                </p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
                >
                  <Download size={16} />
                  Download to open
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Attachment chip ──────────────────────────────────────────────────────────

function AttachmentChip({ attachment, onClick }) {
  const cfg  = getAttachConfig(attachment.attachmentType);
  const Icon = cfg.icon;

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href     = attachment.fileUrl;
    a.download = attachment.originalFileName;
    a.target   = "_blank";
    a.rel      = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${cfg.bg} border border-slate-100`}>
      <Icon size={14} className={cfg.color} />
      <span
        className="text-xs font-medium text-slate-700 truncate max-w-[100px] cursor-pointer hover:text-indigo-600 transition-colors"
        title={attachment.originalFileName}
        onClick={onClick}
      >
        {attachment.originalFileName}
      </span>
      <div className="flex gap-1 ml-auto shrink-0">
        <button
          onClick={onClick}
          title="View"
          className="p-1 rounded hover:bg-white/70 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Eye size={12} />
        </button>
        <button
          onClick={handleDownload}
          title="Download"
          className="p-1 rounded hover:bg-white/70 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Download size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  pending:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Pending"   },
  submitted: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Submitted" },
  late:      { bg: "bg-rose-100",    text: "text-rose-700",    label: "Late"      },
};

function getStatusCfg(s) {
  return (
    STATUS_CFG[s?.toLowerCase()] || {
      bg: "bg-slate-100", text: "text-slate-600", label: s || "—",
    }
  );
}

// ─── Individual Homework Card ─────────────────────────────────────────────────

function HomeworkCard({ hw, isRead, onExpand, viewerOpen }) {
  const [expanded, setExpanded] = useState(false);
  const scfg      = getStatusCfg(hw.status);
  const showNew   = isNewHomework(hw.assignedDate) && !isRead;
  const hasExpand = hw.description || hw.attachments?.length > 0 || hw.submission;

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) onExpand(hw.id); // triggers mark-read
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-violet-400" />

      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Subject + status + NEW badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            {hw.subject ?? hw.subjectName}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {showNew && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <Bell size={10} />
                New
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scfg.bg} ${scfg.text}`}>
              {scfg.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="font-bold text-slate-800 text-base leading-snug">{hw.title}</h2>
        </div>

        {/* Meta — always visible */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <User size={12} className="shrink-0" />
            <span>{hw.teacherName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0" />
            <span>Assigned: {hw.assignedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock
              size={12}
              className={`shrink-0 ${hw.status === "late" ? "text-rose-400" : ""}`}
            />
            <span className={hw.status === "late" ? "text-rose-500 font-semibold" : ""}>
              Due: {hw.dueDate}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        {hasExpand && (
          <button
            onClick={handleToggle}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-auto self-start transition"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Show less" : "View details"}
          </button>
        )}

        {/* Expanded section */}
        {expanded && (
          <div className="mt-1 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">

            {/* Description */}
            {hw.description && (
              <p className="text-slate-500 text-sm leading-relaxed">{hw.description}</p>
            )}

            {/* Submission badge */}
            {hw.submission && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs text-emerald-700 font-medium">
                ✅ Submitted on {hw.submission.submittedDate}
                {hw.submission.marks != null && (
                  <span className="ml-2 font-bold">
                    {hw.submission.marks}/{hw.submission.totalMarks} marks
                  </span>
                )}
              </div>
            )}

            {/* Attachments */}
            {hw.attachments?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">
                  Attachments ({hw.attachments.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {hw.attachments.map((att) => (
                    <AttachmentChip
                      key={att.id}
                      attachment={att}
                      onClick={() => viewerOpen(att)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FILTERS = ["ALL", "PENDING", "LATE", "SUBMITTED"];

export default function ParentHomework() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();

  const [homework,         setHomework]         = useState([]);
  const [filter,           setFilter]           = useState("ALL");
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);
  const [viewerAttachment, setViewerAttachment] = useState(null);

  /**
   * Locally tracks which homework IDs have been "read" this session.
   * Prevents duplicate API calls if the user collapses and re-expands a card.
   */
  const [readIds, setReadIds] = useState(new Set());

  /**
   * Tracks which IDs we've already fired markHomeworkNotificationSeen for
   * this session — avoids duplicate calls across filter changes.
   */
  const seenFiredRef = useRef(new Set());

  // ── Load homework ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    const status = filter === "ALL" ? null : filter.toLowerCase();

    getStudentHomework(studentId, status)
      .then((res) => {
        const list = res.data ?? [];
        setHomework(list);
        // Fire mark-seen for all items that haven't been seen yet
        fireMarkSeen(list);
      })
      .catch(() => setError("Could not load homework."))
      .finally(() => setLoading(false));
  }, [studentId, filter]);

  /**
   * Mark all items in the list as "seen" (notification reached the parent
   * — equivalent of notification banner appearing on desktop).
   * Fire-and-forget — errors are swallowed to keep UI intact.
   */
  const fireMarkSeen = useCallback((list) => {
    list.forEach((hw) => {
      if (!seenFiredRef.current.has(hw.id)) {
        seenFiredRef.current.add(hw.id);
        markHomeworkNotificationSeen(hw.id).catch(() => {
          // Silent fail — do not disrupt the homework view
        });
      }
    });
  }, []);

  /**
   * Mark a specific homework as "read" when the parent expands the card.
   * Called by HomeworkCard on first expand.
   * Fire-and-forget.
   */
  const handleExpand = useCallback((homeworkId) => {
    if (readIds.has(homeworkId)) return; // already fired
    setReadIds((prev) => new Set([...prev, homeworkId]));
    markHomeworkNotificationRead(homeworkId).catch(() => {
      // Silent fail — do not disrupt the homework view
    });
  }, [readIds]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <ParentSidebar />

      <div className="flex-1 p-6 md:p-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">📚 Homework</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              View assignments and download attachments
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        )}

        {/* Error */}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 text-rose-600 text-sm">
            <AlertCircle size={18} />
            {error || sidError}
          </div>
        )}

        {/* Empty */}
        {!loading && !sidLoading && !error && !sidError && homework.length === 0 && (
          <div className="flex flex-col items-center mt-24 text-slate-400 gap-3">
            <div className="p-5 bg-slate-100 rounded-2xl">
              <BookOpen size={40} className="opacity-50" />
            </div>
            <p className="text-base font-medium">No homework found</p>
            <p className="text-sm">Try changing the filter above</p>
          </div>
        )}

        {/* Homework cards */}
        {!loading && !sidLoading && homework.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {homework.map((hw) => (
              <HomeworkCard
                key={hw.id}
                hw={hw}
                isRead={readIds.has(hw.id)}
                onExpand={handleExpand}
                viewerOpen={setViewerAttachment}
              />
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewerAttachment && (
        <FileViewerModal
          attachment={viewerAttachment}
          onClose={() => setViewerAttachment(null)}
        />
      )}
    </div>
  );
}
