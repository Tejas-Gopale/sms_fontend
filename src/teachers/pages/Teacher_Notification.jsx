import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { Bell, CheckCheck, AlertCircle, Info } from "lucide-react";

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Try the notifications endpoint (adjust path based on your API)
      const res = await API.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Fallback to sample data if endpoint isn't ready
      setNotifications([
        { id: 1, message: "Staff meeting tomorrow at 10:00 AM in the conference room", type: "INFO", createdAt: new Date().toISOString(), isRead: false },
        { id: 2, message: "Exam schedule for final exams has been updated", type: "WARNING", createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true },
        { id: 3, message: "Holiday on account of national holiday — 15th August", type: "INFO", createdAt: new Date(Date.now() - 172800000).toISOString(), isRead: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/mark-all-read");
    } catch { /* silent */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
    } catch { /* silent */ }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeConfig = {
    INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    WARNING: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50" },
    SUCCESS: { icon: CheckCheck, color: "text-green-500", bg: "bg-green-50" },
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={28} className="text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow divide-y">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.INFO;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition hover:bg-gray-50
                    ${!n.isRead ? "bg-blue-50/40" : ""}`}
                >
                  <div className={`${cfg.bg} p-2 rounded-full mt-0.5`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
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