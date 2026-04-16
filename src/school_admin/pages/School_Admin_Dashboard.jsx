import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  Settings,
  AlertCircle,
  CheckCircle
} from "lucide-react";

import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";

export default function SchoolAdminDashboard() {

  // ✅ State to store API data
  const [dashboardData, setDashboardData] = useState({
    total_Students: 0,
    total_Teachers: 0,
    totalClasses: 0,
    fees_Colleced: 0,
    isPaymentConfigured: false // ✅ New state to check payment status
  });

  // Modal State for Payment Settings
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    apiKey: "",
    apiSecret: "",
    webhookSecret: ""
  });

  // ✅ API Call
  const getSchoolDashboardData = async () => {
    try {
      console.log("Fetching dashboard data..." + new Date().toISOString());
      const res = await API.get("/school-admin/getSchoolDashboardData");
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // ✅ Function to Save Razorpay Keys
  const handleSavePaymentConfig = async () => {
    try {
      await API.post("/api/payments/update-config", paymentConfig);
      alert("Payment Keys Updated Successfully!");
      setShowPaymentModal(false);
      getSchoolDashboardData(); // Refresh to update status
    } catch (error) {
      alert("Error saving config" , error);
    }
  };

  // ✅ Call API on page load
  useEffect(() => {
    getSchoolDashboardData();
  }, []);

  // ✅ Dynamic Stats
  const stats = [
    {
      title: "Total Students",
      value: dashboardData.total_Students,
      icon: Users,
      color: "border-blue-500"
    },
    {
      title: "Total Teachers",
      value: dashboardData.total_Teachers,
      icon: GraduationCap,
      color: "border-green-500"
    },
    {
      title: "Total Classes",
      value: dashboardData.totalClasses,
      icon: BookOpen,
      color: "border-purple-500"
    },
    {
      title: "Fees Collected",
      value: `₹${dashboardData.fees_Colleced?.toLocaleString()}`,
      icon: IndianRupee,
      color: "border-yellow-500"
    }
  ];

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        <h1 className="text-3xl font-bold mb-6">
          School Admin Dashboard
        </h1>

        {/* ✅ Payment Status Badge */}
          <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${dashboardData.isPaymentConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {dashboardData.isPaymentConfigured ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>} 
             {dashboardData.isPaymentConfigured ? "Payments Active" : "Payments Not Configured"} 
          </div>
        
       {/* ✅ Payment Setup Notice (Only shows if not configured) */}
       {!dashboardData.isPaymentConfigured && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex justify-between items-center">
            <div className="flex items-center">
              <Settings className="text-yellow-600 mr-3" />
              <div>
                <p className="font-bold text-yellow-800">Payment Gateway Required</p>
                <p className="text-yellow-700 text-sm">Please add your Razorpay keys to start collecting fees online.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              Setup Now
            </button>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">
                      {stat.title}
                    </p>
                    <h2 className="text-2xl font-bold">
                      {stat.value}
                    </h2>
                  </div>
                  <Icon size={28} className="text-gray-600" />
                </div>
              </div>
            );
          })}

        </div>

        {/* Dashboard Sections */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          {/* Upcoming Exams */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">
              Upcoming Exams
            </h2>

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

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">
              Recent Activities
            </h2>

            <ul className="space-y-3">

              <li className="border-b pb-2">
                New student registered in Class 7
              </li>

              <li className="border-b pb-2">
                Fee payment received from Rahul Sharma
              </li>

              <li className="border-b pb-2">
                Teacher added for Mathematics
              </li>

              <li>
                Exam timetable updated
              </li>

            </ul>

          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
              Add Student
            </button>

            <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
              Add Teacher
            </button>

            <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600">
              Create Exam
            </button>

            <button className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600">
              Collect Fees
            </button>

          </div>
          {/* ✅ Payment Configuration Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Razorpay Configuration</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your school's specific Razorpay API credentials.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded-lg" 
                    placeholder="rzp_live_..."
                    value={paymentConfig.apiKey}
                    onChange={(e) => setPaymentConfig({...paymentConfig, apiKey: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Secret</label>
                  <input 
                    type="password" 
                    className="w-full border p-2 rounded-lg"
                    value={paymentConfig.apiSecret}
                    onChange={(e) => setPaymentConfig({...paymentConfig, apiSecret: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded-lg"
                    value={paymentConfig.webhookSecret}
                    onChange={(e) => setPaymentConfig({...paymentConfig, webhookSecret: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePaymentConfig}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

      </div>

    </div>
    
  );
  
}