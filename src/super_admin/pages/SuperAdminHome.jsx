// src/super_admin/pages/SuperAdminHome.jsx
import { useState, useEffect } from "react";

import DashboardCard        from "../../common/components/DashboardCard";
import RevenueChart         from "../../common/components/RevenueChart";
import RecentActivity       from "../../common/components/RecentActivity";
import ExpiringSchoolsCard  from "../components/ExpiringSchoolsCard";
import SchoolOnboardingCard from "../components/SchoolOnboardingCard";
import Sidebar              from "../components/SuperAdminSidebar";
import { getDashboardData } from "../services/superAdminService";

import {
  School,
  Users,
  UserCheck,
  IndianRupee,
  Activity,
  BookOpen,
  RefreshCw,
} from "lucide-react";

export default function SuperAdminHome() {
  const [openOnboard, setOpenOnboard] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    total_schools:       0,
    total_students:      0,
    total_teachers:      0,
    totalRevenu:         0, // NOTE: backend DTO field is "totalRevenu" (no 'e')
    active_subscription: 0,
  });

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Safe revenue value — backend sends "totalRevenu" (typo in DTO, don't change)
  const revenueValue = Number(dashboardData.totalRevenu || 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Karyasoft Technology
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Welcome back, Super Admin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setOpenOnboard(true)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 flex items-center gap-2"
              >
                + Onboard School
              </button>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
            <DashboardCard
              title="Total Schools"
              value={dashboardData.total_schools}
              icon={School}
              color="border-blue-500"
              link="/super-admin/schools"
            />
            <DashboardCard
              title="Total Students"
              value={dashboardData.total_students}
              icon={Users}
              color="border-green-500"
              link="/super-admin/students"
            />
            <DashboardCard
              title="Total Teachers"
              value={dashboardData.total_teachers}
              icon={UserCheck}
              color="border-purple-500"
              link="/super-admin/teachers"
            />
            <DashboardCard
              title="Total Revenue"
              value={`₹${revenueValue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              color="border-yellow-500"
            />
            <DashboardCard
              title="Active Subscriptions"
              value={dashboardData.active_subscription}
              icon={Activity}
              color="border-pink-500"
              link="/super-admin/subscriptions"
            />
            <DashboardCard
              title="Exam Modules Active"
              value={65}
              icon={BookOpen}
              color="border-indigo-500"
            />
          </div>

          {/* ANALYTICS ROW */}
          <div className="grid lg:grid-cols-2 gap-5">
            <RevenueChart />
            <RecentActivity />
            <ExpiringSchoolsCard />
          </div>

        </div>
      </div>

      {/* ONBOARDING MODAL */}
      {openOnboard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenOnboard(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setOpenOnboard(false)}
              className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors text-lg font-medium"
            >
              ✕
            </button>
            <SchoolOnboardingCard />
          </div>
        </div>
      )}
    </div>
  );
}
