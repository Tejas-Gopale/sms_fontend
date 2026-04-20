import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  Users, GraduationCap, BookOpen, IndianRupee,
  Settings, AlertCircle, CheckCircle, Loader2, Eye, EyeOff
} from "lucide-react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const STALE_TIME_5MIN = 1000 * 60 * 5;
const STALE_TIME_10MIN = 1000 * 60 * 10;

const DEFAULT_PAYMENT_CONFIG = {
  gatewayName: "RAZORPAY",
  apiKey: "",
  apiSecret: "",
  webhookSecret: "",
  isTestMode: true,
  isActive: true,
};

// ─── API Functions (component ke bahar — har render pe recreate nahi hoga) ───
const fetchDashboardData = async () => {
  const res = await API.get("/school-admin/getSchoolDashboardData");
  return res.data;
};

const fetchPaymentConfig = async (schoolId) => {
  const res = await API.get(`/payments/config?schoolId=${schoolId}`);
  return res.data;
};

const savePaymentConfig = async ({ schoolId, config }) => {
  const res = await API.post(`/payments/save?schoolId=${schoolId}`, config);
  return res.data;
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

// Stat Card Skeleton
function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-300 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

// Individual Stat Card
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
        <Icon size={28} className="text-gray-400" />
      </div>
    </div>
  );
}

// Payment Modal — alag component, clean aur isolated
function PaymentConfigModal({ onClose, schoolId, existingConfig }) {
  const queryClient = useQueryClient();

  // ✅ Modal ka apna local state — parent pollute nahi hota
  const [config, setConfig] = useState(() => ({
    ...DEFAULT_PAYMENT_CONFIG,
    ...existingConfig,
  }));
  const [showSecret, setShowSecret] = useState(false);

  const mutation = useMutation({
    mutationFn: savePaymentConfig,
    onSuccess: () => {
      toast.success("Payment config saved successfully!");
      // ✅ React Query v5 correct syntax
      queryClient.invalidateQueries({ queryKey: ["paymentConfig", schoolId] });
      onClose();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Something went wrong";
      toast.error(`Failed to save: ${msg}`);
    },
  });

  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    if (!config.apiKey.trim() || !config.apiSecret.trim()) {
      toast.error("Key ID and Key Secret are required");
      return;
    }
    mutation.mutate({ schoolId, config });
  };

  // ✅ ESC key se modal close ho
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    // ✅ Backdrop click se bhi close hoga
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Razorpay Configuration</h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your Razorpay API credentials for this school.
        </p>

        <div className="space-y-4">
          {/* Key ID */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Key ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="rzp_test_..."
              value={config.apiKey}
              onChange={handleChange("apiKey")}
              autoComplete="off"
            />
          </div>

          {/* Key Secret with toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Key Secret <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type={showSecret ? "text" : "password"}
                className="w-full border border-gray-300 p-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Secret Key"
                value={config.apiSecret}
                onChange={handleChange("apiSecret")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Webhook Secret{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="whsec_..."
              value={config.webhookSecret}
              onChange={handleChange("webhookSecret")}
              autoComplete="off"
            />
          </div>

          {/* Test Mode Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setConfig((p) => ({ ...p, isTestMode: !p.isTestMode }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                config.isTestMode ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                config.isTestMode ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
            <span className="text-sm text-gray-700">
              Test Mode{" "}
              {config.isTestMode && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                  Sandbox
                </span>
              )}
            </span>
          </label>
        </div>

        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={mutation.isPending}
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 hover:bg-blue-700 transition flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {mutation.isPending ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SchoolAdminDashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ localStorage se safely lo — null check sahi se
  const schoolId = useMemo(() => {
    const id = localStorage.getItem("schoolId");
    if (!id) {
      console.warn("schoolId not found in localStorage");
      return null;
    }
    return id;
  }, []);

  // ✅ Query 1: Dashboard stats — independent loading
  const {
    data: dashboardData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["schoolDashboard"],
    queryFn: fetchDashboardData,
    staleTime: STALE_TIME_5MIN,
    retry: 2,
  });

  // ✅ Query 2: Payment config — schoolId pe dependent, independent loading
  const { data: dbConfig, isLoading: isConfigLoading } = useQuery({
    queryKey: ["paymentConfig", schoolId],
    queryFn: () => fetchPaymentConfig(schoolId),
    staleTime: STALE_TIME_10MIN,
    enabled: !!schoolId,  // schoolId nahi hai toh fetch mat karo
    retry: 1,
  });

  // ✅ Memoized stats — har render pe recreate nahi hoga
  const stats = useMemo(() => [
    {
      title: "Total Students",
      value: dashboardData?.total_Students?.toLocaleString() ?? "—",
      icon: Users,
      color: "border-blue-500",
    },
    {
      title: "Total Teachers",
      value: dashboardData?.total_Teachers?.toLocaleString() ?? "—",
      icon: GraduationCap,
      color: "border-green-500",
    },
    {
      title: "Total Classes",
      value: dashboardData?.totalClasses?.toLocaleString() ?? "—",
      icon: BookOpen,
      color: "border-purple-500",
    },
    {
      title: "Fees Collected",
      value: dashboardData
        ? `₹${(dashboardData.fees_Colleced || 0).toLocaleString("en-IN")}`
        : "—",
      icon: IndianRupee,
      color: "border-yellow-500",
    },
  ], [dashboardData]);

  const isPaymentConfigured = dbConfig?.isActive === true;

  // ✅ schoolId nahi mila toh proper error state
  if (!schoolId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-bold text-lg">Session Error</p>
          <p className="text-gray-500 text-sm mt-1">School ID not found. Please login again.</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* ✅ Toast notifications — alert() ki jagah */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <SchoolAdminSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">School Admin Dashboard</h1>

          {/* ✅ Config loading skeleton — flicker nahi hoga */}
          {isConfigLoading ? (
            <div className="h-9 w-44 bg-gray-200 animate-pulse rounded-full" />
          ) : (
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isPaymentConfigured
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {isPaymentConfigured
                ? <><CheckCircle size={16} className="mr-2" /> Payments Active</>
                : <><AlertCircle size={16} className="mr-2" /> Payments Not Configured</>
              }
            </div>
          )}
        </div>

        {/* Payment Setup Notice */}
        {!isConfigLoading && !isPaymentConfigured && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex justify-between items-center">
            <div className="flex items-center">
              <Settings className="text-yellow-600 mr-3 shrink-0" />
              <div>
                <p className="font-bold text-yellow-800">Payment Gateway Required</p>
                <p className="text-yellow-700 text-sm">Add Razorpay keys to enable fee collection.</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition shrink-0"
            >
              Setup Now
            </button>
          </div>
        )}

        {/* ✅ Stats Grid — skeleton show karo, page block nahi hoga */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isStatsLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : stats.map((stat) => <StatCard key={stat.title} {...stat} />)
          }
        </div>

        {/* Error State for Stats */}
        {isStatsError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={18} />
              <span className="text-sm">Failed to load dashboard stats.</span>
            </div>
            <button
              onClick={refetchStats}
              className="text-sm text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Upcoming Exams</h2>
            <ul className="space-y-3">
              <li className="flex justify-between border-b pb-2">
                <span>Math - Class 10</span>
                <span className="text-gray-500">15 Mar</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Science - Class 9</span>
                <span className="text-gray-500">18 Mar</span>
              </li>
              <li className="flex justify-between">
                <span>English - Class 8</span>
                <span className="text-gray-500">21 Mar</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="border-b pb-2">New student registered in Class 7</li>
              <li className="border-b pb-2">Fee payment received from Rahul Sharma</li>
              <li>Teacher added for Mathematics</li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
              Add Student
            </button>
            <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition">
              Add Teacher
            </button>
            <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition">
              Create Exam
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition"
            >
              Update Payment Keys
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal — alag isolated component */}
      {showPaymentModal && (
        <PaymentConfigModal
          onClose={() => setShowPaymentModal(false)}
          schoolId={schoolId}
          existingConfig={dbConfig}
        />
      )}
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Users,
//   GraduationCap,
//   BookOpen,
//   IndianRupee,
//   Settings,
//   AlertCircle,
//   CheckCircle,
//   Loader2
// } from "lucide-react";

// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import API from "../../common/services/api";

// export default function SchoolAdminDashboard() {
//   const queryClient = useQueryClient();
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
  
//   // LocalStorage se schoolId le rahe hain
//   const school_Id = localStorage.getItem("schoolId") || 1; 

//   const [paymentConfig, setPaymentConfig] = useState({
//     gatewayName: "RAZORPAY",
//     apiKey: "",
//     apiSecret: "",
//     webhookSecret: "",
//     isTestMode: true,
//     isActive: true
//   });

//   // ✅ 1. DASHBOARD DATA FETCH (Stats like students, teachers etc.)
//   const { data: dashboardData, isLoading: isStatsLoading, isError: isStatsError } = useQuery({
//     queryKey: ["schoolDashboard"],
//     queryFn: async () => {
//       const res = await API.get("/school-admin/getSchoolDashboardData");
//       return res.data;
//     },
//     staleTime: 1000 * 60 * 5, 
//   });

//   // ✅ 2. PAYMENT CONFIG FETCH (Nayi API jo tune batayi)
//   const { data: dbConfig, isLoading: isConfigLoading } = useQuery({
//     queryKey: ["paymentConfig", school_Id],
//     queryFn: async () => {
//       const res = await API.get(`/payments/config?schoolId=${school_Id}`);
//       console.log("Fetched Payment Config:", res.data);
//       return res.data;
//     }
//   });

//   // ✅ 3. PRE-FILL MODAL (Agar DB mein config pehle se hai toh inputs bhar do)
//   useEffect(() => {
//     if (dbConfig) {
//       setPaymentConfig({
//         gatewayName: dbConfig.gatewayName || "RAZORPAY",
//         apiKey: dbConfig.apiKey || "",
//         apiSecret: dbConfig.apiSecret || "",
//         webhookSecret: dbConfig.webhookSecret || "",
//         isTestMode: dbConfig.isTestMode ?? true,
//         isActive: dbConfig.isActive ?? true
//       });
//     }
//   }, [dbConfig]);

//   // ✅ 4. SAVE CONFIG MUTATION
//   const mutation = useMutation({
//     mutationFn: (newConfig) => 
//       API.post(`/payments/save?schoolId=${school_Id}`, newConfig),
//     onSuccess: () => {
//       alert("Payment Keys Updated Successfully!");
//       setShowPaymentModal(false);
//       // Dono queries ko refresh karo taaki UI update ho jaye
//       queryClient.invalidateQueries(["paymentConfig"]);
//       queryClient.invalidateQueries(["schoolDashboard"]);
//     },
//     onError: (error) => {
//       const errorMsg = error.response?.data || error.message;
//       alert("Error saving config: " + errorMsg);
//     }
//   });

//   const handleSavePaymentConfig = () => {
//     if(!paymentConfig.apiKey || !paymentConfig.apiSecret) {
//         alert("Please fill all fields");
//         return;
//     }
//     mutation.mutate(paymentConfig);
//   };

//   // ✅ 5. HELPER LOGIC: Check if Payment is Active
//   const isActuallyConfigured = dbConfig && dbConfig.isActive === true;

//   if (isStatsLoading || isConfigLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-100">
//         <Loader2 className="animate-spin text-blue-600" size={48} />
//         <span className="ml-2 text-xl font-semibold">Loading Dashboard...</span>
//       </div>
//     );
//   }

//   if (isStatsError) {
//     return <div className="p-10 text-center text-red-500 font-bold">Error loading dashboard. Check API Connection.</div>;
//   }

//   const stats = [
//     { title: "Total Students", value: dashboardData?.total_Students || 0, icon: Users, color: "border-blue-500" },
//     { title: "Total Teachers", value: dashboardData?.total_Teachers || 0, icon: GraduationCap, color: "border-green-500" },
//     { title: "Total Classes", value: dashboardData?.totalClasses || 0, icon: BookOpen, color: "border-purple-500" },
//     { title: "Fees Collected", value: `₹${(dashboardData?.fees_Colleced || 0).toLocaleString()}`, icon: IndianRupee, color: "border-yellow-500" }
//   ];

//   return (
//     <div className="flex">
//       <SchoolAdminSidebar />

//       <div className="flex-1 bg-gray-100 min-h-screen p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">School Admin Dashboard</h1>
          
//           {/* ✅ Status Badge: Config ke isActive pe depend karta hai */}
//           <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${isActuallyConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//              {isActuallyConfigured ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>} 
//              {isActuallyConfigured ? "Payments Active" : "Payments Not Configured"} 
//           </div>
//         </div>

//         {/* ✅ Payment Setup Notice: Hides if isActuallyConfigured is true */}
//         {!isActuallyConfigured && (
//           <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex justify-between items-center">
//             <div className="flex items-center">
//               <Settings className="text-yellow-600 mr-3" />
//               <div>
//                 <p className="font-bold text-yellow-800">Payment Gateway Required</p>
//                 <p className="text-yellow-700 text-sm">Add Razorpay keys to enable fee collection.</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setShowPaymentModal(true)}
//               className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
//             >
//               Setup Now
//             </button>
//           </div>
//         )}

//         {/* Stats Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <div key={index} className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm">{stat.title}</p>
//                     <h2 className="text-2xl font-bold">{stat.value}</h2>
//                   </div>
//                   <Icon size={28} className="text-gray-600" />
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Dashboard Content */}
//         <div className="grid lg:grid-cols-2 gap-6 mt-8">
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h2 className="text-xl font-bold mb-4">Upcoming Exams</h2>
//             <ul className="space-y-3">
//               <li className="flex justify-between border-b pb-2"><span>Math - Class 10</span><span className="text-gray-500">15 Mar</span></li>
//               <li className="flex justify-between border-b pb-2"><span>Science - Class 9</span><span className="text-gray-500">18 Mar</span></li>
//               <li className="flex justify-between"><span>English - Class 8</span><span className="text-gray-500">21 Mar</span></li>
//             </ul>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow">
//             <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
//             <ul className="space-y-3">
//               <li className="border-b pb-2">New student registered in Class 7</li>
//               <li className="border-b pb-2">Fee payment received from Rahul Sharma</li>
//               <li>Teacher added for Mathematics</li>
//             </ul>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 bg-white p-6 rounded-xl shadow">
//           <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">Add Student</button>
//             <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">Add Teacher</button>
//             <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600">Create Exam</button>
//             <button 
//               onClick={() => setShowPaymentModal(true)} 
//               className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600"
//             >
//               Update Payment Keys
//             </button>
//           </div>
//         </div>

//         {/* Modal for Razorpay Config */}
//         {showPaymentModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
//               <h2 className="text-2xl font-bold mb-2">Razorpay Config</h2>
//               <p className="text-gray-500 text-sm mb-6">Enter API credentials for this school.</p>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase">Key ID</label>
//                   <input 
//                     type="text" className="w-full border p-2 rounded-lg mt-1" placeholder="rzp_test_..."
//                     value={paymentConfig.apiKey}
//                     onChange={(e) => setPaymentConfig({...paymentConfig, apiKey: e.target.value})}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase">Key Secret</label>
//                   <input 
//                     type="password" className="w-full border p-2 rounded-lg mt-1" placeholder="Secret Key"
//                     value={paymentConfig.apiSecret}
//                     onChange={(e) => setPaymentConfig({...paymentConfig, apiSecret: e.target.value})}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs font-semibold text-gray-500 uppercase">Webhook Secret</label>
//                   <input 
//                     type="text" className="w-full border p-2 rounded-lg mt-1" placeholder="Optional"
//                     value={paymentConfig.webhookSecret}
//                     onChange={(e) => setPaymentConfig({...paymentConfig, webhookSecret: e.target.value})}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                    <input 
//                     type="checkbox" 
//                     checked={paymentConfig.isTestMode}
//                     onChange={(e) => setPaymentConfig({...paymentConfig, isTestMode: e.target.checked})}
//                    />
//                    <span className="text-sm text-gray-600">Enable Test Mode</span>
//                 </div>
//               </div>

//               <div className="flex justify-end mt-8 gap-3">
//                 <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
//                 <button 
//                   disabled={mutation.isPending}
//                   onClick={handleSavePaymentConfig} 
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 shadow-lg hover:bg-blue-700 transition"
//                 >
//                   {mutation.isPending ? "Saving..." : "Save Config"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }