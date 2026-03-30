import { useState, useEffect } from "react";

import DashboardCard from "../../common/components/DashboardCard";
import RevenueChart from "../../common/components/RevenueChart";
import RecentActivity from "../../common/components/RecentActivity";
import ExpiringSchoolsCard from "../components/ExpiringSchoolsCard";
import SchoolOnboardingCard from "../components/SchoolOnboardingCard";
import Sidebar from "../components/SuperAdminSidebar";

import API from "../../common/services/api";

import {
  School,
  Users,
  UserCheck,
  IndianRupee,
  Activity,
  BookOpen
} from "lucide-react";

export default function SuperAdminHome() {

  const [openOnboard, setOpenOnboard] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    total_schools: 0,
    total_students: 0,
    total_teachers: 0,
    totalRevenue: 0,
    active_subscription: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/super-admin/getDashboard-data");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            Karyasoft Technology
          </h1>

          <button
            onClick={() => setOpenOnboard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            + Onboard School
          </button>

        </div>

        {/* DASHBOARD CARDS */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">

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
            link="/super-admin/students"
            color="border-green-500"
          />

          <DashboardCard
            title="Total Teachers"
            value={dashboardData.total_teachers}
            icon={UserCheck}
            link="/super-admin/teachers"
            color="border-purple-500"
          />

          <DashboardCard
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenu.toLocaleString()}`}
            icon={IndianRupee}
            color="border-yellow-500"
          />

          <DashboardCard
            title="Active Subscriptions"
            value={dashboardData.active_subscription}
            icon={Activity}
            link="/super-admin/subscriptions"
            color="border-pink-500"
          />

          <DashboardCard
            title="Exam Modules Active"
            value={65}
            icon={BookOpen}
            color="border-indigo-500"
          />

        </div>

        {/* ANALYTICS */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          <RevenueChart />

          <RecentActivity />

          <ExpiringSchoolsCard />

        </div>

        {/* ONBOARDING MODAL */}
        {openOnboard && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">

              <button
                onClick={() => setOpenOnboard(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>

              <SchoolOnboardingCard />

            </div>

          </div>
        )}

      </div>
    </div>
  );
}