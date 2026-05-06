import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { 
  Bus, MapPin, Users, Navigation, Plus, Edit2, 
  Trash2, Play, Square, Map, ChevronRight, X, Phone 
} from "lucide-react";
// Live Tracking ke liye (npm install sockjs-client stompjs)
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function TransportManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId] = useState("1"); // Dynamic school ID

  // States
  const [activeTab, setActiveTab] = useState("routes"); // routes, live, assignment
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  
  // Modals
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  // WebSocket Ref
  const stompClient = useRef(null);

  useEffect(() => {
    fetchRoutes();
    return () => disconnectWebSocket();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/v1/schools/${schoolId}/transport/routes`);
      setRoutes(res.data);
    } catch (err) {
      console.error("Error fetching routes", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── WebSocket Logic for Live Tracking ──────────────────────────
  const connectToRoute = (routeId) => {
    const socket = new SockJS("http://localhost:8080/ws"); // Aapka backend WS endpoint
    stompClient.current = Stomp.over(socket);
    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(`/topic/bus/${routeId}`, (message) => {
        const location = JSON.parse(message.body);
        setLiveLocation(location);
      });
    });
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) stompClient.current.disconnect();
  };

  // ─── Renderers ──────────────────────────────────────────────────
  
  const RouteCard = ({ route }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Bus size={24} />
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold ${route.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {route.status}
        </span>
      </div>
      
      <h3 className="font-bold text-slate-800 text-lg leading-tight">{route.routeName}</h3>
      <p className="text-slate-400 text-xs mb-3 font-medium">{route.routeCode} • {route.vehicleNumber}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={14} className="text-slate-400" />
          <span>{route.stops?.length || 0} Stops</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users size={14} className="text-slate-400" />
          <span>Capacity: {route.vehicleCapacity}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-50">
        <button 
          onClick={() => { setActiveTab("live"); connectToRoute(route.id); }}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-700"
        >
          <Navigation size={14} /> Live
        </button>
        <button 
          onClick={() => setSelectedRoute(route)}
          className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-200"
        >
          Details <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Transport Hub</h1>
            <div className="flex gap-4 mt-2">
              <button onClick={() => setActiveTab("routes")} className={`text-sm font-bold ${activeTab === 'routes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Routes</button>
              <button onClick={() => setActiveTab("live")} className={`text-sm font-bold ${activeTab === 'live' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Live Monitor</button>
            </div>
          </div>
          <button 
            onClick={() => setShowRouteModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg font-medium"
          >
            <Plus size={18} /> Add New Route
          </button>
        </div>

        {/* CONTENT AREA */}
        {activeTab === "routes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400">Loading routes...</div>
            ) : routes.map(route => <RouteCard key={route.id} route={route} />)}
          </div>
        )}

        {activeTab === "live" && (
          <div className="bg-white rounded-3xl border border-slate-200 h-[600px] overflow-hidden flex relative">
            {/* Sidebar for Live List */}
            <div className="w-80 border-r border-slate-100 p-6 overflow-y-auto hidden md:block">
              <h3 className="font-bold text-slate-800 mb-4">Active Trips</h3>
              <div className="space-y-4">
                {routes.map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold">{r.routeName}</p>
                      <p className="text-[10px] text-slate-400">Driver: {r.driver?.fullName || "Not Assigned"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
               <div className="text-center">
                  <Map size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 font-medium">Select a route to track live location</p>
                  {liveLocation && (
                    <div className="mt-4 p-4 bg-white rounded-2xl shadow-xl border border-indigo-100 text-left">
                       <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Current Ping</p>
                       <p className="text-sm font-bold">Lat: {liveLocation.latitude}</p>
                       <p className="text-sm font-bold">Long: {liveLocation.longitude}</p>
                       <p className="text-sm font-bold text-amber-600">Speed: {liveLocation.speedKmph} km/h</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* ROUTE DETAIL DRAWER */}
        <AnimatePresence>
          {selectedRoute && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                className="bg-white w-full max-w-xl shadow-2xl h-full p-8 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{selectedRoute.routeName}</h2>
                  <button onClick={() => setSelectedRoute(null)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Morning Schedule</p>
                      <p className="font-bold text-slate-700">{selectedRoute.morningDepartureTime} - {selectedRoute.morningArrivalTime}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vehicle Info</p>
                      <p className="font-bold text-slate-700">{selectedRoute.vehicleNumber} ({selectedRoute.vehicleType})</p>
                   </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <MapPin size={18} className="text-indigo-600"/> Route Stops
                </h3>
                <div className="space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {selectedRoute.stops?.map((stop, idx) => (
                     <div key={stop.id} className="relative pl-12 pb-8 last:pb-0">
                        <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 z-10">
                           {idx + 1}
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                           <p className="font-bold text-slate-800">{stop.stopName}</p>
                           <p className="text-xs text-slate-400">{stop.landmark || "No landmark"}</p>
                           <div className="flex gap-4 mt-2">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Pick: {stop.morningPickupTime}</span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Drop: {stop.eveningDropTime}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                
                <button 
                  className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  onClick={() => setShowStopModal(true)}
                >
                   <Plus size={18}/> Manage Stops
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* CREATE ROUTE MODAL */}
      <AnimatePresence>
        {showRouteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <motion.form 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }}
               className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl"
               onSubmit={(e) => { e.preventDefault(); /* API call to POST /routes */ }}
             >
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold">Configure New Route</h2>
                   <button type="button" onClick={() => setShowRouteModal(false)}><X/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Route Name</label>
                      <input className="w-full p-3 bg-slate-50 border rounded-xl mt-1" placeholder="e.g. Sector 5 Express" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Number</label>
                      <input className="w-full p-3 bg-slate-50 border rounded-xl mt-1" placeholder="MH-01-AB-1234" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Monthly Fare</label>
                      <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl mt-1" placeholder="2500" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Morning Departure</label>
                      <input type="time" className="w-full p-3 bg-slate-50 border rounded-xl mt-1" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Evening Departure</label>
                      <input type="time" className="w-full p-3 bg-slate-50 border rounded-xl mt-1" />
                   </div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg">
                   Save Route Configuration
                </button>
             </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}