import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, BellOff, BookOpen, IndianRupee, CalendarCheck, AlertTriangle, Info } from "lucide-react";
import ParentSidebar from "../components/ParentSidebar";
import { getParentNotifications, markNotificationRead } from "../../common/services/parentService";

const TYPE_ICON = {
  homework: BookOpen,
  fee:      IndianRupee,
  exam:     CalendarCheck,
  alert:    AlertTriangle,
  event:    CalendarCheck,
};

const PRIORITY_BADGE = {
  high:   "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-slate-100 text-slate-500",
};

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showUnread,    setShowUnread]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");

  const fetch = (unreadOnly) => {
    setLoading(true);
    getParentNotifications(unreadOnly || null)
      .then((res) => setNotifications(res.data ?? []))
      .catch(() => setError("Could not load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(showUnread); }, [showUnread]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch {
      console.error("Could not mark as read");
    }
  };

  const markAllRead = async () => {
    // Mark all unread locally (API endpoint is /notifications/read-all if available)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed   = showUnread ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <Bell size={28} className="text-indigo-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-sm rounded-full px-2.5 py-0.5 font-semibold">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnread}
                onChange={(e) => setShowUnread(e.target.checked)}
                className="rounded"
              />
              Unread only
            </label>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">{error}</div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center mt-20 text-gray-400 gap-3">
            <BellOff size={48} />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You will see push alerts here when your child is absent or fees are due.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((n) => {
              const Icon = TYPE_ICON[n.type] || Info;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`bg-white rounded-2xl shadow-sm p-4 flex gap-4 cursor-pointer transition
                    ${n.isRead ? "opacity-60" : "border-l-4 border-indigo-500 hover:shadow-md"}`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center ${n.isRead ? "bg-slate-100" : "bg-indigo-100"}`}>
                    <Icon size={18} className={n.isRead ? "text-slate-400" : "text-indigo-600"} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      {n.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[n.priority] ?? PRIORITY_BADGE.low}`}>
                          {n.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.date} {n.time && `at ${n.time}`}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
