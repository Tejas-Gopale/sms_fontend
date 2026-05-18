import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
// Super_Admin Importing components
import SuperAdminHome from "./super_admin/pages/SuperAdminHome";
import SMS_Students from "./super_admin/pages/SMS_Students";
import SMS_Teachers from "./super_admin/pages/SMS_Teachers";
import SMS_Schools from "./super_admin/pages/SMS_Schools";
import SMS_Revenue from "./super_admin/pages/SMS_Revenue";
import SMS_Subscriptions from "./super_admin/pages/SMS_Subscription";
import SMS_Settings from "./super_admin/pages/SMS_Settings";
import { useFCM } from './common/hooks/useFCM';

// School_Admin Importing components
import SchoolAdminDashboard from "./school_admin/pages/School_Admin_Dashboard";
import Classes from "./school_admin/pages/Classes";
import Exams from "./school_admin/pages/Exams";
import Students from "./school_admin/pages/Students";
import Subjects from "./school_admin/pages/Subjects";
import FeeManagement from "./school_admin/pages/FeeManagement";
import Timetable from "./school_admin/pages/Timetable";
import Notifications from "./school_admin/pages/Notifications";
import Settings from "./school_admin/pages/Settings";
import Teacher from "./school_admin/pages/AllTeachers";

// Teacher Importing components
import TeacherDashboard from "./teachers/pages/Teachers_Dashboard";
import Teacher_Salary from "./teachers/pages/Teacher_Salary";
import TeacherNotifications from "./teachers/pages/Teacher_Notification";
import StudentRemarks from "./teachers/pages/StudentRemarks";
import TeacherExam from "./teachers/pages/ExamAndTes";
import AssignHomework from "./teachers/pages/AssignHomework";
import TeacherAttendance from "./teachers/pages/TeacherAttendance";
import TakeAttendance from "./teachers/pages/TakeAttendance";
import TimetableCreator from "./school_admin/components/TimetableCreator";

// Parent Importing components
import ParentDashboard from "./parents/pages/Parents_Dashboard";
// import ParentSettings from "./parents/pages/ParentSettings";
import ParentNotifications from "./parents/pages/ParentNotifications";
import ParentRemarks from "./parents/pages/ParentRemarks";
import ParentFees from "./parents/pages/Fees";
import ParentBusTracking from "./parents/pages/ParentBusTracking";
import ParentResults from "./parents/pages/ParentResults";
import ParentHomework from "./parents/pages/ParentHomework";
import ParentAttendance from "./parents/pages/ParentAttendance";
import ParentTimeTable from "./parents/pages/Timetable";

// common components
import ProtectedRoute from "./common/routes/ProtectedRoute";
import LoginPage from "./common/components/LoginPage";
import Resetpasswordpage from "./common/components/Resetpasswordpage";
import VisitorManagementPage from "./school_admin/pages/Visitormanagementpage";
import StaffManagement from "./school_admin/pages/StaffManagement";
import LibraryManagement from "./school_admin/pages/LibraryManagement";
import TransportManagement from "./school_admin/pages/TransportManagement";
import HostelManagement from "./school_admin/pages/HostelManagement";
import AdmissionManagement from "./school_admin/pages/AdmissionManagement";
import EventManagement from "./school_admin/pages/EventManagement";
import TeacherTimetable from "./teachers/pages/Timetable";
import TeacherSettings from "./teachers/pages/Teacher_settings";
import ProfilePage from "./profile/ProfilePage";

// ── Wrapper so useNavigate works inside Route element ──────────────────────
function TimetableCreatorPage() {
  const navigate = useNavigate();
  return <TimetableCreator onBack={() => navigate("/school-admin/timetable")} />;
}

function App() {
    useFCM(); // ← bas ye ek line add karo

  return (
    <BrowserRouter>
      <Routes>

        {/* Login Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<Resetpasswordpage />} />

        {/* Super Admin Routes */}
        <Route path="/super-admin/dashboard" element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdminHome /></ProtectedRoute>} />
        <Route path="/super-admin/students" element={<SMS_Students />} />
        <Route path="/super-admin/teachers" element={<SMS_Teachers />} />
        <Route path="/super-admin/revenue" element={<SMS_Revenue />} />
        <Route path="/super-admin/subscriptions" element={<SMS_Subscriptions />} />
        <Route path="/super-admin/schools" element={<SMS_Schools />} />
        <Route path="/super-admin/settings" element={<SMS_Settings />} />

        {/* School Admin Routes */}
        <Route path="/school-admin/dashboard" element={<ProtectedRoute role="SCHOOL_ADMIN"><SchoolAdminDashboard /></ProtectedRoute>} />
        <Route path="/school-admin/classes" element={<Classes />} />
        <Route path="/school-admin/exams" element={<Exams />} />
        <Route path="/school-admin/students" element={<Students />} />
        <Route path="/school-admin/teachers" element={<Teacher />} />
        <Route path="/school-admin/subjects" element={<Subjects />} />
        <Route path="/school-admin/fees" element={<FeeManagement />} />
        <Route path="/school-admin/timetable" element={<Timetable />} />
        <Route path="/school-admin/timetable/create" element={<TimetableCreatorPage />} />
        <Route path="/school-admin/notifications" element={<Notifications />} />
        <Route path="/school-admin/settings" element={<Settings />} />
        <Route path="/school-admin/profile-settings" element={<ProfilePage />} />
        <Route path="/school-admin/visitors" element={<VisitorManagementPage />} />
        <Route path="/school-admin/analytics" element={<SchoolAdminDashboard />} />
        <Route path="/school-admin/events" element={<EventManagement />} />
        <Route path="/school-admin/alumni" element={<SchoolAdminDashboard />} />
        <Route path="/school-admin/health" element={<SchoolAdminDashboard />} />
        <Route path="/school-admin/communication" element={<SchoolAdminDashboard />} />
        <Route path="/school-admin/library" element={<LibraryManagement />} />
        <Route path="/school-admin/transport" element={<TransportManagement />} />
        <Route path="/school-admin/hostel" element={<HostelManagement />} />
        <Route path="/school-admin/inventory" element={<SchoolAdminDashboard />} />
        <Route path="/school-admin/staff" element={<StaffManagement />} />
        <Route path="/school-admin/admissions" element={<AdmissionManagement />} />

        {/* Teacher Routes */}
        <Route path="/teachers/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<TakeAttendance />} />
        <Route path="/teacher/my-attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/assign-homework" element={<AssignHomework />} />
        <Route path="/teacher/exams_and_tests" element={<TeacherExam />} />
        <Route path="/teacher/remarks" element={<StudentRemarks />} />
        <Route path="/teacher/salary" element={<Teacher_Salary />} />
        <Route path="/teacher/notifications" element={<TeacherNotifications />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/settings" element={<TeacherSettings />} />
        <Route path="/teacher/profile-settings" element={<ProfilePage />} />

        {/* Parent Routes */}
        <Route path="/parents/dashboard" element={<ParentDashboard />} />
         <Route path="/parent/attendance" element={<ParentAttendance />} />
        <Route path="/parent/homework" element={<ParentHomework />} />
        <Route path="/parent/results" element={<ParentResults />} />
        <Route path="/parent/bus-tracking" element={<ParentBusTracking />} />
        <Route path="/parent/fees" element={<ParentFees />} />
       <Route path="/parent/remarks" element={<ParentRemarks />} />
       <Route path="/parent/notifications" element={<ParentNotifications />} />
        {/* <Route path="/parent/settings" element={<ParentSettings />} /> */}
         <Route path="/parent/timetable" element={<ParentTimeTable />} />
        <Route path="/parent/profile-settings" element={<ProfilePage />} /> 

      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// // Super_Admin Importing components
// import SuperAdminHome from "./super_admin/pages/SuperAdminHome";
// import SMS_Students from "./super_admin/pages/SMS_Students";
// import SMS_Teachers from "./super_admin/pages/SMS_Teachers";
// import SMS_Schools from "./super_admin/pages/SMS_Schools";
// import SMS_Revenue from "./super_admin/pages/SMS_Revenue";
// import SMS_Subscriptions from "./super_admin/pages/SMS_Subscription";
// import SMS_Settings from "./super_admin/pages/SMS_Settings";

// // School_Admin Importing components
// import SchoolAdminDashboard from "./school_admin/pages/School_Admin_Dashboard";
// import Classes from "./school_admin/pages/Classes";
// import Exams from "./school_admin/pages/Exams";
// import Students from "./school_admin/pages/Students";
// import Subjects from "./school_admin/pages/Subjects";
// import FeeManagement from "./school_admin/pages/FeeManagement";
// import Timetable from "./school_admin/pages/Timetable";
// import Notifications from "./school_admin/pages/Notifications";
// import Settings from "./school_admin/pages/Settings";
// import Teacher from "./school_admin/pages/AllTeachers";

// // Teacher Importing components
// import TeacherDashboard from "./teachers/pages/Teachers_Dashboard";
// import Teacher_Salary from "./teachers/pages/Teacher_Salary";
// import TeacherNotifications from "./teachers/pages/Teacher_Notification";
// import StudentRemarks from "./teachers/pages/StudentRemarks";
// import TeacherExam from "./teachers/pages/ExamAndTes";
// import AssignHomework from "./teachers/pages/AssignHomework";
// import TeacherAttendance from "./teachers/pages/TeacherAttendance";
// import TakeAttendance from "./teachers/pages/TakeAttendance";
// import TimetableCreator from "./school_admin/components/Timetablecreator";
// // Parent Importing components
// import ParentDashboard from "./parents/pages/Parents_Dashboard";
// import ParentSettings from "./parents/pages/ParentSettings";
// import ParentNotifications from "./parents/pages/ParentNotifications";
// import ParentRemarks from "./parents/pages/ParentRemarks";
// import ParentFees from "./parents/pages/Fees";
// import ParentBusTracking from "./parents/pages/ParentBusTracking";
// import ParentResults from "./parents/pages/ParentResults";
// import ParentHomework from "./parents/pages/ParentHomework";
// import ParentAttendance from "./parents/pages/ParentAttendance";
// import ParentTimeTable from "./parents/pages/Timetable";

// // common components
// import ProtectedRoute from "./common/routes/ProtectedRoute";
// import LoginPage from "./common/components/LoginPage";


// import Resetpasswordpage from "./common/components/Resetpasswordpage";
// import VisitorManagementPage from "./school_admin/pages/Visitormanagementpage";
// import StaffManagement from "./school_admin/pages/StaffManagement";
// import LibraryManagement from "./school_admin/pages/LibraryManagement";
// import TransportManagement from "./school_admin/pages/TransportManagement";
// import HostelManagement from "./school_admin/pages/HostelManagement";
// import AdmissionManagement from "./school_admin/pages/AdmissionManagement";
// import EventManagement from "./school_admin/pages/EventManagement";
// import TeacherTimetable from "./teachers/pages/Timetable";
// import TeacherSettings from "./teachers/pages/Teacher_settings";
// import ProfilePage from "./profile/ProfilePage";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Login Route */}
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/reset-password" element={<Resetpasswordpage />} />
//       <>
//         {/* Super Admin Routes */}
//         <Route path="/super-admin/dashboard" element={ <ProtectedRoute role="SUPER_ADMIN"> <SuperAdminHome /> </ProtectedRoute>} />
//         <Route path="/super-admin/students" element={<SMS_Students />} />
//         <Route path="/super-admin/teachers" element={<SMS_Teachers />} />
//         <Route path="/super-admin/revenue" element={<SMS_Revenue />} />
//         <Route path="/super-admin/subscriptions" element={<SMS_Subscriptions />} />
//         <Route path="/super-admin/schools" element={<SMS_Schools />} />
//         <Route path="/super-admin/settings" element={<SMS_Settings />} />

//       </>
//     {/* School Admin Routes */}
//       <>  
//         <Route path="/school-admin/dashboard" element={<ProtectedRoute role="SCHOOL_ADMIN"> <SchoolAdminDashboard /> </ProtectedRoute>}/>
//         {/* Add more routes as needed */}
//         <Route path="/school-admin/classes" element={<Classes />} />
//         <Route path="/school-admin/exams" element={<Exams  />} />
//         <Route path="/school-admin/students" element={<Students />} />
//         <Route path="/school-admin/teachers" element={<Teacher />} />
//         <Route path="/school-admin/subjects" element={<Subjects />} />
//         <Route path="/school-admin/fees" element={<FeeManagement />} />
//         <Route path="/school-admin/timetable" element={<Timetable />} />
//         <Route path="/school-admin/notifications" element={<Notifications />} />
//         <Route path="/school-admin/settings" element={<Settings />} />
//         <Route path="/school-admin/profile-settings" element={<ProfilePage   />} /> {/* Placeholder for Profile Settings page */}
//         <Route path="/school-admin/visitors" element={<VisitorManagementPage />} />
//         <Route path="/school-admin/analytics" element={<SchoolAdminDashboard />} /> {/* Placeholder for Analytics & Reports page */}
//         <Route path="/school-admin/events" element={<EventManagement />} /> {/* Placeholder for Event Management page */}
//         <Route path="/school-admin/alumni" element={<SchoolAdminDashboard />} /> {/* Placeholder for Alumni Management page */}
//         <Route path="/school-admin/health" element={<SchoolAdminDashboard />} /> {/* Placeholder for Health & Wellness page */}
//         <Route path="/school-admin/communication" element={<SchoolAdminDashboard />} /> {/* Placeholder for Communication page */}
//         <Route path="/school-admin/library" element={<LibraryManagement />} /> {/* Placeholder for Library Management page */}
//         <Route path="/school-admin/transport" element={<TransportManagement />} /> {/* Placeholder for Transport Management page */}
//         <Route path="/school-admin/hostel" element={<HostelManagement />} /> {/* Placeholder for Hostel Management page */}
//         <Route path="/school-admin/inventory" element={<SchoolAdminDashboard />} /> {/* Placeholder for Inventory Management page */}
//         <Route path="/school-admin/staff" element={<StaffManagement />} /> {/* Placeholder for Staff Management page */}
//         <Route path="/school-admin/admissions" element={<AdmissionManagement />} /> {/* Placeholder for Admission Management page */}
//         <Route path="/school-admin/events" element={<EventManagement />} /> {/* Placeholder for Event Management page */}
//         <Route path="/school-admin/timetable/create" element={<TimetableCreator onBack={() => navigate("/school-admin/timetable")} />} />
//         </> 

//         {/* Teacher Routes */}

//         <Route path="/teachers/dashboard" element={<TeacherDashboard />}/>
//         <Route path="/teacher/attendance" element={<TakeAttendance />} />
//         <Route path="/teacher/my-attendance" element={<TeacherAttendance />} />
//         <Route path="/teacher/assign-homework" element={<AssignHomework />} />
//         <Route path="/teacher/exams_and_tests" element={<TeacherExam />} />
//         <Route path="/teacher/remarks" element={<StudentRemarks />} />
//         <Route path="/teacher/salary" element={<Teacher_Salary />} />
//         <Route path="/teacher/notifications" element={<TeacherNotifications />} />
//         <Route path="/teacher/timetable" element={<TeacherTimetable />} />
//         <Route path="/teacher/settings" element={<TeacherSettings />} />
//         <Route path="/teacher/profile-settings" element={<ProfilePage />} /> {/* Placeholder for Profile Settings page */}
//         {/* Add more routes for teachers, students, etc. */}

//         <Route path="/parents/dashboard" element={<ParentDashboard />} />

//         {/* Parent-specific routes  ParentDashboard*/}
//         <Route path="/parent/attendance" element={<ParentAttendance />} />
//         <Route path="/parent/homework" element={<ParentHomework />} />
//         <Route path="/parent/results" element={<ParentResults />} />
//         <Route path="/parent/bus-tracking" element={<ParentBusTracking />} />
//         <Route path="/parent/fees" element={<ParentFees />} />
//         <Route path="/parent/remarks" element={<ParentRemarks />} />
//         <Route path="/parent/notifications" element={<ParentNotifications />} />
//         <Route path="/parent/settings" element={<ParentSettings />} />
//         <Route path="/parent/timetable" element={<ParentTimeTable />} />
//         <Route path="/parent/profile-settings" element={<ProfilePage />} /> {/* Placeholder for Profile Settings page */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App; 