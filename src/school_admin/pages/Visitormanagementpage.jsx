import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  UserCheck, UserX, Users, Clock, AlertTriangle,
  Plus, Search, LogOut, X, Loader2, ChevronDown,
  Eye, Phone, CalendarDays, Building2, Car, IdCard,
  RefreshCw, TrendingUp,
} from "lucide-react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPOSES = [
  { value: "PARENT_MEETING",    label: "Parent Meeting"     },
  { value: "ADMISSION_ENQUIRY", label: "Admission Enquiry"  },
  { value: "OFFICIAL_WORK",     label: "Official Work"      },
  { value: "DELIVERY",          label: "Delivery"           },
  { value: "MAINTENANCE",       label: "Maintenance"        },
  { value: "INTERVIEW",         label: "Interview"          },
  { value: "INSPECTION",        label: "Inspection"         },
  { value: "EVENT",             label: "Event"              },
  { value: "OTHER",             label: "Other"              },
];

const STATUS_STYLE = {
  CHECKED_IN:  { bg: "bg-green-100",  text: "text-green-700",  label: "Inside"      },
  CHECKED_OUT: { bg: "bg-gray-100",   text: "text-gray-600",   label: "Checked Out" },
  OVERSTAY:    { bg: "bg-red-100",    text: "text-red-700",    label: "Overstay"    },
};

const EMPTY_FORM = {
  visitorName: "", visitorPhone: "", visitorEmail: "",
  idProofType: "", idProofNumber: "",
  purpose: "PARENT_MEETING", purposeDescription: "",
  whomToMeet: "", whomToMeetDepartment: "",
  numberOfVisitors: 1, vehicleNumber: "",
  expectedCheckOutTime: "", remarks: "",
};

// ─── API Functions ────────────────────────────────────────────────────────────

const getBase = (schoolId) => `/api/schools/${schoolId}/visitors`;

const apiGetByDate   = async (schoolId, date)    => (await API.get(`${getBase(schoolId)}/by-date?date=${date}`)).data;
const apiGetSummary  = async (schoolId, date)    => (await API.get(`${getBase(schoolId)}/summary/day?date=${date}`)).data;
const apiGetInside   = async (schoolId)          => (await API.get(`${getBase(schoolId)}/inside`)).data;
const apiSearch      = async (schoolId, q)       => (await API.get(`${getBase(schoolId)}/search?q=${q}`)).data;
const apiCheckIn     = async (schoolId, dto)     => (await API.post(`${getBase(schoolId)}/checkin`, dto)).data;
const apiCheckOut    = async (schoolId, id, dto) => (await API.patch(`${getBase(schoolId)}/${id}/checkout`, dto)).data;
const apiGetOverstay = async (schoolId)          => (await API.get(`${getBase(schoolId)}/overstay`)).data;

// ─── Helper ───────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split("T")[0];

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

// Summary Stat Card
function SummaryCard({ label, value, icon: Icon, colorClass, subLabel }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
          {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon size={22} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.CHECKED_IN;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Check-In Modal ───────────────────────────────────────────────────────────

function CheckInModal({ onClose, schoolId }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

  const set = useCallback((field) => (e) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
  }, []);

  const mutation = useMutation({
    mutationFn: (dto) => apiCheckIn(schoolId, dto),
    onSuccess: (data) => {
      toast.success(`✅ Visitor checked in! Pass: ${data.visitorPassNumber}`);
      queryClient.invalidateQueries({ queryKey: ["visitors", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["visitorSummary", schoolId] });
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Check-in failed"),
  });

  const handleSubmit = () => {
    if (!form.visitorName.trim()) return toast.error("Visitor name is required");
    if (!form.visitorPhone.trim()) return toast.error("Phone number is required");
    if (!form.whomToMeet.trim()) return toast.error("Whom to meet is required");
    const dto = {
      ...form,
      expectedCheckOutTime: form.expectedCheckOutTime
        ? new Date(form.expectedCheckOutTime).toISOString()
        : null,
    };
    mutation.mutate(dto);
  };

  // ESC close
  const handleKey = useCallback((e) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useState(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold">New Visitor Check-In</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill details to register the visitor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Section: Visitor Info */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Visitor Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="label-style">Full Name <Req /></label>
                <input className="input-style" placeholder="Rahul Sharma" value={form.visitorName} onChange={set("visitorName")} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="label-style">Phone Number <Req /></label>
                <input className="input-style" placeholder="9876543210" value={form.visitorPhone} onChange={set("visitorPhone")} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="label-style">Email <Opt /></label>
                <input className="input-style" placeholder="rahul@email.com" value={form.visitorEmail} onChange={set("visitorEmail")} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="label-style">Number of People <Req /></label>
                <input className="input-style" type="number" min={1} value={form.numberOfVisitors} onChange={set("numberOfVisitors")} />
              </div>
            </div>
          </div>

          {/* Section: ID Proof */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">ID Proof</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-style">ID Type <Opt /></label>
                <select className="input-style" value={form.idProofType} onChange={set("idProofType")}>
                  <option value="">Select</option>
                  {["AADHAAR","PAN","PASSPORT","DRIVING_LICENSE","VOTER_ID"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-style">ID Number <Opt /></label>
                <input className="input-style" placeholder="XXXX-XXXX-XXXX" value={form.idProofNumber} onChange={set("idProofNumber")} />
              </div>
            </div>
          </div>

          {/* Section: Visit Details */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Visit Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-style">Purpose <Req /></label>
                <select className="input-style" value={form.purpose} onChange={set("purpose")}>
                  {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-style">Whom to Meet <Req /></label>
                <input className="input-style" placeholder="Mr. Principal / Mrs. Sharma" value={form.whomToMeet} onChange={set("whomToMeet")} />
              </div>
              <div>
                <label className="label-style">Department / Class <Opt /></label>
                <input className="input-style" placeholder="Principal Office / Class 7B" value={form.whomToMeetDepartment} onChange={set("whomToMeetDepartment")} />
              </div>
              <div>
                <label className="label-style">Vehicle Number <Opt /></label>
                <input className="input-style" placeholder="MH-12-AB-1234" value={form.vehicleNumber} onChange={set("vehicleNumber")} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="label-style">Expected Check-Out <Opt /></label>
                <input type="datetime-local" className="input-style" value={form.expectedCheckOutTime} onChange={set("expectedCheckOutTime")} />
              </div>
              {form.purpose === "OTHER" && (
                <div className="col-span-2">
                  <label className="label-style">Purpose Description <Req /></label>
                  <input className="input-style" placeholder="Describe the purpose" value={form.purposeDescription} onChange={set("purposeDescription")} />
                </div>
              )}
              <div className="col-span-2">
                <label className="label-style">Remarks <Opt /></label>
                <textarea className="input-style resize-none h-20" placeholder="Any notes for security/reception..." value={form.remarks} onChange={set("remarks")} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
          <button onClick={onClose} disabled={mutation.isPending} className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-semibold"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {mutation.isPending ? "Registering..." : "Check In Visitor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Confirm Modal ───────────────────────────────────────────────────

function CheckOutModal({ visitor, onClose, schoolId }) {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiCheckOut(schoolId, visitor.id, { remarks }),
    onSuccess: () => {
      toast.success(`${visitor.visitorName} checked out!`);
      queryClient.invalidateQueries({ queryKey: ["visitors", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["visitorSummary", schoolId] });
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Checkout failed"),
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-xl">
            <LogOut size={22} className="text-orange-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Check Out Visitor</h2>
            <p className="text-sm text-gray-500">Pass: {visitor.visitorPassNumber}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1">
          <p className="font-semibold">{visitor.visitorName}</p>
          <p className="text-sm text-gray-500">{visitor.visitorPhone}</p>
          <p className="text-sm text-gray-500">Meeting: {visitor.whomToMeet}</p>
          <p className="text-sm text-gray-500">Checked in at: {fmt(visitor.checkInTime)}</p>
        </div>

        <div className="mb-4">
          <label className="label-style">Exit Remarks <Opt /></label>
          <textarea
            className="input-style resize-none h-20"
            placeholder="Any exit notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={mutation.isPending} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition font-semibold"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {mutation.isPending ? "Processing..." : "Confirm Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Visitor Detail Drawer ────────────────────────────────────────────────────

function VisitorDetailDrawer({ visitor, onClose, onCheckout }) {
  if (!visitor) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">Visitor Details</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Pass Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Visitor Pass</p>
            <p className="text-xl font-mono font-bold text-blue-700 mt-1">{visitor.visitorPassNumber}</p>
            <div className="mt-2"><StatusBadge status={visitor.status} /></div>
          </div>

          {/* Details */}
          <DetailRow icon={Users} label="Name" value={visitor.visitorName} />
          <DetailRow icon={Phone} label="Phone" value={visitor.visitorPhone} />
          {visitor.visitorEmail && <DetailRow icon={Users} label="Email" value={visitor.visitorEmail} />}
          <DetailRow icon={Building2} label="Meeting" value={`${visitor.whomToMeet}${visitor.whomToMeetDepartment ? ` — ${visitor.whomToMeetDepartment}` : ""}`} />
          <DetailRow icon={CalendarDays} label="Purpose" value={PURPOSES.find(p => p.value === visitor.purpose)?.label ?? visitor.purpose} />
          <DetailRow icon={Users} label="Group Size" value={`${visitor.numberOfVisitors} person(s)`} />
          {visitor.vehicleNumber && <DetailRow icon={Car} label="Vehicle" value={visitor.vehicleNumber} />}
          {visitor.idProofType && <DetailRow icon={IdCard} label="ID Proof" value={`${visitor.idProofType} — ${visitor.idProofNumber}`} />}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Check-In</span>
              <span className="font-medium">{fmt(visitor.checkInTime)} · {fmtDate(visitor.checkInTime)}</span>
            </div>
            {visitor.expectedCheckOutTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expected Out</span>
                <span className="font-medium">{fmt(visitor.expectedCheckOutTime)}</span>
              </div>
            )}
            {visitor.actualCheckOutTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Actual Out</span>
                <span className="font-medium text-green-700">{fmt(visitor.actualCheckOutTime)}</span>
              </div>
            )}
            {visitor.durationMinutes && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{Math.floor(visitor.durationMinutes / 60)}h {visitor.durationMinutes % 60}m</span>
              </div>
            )}
          </div>

          {visitor.remarks && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              <p className="font-semibold text-xs text-gray-400 uppercase mb-1">Remarks</p>
              <p>{visitor.remarks}</p>
            </div>
          )}

          {/* Checkout button */}
          {visitor.status === "CHECKED_IN" && (
            <button
              onClick={() => { onClose(); onCheckout(visitor); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold transition mt-2"
            >
              <LogOut size={18} /> Check Out Visitor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Small Helpers ────────────────────────────────────────────────────────────
const Req = () => <span className="text-red-500 ml-0.5">*</span>;
const Opt = () => <span className="text-gray-400 font-normal ml-1">(Optional)</span>;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VisitorManagementPage() {
  const schoolId = useMemo(() => localStorage.getItem("schoolId"), []);
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("today"); // today | inside | overstay
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [detailVisitor, setDetailVisitor] = useState(null);

  // Debounce search
  const handleSearch = useCallback((val) => {
    setSearchQuery(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  // ─── Queries ─────────────────────────────────────────────────────────────

  // Day Summary
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ["visitorSummary", schoolId, selectedDate],
    queryFn: () => apiGetSummary(schoolId, selectedDate),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 2,
  });

  // Visitors by date
  const { data: visitorsByDate = [], isLoading: listLoading, refetch: refetchList } = useQuery({
    queryKey: ["visitors", schoolId, "date", selectedDate],
    queryFn: () => apiGetByDate(schoolId, selectedDate),
    enabled: !!schoolId && activeTab === "today",
    staleTime: 1000 * 60 * 1,
  });

  // Currently inside
  const { data: insideVisitors = [], isLoading: insideLoading } = useQuery({
    queryKey: ["visitors", schoolId, "inside"],
    queryFn: () => apiGetInside(schoolId),
    enabled: !!schoolId && activeTab === "inside",
    staleTime: 1000 * 30,
    refetchInterval: activeTab === "inside" ? 1000 * 30 : false, // auto-refresh every 30s when on this tab
  });

  // Overstay
  const { data: overstayVisitors = [], isLoading: overstayLoading } = useQuery({
    queryKey: ["visitors", schoolId, "overstay"],
    queryFn: () => apiGetOverstay(schoolId),
    enabled: !!schoolId && activeTab === "overstay",
    staleTime: 1000 * 60 * 5,
  });

  // Search
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["visitors", schoolId, "search", debouncedSearch],
    queryFn: () => apiSearch(schoolId, debouncedSearch),
    enabled: !!schoolId && debouncedSearch.length >= 2,
    staleTime: 1000 * 30,
  });

  // ─── Derived State ────────────────────────────────────────────────────────

  const isSearchMode = debouncedSearch.length >= 2;

  const displayedVisitors = useMemo(() => {
    if (isSearchMode) return searchResults;
    if (activeTab === "inside") return insideVisitors;
    if (activeTab === "overstay") return overstayVisitors;
    return visitorsByDate;
  }, [isSearchMode, searchResults, activeTab, visitorsByDate, insideVisitors, overstayVisitors]);

  const isTableLoading = isSearchMode
    ? searchLoading
    : activeTab === "inside" ? insideLoading
    : activeTab === "overstay" ? overstayLoading
    : listLoading;

  const handleRefresh = () => {
    refetchList();
    refetchSummary();
    queryClient.invalidateQueries({ queryKey: ["visitors", schoolId, "inside"] });
    toast.success("Data refreshed");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <SchoolAdminSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">
        {/* Top Header */}
        <div className="bg-white border-b px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage all school visitors in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 border rounded-lg transition"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={() => setShowCheckIn(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              <Plus size={16} /> Check In Visitor
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ─── Summary Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-5 border-l-4 border-gray-200 animate-pulse">
                  <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-12 bg-gray-300 rounded" />
                </div>
              ))
            ) : (
              <>
                <SummaryCard label="Total Visits" value={summary?.totalVisits} icon={Users}         colorClass="border-blue-500"   subLabel="entries today" />
                <SummaryCard label="Total People" value={summary?.totalPeople} icon={TrendingUp}    colorClass="border-indigo-500"  subLabel="individuals" />
                <SummaryCard label="Inside Now"   value={summary?.currentlyInside} icon={UserCheck} colorClass="border-green-500"  subLabel="currently inside" />
                <SummaryCard label="Overstay"     value={summary?.overstay}    icon={AlertTriangle} colorClass="border-red-500"   subLabel="exceeded expected time" />
              </>
            )}
          </div>

          {/* ─── Purpose Breakdown ──────────────────────────────────── */}
          {summary && !summaryLoading && (
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Today's Purpose Breakdown</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Parent Meeting",    val: summary.parentMeetingCount    },
                  { label: "Admission Enquiry", val: summary.admissionEnquiryCount },
                  { label: "Official Work",     val: summary.officialWorkCount     },
                  { label: "Delivery",          val: summary.deliveryCount         },
                  { label: "Maintenance",       val: summary.maintenanceCount      },
                  { label: "Others",            val: summary.otherCount            },
                ].map((item) => item.val > 0 && (
                  <span key={item.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {item.label} <span className="font-bold">{item.val}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Search + Date + Tabs ────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by visitor name or phone..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <CalendarDays size={16} className="text-gray-400" />
                <input
                  type="date"
                  className="text-sm focus:outline-none bg-transparent"
                  value={selectedDate}
                  max={todayISO()}
                  onChange={(e) => { setSelectedDate(e.target.value); setActiveTab("today"); }}
                />
              </div>
            </div>

            {/* Tabs */}
            {!isSearchMode && (
              <div className="flex gap-1 border-b">
                {[
                  { key: "today",   label: "All Visitors",      count: visitorsByDate.length  },
                  { key: "inside",  label: "Currently Inside",   count: insideVisitors.length  },
                  { key: "overstay",label: "Overstay",           count: overstayVisitors.length, alert: overstayVisitors.length > 0 },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px
                      ${activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold
                      ${tab.alert ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Visitors Table ──────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {isSearchMode && (
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-700 font-medium">
                {searchLoading ? "Searching..." : `${searchResults.length} result(s) for "${debouncedSearch}"`}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Visitor</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Purpose</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Meeting</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Check-In</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Check-Out</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isTableLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : displayedVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <UserX size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No visitors found</p>
                        <p className="text-xs mt-1">
                          {activeTab === "inside" ? "No visitors currently inside the school"
                            : activeTab === "overstay" ? "No overstay visitors 🎉"
                            : "No visitors recorded for this date"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedVisitors.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        {/* Visitor */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{v.visitorName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{v.visitorPhone}</p>
                            <p className="text-xs font-mono text-blue-500 mt-0.5">{v.visitorPassNumber}</p>
                          </div>
                        </td>

                        {/* Purpose */}
                        <td className="px-4 py-4">
                          <p className="text-gray-700">{PURPOSES.find(p => p.value === v.purpose)?.label ?? v.purpose}</p>
                          {v.numberOfVisitors > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">{v.numberOfVisitors} people</p>
                          )}
                        </td>

                        {/* Meeting */}
                        <td className="px-4 py-4">
                          <p className="text-gray-700">{v.whomToMeet}</p>
                          {v.whomToMeetDepartment && (
                            <p className="text-xs text-gray-400 mt-0.5">{v.whomToMeetDepartment}</p>
                          )}
                        </td>

                        {/* Check-In */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{fmt(v.checkInTime)}</td>

                        {/* Check-Out */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {v.actualCheckOutTime ? (
                            <span className="text-gray-600">{fmt(v.actualCheckOutTime)}</span>
                          ) : v.expectedCheckOutTime ? (
                            <span className="text-orange-500 text-xs">Expected: {fmt(v.expectedCheckOutTime)}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4"><StatusBadge status={v.status} /></td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailVisitor(v)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {v.status === "CHECKED_IN" && (
                              <button
                                onClick={() => setCheckoutTarget(v)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-semibold transition"
                              >
                                <LogOut size={13} /> Check Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer count */}
            {!isTableLoading && displayedVisitors.length > 0 && (
              <div className="px-5 py-3 border-t bg-gray-50 text-xs text-gray-400">
                Showing {displayedVisitors.length} record(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals & Drawers ────────────────────────────────────── */}
      {showCheckIn && <CheckInModal onClose={() => setShowCheckIn(false)} schoolId={schoolId} />}
      {checkoutTarget && <CheckOutModal visitor={checkoutTarget} onClose={() => setCheckoutTarget(null)} schoolId={schoolId} />}
      {detailVisitor && (
        <VisitorDetailDrawer
          visitor={detailVisitor}
          onClose={() => setDetailVisitor(null)}
          onCheckout={(v) => setCheckoutTarget(v)}
        />
      )}
    </div>
  );
}