// src/teachers/pages/TeacherAttendance.jsx
// Combined GPS Attendance + Monthly Records — single unified page
// Exact styling from original TeacherGpsAttendance.jsx + TeacherMyAttendance.jsx

import { useState, useEffect, useRef } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { teacherSelfAttendanceService } from "../services/teacherService";
import { getUserData } from "../../common/utils/tokenStorage";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw,
  Navigation,
  LogOut,
  LogIn,
  CalendarDays,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * ─────────────────────────────────────────────────────────────
 * MULTI-PUNCH FLOW:
 * 1. First POST /mark-self → status=MARKED (logIndex=1)
 * 2. Subsequent POST /mark-self → status=ALREADY_MARKED (logIndex=2,3...)
 * 3. GET /today-status → first punch status + all punches list
 * 4. GET /today-logs → raw list of all punches today
 * ─────────────────────────────────────────────────────────────
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GPS_STATUS_CONFIG = {
  MARKED: {
    label: "Attendance Mark Ho Gayi ✅",
    color: "bg-emerald-50 border-emerald-300 text-emerald-900",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgAccent: "bg-emerald-100",
  },
  ALREADY_MARKED: {
    label: "Re-punch Recorded",
    color: "bg-blue-50 border-blue-300 text-blue-900",
    icon: Clock,
    iconColor: "text-blue-600",
    bgAccent: "bg-blue-100",
  },
  LOCATION_MISMATCH: {
    label: "School Ke Bahar Hain",
    color: "bg-red-50 border-red-300 text-red-900",
    icon: XCircle,
    iconColor: "text-red-600",
    bgAccent: "bg-red-100",
  },
  PRESENT: {
    label: "Present",
    color: "bg-emerald-50 border-emerald-300 text-emerald-900",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgAccent: "bg-emerald-100",
  },
  LATE: {
    label: "Late",
    color: "bg-amber-50 border-amber-300 text-amber-900",
    icon: Clock,
    iconColor: "text-amber-600",
    bgAccent: "bg-amber-100",
  },
  NOT_MARKED: {
    label: "Not Marked Yet",
    color: "bg-gray-50 border-gray-300 text-gray-900",
    icon: AlertCircle,
    iconColor: "text-gray-600",
    bgAccent: "bg-gray-100",
  },
  ERROR: {
    label: "Error",
    color: "bg-red-50 border-red-300 text-red-900",
    icon: AlertCircle,
    iconColor: "text-red-600",
    bgAccent: "bg-red-100",
  },
};

const HISTORY_STATUS_CONFIG = {
  PRESENT: {
    label: "Present",
    color: "bg-emerald-50 text-emerald-700 border-emerald-300",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  ABSENT: {
    label: "Absent",
    color: "bg-red-50 text-red-700 border-red-300",
    icon: XCircle,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
  },
  LATE: {
    label: "Late",
    color: "bg-amber-50 text-amber-700 border-amber-300",
    icon: Clock,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  HALF_DAY: {
    label: "Half Day",
    color: "bg-orange-50 text-orange-700 border-orange-300",
    icon: AlertCircle,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  LEAVE: {
    label: "On Leave",
    color: "bg-blue-50 text-blue-700 border-blue-300",
    icon: AlertCircle,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

export default function TeacherAttendance() {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState("gps"); // "gps" | "records"

  // ── GPS / Today states ──
  const [todayStatus, setTodayStatus]         = useState(null);
  const [allLogs, setAllLogs]                 = useState([]);
  const [loadingStatus, setLoadingStatus]     = useState(true);
  const [marking, setMarking]                 = useState(false);
  const [gpsState, setGpsState]               = useState("idle"); // idle | fetching | ready | error
  const [coords, setCoords]                   = useState(null);
  const [gpsError, setGpsError]               = useState("");
  const [markResult, setMarkResult]           = useState(null);
  const [remarks, setRemarks]                 = useState("");
  const [showPunchHistory, setShowPunchHistory] = useState(false);
  const autoRefreshRef                        = useRef(null);

  // ── Monthly records states ──
  const now = new Date();
  const [month, setMonth]                     = useState(now.getMonth() + 1);
  const [year, setYear]                       = useState(now.getFullYear());
  const [records, setRecords]                 = useState([]);
  const [summary, setSummary]                 = useState(null);
  const [loadingRecords, setLoadingRecords]   = useState(false);
  const [teacherId, setTeacherId]             = useState(null);

  // ── Init ──
  useEffect(() => {
    const userData = getUserData();
    if (userData?.userId) setTeacherId(userData.userId);
    fetchTodayData();
    autoRefreshRef.current = setInterval(fetchTodayData, 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, []);

  useEffect(() => {
    if (teacherId && activeTab === "records") fetchMonthlyAttendance();
  }, [teacherId, activeTab, month, year]);

  // ── API: Today ──
  const fetchTodayData = async () => {
    setLoadingStatus(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        teacherSelfAttendanceService.getTodayStatus(),
        teacherSelfAttendanceService.getTodayLogs(),
      ]);
      setTodayStatus(statusRes.data);
      setAllLogs(logsRes.data || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching today data:", err);
      }
      setTodayStatus(null);
      setAllLogs([]);
    } finally {
      setLoadingStatus(false);
    }
  };

  // ── API: Monthly ──
  const fetchMonthlyAttendance = async () => {
    setLoadingRecords(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        teacherSelfAttendanceService.getMonthlyRecords(teacherId, month, year),
        teacherSelfAttendanceService.getMonthlySummary(teacherId, month, year),
      ]);
      setRecords(recordsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setRecords([]);
      setSummary(null);
    } finally {
      setLoadingRecords(false);
    }
  };

  // ── GPS ──
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser GPS support nahi hai.");
      setGpsState("error");
      return;
    }
    setGpsState("fetching");
    setGpsError("");
    setMarkResult(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        setGpsState("ready");
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission deny ho gayi. Browser settings allow karo."
            : err.code === 2
            ? "GPS signal nahi mil raha. Bahar try karo."
            : "GPS timeout — dobara try karo.";
        setGpsError(msg);
        setGpsState("error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Mark Attendance ──
  const handleMarkAttendance = async () => {
    if (!coords) return;
    setMarking(true);
    setMarkResult(null);
    try {
      const n = new Date();
      const checkInTime = `${String(n.getHours()).padStart(2, "0")}:${String(
        n.getMinutes()
      ).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`;

      const res = await teacherSelfAttendanceService.markGpsAttendance({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        checkInTime,
        remarks: remarks.trim() || null,
      });
      setMarkResult(res.data);
      setCoords(null);
      setGpsState("idle");
      setRemarks("");
      setTimeout(fetchTodayData, 500);
    } catch (err) {
      setMarkResult({
        status: "ERROR",
        message: err.response?.data?.message || "Server error — dobara try karo.",
      });
    } finally {
      setMarking(false);
    }
  };

  // ── Month navigation ──
  const goToPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth() + 1)) return;
    setMonth(nm);
    if (month === 12) setYear((y) => y + 1);
  };
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  // ── Derived ──
  const todayStatusCfg = todayStatus
    ? GPS_STATUS_CONFIG[todayStatus.status] || GPS_STATUS_CONFIG.NOT_MARKED
    : GPS_STATUS_CONFIG.NOT_MARKED;

  const markResultCfg = markResult
    ? GPS_STATUS_CONFIG[markResult.status] || GPS_STATUS_CONFIG.ERROR
    : null;

  const alreadyMarked =
    todayStatus?.status === "MARKED" ||
    todayStatus?.status === "ALREADY_MARKED" ||
    markResult?.status === "MARKED" ||
    markResult?.status === "ALREADY_MARKED";

  const presentDays = summary?.presentDays ?? 0;
  const totalWorkingDays = summary?.totalWorkingDays ?? 0;
  const attendancePercentage =
    totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

  const formatTime = (t) => {
    if (!t) return "-";
    return t.toString().substring(0, 5);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      {/* ── SIDEBAR ── */}
      <TeacherSidebar />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ──────────────────────────────────────────────────────────────
              HEADER
              ────────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                {activeTab === "gps" ? <MapPin size={24} /> : <CalendarDays size={24} />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeTab === "gps" ? "GPS Attendance" : "My Attendance"}
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  {activeTab === "gps"
                    ? "School premises mein rehkar attendance mark karo"
                    : "Monthly attendance records and summary"}
                </p>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              TAB SWITCHER
              ────────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex gap-1.5">
            <button
              onClick={() => setActiveTab("gps")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
                ${activeTab === "gps"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <MapPin size={15} />
              GPS Attendance
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
                ${activeTab === "records"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <CalendarDays size={15} />
              My Records
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              GPS ATTENDANCE TAB
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "gps" && (
            <>
              {/* TODAY'S STATUS CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/5 to-blue-500/5 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Aaj Ka Status</h2>
                  <button
                    onClick={fetchTodayData}
                    disabled={loadingStatus}
                    className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw size={18} className={loadingStatus ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="p-6">
                  {loadingStatus ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
                      <Loader size={18} className="animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : todayStatus ? (
                    <div className={`flex items-start gap-4 p-4 rounded-xl border ${todayStatusCfg.color}`}>
                      <div className={`p-3 rounded-lg ${todayStatusCfg.bgAccent}`}>
                        {(() => {
                          const Icon = todayStatusCfg.icon;
                          return <Icon size={24} className={todayStatusCfg.iconColor} />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{todayStatusCfg.label}</p>
                        {todayStatus.checkInTime && (
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                              <LogIn size={14} />
                              <span>
                                Check-in:{" "}
                                <span className="font-semibold">
                                  {todayStatus.checkInTime.toString().substring(0, 5)}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                        {todayStatus.totalPunchesToday > 0 && (
                          <div className="mt-2 text-sm text-slate-700 font-medium">
                            📍 {todayStatus.totalPunchesToday} punch
                            {todayStatus.totalPunchesToday !== 1 ? "es" : ""} today
                          </div>
                        )}
                        {todayStatus.message && (
                          <p className="text-xs mt-2 text-slate-600">{todayStatus.message}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-600 py-8 justify-center">
                      <Clock size={18} />
                      <span>Attendance abhi mark nahi hui</span>
                    </div>
                  )}
                </div>
              </div>

              {/* MARK ATTENDANCE CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600/5 to-emerald-500/5 px-6 py-4">
                  <h2 className="font-semibold text-slate-900">
                    {alreadyMarked ? "Punch Again" : "Attendance Mark Karo"}
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Step 1: Get GPS */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        1
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        Apni Current Location Lo
                      </span>
                    </div>

                    <button
                      onClick={handleGetGPS}
                      disabled={gpsState === "fetching"}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition
                        ${gpsState === "ready"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : gpsState === "fetching"
                          ? "bg-blue-50 text-blue-600 cursor-not-allowed border border-blue-200"
                          : gpsState === "error"
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700"
                        }`}
                    >
                      {gpsState === "fetching" ? (
                        <><Loader size={16} className="animate-spin" /> GPS signal dhundh raha hai...</>
                      ) : gpsState === "ready" ? (
                        <><CheckCircle size={16} /> GPS Location Mili ✅</>
                      ) : gpsState === "error" ? (
                        <><Navigation size={16} /> Dobara Try Karo</>
                      ) : (
                        <><Navigation size={16} /> GPS Location Lo</>
                      )}
                    </button>

                    {gpsState === "ready" && coords && (
                      <div className="mt-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg space-y-1">
                        <div><span className="font-semibold">Latitude:</span> {coords.latitude.toFixed(6)}</div>
                        <div><span className="font-semibold">Longitude:</span> {coords.longitude.toFixed(6)}</div>
                        <div><span className="font-semibold">Accuracy:</span> {coords.accuracyMeters.toFixed(1)}m</div>
                      </div>
                    )}

                    {gpsState === "error" && gpsError && (
                      <div className="mt-3 text-xs bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                        {gpsError}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Remarks */}
                  {gpsState === "ready" && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                          2
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          Remarks (Optional)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g., On time, Work from field..."
                        maxLength={100}
                        className="w-full border border-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1">{remarks.length}/100</p>
                    </div>
                  )}

                  {/* Step 3: Mark */}
                  {gpsState === "ready" && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                          3
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          Mark Attendance
                        </span>
                      </div>
                      <button
                        onClick={handleMarkAttendance}
                        disabled={marking}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
                      >
                        {marking ? (
                          <><Loader size={16} className="animate-spin" /> Mark ho raha hai...</>
                        ) : (
                          <><CheckCircle size={16} /> Attendance Mark Karo</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mark Result */}
                  {markResult && markResultCfg && (
                    <div className={`flex items-start gap-4 p-4 rounded-xl border ${markResultCfg.color}`}>
                      <div className={`p-3 rounded-lg ${markResultCfg.bgAccent}`}>
                        {(() => {
                          const Icon = markResultCfg.icon;
                          return <Icon size={24} className={markResultCfg.iconColor} />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{markResultCfg.label}</p>
                        {markResult.distanceFromSchoolMeters != null && (
                          <p className="text-xs mt-2 text-slate-700">
                            School se aap{" "}
                            <span className="font-semibold">
                              {markResult.distanceFromSchoolMeters.toFixed(1)} meter
                            </span>{" "}
                            door hain
                          </p>
                        )}
                        {markResult.totalPunchesToday && (
                          <p className="text-xs mt-2 text-slate-700">
                            📍 Total punches today:{" "}
                            <span className="font-semibold">{markResult.totalPunchesToday}</span>
                          </p>
                        )}
                        {markResult.message && (
                          <p className="text-xs mt-2 text-slate-600">{markResult.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PUNCH HISTORY TIMELINE */}
              {allLogs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600/5 to-purple-500/5 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-slate-900">
                        Aaj Ke Punches ({allLogs.length})
                      </h2>
                      <button
                        onClick={() => setShowPunchHistory(!showPunchHistory)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {showPunchHistory ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {showPunchHistory && (
                    <div className="p-6">
                      <div className="space-y-3">
                        {allLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                                #{log.logIndex || idx + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                {log.checkInTime && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <LogIn size={14} className="text-blue-600" />
                                    <span className="font-semibold text-slate-900">
                                      {log.checkInTime.toString().substring(0, 5)}
                                    </span>
                                  </div>
                                )}
                                {log.checkOutTime && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <LogOut size={14} className="text-red-600" />
                                    <span className="font-semibold text-slate-900">
                                      {log.checkOutTime.toString().substring(0, 5)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {log.distanceFromSchoolMeters != null && (
                                <p className="text-xs text-slate-600 mt-2">
                                  📍 {log.distanceFromSchoolMeters.toFixed(1)}m se school
                                </p>
                              )}
                              {log.remarks && (
                                <p className="text-xs text-slate-600 mt-1.5 italic">
                                  "{log.remarks}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INFO BOX */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900">📍 GPS Attendance Information</p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Sirf school ke 5 meter radius ke andar attendance mark hogi</li>
                      <li>• Multiple punches allowed — har punch record hoga</li>
                      <li>• GPS accuracy 50m se zyada kharab hai toh reject ho sakti hai</li>
                      <li>• High Accuracy mode enable karke best results pao</li>
                      <li>• Location nahi milegi toh device settings check karo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              MY RECORDS TAB
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "records" && (
            <>
              {/* MONTH NAVIGATOR */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{MONTHS[month - 1]}</p>
                  <p className="text-sm text-slate-500">{year}</p>
                </div>
                <button
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>

              {/* SUMMARY CARDS */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600">Working Days</p>
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <CalendarDays size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {summary.totalWorkingDays ?? "-"}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-emerald-700">Days Present</p>
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle size={16} className="text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">{presentDays}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-red-700">Days Absent</p>
                      <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle size={16} className="text-red-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                      {summary.absentDays ?? (summary.totalWorkingDays - presentDays)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-blue-700">Attendance %</p>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp size={16} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-blue-700">{attendancePercentage}%</p>
                      {attendancePercentage >= 75 && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          ✓ Good
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ATTENDANCE TABLE */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/5 to-blue-500/5 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    {MONTHS[month - 1]} {year} Records
                  </h2>
                  <button
                    onClick={fetchMonthlyAttendance}
                    disabled={loadingRecords}
                    className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw size={18} className={loadingRecords ? "animate-spin" : ""} />
                  </button>
                </div>

                {loadingRecords ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 text-sm mt-3">Loading attendance records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">
                    <AlertCircle size={32} className="mx-auto text-slate-400 mb-3" />
                    <p>No attendance records found for {MONTHS[month - 1]} {year}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700">Date</th>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700">Day</th>
                          <th className="px-6 py-3 text-center font-semibold text-slate-700">Check-In</th>
                          <th className="px-6 py-3 text-center font-semibold text-slate-700">Check-Out</th>
                          <th className="px-6 py-3 text-center font-semibold text-slate-700">Status</th>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {records.map((record) => {
                          const cfg = HISTORY_STATUS_CONFIG[record.status] || HISTORY_STATUS_CONFIG.ABSENT;
                          const Icon = cfg.icon;
                          const dateObj = new Date(record.date);
                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 text-slate-900 font-medium">
                                {dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-xs">
                                {dateObj.toLocaleDateString("en-IN", { weekday: "short" })}
                              </td>
                              <td className="px-6 py-4 text-center text-slate-700 font-medium">
                                {formatTime(record.checkInTime)}
                              </td>
                              <td className="px-6 py-4 text-center text-slate-700 font-medium">
                                {formatTime(record.checkOutTime)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                    <Icon size={14} />
                                    {cfg.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-xs">
                                {record.remarks
                                  ? <span className="italic">{record.remarks}</span>
                                  : <span className="text-slate-400">-</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* LEGEND */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Status Legend</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {Object.entries(HISTORY_STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon size={14} className={config.iconColor} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import API from "../../common/services/api";
// import { CalendarDays, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
// import { getUserData } from "../../common/utils/tokenStorage";

// export default function TeacherMyAttendance() {
//   const now = new Date();
//   const [month, setMonth] = useState(now.getMonth() + 1);
//   const [year, setYear] = useState(now.getFullYear());
//   const [records, setRecords] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [teacherId, setTeacherId] = useState(null);

//   useEffect(() => {
//     // Get teacher ID from stored user data
//     const userData = getUserData();
//     if (userData?.userId) {
//       setTeacherId(userData.userId);
//     }
//   }, []);

//   useEffect(() => {
//     if (teacherId) {
//       fetchAttendance();
//     }
//   }, [teacherId, month, year]);

//   const fetchAttendance = async () => {
//     setLoading(true);
//     try {
//       const [recordsRes, summaryRes] = await Promise.all([
//         API.get(`/staff-attendance/teacher/${teacherId}/monthly`, { params: { month, year } }),
//         API.get(`/staff-attendance/teacher/${teacherId}/summary`, { params: { month, year } }),
//       ]);
//       setRecords(recordsRes.data || []);
//       setSummary(summaryRes.data || null);
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const statusConfig = {
//     PRESENT: { label: "Present", color: "bg-green-100 text-green-700", icon: CheckCircle },
//     ABSENT: { label: "Absent", color: "bg-red-100 text-red-700", icon: XCircle },
//     LATE: { label: "Late", color: "bg-yellow-100 text-yellow-700", icon: Clock },
//     HALF_DAY: { label: "Half Day", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
//     LEAVE: { label: "On Leave", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
//   };

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const years = [2024, 2025, 2026];

//   const formatTime = (t) => {
//     if (!t) return "-";
//     return t.toString().substring(0, 5);
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <TeacherSidebar />

//       <div className="flex-1 p-6">
//         {/* Header */}
//         <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
//           <div className="flex items-center gap-3">
//             <CalendarDays size={28} className="text-blue-600" />
//             <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
//           </div>

//           {/* Month/Year Picker */}
//           <div className="flex gap-3">
//             <select
//               value={month}
//               onChange={(e) => setMonth(Number(e.target.value))}
//               className="border px-3 py-2 rounded bg-white shadow-sm"
//             >
//               {months.map((m, i) => (
//                 <option key={i} value={i + 1}>{m}</option>
//               ))}
//             </select>
//             <select
//               value={year}
//               onChange={(e) => setYear(Number(e.target.value))}
//               className="border px-3 py-2 rounded bg-white shadow-sm"
//             >
//               {years.map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         {summary && (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             {[
//               { label: "Working Days", value: summary.totalWorkingDays, color: "border-gray-400" },
//               { label: "Days Present", value: summary.presentDays, color: "border-green-500" },
//               { label: "Days Absent", value: summary.absentDays ?? (summary.totalWorkingDays - summary.presentDays), color: "border-red-500" },
//               { label: "LOP Days", value: summary.lopDays ?? 0, color: "border-orange-500" },
//             ].map((card, i) => (
//               <div key={i} className={`bg-white p-4 rounded-xl shadow border-l-4 ${card.color}`}>
//                 <p className="text-gray-500 text-sm">{card.label}</p>
//                 <p className="text-2xl font-bold">{card.value}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Attendance Table */}
//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           {loading ? (
//             <div className="p-8 text-center text-gray-500">Loading attendance records...</div>
//           ) : records.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               No attendance records found for {months[month - 1]} {year}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-100 sticky top-0 z-10">
//                   <tr className="text-left text-gray-600">
//                     <th className="p-3">Date</th>
//                     <th className="p-3">Day</th>
//                     <th className="p-3">Check-In</th>
//                     <th className="p-3">Check-Out</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.map((r) => {
//                     const cfg = statusConfig[r.status] || { label: r.status, color: "bg-gray-100 text-gray-700", icon: AlertCircle };
//                     const Icon = cfg.icon;
//                     const dateObj = new Date(r.date);
//                     return (
//                       <tr key={r.id} className="border-t hover:bg-gray-50">
//                         <td className="p-3">{dateObj.toLocaleDateString("en-IN")}</td>
//                         <td className="p-3 text-gray-500">
//                           {dateObj.toLocaleDateString("en-IN", { weekday: "short" })}
//                         </td>
//                         <td className="p-3">{formatTime(r.checkInTime)}</td>
//                         <td className="p-3">{formatTime(r.checkOutTime)}</td>
//                         <td className="p-3">
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
//                             <Icon size={12} />
//                             {cfg.label}
//                           </span>
//                         </td>
//                         <td className="p-3 text-gray-500">{r.remarks || "-"}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }