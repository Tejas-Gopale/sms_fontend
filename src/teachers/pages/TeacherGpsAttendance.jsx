// src/teachers/pages/TeacherGpsAttendance.jsx
// GPS-based Teacher Self Attendance with multi-punch support
// Implements: TeacherGeoAttendanceController endpoints

import { useState, useEffect, useRef } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { teacherSelfAttendanceService } from "../services/teacherService";
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

export default function TeacherGpsAttendance() {
  // ── STATE: Today's Status ──
  const [todayStatus, setTodayStatus] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ── STATE: GPS & Marking ──
  const [marking, setMarking] = useState(false);
  const [gpsState, setGpsState] = useState("idle"); // idle | fetching | ready | error
  const [coords, setCoords] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [markResult, setMarkResult] = useState(null);
  const [remarks, setRemarks] = useState("");

  // ── STATE: UI ──
  const [showPunchHistory, setShowPunchHistory] = useState(false);
  const autoRefreshRef = useRef(null);

  useEffect(() => {
    fetchTodayData();
    // Auto-refresh every 30 seconds
    autoRefreshRef.current = setInterval(fetchTodayData, 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, []);

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
      // 404 = not marked yet — that's fine
      if (err.response?.status !== 404) {
        console.error("Error fetching today data:", err);
      }
      setTodayStatus(null);
      setAllLogs([]);
    } finally {
      setLoadingStatus(false);
    }
  };

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

  const handleMarkAttendance = async () => {
    if (!coords) return;

    setMarking(true);
    setMarkResult(null);

    try {
      const now = new Date();
      const checkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        checkInTime,
        remarks: remarks.trim() || null,
      };

      const res = await teacherSelfAttendanceService.markGpsAttendance(payload);
      setMarkResult(res.data);

      // Reset form
      setCoords(null);
      setGpsState("idle");
      setRemarks("");

      // Refresh data after marking
      setTimeout(fetchTodayData, 500);
    } catch (err) {
      setMarkResult({
        status: "ERROR",
        message:
          err.response?.data?.message || "Server error — dobara try karo.",
      });
    } finally {
      setMarking(false);
    }
  };

  // ── STATUS CONFIG ──
  const statusConfig = {
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

  const todayStatusCfg = todayStatus
    ? statusConfig[todayStatus.status] || statusConfig.NOT_MARKED
    : statusConfig.NOT_MARKED;

  const markResultCfg = markResult
    ? statusConfig[markResult.status] || statusConfig.ERROR
    : null;

  const alreadyMarked =
    todayStatus?.status === "MARKED" ||
    todayStatus?.status === "ALREADY_MARKED" ||
    markResult?.status === "MARKED" ||
    markResult?.status === "ALREADY_MARKED";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ──────────────────────────────────────────────────────────────
              HEADER
              ────────────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <MapPin size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  GPS Attendance
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  School premises mein rehkar attendance mark karo
                </p>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────────
              TODAY'S STATUS CARD
              ────────────────────────────────────────────────────────────── */}
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
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl border ${todayStatusCfg.color}`}
                >
                  <div className={`p-3 rounded-lg ${todayStatusCfg.bgAccent}`}>
                    {(() => {
                      const Icon = todayStatusCfg.icon;
                      return (
                        <Icon
                          size={24}
                          className={todayStatusCfg.iconColor}
                        />
                      );
                    })()}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {todayStatusCfg.label}
                    </p>

                    {todayStatus.checkInTime && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          <LogIn size={14} />
                          <span>
                            Check-in:{" "}
                            <span className="font-semibold">
                              {todayStatus.checkInTime
                                .toString()
                                .substring(0, 5)}
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
                      <p className="text-xs mt-2 text-slate-600">
                        {todayStatus.message}
                      </p>
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

          {/* ──────────────────────────────────────────────────────────────
              MARK ATTENDANCE CARD
              ────────────────────────────────────────────────────────────── */}
          {!alreadyMarked && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600/5 to-emerald-500/5 px-6 py-4">
                <h2 className="font-semibold text-slate-900">
                  Attendance Mark Karo
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
                      ${
                        gpsState === "ready"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : gpsState === "fetching"
                          ? "bg-blue-50 text-blue-600 cursor-not-allowed border border-blue-200"
                          : gpsState === "error"
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700"
                      }`}
                  >
                    {gpsState === "fetching" ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        GPS signal dhundh raha hai...
                      </>
                    ) : gpsState === "ready" ? (
                      <>
                        <CheckCircle size={16} />
                        GPS Location Mili ✅
                      </>
                    ) : gpsState === "error" ? (
                      <>
                        <Navigation size={16} />
                        Dobara Try Karo
                      </>
                    ) : (
                      <>
                        <Navigation size={16} />
                        GPS Location Lo
                      </>
                    )}
                  </button>

                  {gpsState === "ready" && coords && (
                    <div className="mt-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg space-y-1">
                      <div>
                        <span className="font-semibold">Latitude:</span>{" "}
                        {coords.latitude.toFixed(6)}
                      </div>
                      <div>
                        <span className="font-semibold">Longitude:</span>{" "}
                        {coords.longitude.toFixed(6)}
                      </div>
                      <div>
                        <span className="font-semibold">Accuracy:</span>{" "}
                        {coords.accuracyMeters.toFixed(1)}m
                      </div>
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
                    <p className="text-xs text-slate-500 mt-1">
                      {remarks.length}/100
                    </p>
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
                        <>
                          <Loader size={16} className="animate-spin" />
                          Mark ho raha hai...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Attendance Mark Karo
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Mark Result */}
                {markResult && markResultCfg && (
                  <div
                    className={`flex items-start gap-4 p-4 rounded-xl border ${markResultCfg.color}`}
                  >
                    <div className={`p-3 rounded-lg ${markResultCfg.bgAccent}`}>
                      {(() => {
                        const Icon = markResultCfg.icon;
                        return (
                          <Icon
                            size={24}
                            className={markResultCfg.iconColor}
                          />
                        );
                      })()}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {markResultCfg.label}
                      </p>

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
                          <span className="font-semibold">
                            {markResult.totalPunchesToday}
                          </span>
                        </p>
                      )}

                      {markResult.message && (
                        <p className="text-xs mt-2 text-slate-600">
                          {markResult.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────
              PUNCH HISTORY TIMELINE
              ────────────────────────────────────────────────────────────── */}
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
                              📍{" "}
                              {log.distanceFromSchoolMeters.toFixed(1)}m se school
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

          {/* ──────────────────────────────────────────────────────────────
              INFO BOX
              ────────────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900">
                  📍 GPS Attendance Information
                </p>
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
        </div>
      </div>
    </div>
  );
}
// // src/teachers/pages/TeacherGpsAttendance.jsx
// // GPS-based Teacher Self Attendance — mark-self + today-status

// import { useState, useEffect } from "react";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import { teacherSelfAttendanceService } from "../services/teacherService";
// import {
//   MapPin,
//   CheckCircle,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Loader,
//   RefreshCw,
//   Navigation,
// } from "lucide-react";

// export default function TeacherGpsAttendance() {
//   const [todayStatus, setTodayStatus]     = useState(null);
//   const [loadingStatus, setLoadingStatus] = useState(true);
//   const [marking, setMarking]             = useState(false);
//   const [gpsState, setGpsState]           = useState("idle"); // idle | fetching | ready | error
//   const [coords, setCoords]               = useState(null);
//   const [gpsError, setGpsError]           = useState("");
//   const [markResult, setMarkResult]       = useState(null); // response after marking
//   const [remarks, setRemarks]             = useState("");

//   useEffect(() => {
//     fetchTodayStatus();
//   }, []);

//   const fetchTodayStatus = async () => {
//     setLoadingStatus(true);
//     try {
//       const res = await teacherSelfAttendanceService.getTodayStatus();
//       setTodayStatus(res.data);
//     } catch (err) {
//       // 404 = not marked yet — that's fine
//       if (err.response?.status !== 404) {
//         console.error("Error fetching today status:", err);
//       }
//       setTodayStatus(null);
//     } finally {
//       setLoadingStatus(false);
//     }
//   };

//   const handleGetGPS = () => {
//     if (!navigator.geolocation) {
//       setGpsError("Aapka browser GPS support nahi karta.");
//       setGpsState("error");
//       return;
//     }
//     setGpsState("fetching");
//     setGpsError("");
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setCoords({
//           latitude:       position.coords.latitude,
//           longitude:      position.coords.longitude,
//           accuracyMeters: position.coords.accuracy,
//         });
//         setGpsState("ready");
//       },
//       (err) => {
//         const msg =
//           err.code === 1
//             ? "Location permission deny ho gayi. Please browser settings mein allow karo."
//             : err.code === 2
//             ? "GPS signal nahi mil raha. Bahar jakar try karo."
//             : "GPS timeout — dobara try karo.";
//         setGpsError(msg);
//         setGpsState("error");
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   const handleMarkAttendance = async () => {
//     if (!coords) return;
//     setMarking(true);
//     setMarkResult(null);
//     try {
//       const now = new Date();
//       const checkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(
//         now.getMinutes()
//       ).padStart(2, "0")}:00`;

//       const res = await teacherSelfAttendanceService.markGpsAttendance({
//         latitude:       coords.latitude,
//         longitude:      coords.longitude,
//         accuracyMeters: coords.accuracyMeters,
//         checkInTime,
//         remarks: remarks || null,
//       });
//       setMarkResult(res.data);
//       // Refresh today status after marking
//       fetchTodayStatus();
//     } catch (err) {
//       setMarkResult({
//         status: "ERROR",
//         message:
//           err.response?.data?.message || "Server error — dobara try karo.",
//       });
//     } finally {
//       setMarking(false);
//     }
//   };

//   // ── Status config ──
//   const statusConfig = {
//     MARKED: {
//       label: "Present — Attendance Mark Ho Gayi ✅",
//       color: "bg-green-50 border-green-300 text-green-800",
//       icon: CheckCircle,
//       iconColor: "text-green-500",
//     },
//     ALREADY_MARKED: {
//       label: "Aaj Ki Attendance Pehle Se Mark Hai",
//       color: "bg-blue-50 border-blue-300 text-blue-800",
//       icon: Clock,
//       iconColor: "text-blue-500",
//     },
//     LOCATION_MISMATCH: {
//       label: "Location Mismatch — School Ke Bahar Hain",
//       color: "bg-red-50 border-red-300 text-red-800",
//       icon: XCircle,
//       iconColor: "text-red-500",
//     },
//     ERROR: {
//       label: "Kuch Galat Hua",
//       color: "bg-yellow-50 border-yellow-300 text-yellow-800",
//       icon: AlertCircle,
//       iconColor: "text-yellow-500",
//     },
//   };

//   const todayCfg = todayStatus
//     ? statusConfig[todayStatus.status] || statusConfig["ERROR"]
//     : null;

//   const resultCfg = markResult
//     ? statusConfig[markResult.status] || statusConfig["ERROR"]
//     : null;

//   const alreadyMarked =
//     todayStatus?.status === "MARKED" ||
//     todayStatus?.status === "ALREADY_MARKED" ||
//     markResult?.status === "MARKED" ||
//     markResult?.status === "ALREADY_MARKED";

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <TeacherSidebar />

//       <div className="flex-1 p-6 max-w-2xl">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-6">
//           <MapPin size={28} className="text-blue-600" />
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">GPS Attendance</h2>
//             <p className="text-sm text-gray-500">
//               School premises mein rehkar apni attendance mark karo
//             </p>
//           </div>
//         </div>

//         {/* Today's Status Card */}
//         <div className="bg-white rounded-xl shadow p-5 mb-6">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-semibold text-gray-700">Aaj Ki Status</h3>
//             <button
//               onClick={fetchTodayStatus}
//               className="text-gray-400 hover:text-blue-500 transition"
//               title="Refresh"
//             >
//               <RefreshCw size={16} />
//             </button>
//           </div>

//           {loadingStatus ? (
//             <div className="flex items-center gap-2 text-gray-400 text-sm">
//               <Loader size={16} className="animate-spin" />
//               Loading...
//             </div>
//           ) : todayStatus ? (
//             <div
//               className={`flex items-start gap-3 p-4 rounded-lg border ${todayCfg.color}`}
//             >
//               {(() => {
//                 const Icon = todayCfg.icon;
//                 return (
//                   <Icon
//                     size={20}
//                     className={`mt-0.5 flex-shrink-0 ${todayCfg.iconColor}`}
//                   />
//                 );
//               })()}
//               <div>
//                 <p className="font-semibold text-sm">{todayCfg.label}</p>
//                 {todayStatus.checkInTime && (
//                   <p className="text-xs mt-1">
//                     Check-in:{" "}
//                     <span className="font-medium">
//                       {todayStatus.checkInTime?.toString().substring(0, 5)}
//                     </span>
//                   </p>
//                 )}
//                 {todayStatus.distanceFromSchoolMeters != null && (
//                   <p className="text-xs mt-0.5">
//                     School se distance:{" "}
//                     <span className="font-medium">
//                       {todayStatus.distanceFromSchoolMeters.toFixed(1)} meter
//                     </span>
//                   </p>
//                 )}
//                 {todayStatus.message && (
//                   <p className="text-xs mt-1 opacity-80">{todayStatus.message}</p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 text-gray-500 text-sm">
//               <Clock size={16} />
//               Aaj abhi tak attendance mark nahi hui
//             </div>
//           )}
//         </div>

//         {/* Mark Attendance Card */}
//         {!alreadyMarked && (
//           <div className="bg-white rounded-xl shadow p-5">
//             <h3 className="font-semibold text-gray-700 mb-4">
//               Attendance Mark Karo
//             </h3>

//             {/* Step 1: Get GPS */}
//             <div className="mb-5">
//               <p className="text-sm text-gray-500 mb-3">
//                 <span className="font-semibold text-gray-700">Step 1:</span>{" "}
//                 Apni current location lo
//               </p>

//               <button
//                 onClick={handleGetGPS}
//                 disabled={gpsState === "fetching"}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
//                   ${
//                     gpsState === "ready"
//                       ? "bg-green-100 text-green-700 border border-green-300"
//                       : gpsState === "fetching"
//                       ? "bg-blue-50 text-blue-400 cursor-not-allowed"
//                       : gpsState === "error"
//                       ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
//                       : "bg-blue-600 text-white hover:bg-blue-700"
//                   }`}
//               >
//                 {gpsState === "fetching" ? (
//                   <Loader size={16} className="animate-spin" />
//                 ) : gpsState === "ready" ? (
//                   <CheckCircle size={16} />
//                 ) : (
//                   <Navigation size={16} />
//                 )}
//                 {gpsState === "fetching"
//                   ? "GPS signal dhundh raha hai..."
//                   : gpsState === "ready"
//                   ? "GPS Location Mili ✅"
//                   : gpsState === "error"
//                   ? "Dobara Try Karo"
//                   : "GPS Location Lo"}
//               </button>

//               {gpsState === "ready" && coords && (
//                 <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
//                   <span className="font-medium">Lat:</span>{" "}
//                   {coords.latitude.toFixed(6)} |{" "}
//                   <span className="font-medium">Lng:</span>{" "}
//                   {coords.longitude.toFixed(6)} |{" "}
//                   <span className="font-medium">Accuracy:</span>{" "}
//                   {coords.accuracyMeters.toFixed(1)}m
//                 </div>
//               )}

//               {gpsState === "error" && (
//                 <p className="mt-2 text-xs text-red-600">{gpsError}</p>
//               )}
//             </div>

//             {/* Step 2: Remarks (optional) */}
//             {gpsState === "ready" && (
//               <div className="mb-5">
//                 <p className="text-sm text-gray-500 mb-2">
//                   <span className="font-semibold text-gray-700">Step 2:</span>{" "}
//                   Remarks (optional)
//                 </p>
//                 <input
//                   type="text"
//                   value={remarks}
//                   onChange={(e) => setRemarks(e.target.value)}
//                   placeholder="e.g., On time, Work from field..."
//                   className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
//                 />
//               </div>
//             )}

//             {/* Step 3: Mark */}
//             {gpsState === "ready" && (
//               <div>
//                 <p className="text-sm text-gray-500 mb-2">
//                   <span className="font-semibold text-gray-700">Step 3:</span>{" "}
//                   Attendance mark karo
//                 </p>
//                 <button
//                   onClick={handleMarkAttendance}
//                   disabled={marking}
//                   className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
//                 >
//                   {marking ? (
//                     <Loader size={16} className="animate-spin" />
//                   ) : (
//                     <CheckCircle size={16} />
//                   )}
//                   {marking ? "Mark ho raha hai..." : "Attendance Mark Karo"}
//                 </button>
//               </div>
//             )}

//             {/* Mark Result */}
//             {markResult && resultCfg && (
//               <div
//                 className={`mt-5 flex items-start gap-3 p-4 rounded-lg border ${resultCfg.color}`}
//               >
//                 {(() => {
//                   const Icon = resultCfg.icon;
//                   return (
//                     <Icon
//                       size={20}
//                       className={`mt-0.5 flex-shrink-0 ${resultCfg.iconColor}`}
//                     />
//                   );
//                 })()}
//                 <div>
//                   <p className="font-semibold text-sm">{resultCfg.label}</p>
//                   {markResult.distanceFromSchoolMeters != null && (
//                     <p className="text-xs mt-1">
//                       School se aap{" "}
//                       <span className="font-medium">
//                         {markResult.distanceFromSchoolMeters.toFixed(1)} meter
//                       </span>{" "}
//                       door hain
//                     </p>
//                   )}
//                   {markResult.message && (
//                     <p className="text-xs mt-1 opacity-80">{markResult.message}</p>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
//           <p className="text-sm font-semibold text-blue-800 mb-2">
//             📍 GPS Attendance Ke Baare Mein
//           </p>
//           <ul className="text-xs text-blue-700 space-y-1">
//             <li>• Sirf school ke 5 meter radius ke andar attendance mark hogi</li>
//             <li>• Har din sirf ek baar mark ho sakti hai</li>
//             <li>• GPS accuracy 50m se zyada kharab hai toh attendance reject ho sakti hai</li>
//             <li>• High Accuracy GPS mode use karo behtar results ke liye</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }
