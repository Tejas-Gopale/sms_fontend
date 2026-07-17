// src/role_dashboards/MinorRoleDashboards.jsx
// Dashboards for: RECEPTIONIST, NURSE, SECURITY, HOUSEKEEPING, CANTEEN_STAFF, IT_ADMIN

import { useEffect, useState } from "react";
import RoleSidebar from "../common/components/RoleSidebar";
import { getUserData } from "../common/utils/tokenStorage";
import { healthService } from "../common/services/healthService";
import { housekeepingService } from "../common/services/housekeepingService";
import {
  Eye, Users, MessageSquare, Bell, HeartPulse, Package, AlertCircle,
  Shield, ClipboardList, UtensilsCrossed, Settings, Plug, FileText,
} from "lucide-react";

const DashboardShell = ({ title, subtitle, children }) => (
  <div className="flex h-screen bg-gray-50 overflow-hidden">
    <RoleSidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-8 space-y-6">{children}</div>
    </main>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}><Icon size={20} className={`text-${color}-600`} /></div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const QuickActions = ({ links }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <h2 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h2>
    <div className="flex flex-wrap gap-3">
      {links.map((a) => (
        <a key={a.label} href={a.href}
           className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors">
          {a.label}
        </a>
      ))}
    </div>
  </div>
);

// ─── RECEPTIONIST ─────────────────────────────────────────────────────────────
export function ReceptionistDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Receptionist";

  const todayVisitors = [
    { name: "Mr. Ramesh Gupta",  purpose: "Parent Meeting",  contact: "9876543210", in: "9:15 AM", out: "10:00 AM" },
    { name: "Mrs. Sujata Rao",   purpose: "Admission Enquiry",contact:"9988776655", in: "10:30 AM", out: "-" },
    { name: "Mr. Arjun Shetty",  purpose: "Delivery",        contact: "8765432109", in: "11:00 AM", out: "11:05 AM" },
  ];

  return (
    <DashboardShell title="Reception Dashboard" subtitle={`Welcome, ${displayName}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Eye}           label="Visitors Today"     value="8"   color="blue"   />
        <StatCard icon={MessageSquare} label="Pending Enquiries"  value="3"   color="yellow" />
        <StatCard icon={Users}         label="Parent Meetings"    value="5"   color="green"  />
        <StatCard icon={Bell}          label="Announcements Sent" value="2"   color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Today's Visitor Log</h2>
          <a href="/receptionist/visitors" className="text-xs text-yellow-600 font-medium">View all →</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Visitor", "Purpose", "Contact", "In", "Out"].map((h) => (
                <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {todayVisitors.map((v, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-800">{v.name}</td>
                <td className="py-2.5 text-gray-600">{v.purpose}</td>
                <td className="py-2.5 text-gray-500 text-xs">{v.contact}</td>
                <td className="py-2.5 text-gray-600">{v.in}</td>
                <td className="py-2.5 text-gray-500">{v.out}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuickActions links={[
        { label: "Log Visitor",        href: "/receptionist/visitors" },
        { label: "View Enquiries",     href: "/receptionist/enquiries" },
        { label: "Send Notification",  href: "/receptionist/notifications" },
      ]} />
    </DashboardShell>
  );
}

// ─── NURSE ────────────────────────────────────────────────────────────────────
export function NurseDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Nurse";
  const schoolId     = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [stats, setStats] = useState(null);
  const [todayVisits, setTodayVisits] = useState([]);

  useEffect(() => {
    if (!schoolId) return;
    healthService.getStats(schoolId).then((res) => setStats(res.data)).catch(() => {});
    healthService.getTodayVisits(schoolId).then((res) => setTodayVisits(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, [schoolId]);

  return (
    <DashboardShell title="Health Room Dashboard" subtitle={`Welcome, ${displayName}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={HeartPulse}   label="Visits Today"          value={stats?.visitsToday ?? "-"}       color="red"    />
        <StatCard icon={AlertCircle}  label="Pending Follow-ups"    value={stats?.pendingFollowUps ?? "-"}  color="yellow" />
        <StatCard icon={Package}      label="Referred Cases"        value={stats?.referredCount ?? "-"}     color="orange" />
        <StatCard icon={Users}        label="Health Records"        value={stats?.totalStudentsWithRecords ?? "-"} color="blue" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Today's Health Incidents</h2>
        {todayVisits.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No visits logged today</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Student", "Symptoms", "Time", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayVisits.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{r.studentName}</td>
                  <td className="py-2.5 text-gray-700">{r.symptoms}</td>
                  <td className="py-2.5 text-gray-500">{r.visitTime ? new Date(r.visitTime).toLocaleTimeString() : "-"}</td>
                  <td className="py-2.5 text-gray-700">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <QuickActions links={[
        { label: "Log Incident",     href: "/nurse/incidents" },
        { label: "Health Records",   href: "/nurse/health-records" },
        { label: "Medical Stock",    href: "/nurse/medical-stock" },
        { label: "Students",         href: "/nurse/students" },
      ]} />
    </DashboardShell>
  );
}

// ─── SECURITY ─────────────────────────────────────────────────────────────────
export function SecurityDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Security";

  return (
    <DashboardShell title="Security Dashboard" subtitle={`Welcome, ${displayName}`}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={Eye}     label="Gate Entries Today"  value="284" color="blue"   />
        <StatCard icon={Shield}  label="Incidents Logged"    value="1"   color="red"    />
        <StatCard icon={Users}   label="Visitors on Campus"  value="6"   color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Today's Gate Log</h2>
        <div className="space-y-2">
          {[
            { name: "All Students",       time: "7:30 AM",  type: "Entry" },
            { name: "Teaching Staff",     time: "8:00 AM",  type: "Entry" },
            { name: "Mr. Ramesh (Parent)",time: "10:15 AM", type: "Entry" },
            { name: "Delivery: Books",    time: "11:00 AM", type: "Entry" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
              <Shield size={14} className="text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-gray-700">{e.name}</span>
              <span className="text-gray-500 text-xs">{e.time}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                e.type === "Entry" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}>{e.type}</span>
            </div>
          ))}
        </div>
      </div>

      <QuickActions links={[
        { label: "Log Visitor",  href: "/security/visitor-log" },
        { label: "Gate Control", href: "/security/gate" },
      ]} />
    </DashboardShell>
  );
}

// ─── GENERIC STAFF (HOUSEKEEPING / CANTEEN) ───────────────────────────────────
export function StaffDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Staff";
  const role        = (userData?.roles || [])[0];
  const isCanteen   = role === "CANTEEN_STAFF";
  const schoolId    = userData?.schoolId ? Number(userData.schoolId) : Number(localStorage.getItem("schoolId"));

  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isCanteen || !schoolId) return;
    housekeepingService.getMyTasks(schoolId).then((res) => setMyTasks(Array.isArray(res.data) ? res.data : [])).catch(() => {});
    housekeepingService.getStats(schoolId).then((res) => setStats(res.data)).catch(() => {});
  }, [schoolId, isCanteen]);

  const pendingCount = myTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const doneCount = myTasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <DashboardShell
      title={isCanteen ? "Canteen Dashboard" : "Staff Dashboard"}
      subtitle={`Welcome, ${displayName}`}
    >
      <div className="grid grid-cols-2 gap-5">
        {isCanteen ? (
          <>
            <StatCard icon={UtensilsCrossed} label="Orders Today"    value="148"  color="yellow" />
            <StatCard icon={ClipboardList}   label="Menu Items"      value="24"   color="blue"   />
          </>
        ) : (
          <>
            <StatCard icon={ClipboardList}   label="Tasks Pending"   value={pendingCount}  color="blue"   />
            <StatCard icon={ClipboardList}   label="Tasks Done"      value={doneCount}     color="green"  />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">My Tasks Today</h2>
        {isCanteen ? (
          <div className="space-y-2">
            {["Prepare breakfast menu", "Restock beverages", "Clean canteen area", "Prepare lunch menu"].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <input type="checkbox" className="accent-yellow-500" />
                <span className="text-sm text-gray-700">{task}</span>
              </div>
            ))}
          </div>
        ) : myTasks.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No tasks assigned</p>
        ) : (
          <div className="space-y-2">
            {myTasks.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <input type="checkbox" checked={t.status === "COMPLETED"} readOnly className="accent-yellow-500" />
                <span className="text-sm text-gray-700 flex-1">{t.title} — {t.location}</span>
                <span className="text-xs text-gray-400">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuickActions links={
        isCanteen
          ? [{ label: "View Menu",   href: "/staff/canteen-menu" }, { label: "View Orders", href: "/staff/orders" }]
          : [{ label: "My Tasks",    href: "/staff/tasks" }, { label: "My Attendance", href: "/staff/my-attendance" }]
      } />
    </DashboardShell>
  );
}

// ─── IT ADMIN ─────────────────────────────────────────────────────────────────
export function ITAdminDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "IT Admin";

  return (
    <DashboardShell title="IT Admin Dashboard" subtitle={`Welcome, ${displayName}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users}    label="Active Users"     value="312"  color="blue"   />
        <StatCard icon={FileText} label="System Logs"      value="1,284"color="gray"   />
        <StatCard icon={Plug}     label="Integrations"     value="5"    color="green"  />
        <StatCard icon={Settings} label="Config Changes"   value="3"    color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Recent System Events</h2>
        <div className="space-y-2 text-sm font-mono">
          {[
            { level: "INFO",  msg: "User 'teacher.sharma' logged in",          time: "09:12" },
            { level: "WARN",  msg: "Failed login attempt for 'admin@school'",  time: "10:05" },
            { level: "INFO",  msg: "FCM token refreshed for 42 users",         time: "10:30" },
            { level: "ERROR", msg: "Email service timeout (retry #2)",         time: "11:00" },
            { level: "INFO",  msg: "Database backup completed successfully",   time: "12:00" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-4 p-2 rounded bg-gray-50">
              <span className={`text-xs font-bold w-12 ${
                e.level === "ERROR" ? "text-red-500" :
                e.level === "WARN"  ? "text-yellow-600" : "text-green-600"
              }`}>{e.level}</span>
              <span className="flex-1 text-gray-700 text-xs">{e.msg}</span>
              <span className="text-gray-400 text-xs">{e.time}</span>
            </div>
          ))}
        </div>
      </div>

      <QuickActions links={[
        { label: "Manage Users",   href: "/it-admin/users" },
        { label: "System Logs",    href: "/it-admin/logs" },
        { label: "Settings",       href: "/it-admin/settings" },
        { label: "Integrations",   href: "/it-admin/integrations" },
      ]} />
    </DashboardShell>
  );
}