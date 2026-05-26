// src/teachers/pages/TeacherGpsAttendance.jsx
// GPS-based Teacher Self Attendance — mark-self + today-status

import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function TeacherGpsAttendance() {
  const [todayStatus, setTodayStatus]     = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [marking, setMarking]             = useState(false);
  const [gpsState, setGpsState]           = useState("idle"); // idle | fetching | ready | error
  const [coords, setCoords]               = useState(null);
  const [gpsError, setGpsError]           = useState("");
  const [markResult, setMarkResult]       = useState(null); // response after marking
  const [remarks, setRemarks]             = useState("");

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await teacherSelfAttendanceService.getTodayStatus();
      setTodayStatus(res.data);
    } catch (err) {
      // 404 = not marked yet — that's fine
      if (err.response?.status !== 404) {
        console.error("Error fetching today status:", err);
      }
      setTodayStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Aapka browser GPS support nahi karta.");
      setGpsState("error");
      return;
    }
    setGpsState("fetching");
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude:       position.coords.latitude,
          longitude:      position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        setGpsState("ready");
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission deny ho gayi. Please browser settings mein allow karo."
            : err.code === 2
            ? "GPS signal nahi mil raha. Bahar jakar try karo."
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
      ).padStart(2, "0")}:00`;

      const res = await teacherSelfAttendanceService.markGpsAttendance({
        latitude:       coords.latitude,
        longitude:      coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        checkInTime,
        remarks: remarks || null,
      });
      setMarkResult(res.data);
      // Refresh today status after marking
      fetchTodayStatus();
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

  // ── Status config ──
  const statusConfig = {
    MARKED: {
      label: "Present — Attendance Mark Ho Gayi ✅",
      color: "bg-green-50 border-green-300 text-green-800",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    ALREADY_MARKED: {
      label: "Aaj Ki Attendance Pehle Se Mark Hai",
      color: "bg-blue-50 border-blue-300 text-blue-800",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    LOCATION_MISMATCH: {
      label: "Location Mismatch — School Ke Bahar Hain",
      color: "bg-red-50 border-red-300 text-red-800",
      icon: XCircle,
      iconColor: "text-red-500",
    },
    ERROR: {
      label: "Kuch Galat Hua",
      color: "bg-yellow-50 border-yellow-300 text-yellow-800",
      icon: AlertCircle,
      iconColor: "text-yellow-500",
    },
  };

  const todayCfg = todayStatus
    ? statusConfig[todayStatus.status] || statusConfig["ERROR"]
    : null;

  const resultCfg = markResult
    ? statusConfig[markResult.status] || statusConfig["ERROR"]
    : null;

  const alreadyMarked =
    todayStatus?.status === "MARKED" ||
    todayStatus?.status === "ALREADY_MARKED" ||
    markResult?.status === "MARKED" ||
    markResult?.status === "ALREADY_MARKED";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MapPin size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">GPS Attendance</h2>
            <p className="text-sm text-gray-500">
              School premises mein rehkar apni attendance mark karo
            </p>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Aaj Ki Status</h3>
            <button
              onClick={fetchTodayStatus}
              className="text-gray-400 hover:text-blue-500 transition"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {loadingStatus ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader size={16} className="animate-spin" />
              Loading...
            </div>
          ) : todayStatus ? (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${todayCfg.color}`}
            >
              {(() => {
                const Icon = todayCfg.icon;
                return (
                  <Icon
                    size={20}
                    className={`mt-0.5 flex-shrink-0 ${todayCfg.iconColor}`}
                  />
                );
              })()}
              <div>
                <p className="font-semibold text-sm">{todayCfg.label}</p>
                {todayStatus.checkInTime && (
                  <p className="text-xs mt-1">
                    Check-in:{" "}
                    <span className="font-medium">
                      {todayStatus.checkInTime?.toString().substring(0, 5)}
                    </span>
                  </p>
                )}
                {todayStatus.distanceFromSchoolMeters != null && (
                  <p className="text-xs mt-0.5">
                    School se distance:{" "}
                    <span className="font-medium">
                      {todayStatus.distanceFromSchoolMeters.toFixed(1)} meter
                    </span>
                  </p>
                )}
                {todayStatus.message && (
                  <p className="text-xs mt-1 opacity-80">{todayStatus.message}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock size={16} />
              Aaj abhi tak attendance mark nahi hui
            </div>
          )}
        </div>

        {/* Mark Attendance Card */}
        {!alreadyMarked && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Attendance Mark Karo
            </h3>

            {/* Step 1: Get GPS */}
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-3">
                <span className="font-semibold text-gray-700">Step 1:</span>{" "}
                Apni current location lo
              </p>

              <button
                onClick={handleGetGPS}
                disabled={gpsState === "fetching"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                  ${
                    gpsState === "ready"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : gpsState === "fetching"
                      ? "bg-blue-50 text-blue-400 cursor-not-allowed"
                      : gpsState === "error"
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {gpsState === "fetching" ? (
                  <Loader size={16} className="animate-spin" />
                ) : gpsState === "ready" ? (
                  <CheckCircle size={16} />
                ) : (
                  <Navigation size={16} />
                )}
                {gpsState === "fetching"
                  ? "GPS signal dhundh raha hai..."
                  : gpsState === "ready"
                  ? "GPS Location Mili ✅"
                  : gpsState === "error"
                  ? "Dobara Try Karo"
                  : "GPS Location Lo"}
              </button>

              {gpsState === "ready" && coords && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Lat:</span>{" "}
                  {coords.latitude.toFixed(6)} |{" "}
                  <span className="font-medium">Lng:</span>{" "}
                  {coords.longitude.toFixed(6)} |{" "}
                  <span className="font-medium">Accuracy:</span>{" "}
                  {coords.accuracyMeters.toFixed(1)}m
                </div>
              )}

              {gpsState === "error" && (
                <p className="mt-2 text-xs text-red-600">{gpsError}</p>
              )}
            </div>

            {/* Step 2: Remarks (optional) */}
            {gpsState === "ready" && (
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Step 2:</span>{" "}
                  Remarks (optional)
                </p>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g., On time, Work from field..."
                  className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            )}

            {/* Step 3: Mark */}
            {gpsState === "ready" && (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Step 3:</span>{" "}
                  Attendance mark karo
                </p>
                <button
                  onClick={handleMarkAttendance}
                  disabled={marking}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
                >
                  {marking ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {marking ? "Mark ho raha hai..." : "Attendance Mark Karo"}
                </button>
              </div>
            )}

            {/* Mark Result */}
            {markResult && resultCfg && (
              <div
                className={`mt-5 flex items-start gap-3 p-4 rounded-lg border ${resultCfg.color}`}
              >
                {(() => {
                  const Icon = resultCfg.icon;
                  return (
                    <Icon
                      size={20}
                      className={`mt-0.5 flex-shrink-0 ${resultCfg.iconColor}`}
                    />
                  );
                })()}
                <div>
                  <p className="font-semibold text-sm">{resultCfg.label}</p>
                  {markResult.distanceFromSchoolMeters != null && (
                    <p className="text-xs mt-1">
                      School se aap{" "}
                      <span className="font-medium">
                        {markResult.distanceFromSchoolMeters.toFixed(1)} meter
                      </span>{" "}
                      door hain
                    </p>
                  )}
                  {markResult.message && (
                    <p className="text-xs mt-1 opacity-80">{markResult.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">
            📍 GPS Attendance Ke Baare Mein
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Sirf school ke 5 meter radius ke andar attendance mark hogi</li>
            <li>• Har din sirf ek baar mark ho sakti hai</li>
            <li>• GPS accuracy 50m se zyada kharab hai toh attendance reject ho sakti hai</li>
            <li>• High Accuracy GPS mode use karo behtar results ke liye</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
