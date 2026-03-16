import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminHome from "./super_admin/pages/SuperAdminHome";
import SchoolsList from "./super_admin/pages/SchoolsList";
import SchoolAdminDashboard from "./school_admin/pages/School_Admin_Dashboard";
import TeacherDashboard from "./teachers/pages/Teachers_Dashboard";
import ParentDashboard from "./parents/pages/Parents_Dashboard";
import ParentSettings from "./parents/pages/ParentSettings";
import ParentNotifications from "./parents/pages/ParentNotifications";
import ParentRemarks from "./parents/pages/ParentRemarks";
import ParentFees from "./parents/pages/Fees";
import ParentBusTracking from "./parents/pages/ParentBusTracking";
import ParentResults from "./parents/pages/ParentResults";
import ParentHomework from "./parents/pages/ParentHomework";
import ParentAttendance from "./parents/pages/ParentAttendance";
import Classes from "./school_admin/pages/Classes";
import Exams from "./school_admin/pages/Exams";
import Students from "./school_admin/pages/Students";
import Teachers from "./school_admin/pages/Teachers";
import Subjects from "./school_admin/pages/Subjects";
import FeeManagement from "./school_admin/pages/FeeManagement";
import Timetable from "./school_admin/pages/Timetable";
import Notifications from "./school_admin/pages/Notifications";
import Settings from "./school_admin/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<SuperAdminHome />} />

        <Route path="/super-admin/dashboard" element={<SuperAdminHome />} />
        
        <Route path="/super-admin/schools" element={<SchoolsList />}/>

        <Route path="/school-admin/dashboard" element={<SchoolAdminDashboard />}/>
        {/* Add more routes as needed */}
        <Route path="/school-admin/classes" element={<Classes />} />
        <Route path="/school-admin/exams" element={<Exams  />} />
        <Route path="/school-admin/students" element={<Students />} />
        <Route path="/school-admin/teachers" element={<Teachers />} />
        <Route path="/school-admin/subjects" element={<Subjects />} />
        <Route path="/school-admin/fees" element={<FeeManagement />} />
        <Route path="/school-admin/timetable" element={<Timetable />} />
        <Route path="/school-admin/notifications" element={<Notifications />} />
        <Route path="/school-admin/settings" element={<Settings />} />
            
        {/* Add more routes for teachers, students, etc. */}
        <Route path="/teachers/dashboard" element={<TeacherDashboard />}/>

        <Route path="/parents/dashboard" element={<ParentDashboard />} />

        {/* Parent-specific routes  ParentDashboard*/}
        <Route path="/parent/attendance" element={<ParentAttendance />} />
        <Route path="/parent/homework" element={<ParentHomework />} />
        <Route path="/parent/results" element={<ParentResults />} />
        <Route path="/parent/bus-tracking" element={<ParentBusTracking />} />
        <Route path="/parent/fees" element={<ParentFees />} />
        <Route path="/parent/remarks" element={<ParentRemarks />} />
        <Route path="/parent/notifications" element={<ParentNotifications />} />
        <Route path="/parent/settings" element={<ParentSettings />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;