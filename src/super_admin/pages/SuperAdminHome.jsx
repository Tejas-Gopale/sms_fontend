import { useState } from "react";

import DashboardCard from "../../common/components/DashboardCard";
import RevenueChart from "../../common/components/RevenueChart";
import RecentActivity from "../../common/components/RecentActivity";
import ExpiringSchoolsCard from "../components/ExpiringSchoolsCard";
import SchoolOnboardingCard from "../components/SchoolOnboardingCard";
import Sidebar from "../components/SuperAdminSidebar";

import {
  School,
  Users,
  UserCheck,
  IndianRupee,
  Activity,
  BookOpen
} from "lucide-react";

export default function SuperAdminHome() {

  const [openOnboard,setOpenOnboard] = useState(false);

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
            onClick={()=>setOpenOnboard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            + Onboard School
          </button>

        </div>


        {/* DASHBOARD CARDS */}

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">

          <DashboardCard
            title="Total Schools"
            value={125}
            icon={School}
            color="border-blue-500"
            link="/super-admin/schools"
          />

          <DashboardCard
            title="Total Students"
            value={52340}
            icon={Users}
            color="border-green-500"
          />

          <DashboardCard
            title="Total Teachers"
            value={2340}
            icon={UserCheck}
            color="border-purple-500"
          />

          <DashboardCard
            title="Total Revenue"
            value={1850000}
            icon={IndianRupee}
            color="border-yellow-500"
          />

          <DashboardCard
            title="Active Subscriptions"
            value={92}
            icon={Activity}
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

            <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative animate-fadeIn">

              <button
                onClick={()=>setOpenOnboard(false)}
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