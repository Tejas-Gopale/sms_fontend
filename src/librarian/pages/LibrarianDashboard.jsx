// src/librarian/pages/LibrarianDashboard.jsx
// Role: LIBRARIAN

import RoleSidebar from "../../common/components/RoleSidebar";
import { getUserData } from "../../common/utils/tokenStorage";
import { BookOpen, Users, AlertTriangle, ArrowLeftRight, Clock } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-50`}><Icon size={20} className={`text-${color}-600`} /></div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

export default function LibrarianDashboard() {
  const userData    = getUserData();
  const displayName = userData?.fullName || "Librarian";

  const recentIssues = [
    { member: "Ananya Verma",  class: "10-A", book: "To Kill a Mockingbird", issued: "20 May", due: "03 Jun", returned: false },
    { member: "Rohan Das",     class: "9-B",  book: "Wings of Fire",         issued: "18 May", due: "01 Jun", returned: false },
    { member: "Priya Sharma",  class: "11-C", book: "The Alchemist",         issued: "15 May", due: "29 May", returned: true  },
  ];

  const overdueBooks = [
    { member: "Raj Kumar", class: "8-A",  book: "Harry Potter & Philosopher's Stone", overdue: "5 days" },
    { member: "Neha Jain", class: "10-B", book: "Rich Dad Poor Dad",                  overdue: "2 days" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-800">Library Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome, {displayName}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={BookOpen}      label="Total Books"         value="3,420"  color="blue"   />
            <StatCard icon={ArrowLeftRight}label="Books Issued Today"  value="12"     color="green"  />
            <StatCard icon={AlertTriangle} label="Overdue Books"       value="8"      color="red"    />
            <StatCard icon={Users}         label="Active Members"      value="640"    color="yellow" />
          </div>

          {/* Recent Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Recent Issues / Returns</h2>
              <a href="/librarian/issue-return" className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                Manage →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Member", "Class", "Book", "Issued", "Due", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 text-gray-400 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentIssues.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{r.member}</td>
                    <td className="py-2.5 text-gray-500">{r.class}</td>
                    <td className="py-2.5 text-gray-700 italic">{r.book}</td>
                    <td className="py-2.5 text-gray-500">{r.issued}</td>
                    <td className="py-2.5 text-gray-500">{r.due}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        r.returned ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {r.returned ? "Returned" : "Issued"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-red-500" /> Overdue Books
            </h2>
            <div className="space-y-3">
              {overdueBooks.map((o, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <Clock size={14} className="text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{o.member} <span className="text-gray-400 font-normal">({o.class})</span></p>
                    <p className="text-xs text-gray-600 italic">{o.book}</p>
                  </div>
                  <span className="text-xs text-red-500 font-medium">Overdue: {o.overdue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Issue Book",   href: "/librarian/issue-return" },
                { label: "Return Book",  href: "/librarian/issue-return" },
                { label: "Add Book",     href: "/librarian/books" },
                { label: "View Members", href: "/librarian/members" },
                { label: "Reports",      href: "/librarian/reports" },
              ].map((a) => (
                <a key={a.label} href={a.href}
                   className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}