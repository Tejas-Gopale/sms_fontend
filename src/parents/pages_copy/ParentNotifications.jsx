// src/parents/pages/ParentNotifications.jsx
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, BellOff } from 'lucide-react';
import ParentSidebar from '../components/ParentSidebar';
import API from '../../common/services/api';

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    API.get('/notifications/my')
      .then(res => setNotifications(res.data ?? []))
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (e) {
      console.error('Could not mark as read:', e);
    }
  };

  return (
    <div className="flex">
      <ParentSidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <Bell size={28} className="text-indigo-600" />
            Notifications
          </h1>
          {notifications.some(n => !n.read) && (
            <button
              onClick={async () => {
                await API.put('/notifications/read-all');
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center mt-20 text-gray-400 gap-3">
            <BellOff size={48} />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm">You will see push alerts here when your child is absent or fees are due.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`bg-white rounded-xl shadow-sm p-4 flex gap-3 cursor-pointer transition
                  ${n.read ? 'opacity-60' : 'border-l-4 border-indigo-500 hover:shadow-md'}`}
              >
                <CheckCheck
                  size={20}
                  className={`mt-0.5 flex-shrink-0 ${n.read ? 'text-gray-300' : 'text-indigo-500'}`}
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.sentAt}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}