import DashboardCard from "../../common/components/DashboardCard";
import RevenueChart from "../../common/components//RevenueChart";
import RecentActivity from "../../common/components//RecentActivity";
import SchoolOnboardingCard from "../components/SchoolOnboardingCard";
import ExpiringSchoolsCard from "../components/ExpiringSchoolsCard";

import {
  School,
  Users,
  UserCheck,
  IndianRupee,
  Activity,
  BookOpen,
} from "lucide-react";
import Sidebar from "../components/SuperAdminSidebar";

export default function SuperAdminHome() {
  return (
  <div className="flex">
    <Sidebar />
 
  <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Karyasoft Technology</h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* <Sidebar /> */}
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

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <RevenueChart />
        <RecentActivity />

        <SchoolOnboardingCard />

        <ExpiringSchoolsCard />
      </div>
    </div>
     </div>
  );
}
/*
    1. Dashboard Cards: 
        Total Schools, 
        Total Students,
        Total Teachers,
        Total Revenue,
        Active Subscriptions,
        Exam Modules Active
    2. Revenue Chart: Monthly revenue trend for the past year
    3. Recent Activity: List of recent actions like new school registrations, payments received, etc.
    4. School Onboarding: A card with a form to onboard new schools
    5. Expiring Schools: A table listing schools whose subscriptions are about to expire in the next 30 days
*/
