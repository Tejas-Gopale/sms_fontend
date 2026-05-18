import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, Bus, Phone, MapPin, Navigation } from "lucide-react";
import { getBusTracking } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

export default function ParentBusTracking() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getBusTracking(studentId)
      .then((res) => setBusInfo(res.data))
      .catch(() => setError("Could not load bus tracking data."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const statusBadge = (status) => {
    const map = {
      "On Route": "bg-blue-100 text-blue-700",
      "Arrived":  "bg-green-100 text-green-700",
      "Delayed":  "bg-red-100 text-red-600",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">🚌 Bus Tracking</h1>

        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        )}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}

        {busInfo && !loading && !sidLoading && (
          <>
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {[
                { icon: Bus,        label: "Bus Number",        value: busInfo.busNumber },
                { icon: Navigation, label: "Distance",          value: `${busInfo.distanceAway} away` },
                { icon: MapPin,     label: "Estimated Arrival", value: busInfo.estimatedArrival },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={18} className="text-indigo-500" />
                      <p className="text-sm text-gray-500">{card.label}</p>
                    </div>
                    <p className="text-xl font-semibold text-slate-800">{card.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Status Badge */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
              <p className="text-slate-700 font-medium">Current Status</p>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusBadge(busInfo.currentStatus)}`}>
                {busInfo.currentStatus}
              </span>
            </div>

            {/* Driver Info */}
            {busInfo.driverInfo && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h2 className="text-lg font-bold mb-4 text-slate-800">Driver Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <p><strong>Driver Name:</strong> {busInfo.driverInfo.name}</p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-green-500" />
                    <a href={`tel:${busInfo.driverInfo.contact}`} className="text-blue-600 hover:underline">
                      {busInfo.driverInfo.contact}
                    </a>
                  </p>
                  <p className="md:col-span-2"><strong>Route:</strong> {busInfo.routeName}</p>
                </div>
              </div>
            )}

            {/* Student Stop */}
            {busInfo.studentStop && (
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl mb-6">
                <h2 className="text-sm font-semibold text-indigo-700 mb-1 uppercase tracking-wide">Your Pickup Stop</h2>
                <p className="text-slate-800 font-semibold">{busInfo.studentStop.stopName}</p>
                {busInfo.studentStop.arrivalTime && (
                  <p className="text-sm text-slate-500 mt-0.5">Expected: {busInfo.studentStop.arrivalTime}</p>
                )}
              </div>
            )}

            {/* Live Map Placeholder */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Live Bus Location</h2>
              <div className="h-72 bg-gradient-to-br from-slate-100 to-indigo-50 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-dashed border-indigo-200">
                <MapPin size={36} className="text-indigo-300" />
                <p className="font-medium">Live Map Integration</p>
                {busInfo.currentLocation && (
                  <p className="text-xs text-slate-400">
                    Lat: {busInfo.currentLocation.latitude?.toFixed(4)}, Lng: {busInfo.currentLocation.longitude?.toFixed(4)}
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Bus is currently <strong>{busInfo.distanceAway}</strong> away from the pickup location.
                {busInfo.currentLocation?.lastUpdated && (
                  <span className="text-slate-400"> · Updated {busInfo.currentLocation.lastUpdated}</span>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
