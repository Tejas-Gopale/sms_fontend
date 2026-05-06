import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { 
  Search, Plus, UserX, MapPin, Briefcase, 
  Filter, X, Save, Phone, Mail, Loader2 
} from "lucide-react";

// Enum Options based on your Backend
const ROLES = ["BUS_DRIVER", "SECURITY", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST", "NURSE", "HOUSEKEEPING"];
const DEPARTMENTS = ["ACADEMIC", "FINANCE", "TRANSPORT", "FACILITY", "LIBRARY", "ADMINISTRATION", "IT"];

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId] = useState("1"); // Isse aap context ya URL params se le sakte hain

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(null); // Stores staffId for route
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "", email: "", phoneNumber: "", role: "",
    monthlySalary: "", designation: "", aadharNumber: ""
  });
  const [routeData, setRouteData] = useState({ vehicleNumber: "", routeName: "" });

  useEffect(() => {
    fetchStaff();
  }, [selectedRole, selectedDept]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      let url = `/schools/${schoolId}/staff`;
      const params = {};
      if (selectedRole) params.role = selectedRole;
      if (selectedDept) params.department = selectedDept;

      const res = await API.get(url, { params });
      setStaffList(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/schools/${schoolId}/staff`, formData);
      setShowAddModal(false);
      fetchStaff();
      setFormData({ fullName: "", email: "", phoneNumber: "", role: "" }); // Reset
    } catch (err) {
      alert("Error creating staff member");
    }
  };

  const handleDeactivate = async (staffId) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      await API.put(`/schools/${schoolId}/staff/${staffId}/deactivate`);
      fetchStaff();
    } catch (err) {
      alert("Deactivation failed");
    }
  };

  const handleAssignRoute = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/schools/${schoolId}/staff/${showRouteModal}/assign-route`, routeData);
      setShowRouteModal(null);
      fetchStaff();
    } catch (err) {
      alert("Route assignment failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Staff Directory</h1>
            <p className="text-slate-500">Manage non-teaching staff, transport, and facility members.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Plus size={20} /> Add New Staff
          </button>
        </div>

        {/* FILTERS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search staff..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>

          <select 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* STAFF LIST TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
              ) : staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{staff.fullName}</div>
                    <div className="text-xs text-slate-400">ID: {staff.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold block w-fit mb-1">
                      {staff.role}
                    </span>
                    <span className="text-xs text-slate-500 italic">{staff.designation}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1"><Mail size={14}/> {staff.email}</div>
                    <div className="flex items-center gap-1"><Phone size={14}/> {staff.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    {staff.role === "BUS_DRIVER" && (
                      <button 
                        onClick={() => setShowRouteModal(staff.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Assign Route"
                      >
                        <MapPin size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeactivate(staff.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate"
                    >
                      <UserX size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* CREATE STAFF MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleCreateStaff}
              className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Add Staff Member</h3>
                <button type="button" onClick={() => setShowAddModal(false)}><X /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input required type="text" className="w-full p-2.5 border rounded-xl bg-slate-50" 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input required type="email" className="w-full p-2.5 border rounded-xl bg-slate-50" 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input required type="text" className="w-full p-2.5 border rounded-xl bg-slate-50" 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select required className="w-full p-2.5 border rounded-xl bg-slate-50" 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="">Select Role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary</label>
                  <input type="number" className="w-full p-2.5 border rounded-xl bg-slate-50" 
                    onChange={(e) => setFormData({...formData, monthlySalary: e.target.value})} />
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                Save Staff Member
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ROUTE ASSIGNMENT MODAL */}
      <AnimatePresence>
        {showRouteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Assign Transport Route</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Vehicle Number</label>
                  <input className="w-full p-2.5 border rounded-xl mt-1" placeholder="e.g. MH-12-AB-1234"
                    onChange={(e) => setRouteData({...routeData, vehicleNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Route Name</label>
                  <input className="w-full p-2.5 border rounded-xl mt-1" placeholder="e.g. North Sector A"
                    onChange={(e) => setRouteData({...routeData, routeName: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowRouteModal(null)} className="flex-1 py-2.5 border rounded-xl hover:bg-slate-50">Cancel</button>
                  <button onClick={handleAssignRoute} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Assign</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}