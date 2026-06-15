// src/school_admin/pages/AlumniManagement.jsx
// Synced with backend AlumniController.java
// Changes from previous version:
//   1. eventTime ":00" suffix fix (backend needs HH:mm:ss, input gives HH:mm)
//   2. registrationDeadline empty string → null fix
//   3. addForm now includes all AlumniRequest fields (highestQualification, bio, etc.)
//   4. Add Alumni modal has extra optional fields
//   5. AlumniManagement used in App.jsx with route /school-admin/alumni ✅

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import {
  getDashboardStats,
  getAllAlumni,
  getAlumniByYear,
  getAlumniByStatus,
  getPassoutYears,
  addAlumni,
  updateAlumniStatus,
  getEvents,
  createEvent,
  markAttendance,
  getApprovedPosts,
  getPendingPosts,
  approvePost,
  togglePinPost,
  deletePost,
  getMentors,
  getMentorshipRequestsByAlumni,
} from "../services/alumniService";
import {
  Users, GraduationCap, CalendarDays, FileText, Search, Plus, X,
  RefreshCw, Loader2, CheckCircle2, XCircle, Pin, PinOff, Trash2,
  UserCheck, Mail, Phone, Building2, MapPin, Linkedin, Award,
  BookOpen, Briefcase, AlertCircle, Eye, Check,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_STATUS = [
  { value: "EMPLOYED",                label: "Employed" },
  { value: "SELF_EMPLOYED",           label: "Self Employed" },
  { value: "PURSUING_HIGHER_STUDIES", label: "Higher Studies" },
  { value: "UNEMPLOYED",              label: "Unemployed" },
  { value: "OTHER",                   label: "Other" },
];

const ALUMNI_STATUS = ["ACTIVE", "PENDING_VERIFICATION", "INACTIVE", "DEACTIVATED"];

const EVENT_TYPES = [
  { value: "REUNION",            label: "Reunion" },
  { value: "SEMINAR",            label: "Seminar" },
  { value: "WORKSHOP",           label: "Workshop" },
  { value: "NETWORKING",         label: "Networking" },
  { value: "MENTORSHIP_SESSION", label: "Mentorship Session" },
  { value: "CULTURAL",           label: "Cultural" },
  { value: "SPORTS",             label: "Sports" },
  { value: "OTHER",              label: "Other" },
];

const POST_TYPE_COLOR = {
  JOB_OPENING:   "bg-blue-50 text-blue-700",
  SUCCESS_STORY: "bg-green-50 text-green-700",
  ADVICE:        "bg-amber-50 text-amber-700",
  GENERAL:       "bg-gray-100 text-gray-600",
};

const STATUS_BADGE = {
  ACTIVE:               "bg-green-50 text-green-700 ring-1 ring-green-700/20",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 ring-1 ring-amber-700/20",
  INACTIVE:             "bg-gray-100 text-gray-500",
  DEACTIVATED:          "bg-red-50 text-red-600 ring-1 ring-red-600/20",
};

// ─── Empty form defaults ───────────────────────────────────────────────────────
const EMPTY_ADD_FORM = {
  firstName: "", lastName: "", email: "", phoneNumber: "",
  passoutYear: "", lastClass: "", admissionNumber: "",
  employmentStatus: "EMPLOYED",
  currentOrganization: "", designation: "",
  highestQualification: "", collegeOrUniversity: "",
  currentCity: "", currentCountry: "",
  linkedinUrl: "", portfolioUrl: "",
  isMentor: false, mentorBio: "", mentorSkills: "",
  bio: "", achievements: "",
};

const EMPTY_EVENT_FORM = {
  title: "", description: "", eventType: "REUNION",
  eventDate: "", eventTime: "", venue: "", meetLink: "",
  registrationDeadline: "", maxParticipants: "", isPublic: true,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, add };
};

const Toasts = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[260px] max-w-sm
            ${t.type === "success" ? "bg-green-600 text-white"
            : t.type === "error"   ? "bg-red-600 text-white"
            : "bg-gray-800 text-white"}`}
        >
          {t.type === "success" ? <CheckCircle2 size={16} />
           : t.type === "error" ? <XCircle size={16} />
           : <AlertCircle size={16} />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide = false }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        >
          <div className="flex items-center justify-between p-5 border-b">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Field helper ─────────────────────────────────────────────────────────────
const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const sel = `${inp} bg-white`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["Alumni", "Events", "Community Posts", "Mentorship"];

// ═══════════════════════════════════════════════════════════════════════════════
export default function AlumniManagement() {
  const schoolId = localStorage.getItem("schoolId") || 1;
  const { toasts, add: toast } = useToast();

  const [activeTab, setActiveTab] = useState("Alumni");
  const [stats, setStats]         = useState(null);

  // Alumni state
  const [alumni, setAlumni]               = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [yearFilter, setYearFilter]       = useState("ALL");
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [searchQ, setSearchQ]             = useState("");
  const [passoutYears, setPassoutYears]   = useState([]);
  const [addModal, setAddModal]           = useState(false);
  const [detailAlumni, setDetailAlumni]   = useState(null);
  const [addForm, setAddForm]             = useState(EMPTY_ADD_FORM);
  const [addLoading, setAddLoading]       = useState(false);

  // Events state
  const [events, setEvents]               = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventModal, setEventModal]       = useState(false);
  const [eventForm, setEventForm]         = useState(EMPTY_EVENT_FORM);
  const [eventLoading, setEventLoading]   = useState(false);

  // Posts state
  const [posts, setPosts]                 = useState([]);
  const [pendingPosts, setPendingPosts]   = useState([]);
  const [postsLoading, setPostsLoading]   = useState(false);
  const [postTab, setPostTab]             = useState("approved");

  // Mentors state
  const [mentors, setMentors]             = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);

  // ─── Loaders ──────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try { const r = await getDashboardStats(schoolId); setStats(r.data); } catch {}
  }, [schoolId]);

  const loadAlumni = useCallback(async () => {
    setAlumniLoading(true);
    try {
      let res;
      if (yearFilter !== "ALL")       res = await getAlumniByYear(schoolId, yearFilter);
      else if (statusFilter !== "ALL") res = await getAlumniByStatus(schoolId, statusFilter);
      else                             res = await getAllAlumni(schoolId);
      setAlumni(res.data || []);
    } catch { toast("Failed to load alumni", "error"); }
    finally  { setAlumniLoading(false); }
  }, [schoolId, yearFilter, statusFilter]);

  const loadPassoutYears = useCallback(async () => {
    try { const r = await getPassoutYears(schoolId); setPassoutYears(r.data || []); } catch {}
  }, [schoolId]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try { const r = await getEvents(schoolId); setEvents(r.data || []); }
    catch { toast("Failed to load events", "error"); }
    finally { setEventsLoading(false); }
  }, [schoolId]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const [a, p] = await Promise.all([getApprovedPosts(schoolId), getPendingPosts(schoolId)]);
      setPosts(a.data || []);
      setPendingPosts(p.data || []);
    } catch { toast("Failed to load posts", "error"); }
    finally { setPostsLoading(false); }
  }, [schoolId]);

  const loadMentors = useCallback(async () => {
    setMentorsLoading(true);
    try { const r = await getMentors(schoolId); setMentors(r.data || []); }
    catch { toast("Failed to load mentors", "error"); }
    finally { setMentorsLoading(false); }
  }, [schoolId]);

  useEffect(() => { loadStats(); loadPassoutYears(); }, []);
  useEffect(() => {
    if (activeTab === "Alumni")          loadAlumni();
    if (activeTab === "Events")          loadEvents();
    if (activeTab === "Community Posts") loadPosts();
    if (activeTab === "Mentorship")      loadMentors();
  }, [activeTab, yearFilter, statusFilter]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddAlumni = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await addAlumni(schoolId, addForm);
      toast("Alumni added successfully!", "success");
      setAddModal(false);
      setAddForm(EMPTY_ADD_FORM);
      loadAlumni(); loadStats();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to add alumni", "error");
    } finally { setAddLoading(false); }
  };

  const handleStatusChange = async (alumniId, newStatus) => {
    try {
      await updateAlumniStatus(alumniId, newStatus);
      toast(`Status updated to ${newStatus}`, "success");
      loadAlumni(); loadStats();
    } catch { toast("Failed to update status", "error"); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    try {
      // FIX: eventTime from HTML input is "HH:mm" — backend needs "HH:mm:ss"
      // FIX: empty registrationDeadline → null (not empty string)
      await createEvent(schoolId, eventForm); // service handles the conversion
      toast("Event created!", "success");
      setEventModal(false);
      setEventForm(EMPTY_EVENT_FORM);
      loadEvents(); loadStats();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to create event", "error");
    } finally { setEventLoading(false); }
  };

  const handleApprovePost = async (postId) => {
    try { await approvePost(postId); toast("Post approved!", "success"); loadPosts(); loadStats(); }
    catch { toast("Failed to approve", "error"); }
  };

  const handlePinPost = async (postId) => {
    try { await togglePinPost(postId); toast("Pin toggled!", "success"); loadPosts(); }
    catch { toast("Failed to pin/unpin", "error"); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try { await deletePost(postId); toast("Post deleted", "success"); loadPosts(); }
    catch { toast("Failed to delete", "error"); }
  };

  const filteredAlumni = alumni.filter((a) => {
    const q = searchQ.toLowerCase();
    return !q || [a.firstName, a.lastName, a.email, a.currentOrganization, a.designation]
      .some((f) => f?.toLowerCase().includes(q));
  });

  // ─── setField helpers ──────────────────────────────────────────────────────
  const setAdd  = (k, v) => setAddForm((p)   => ({ ...p, [k]: v }));
  const setEv   = (k, v) => setEventForm((p) => ({ ...p, [k]: v }));

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SchoolAdminSidebar />
      <Toasts toasts={toasts} />

      <main className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap size={26} className="text-blue-600" />
              Alumni Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage alumni records, events, mentorship & community</p>
          </div>
          <button
            onClick={() => { loadStats(); if (activeTab === "Alumni") loadAlumni(); }}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard icon={Users}        label="Total Alumni"    value={stats.totalAlumni}           color="bg-blue-500" />
            <StatCard icon={UserCheck}    label="Active"          value={stats.activeAlumni}           color="bg-green-500" />
            <StatCard icon={Award}        label="Mentors"         value={stats.totalMentors}           color="bg-purple-500" />
            <StatCard icon={CalendarDays} label="Upcoming Events" value={stats.upcomingEvents}         color="bg-orange-400" />
            <StatCard icon={FileText}     label="Pending Posts"   value={stats.pendingPostApprovals}   color="bg-amber-500" />
            <StatCard icon={BookOpen}     label="Open Mentorship" value={stats.openMentorshipRequests} color="bg-cyan-500" />
          </div>
        )}

        {/* Tab container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors relative
                  ${activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* ── ALUMNI TAB ─────────────────────────────────────────────────── */}
          {activeTab === "Alumni" && (
            <div className="p-5">
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search by name, email, company…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setStatusFilter("ALL"); }}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="ALL">All Years</option>
                  {passoutYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setYearFilter("ALL"); }}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="ALL">All Status</option>
                  {ALUMNI_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <button onClick={() => setAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus size={16} /> Add Alumni
                </button>
              </div>

              {alumniLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" /> Loading alumni…
                </div>
              ) : filteredAlumni.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No alumni found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Name", "Passout Year", "Employment", "Organization", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAlumni.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(a.firstName?.[0] || "A").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{a.firstName} {a.lastName}</p>
                                <p className="text-xs text-gray-400">{a.email}</p>
                              </div>
                              {a.isMentor && (
                                <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-medium">Mentor</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-medium">{a.passoutYear || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {a.employmentStatus?.replace(/_/g, " ") || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {a.currentOrganization ? (
                              <div>
                                <p className="font-medium">{a.currentOrganization}</p>
                                {a.designation && <p className="text-xs text-gray-400">{a.designation}</p>}
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={a.status}
                              onChange={(e) => handleStatusChange(a.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-lg border-0 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_BADGE[a.status] || "bg-gray-100 text-gray-500"}`}
                            >
                              {ALUMNI_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setDetailAlumni(a)}
                              className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="View details">
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EVENTS TAB ─────────────────────────────────────────────────── */}
          {activeTab === "Events" && (
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">{events.length} events found</p>
                <button onClick={() => setEventModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus size={16} /> Create Event
                </button>
              </div>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" /> Loading events…
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CalendarDays size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No events yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {events.map((ev) => (
                    <motion.div key={ev.id} layout
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800 leading-tight">{ev.title}</h4>
                          <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                            {ev.eventType?.replace(/_/g, " ")}
                          </span>
                        </div>
                        {ev.isPublic && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-md flex-shrink-0">Public</span>}
                      </div>
                      {ev.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ev.description}</p>}
                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={12} className="text-gray-400" />
                          {ev.eventDate} {ev.eventTime && `· ${ev.eventTime}`}
                        </div>
                        {ev.venue && <div className="flex items-center gap-2"><MapPin size={12} className="text-gray-400" />{ev.venue}</div>}
                        {ev.maxParticipants && (
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-gray-400" />
                            {ev.registeredCount ?? 0} / {ev.maxParticipants} registered
                          </div>
                        )}
                      </div>
                      {ev.registrationDeadline && (
                        <p className="mt-3 text-xs text-amber-600 font-medium">Deadline: {ev.registrationDeadline}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COMMUNITY POSTS TAB ────────────────────────────────────────── */}
          {activeTab === "Community Posts" && (
            <div className="p-5">
              <div className="flex gap-2 mb-5">
                <button onClick={() => setPostTab("approved")}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors
                    ${postTab === "approved" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  Approved Posts ({posts.length})
                </button>
                <button onClick={() => setPostTab("pending")}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors
                    ${postTab === "pending" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  Pending Approval ({pendingPosts.length})
                </button>
              </div>
              {postsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" /> Loading posts…
                </div>
              ) : (
                <div className="space-y-3">
                  {(postTab === "approved" ? posts : pendingPosts).length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <FileText size={36} className="mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No posts here</p>
                    </div>
                  ) : (
                    (postTab === "approved" ? posts : pendingPosts).map((post) => (
                      <motion.div key={post.id} layout
                        className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {post.pinned && <Pin size={12} className="text-blue-500 flex-shrink-0" />}
                              <h4 className="font-bold text-gray-800 text-sm">{post.title}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${POST_TYPE_COLOR[post.postType] || "bg-gray-100 text-gray-600"}`}>
                                {post.postType?.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                            <p className="text-xs text-gray-400">
                              By <span className="font-medium text-gray-600">{post.alumniName || "Alumni"}</span>
                              {post.createdAt && ` · ${new Date(post.createdAt).toLocaleDateString("en-IN")}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {postTab === "pending" && (
                              <button onClick={() => handleApprovePost(post.id)}
                                className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors" title="Approve">
                                <Check size={15} />
                              </button>
                            )}
                            {postTab === "approved" && (
                              <button onClick={() => handlePinPost(post.id)}
                                className={`p-1.5 rounded-lg transition-colors ${post.pinned ? "text-blue-500 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-50 hover:text-blue-500"}`}
                                title={post.pinned ? "Unpin" : "Pin"}>
                                {post.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                              </button>
                            )}
                            <button onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── MENTORSHIP TAB ─────────────────────────────────────────────── */}
          {activeTab === "Mentorship" && (
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-5">
                Alumni who have opted in as mentors — students can send mentorship requests to these profiles.
              </p>
              {mentorsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" /> Loading mentors…
                </div>
              ) : mentors.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Award size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No mentors yet</p>
                  <p className="text-sm mt-1">Alumni can enable mentor mode from their profile</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {mentors.map((m) => (
                    <div key={m.id} className="border border-gray-100 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(m.firstName?.[0] || "M").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{m.designation || "Mentor"}</p>
                        </div>
                      </div>
                      {m.currentOrganization && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <Building2 size={12} className="text-gray-400" />{m.currentOrganization}
                        </div>
                      )}
                      {m.passoutYear && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <GraduationCap size={12} className="text-gray-400" />Batch of {m.passoutYear}
                        </div>
                      )}
                      {m.mentorSkills && (
                        <div className="flex flex-wrap gap-1">
                          {m.mentorSkills.split(",").slice(0, 4).map((skill, i) => (
                            <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md">{skill.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Add Alumni Modal ──────────────────────────────────────────────── */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setAddForm(EMPTY_ADD_FORM); }} title="Add Alumni Manually" wide>
        <form onSubmit={handleAddAlumni} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *">
              <input required value={addForm.firstName} onChange={(e) => setAdd("firstName", e.target.value)} className={inp} placeholder="Rahul" />
            </Field>
            <Field label="Last Name">
              <input value={addForm.lastName} onChange={(e) => setAdd("lastName", e.target.value)} className={inp} placeholder="Sharma" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={addForm.email} onChange={(e) => setAdd("email", e.target.value)} className={inp} placeholder="rahul@gmail.com" />
            </Field>
            <Field label="Phone">
              <input value={addForm.phoneNumber} onChange={(e) => setAdd("phoneNumber", e.target.value)} className={inp} placeholder="+91 9999..." />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Passout Year *">
              <input required value={addForm.passoutYear} onChange={(e) => setAdd("passoutYear", e.target.value)} className={inp} placeholder="2023" />
            </Field>
            <Field label="Last Class">
              <input value={addForm.lastClass} onChange={(e) => setAdd("lastClass", e.target.value)} className={inp} placeholder="Class 12 - Science" />
            </Field>
          </div>
          <Field label="Admission Number">
            <input value={addForm.admissionNumber} onChange={(e) => setAdd("admissionNumber", e.target.value)} className={inp} placeholder="SCH-2019-042" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employment Status">
              <select value={addForm.employmentStatus} onChange={(e) => setAdd("employmentStatus", e.target.value)} className={sel}>
                {EMPLOYMENT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Current Organization">
              <input value={addForm.currentOrganization} onChange={(e) => setAdd("currentOrganization", e.target.value)} className={inp} placeholder="Google India" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Designation">
              <input value={addForm.designation} onChange={(e) => setAdd("designation", e.target.value)} className={inp} placeholder="Software Engineer" />
            </Field>
            <Field label="Current City">
              <input value={addForm.currentCity} onChange={(e) => setAdd("currentCity", e.target.value)} className={inp} placeholder="Mumbai" />
            </Field>
          </div>
          {/* NEW: extra fields from AlumniRequest */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Highest Qualification">
              <input value={addForm.highestQualification} onChange={(e) => setAdd("highestQualification", e.target.value)} className={inp} placeholder="B.Tech" />
            </Field>
            <Field label="College / University">
              <input value={addForm.collegeOrUniversity} onChange={(e) => setAdd("collegeOrUniversity", e.target.value)} className={inp} placeholder="IIT Bombay" />
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <input type="url" value={addForm.linkedinUrl} onChange={(e) => setAdd("linkedinUrl", e.target.value)} className={inp} placeholder="https://linkedin.com/in/..." />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={addForm.isMentor} onChange={(e) => setAdd("isMentor", e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm font-medium text-gray-700">Register as Mentor</span>
          </label>
          {addForm.isMentor && (
            <Field label="Mentor Skills (comma separated)">
              <input value={addForm.mentorSkills} onChange={(e) => setAdd("mentorSkills", e.target.value)} className={inp} placeholder="React, Node.js, Career Guidance" />
            </Field>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setAddModal(false); setAddForm(EMPTY_ADD_FORM); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={addLoading}
              className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {addLoading && <Loader2 size={15} className="animate-spin" />}
              Add Alumni
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Create Event Modal ────────────────────────────────────────────── */}
      <Modal open={eventModal} onClose={() => { setEventModal(false); setEventForm(EMPTY_EVENT_FORM); }} title="Create Alumni Event" wide>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Field label="Event Title *">
            <input required value={eventForm.title} onChange={(e) => setEv("title", e.target.value)} className={inp} placeholder="Annual Alumni Meet 2025" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event Type">
              <select value={eventForm.eventType} onChange={(e) => setEv("eventType", e.target.value)} className={sel}>
                {EVENT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Event Date *">
              <input required type="date" value={eventForm.eventDate} onChange={(e) => setEv("eventDate", e.target.value)} className={inp} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event Time">
              <input type="time" value={eventForm.eventTime} onChange={(e) => setEv("eventTime", e.target.value)} className={inp} />
            </Field>
            <Field label="Registration Deadline">
              <input type="date" value={eventForm.registrationDeadline} onChange={(e) => setEv("registrationDeadline", e.target.value)} className={inp} />
            </Field>
          </div>
          <Field label="Venue">
            <input value={eventForm.venue} onChange={(e) => setEv("venue", e.target.value)} className={inp} placeholder="School Auditorium, Mumbai" />
          </Field>
          <Field label="Meet Link (for online events)">
            <input type="url" value={eventForm.meetLink} onChange={(e) => setEv("meetLink", e.target.value)} className={inp} placeholder="https://meet.google.com/..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Participants">
              <input type="number" min="1" value={eventForm.maxParticipants} onChange={(e) => setEv("maxParticipants", e.target.value)} className={inp} placeholder="200" />
            </Field>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={eventForm.isPublic} onChange={(e) => setEv("isPublic", e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm font-medium text-gray-700">Public Event</span>
              </label>
            </div>
          </div>
          <Field label="Description">
            <textarea rows={3} value={eventForm.description} onChange={(e) => setEv("description", e.target.value)} className={`${inp} resize-none`} placeholder="Event description…" />
          </Field>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setEventModal(false); setEventForm(EMPTY_EVENT_FORM); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={eventLoading}
              className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {eventLoading && <Loader2 size={15} className="animate-spin" />}
              Create Event
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Alumni Detail Modal ───────────────────────────────────────────── */}
      <Modal open={!!detailAlumni} onClose={() => setDetailAlumni(null)} title="Alumni Details" wide>
        {detailAlumni && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {(detailAlumni.firstName?.[0] || "A").toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{detailAlumni.firstName} {detailAlumni.lastName}</h3>
                <p className="text-sm text-gray-500">{detailAlumni.designation || "Alumni"}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_BADGE[detailAlumni.status] || "bg-gray-100 text-gray-500"}`}>
                  {detailAlumni.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Mail,          label: "Email",           value: detailAlumni.email },
                { icon: Phone,         label: "Phone",           value: detailAlumni.phoneNumber },
                { icon: GraduationCap, label: "Passout Year",    value: detailAlumni.passoutYear },
                { icon: BookOpen,      label: "Last Class",      value: detailAlumni.lastClass },
                { icon: Building2,     label: "Organization",    value: detailAlumni.currentOrganization },
                { icon: Briefcase,     label: "Designation",     value: detailAlumni.designation },
                { icon: MapPin,        label: "Location",        value: [detailAlumni.currentCity, detailAlumni.currentCountry].filter(Boolean).join(", ") },
                { icon: Briefcase,     label: "Employment",      value: detailAlumni.employmentStatus?.replace(/_/g, " ") },
                { icon: GraduationCap, label: "Qualification",   value: detailAlumni.highestQualification },
                { icon: BookOpen,      label: "College",         value: detailAlumni.collegeOrUniversity },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-center gap-2 text-gray-600">
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 w-24 flex-shrink-0">{label}:</span>
                  <span className="font-medium text-gray-700 truncate">{value}</span>
                </div>
              ) : null)}
            </div>
            {detailAlumni.bio && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                <p className="text-sm text-gray-600">{detailAlumni.bio}</p>
              </div>
            )}
            {detailAlumni.isMentor && detailAlumni.mentorSkills && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mentor Skills</p>
                <div className="flex flex-wrap gap-1">
                  {detailAlumni.mentorSkills.split(",").map((s, i) => (
                    <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {detailAlumni.linkedinUrl && (
              <a href={detailAlumni.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
                <Linkedin size={14} /> View LinkedIn Profile
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}