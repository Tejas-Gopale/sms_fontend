import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import {
  Bell, CheckCheck, AlertCircle, Info, CheckCircle2,
  RefreshCw, FileText, BookOpen, Calendar, Megaphone,
} from "lucide-react";

// ── Priority config ────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  HIGH:   { border: "border-l-red-500",    badge: "bg-red-100 text-red-700",    label: "High"   },
  MEDIUM: { border: "border-l-yellow-400", badge: "bg-yellow-100 text-yellow-700", label: "Medium" },
  LOW:    { border: "border-l-blue-400",   badge: "bg-blue-100 text-blue-700",  label: "Low"    },
};

// ── Category icon map ──────────────────────────────────────────────────────
const CAT_ICON = {
  EXAM:     { Icon: FileText,   color: "text-purple-500", bg: "bg-purple-50" },
  HOMEWORK: { Icon: BookOpen,   color: "text-green-500",  bg: "bg-green-50"  },
  EVENT:    { Icon: Calendar,   color: "text-orange-500", bg: "bg-orange-50" },
  GENERAL:  { Icon: Megaphone,  color: "text-blue-500",   bg: "bg-blue-50"   },
  ALERT:    { Icon: AlertCircle,color: "text-red-500",    bg: "bg-red-50"    },
};

function formatDate(d) {
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} days ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TeacherNotifications() {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotal]  = useState(0);
  const [filter, setFilter]     = useState("ALL"); // ALL | HIGH | MEDIUM | LOW
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchNotices(); }, [page]);

  const fetchNotices = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      // Backend API: GET /api/v1/notice/feed?audience=TEACHERS&page=0&size=10
      const res = await API.get("/notice/feed", {
        params: { audience: "TEACHERS", page, size: 10 },
      });
      const data = res.data;
      setNotices(data.content || data || []);
      setTotal(data.totalPages || 0);
    } catch (err) {
      console.error("Notice fetch failed:", err);
      // Fallback sample — remove once backend is live
      setNotices([
        {
          id: 1, title: "Staff Meeting Tomorrow",
          content: "All teaching staff are requested to attend the staff meeting tomorrow at 10:00 AM in the conference room. Attendance is mandatory.",
          priority: "HIGH", category: "GENERAL",
          publishDate: new Date().toISOString(), isPublished: true, viewCount: 12,
        },
        {
          id: 2, title: "Updated Exam Schedule — Class 10",
          content: "The final exam schedule for Class 10 has been updated. Please download the revised timetable from the admin portal.",
          priority: "MEDIUM", category: "EXAM",
          publishDate: new Date(Date.now() - 86_400_000).toISOString(), isPublished: true, viewCount: 34,
        },
        {
          id: 3, title: "Holiday Notice — 15th August",
          content: "The school will remain closed on 15th August on account of Independence Day. All events scheduled for that day stand postponed.",
          priority: "LOW", category: "EVENT",
          publishDate: new Date(Date.now() - 172_800_000).toISOString(), isPublished: true, viewCount: 56,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = filter === "ALL"
    ? notices
    : notices.filter((n) => n.priority === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />

      <div className="flex-1 p-6 max-w-4xl">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Notices & Notifications</h1>
              <p className="text-sm text-gray-500">School notices for teaching staff</p>
            </div>
          </div>

          <button
            onClick={() => fetchNotices(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200
                       rounded-lg px-3 py-1.5 hover:bg-blue-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Priority Filter Tabs ─────────────────────────────────── */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${filter === f
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-600 border hover:border-blue-300"}`}
            >
              {f === "ALL" ? "All" : PRIORITY_CFG[f]?.label}
              {f !== "ALL" && (
                <span className="ml-1 text-xs opacity-75">
                  ({notices.filter((n) => n.priority === f).length})
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 self-center">
            {filtered.length} notice{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border-l-4 border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notices found</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for updates from school admin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notice) => {
              const pri   = PRIORITY_CFG[notice.priority] || PRIORITY_CFG.MEDIUM;
              const cat   = CAT_ICON[notice.category]     || CAT_ICON.GENERAL;
              const Icon  = cat.Icon;

              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${pri.border} p-5
                              hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    {/* Category icon */}
                    <div className={`${cat.bg} p-2.5 rounded-xl flex-shrink-0 mt-0.5`}>
                      <Icon size={18} className={cat.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{notice.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.badge}`}>
                          {pri.label}
                        </span>
                        {notice.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {notice.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {notice.content}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{formatDate(notice.publishDate || notice.createdAt)}</span>
                        {notice.expiresDate && (
                          <span className="text-orange-500">
                            Expires: {new Date(notice.expiresDate).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        {notice.viewCount != null && (
                          <span>{notice.viewCount} views</span>
                        )}
                        {notice.attachmentUrl && (
                          <a
                            href={notice.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            📎 Attachment
                          </a>
                        )}
                      </div>
                    </div>
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
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}