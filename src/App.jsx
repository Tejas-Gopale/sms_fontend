// src/App.jsx
// Role-based routing for ALL backend roles:
// SUPER_ADMIN, SCHOOL_OWNER, SCHOOL_ADMIN, PRINCIPAL, VICE_PRINCIPAL,
// TEACHER, CLASS_TEACHER, COUNSELOR, STUDENT, PARENT,
// ACCOUNTANT, CASHIER, TRANSPORT_MANAGER, BUS_DRIVER, BUS_CONDUCTOR,
// LIBRARIAN, RECEPTIONIST, NURSE, SECURITY, HOUSEKEEPING, CANTEEN_STAFF, IT_ADMIN

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useFCM } from "./common/hooks/useFCM";

// ── Common ──────────────────────────────────────────────────────────────────
import ProtectedRoute          from "./common/routes/ProtectedRoute";
import LoginPage               from "./common/components/LoginPage";
import Resetpasswordpage       from "./common/components/Resetpasswordpage";
import ProfilePage             from "./profile/ProfilePage";

// ── Super Admin ─────────────────────────────────────────────────────────────
import SuperAdminHome          from "./super_admin/pages/SuperAdminHome";
import SMS_Students            from "./super_admin/pages/SMS_Students";
import SMS_Teachers            from "./super_admin/pages/SMS_Teachers";
import SMS_Schools             from "./super_admin/pages/SMS_Schools";
import SMS_Revenue             from "./super_admin/pages/SMS_Revenue";
import SMS_Subscriptions       from "./super_admin/pages/SMS_Subscription";
import SMS_Settings            from "./super_admin/pages/SMS_Settings";
import SMS_SchoolOwner         from "./super_admin/pages/SMS_SchoolOwner";
import SMS_Expenses            from "./super_admin/pages/SMS_Expenses";

// ── School Owner ────────────────────────────────────────────────────────────
import SchoolOwnerDashboard    from "./school_owner/pages/SchoolOwnerDashboard";

// ── School Admin ────────────────────────────────────────────────────────────
import SchoolAdminDashboard    from "./school_admin/pages/School_Admin_Dashboard";
import Classes                 from "./school_admin/pages/Classes";
import Exams                   from "./school_admin/pages/Exams";
import Students                from "./school_admin/pages/Students";
import Subjects                from "./school_admin/pages/Subjects";
import FeeManagement           from "./school_admin/pages/FeeManagement";
import Timetable               from "./school_admin/pages/Timetable";
import Notifications           from "./school_admin/pages/Notifications";
import Settings                from "./school_admin/pages/Settings";
import Teacher                 from "./school_admin/pages/AllTeachers";
import VisitorManagementPage   from "./school_admin/pages/Visitormanagementpage";
import StaffManagement         from "./school_admin/pages/StaffManagement";
import LibraryManagement       from "./school_admin/pages/LibraryManagement";
import TransportManagement     from "./school_admin/pages/TransportManagement";
import HostelManagement        from "./school_admin/pages/HostelManagement";
import AdmissionManagement     from "./school_admin/pages/AdmissionManagement";
import EventManagement         from "./school_admin/pages/EventManagement";
import AlumniManagement        from "./school_admin/pages/AlumniManagement";
import AdminLeaveManagement    from "./school_admin/pages/Adminleavemanagement";
import TimetableCreator        from "./school_admin/components/TimetableCreator";

// ── Principal ───────────────────────────────────────────────────────────────
import PrincipalDashboard      from "./principal/pages/PrincipalDashboard";

// ── Teacher & Class Teacher ─────────────────────────────────────────────────
import TeacherDashboard        from "./teachers/pages/Teachers_Dashboard";
import Teacher_Salary          from "./teachers/pages/Teacher_Salary";
import TeacherNotifications    from "./teachers/pages/Teacher_Notification";
import StudentRemarks          from "./teachers/pages/StudentRemarks";
import TeacherExam             from "./teachers/pages/ExamAndTes";
import AssignHomework          from "./teachers/pages/AssignHomework";
import TeacherAttendance       from "./teachers/pages/TeacherAttendance";
import TakeAttendance          from "./teachers/pages/TakeAttendance";
import TeacherTimetable        from "./teachers/pages/Timetable";
import TeacherSettings         from "./teachers/pages/Teacher_settings";
import TeacherLeave            from "./teachers/pages/TeacherLeave";
import TeacherGpsAttendance    from "./teachers/pages/TeacherGpsAttendance";
import ClassTeacher_Students   from "./teachers/pages/ClassTeacher_Students";
import ClassTeacher_Subjects   from "./teachers/pages/ClassTeacher_Subjects";
import ClassTeacher_Fees       from "./teachers/pages/ClassTeacher_Fees";

// ── Counselor ───────────────────────────────────────────────────────────────
import CounselorDashboard      from "./counselor/pages/CounselorDashboard";

// ── Student ─────────────────────────────────────────────────────────────────
import StudentDashboard        from "./students/pages/students_Dashboard";

// ── Parent ──────────────────────────────────────────────────────────────────
import ParentDashboard         from "./parents/pages/Parents_Dashboard";
import ParentNotifications     from "./parents/pages/ParentNotifications";
import ParentRemarks           from "./parents/pages/ParentRemarks";
import ParentFees              from "./parents/pages/Fees";
import ParentBusTracking       from "./parents/pages/ParentBusTracking";
import ParentResults           from "./parents/pages/ParentResults";
import ParentHomework          from "./parents/pages/ParentHomework";
import ParentAttendance        from "./parents/pages/ParentAttendance";
import ParentTimeTable         from "./parents/pages/Timetable";

// ── Finance roles ───────────────────────────────────────────────────────────
import AccountantDashboard     from "./accountant/pages/AccountantDashboard";
// import CashierDashboard        from "./cashier/pages/CashierDashboard";

// ── Transport roles ─────────────────────────────────────────────────────────
import TransportManagerDashboard from "./transport_manager/pages/TransportManagerDashboard";
import BusDriverDashboard      from "./bus_driver/pages/BusDriverDashboard";

// ── Support staff roles ─────────────────────────────────────────────────────
import LibrarianDashboard      from "./librarian/pages/LibrarianDashboard";
import {
  ReceptionistDashboard,
  NurseDashboard,
  SecurityDashboard,
  StaffDashboard,
  ITAdminDashboard,
} from "./role_dashboards/MinorRoleDashboards";
import ExpensePage from "./accountant/pages/ExpensePage";

// ── Helper wrapper ───────────────────────────────────────────────────────────
function TimetableCreatorPage() {
  const navigate = useNavigate();
  return <TimetableCreator onBack={() => navigate("/school-admin/timetable")} />;
}

// ── Role groups ──────────────────────────────────────────────────────────────
const ADMIN_ROLES     = ["SCHOOL_ADMIN"];
const PRINCIPAL_ROLES = ["PRINCIPAL", "VICE_PRINCIPAL"];
const TEACHER_ROLES   = ["TEACHER", "CLASS_TEACHER"];

function App() {
  useFCM();

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/"               element={<LoginPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/reset-password" element={<Resetpasswordpage />} />

        {/* ── Super Admin ─────────────────────────────────────────────────── */}
        <Route path="/super-admin/dashboard"     element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SuperAdminHome /></ProtectedRoute>} />
        <Route path="/super-admin/students"      element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Students /></ProtectedRoute>} />
        <Route path="/super-admin/teachers"      element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Teachers /></ProtectedRoute>} />
        <Route path="/super-admin/schools"       element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Schools /></ProtectedRoute>} />
        <Route path="/super-admin/revenue"       element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Revenue /></ProtectedRoute>} />
        <Route path="/super-admin/subscriptions" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Subscriptions /></ProtectedRoute>} />
        <Route path="/super-admin/settings"      element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Settings /></ProtectedRoute>} />
        <Route path="/super-admin/school-owner"  element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_SchoolOwner /></ProtectedRoute>} />
        <Route path="/super-admin/expenses"      element={<ProtectedRoute roles={["SUPER_ADMIN"]}><SMS_Expenses /></ProtectedRoute>} />

        {/* ── School Owner ─────────────────────────────────────────────────── */}
        <Route path="/school-owner/dashboard"        element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><SchoolOwnerDashboard /></ProtectedRoute>} />
        <Route path="/school-owner/revenue"          element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><SchoolOwnerDashboard /></ProtectedRoute>} />
        <Route path="/school-owner/fees"             element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><SchoolOwnerDashboard /></ProtectedRoute>} />
        <Route path="/school-owner/enrollment"       element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><SchoolOwnerDashboard /></ProtectedRoute>} />
        <Route path="/school-owner/profile-settings" element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/school-owner/settings"         element={<ProtectedRoute roles={["SCHOOL_OWNER"]}><Settings /></ProtectedRoute>} />

        {/* ── School Admin ─────────────────────────────────────────────────── */}
        <Route path="/school-admin/dashboard"        element={<ProtectedRoute roles={ADMIN_ROLES}><SchoolAdminDashboard /></ProtectedRoute>} />
        <Route path="/school-admin/students"         element={<ProtectedRoute roles={ADMIN_ROLES}><Students /></ProtectedRoute>} />
        <Route path="/school-admin/teachers"         element={<ProtectedRoute roles={ADMIN_ROLES}><Teacher /></ProtectedRoute>} />
        <Route path="/school-admin/staff"            element={<ProtectedRoute roles={ADMIN_ROLES}><StaffManagement /></ProtectedRoute>} />
        <Route path="/school-admin/admissions"       element={<ProtectedRoute roles={ADMIN_ROLES}><AdmissionManagement /></ProtectedRoute>} />
        <Route path="/school-admin/events"           element={<ProtectedRoute roles={ADMIN_ROLES}><EventManagement /></ProtectedRoute>} />
        <Route path="/school-admin/classes"          element={<ProtectedRoute roles={ADMIN_ROLES}><Classes /></ProtectedRoute>} />
        <Route path="/school-admin/subjects"         element={<ProtectedRoute roles={ADMIN_ROLES}><Subjects /></ProtectedRoute>} />
        <Route path="/school-admin/timetable"        element={<ProtectedRoute roles={ADMIN_ROLES}><Timetable /></ProtectedRoute>} />
        <Route path="/school-admin/timetable/create" element={<ProtectedRoute roles={ADMIN_ROLES}><TimetableCreatorPage /></ProtectedRoute>} />
        <Route path="/school-admin/exams"            element={<ProtectedRoute roles={ADMIN_ROLES}><Exams /></ProtectedRoute>} />
        <Route path="/school-admin/fees"             element={<ProtectedRoute roles={ADMIN_ROLES}><FeeManagement /></ProtectedRoute>} />
        <Route path="/school-admin/visitors"         element={<ProtectedRoute roles={ADMIN_ROLES}><VisitorManagementPage /></ProtectedRoute>} />
        <Route path="/school-admin/notifications"    element={<ProtectedRoute roles={ADMIN_ROLES}><Notifications /></ProtectedRoute>} />
        <Route path="/school-admin/library"          element={<ProtectedRoute roles={ADMIN_ROLES}><LibraryManagement /></ProtectedRoute>} />
        <Route path="/school-admin/transport"        element={<ProtectedRoute roles={ADMIN_ROLES}><TransportManagement /></ProtectedRoute>} />
        <Route path="/school-admin/hostel"           element={<ProtectedRoute roles={ADMIN_ROLES}><HostelManagement /></ProtectedRoute>} />
        <Route path="/school-admin/leave-management" element={<ProtectedRoute roles={ADMIN_ROLES}><AdminLeaveManagement /></ProtectedRoute>} />
        <Route path="/school-admin/alumni"           element={<ProtectedRoute roles={ADMIN_ROLES}><AlumniManagement /></ProtectedRoute>} />
        <Route path="/school-admin/profile-settings" element={<ProtectedRoute roles={ADMIN_ROLES}><ProfilePage /></ProtectedRoute>} />
        <Route path="/school-admin/settings"         element={<ProtectedRoute roles={ADMIN_ROLES}><Settings /></ProtectedRoute>} />
        <Route path="/super-admin/my-attendance"     element={<ProtectedRoute roles={ADMIN_ROLES}><TeacherAttendance /></ProtectedRoute>} />
        {/* ── Principal & Vice Principal ───────────────────────────────────── */}
        <Route path="/principal/dashboard"        element={<ProtectedRoute roles={PRINCIPAL_ROLES}><PrincipalDashboard /></ProtectedRoute>} />
        <Route path="/principal/students"         element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Students /></ProtectedRoute>} />
        <Route path="/principal/teachers"         element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Teacher /></ProtectedRoute>} />
        <Route path="/principal/staff"            element={<ProtectedRoute roles={PRINCIPAL_ROLES}><StaffManagement /></ProtectedRoute>} />
        <Route path="/principal/classes"          element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Classes /></ProtectedRoute>} />
        <Route path="/principal/timetable"        element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Timetable /></ProtectedRoute>} />
        <Route path="/principal/exams"            element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Exams /></ProtectedRoute>} />
        <Route path="/principal/attendance"       element={<ProtectedRoute roles={PRINCIPAL_ROLES}><TakeAttendance /></ProtectedRoute>} />
        <Route path="/principal/notifications"    element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Notifications /></ProtectedRoute>} />
        <Route path="/principal/announcements"    element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Notifications /></ProtectedRoute>} />
        <Route path="/principal/profile-settings" element={<ProtectedRoute roles={PRINCIPAL_ROLES}><ProfilePage /></ProtectedRoute>} />
        <Route path="/principal/settings"         element={<ProtectedRoute roles={PRINCIPAL_ROLES}><Settings /></ProtectedRoute>} />

        {/* ── Teacher ─────────────────────────────────────────────────────── */}
        <Route path="/teachers/dashboard"        element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/attendance"        element={<ProtectedRoute roles={TEACHER_ROLES}><TakeAttendance /></ProtectedRoute>} />
        <Route path="/teacher/my-attendance"     element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/teacher/assign-homework"   element={<ProtectedRoute roles={TEACHER_ROLES}><AssignHomework /></ProtectedRoute>} />
        <Route path="/teacher/exams_and_tests"   element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherExam /></ProtectedRoute>} />
        <Route path="/teacher/remarks"           element={<ProtectedRoute roles={TEACHER_ROLES}><StudentRemarks /></ProtectedRoute>} />
        <Route path="/teacher/salary"            element={<ProtectedRoute roles={TEACHER_ROLES}><Teacher_Salary /></ProtectedRoute>} />
        <Route path="/teacher/notifications"     element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherNotifications /></ProtectedRoute>} />
        <Route path="/teacher/timetable"         element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherTimetable /></ProtectedRoute>} />
        <Route path="/teacher/settings"          element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherSettings /></ProtectedRoute>} />
        <Route path="/teacher/leave"             element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherLeave /></ProtectedRoute>} />
        <Route path="/teacher/gps-attendance"    element={<ProtectedRoute roles={TEACHER_ROLES}><TeacherGpsAttendance /></ProtectedRoute>} />
        <Route path="/teacher/profile-settings"  element={<ProtectedRoute roles={TEACHER_ROLES}><ProfilePage /></ProtectedRoute>} />

        {/* ── Class Teacher exclusive ──────────────────────────────────────── */}
        <Route path="/teacher/my-class"          element={<ProtectedRoute roles={["CLASS_TEACHER"]}><ClassTeacher_Students /></ProtectedRoute>} />
        <Route path="/teacher/class/students"    element={<ProtectedRoute roles={["CLASS_TEACHER"]}><ClassTeacher_Students /></ProtectedRoute>} />
        <Route path="/teacher/class/add-student" element={<ProtectedRoute roles={["CLASS_TEACHER"]}><ClassTeacher_Students /></ProtectedRoute>} />
        <Route path="/teacher/class/subjects"    element={<ProtectedRoute roles={["CLASS_TEACHER"]}><ClassTeacher_Subjects /></ProtectedRoute>} />
        <Route path="/teacher/class/fees"        element={<ProtectedRoute roles={["CLASS_TEACHER"]}><ClassTeacher_Fees /></ProtectedRoute>} />

        {/* ── Counselor ───────────────────────────────────────────────────── */}
        <Route path="/counselor/dashboard"        element={<ProtectedRoute roles={["COUNSELOR"]}><CounselorDashboard /></ProtectedRoute>} />
        <Route path="/counselor/students"         element={<ProtectedRoute roles={["COUNSELOR"]}><Students /></ProtectedRoute>} />
        <Route path="/counselor/sessions"         element={<ProtectedRoute roles={["COUNSELOR"]}><CounselorDashboard /></ProtectedRoute>} />
        <Route path="/counselor/remarks"          element={<ProtectedRoute roles={["COUNSELOR"]}><StudentRemarks /></ProtectedRoute>} />
        <Route path="/counselor/notifications"    element={<ProtectedRoute roles={["COUNSELOR"]}><Notifications /></ProtectedRoute>} />
        <Route path="/counselor/my-attendance"    element={<ProtectedRoute roles={["COUNSELOR"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/counselor/profile-settings" element={<ProtectedRoute roles={["COUNSELOR"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/counselor/settings"         element={<ProtectedRoute roles={["COUNSELOR"]}><Settings /></ProtectedRoute>} />

        {/* ── Student ─────────────────────────────────────────────────────── */}
        <Route path="/student/dashboard"         element={<ProtectedRoute roles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/timetable"         element={<ProtectedRoute roles={["STUDENT"]}><ParentTimeTable /></ProtectedRoute>} />
        <Route path="/student/homework"          element={<ProtectedRoute roles={["STUDENT"]}><ParentHomework /></ProtectedRoute>} />
        <Route path="/student/results"           element={<ProtectedRoute roles={["STUDENT"]}><ParentResults /></ProtectedRoute>} />
        <Route path="/student/attendance"        element={<ProtectedRoute roles={["STUDENT"]}><ParentAttendance /></ProtectedRoute>} />
        <Route path="/student/fees"              element={<ProtectedRoute roles={["STUDENT"]}><ParentFees /></ProtectedRoute>} />
        <Route path="/student/notifications"     element={<ProtectedRoute roles={["STUDENT"]}><ParentNotifications /></ProtectedRoute>} />
        <Route path="/student/profile-settings"  element={<ProtectedRoute roles={["STUDENT"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/settings"          element={<ProtectedRoute roles={["STUDENT"]}><Settings /></ProtectedRoute>} />

        {/* ── Parent ──────────────────────────────────────────────────────── */}
        <Route path="/parents/dashboard"         element={<ProtectedRoute roles={["PARENT"]}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/attendance"         element={<ProtectedRoute roles={["PARENT"]}><ParentAttendance /></ProtectedRoute>} />
        <Route path="/parent/homework"           element={<ProtectedRoute roles={["PARENT"]}><ParentHomework /></ProtectedRoute>} />
        <Route path="/parent/results"            element={<ProtectedRoute roles={["PARENT"]}><ParentResults /></ProtectedRoute>} />
        <Route path="/parent/bus-tracking"       element={<ProtectedRoute roles={["PARENT"]}><ParentBusTracking /></ProtectedRoute>} />
        <Route path="/parent/fees"               element={<ProtectedRoute roles={["PARENT"]}><ParentFees /></ProtectedRoute>} />
        <Route path="/parent/remarks"            element={<ProtectedRoute roles={["PARENT"]}><ParentRemarks /></ProtectedRoute>} />
        <Route path="/parent/notifications"      element={<ProtectedRoute roles={["PARENT"]}><ParentNotifications /></ProtectedRoute>} />
        <Route path="/parent/timetable"          element={<ProtectedRoute roles={["PARENT"]}><ParentTimeTable /></ProtectedRoute>} />
        <Route path="/parent/profile-settings"   element={<ProtectedRoute roles={["PARENT"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/parent/settings"           element={<ProtectedRoute roles={["PARENT"]}><Settings /></ProtectedRoute>} />

        {/* ── Accountant ──────────────────────────────────────────────────── */}
        <Route path="/accountant/dashboard"        element={<ProtectedRoute roles={["ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
        <Route path="/accountant/fees"             element={<ProtectedRoute roles={["ACCOUNTANT"]}><FeeManagement /></ProtectedRoute>} />
        <Route path="/accountant/revenue"          element={<ProtectedRoute roles={["ACCOUNTANT"]}><SMS_Revenue /></ProtectedRoute>} />
        <Route path="/accountant/expenses"         element={<ProtectedRoute roles={["ACCOUNTANT"]}><ExpensePage /></ProtectedRoute>} />
        <Route path="/accountant/payroll"          element={<ProtectedRoute roles={["ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
        <Route path="/accountant/reports"          element={<ProtectedRoute roles={["ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
        <Route path="/accountant/my-attendance"    element={<ProtectedRoute roles={["ACCOUNTANT"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/accountant/profile-settings" element={<ProtectedRoute roles={["ACCOUNTANT"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/accountant/settings"         element={<ProtectedRoute roles={["ACCOUNTANT"]}><Settings /></ProtectedRoute>} />

        {/* ── Cashier ─────────────────────────────────────────────────────── */}
        {/* <Route path="/cashier/dashboard"          element={<ProtectedRoute roles={["CASHIER"]}><CashierDashboard /></ProtectedRoute>} /> */}
        <Route path="/cashier/collect-fees"       element={<ProtectedRoute roles={["CASHIER"]}><FeeManagement /></ProtectedRoute>} />
        {/* <Route path="/cashier/receipts"           element={<ProtectedRoute roles={["CASHIER"]}><CashierDashboard /></ProtectedRoute>} /> */}
        {/* <Route path="/cashier/daily-report"       element={<ProtectedRoute roles={["CASHIER"]}><CashierDashboard /></ProtectedRoute>} /> */}
        <Route path="/cashier/my-attendance"      element={<ProtectedRoute roles={["CASHIER"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/cashier/profile-settings"   element={<ProtectedRoute roles={["CASHIER"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/cashier/settings"           element={<ProtectedRoute roles={["CASHIER"]}><Settings /></ProtectedRoute>} />

        {/* ── Transport Manager ────────────────────────────────────────────── */}
        <Route path="/transport-manager/dashboard"        element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><TransportManagerDashboard /></ProtectedRoute>} />
        <Route path="/transport-manager/routes"           element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><TransportManagement /></ProtectedRoute>} />
        <Route path="/transport-manager/vehicles"         element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><TransportManagement /></ProtectedRoute>} />
        <Route path="/transport-manager/drivers"          element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><TransportManagement /></ProtectedRoute>} />
        <Route path="/transport-manager/students"         element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><Students /></ProtectedRoute>} />
        <Route path="/transport-manager/tracking"         element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><ParentBusTracking /></ProtectedRoute>} />
        <Route path="/transport-manager/my-attendance"    element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/transport-manager/profile-settings" element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/transport-manager/settings"         element={<ProtectedRoute roles={["TRANSPORT_MANAGER"]}><Settings /></ProtectedRoute>} />

        {/* ── Bus Driver & Conductor ───────────────────────────────────────── */}
        <Route path="/bus-driver/dashboard"         element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><BusDriverDashboard /></ProtectedRoute>} />
        <Route path="/bus-driver/route"             element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><BusDriverDashboard /></ProtectedRoute>} />
        <Route path="/bus-driver/students"          element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><BusDriverDashboard /></ProtectedRoute>} />
        <Route path="/bus-driver/attendance"        element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><BusDriverDashboard /></ProtectedRoute>} />
        <Route path="/bus-driver/my-attendance"     element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/bus-driver/profile-settings"  element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/bus-driver/settings"          element={<ProtectedRoute roles={["BUS_DRIVER","BUS_CONDUCTOR"]}><Settings /></ProtectedRoute>} />

        {/* ── Librarian ───────────────────────────────────────────────────── */}
        <Route path="/librarian/dashboard"          element={<ProtectedRoute roles={["LIBRARIAN"]}><LibrarianDashboard /></ProtectedRoute>} />
        <Route path="/librarian/books"              element={<ProtectedRoute roles={["LIBRARIAN"]}><LibraryManagement /></ProtectedRoute>} />
        <Route path="/librarian/issue-return"       element={<ProtectedRoute roles={["LIBRARIAN"]}><LibraryManagement /></ProtectedRoute>} />
        <Route path="/librarian/members"            element={<ProtectedRoute roles={["LIBRARIAN"]}><Students /></ProtectedRoute>} />
        <Route path="/librarian/reports"            element={<ProtectedRoute roles={["LIBRARIAN"]}><LibrarianDashboard /></ProtectedRoute>} />
        <Route path="/librarian/my-attendance"      element={<ProtectedRoute roles={["LIBRARIAN"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/librarian/profile-settings"   element={<ProtectedRoute roles={["LIBRARIAN"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/librarian/settings"           element={<ProtectedRoute roles={["LIBRARIAN"]}><Settings /></ProtectedRoute>} />

        {/* ── Receptionist ────────────────────────────────────────────────── */}
        <Route path="/receptionist/dashboard"        element={<ProtectedRoute roles={["RECEPTIONIST"]}><ReceptionistDashboard /></ProtectedRoute>} />
        <Route path="/receptionist/visitors"         element={<ProtectedRoute roles={["RECEPTIONIST"]}><VisitorManagementPage /></ProtectedRoute>} />
        <Route path="/receptionist/enquiries"        element={<ProtectedRoute roles={["RECEPTIONIST"]}><ReceptionistDashboard /></ProtectedRoute>} />
        <Route path="/receptionist/notifications"    element={<ProtectedRoute roles={["RECEPTIONIST"]}><Notifications /></ProtectedRoute>} />
        <Route path="/receptionist/my-attendance"    element={<ProtectedRoute roles={["RECEPTIONIST"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/receptionist/profile-settings" element={<ProtectedRoute roles={["RECEPTIONIST"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/receptionist/settings"         element={<ProtectedRoute roles={["RECEPTIONIST"]}><Settings /></ProtectedRoute>} />

        {/* ── Nurse ───────────────────────────────────────────────────────── */}
        <Route path="/nurse/dashboard"          element={<ProtectedRoute roles={["NURSE"]}><NurseDashboard /></ProtectedRoute>} />
        <Route path="/nurse/health-records"     element={<ProtectedRoute roles={["NURSE"]}><NurseDashboard /></ProtectedRoute>} />
        <Route path="/nurse/medical-stock"      element={<ProtectedRoute roles={["NURSE"]}><NurseDashboard /></ProtectedRoute>} />
        <Route path="/nurse/incidents"          element={<ProtectedRoute roles={["NURSE"]}><NurseDashboard /></ProtectedRoute>} />
        <Route path="/nurse/students"           element={<ProtectedRoute roles={["NURSE"]}><Students /></ProtectedRoute>} />
        <Route path="/nurse/my-attendance"      element={<ProtectedRoute roles={["NURSE"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/nurse/profile-settings"   element={<ProtectedRoute roles={["NURSE"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/nurse/settings"           element={<ProtectedRoute roles={["NURSE"]}><Settings /></ProtectedRoute>} />

        {/* ── Security ────────────────────────────────────────────────────── */}
        <Route path="/security/dashboard"          element={<ProtectedRoute roles={["SECURITY"]}><SecurityDashboard /></ProtectedRoute>} />
        <Route path="/security/visitor-log"        element={<ProtectedRoute roles={["SECURITY"]}><VisitorManagementPage /></ProtectedRoute>} />
        <Route path="/security/gate"               element={<ProtectedRoute roles={["SECURITY"]}><SecurityDashboard /></ProtectedRoute>} />
        <Route path="/security/my-attendance"      element={<ProtectedRoute roles={["SECURITY"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/security/profile-settings"   element={<ProtectedRoute roles={["SECURITY"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/security/settings"           element={<ProtectedRoute roles={["SECURITY"]}><Settings /></ProtectedRoute>} />

        {/* ── Housekeeping & Canteen ───────────────────────────────────────── */}
        <Route path="/staff/dashboard"             element={<ProtectedRoute roles={["HOUSEKEEPING","CANTEEN_STAFF"]}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/tasks"                 element={<ProtectedRoute roles={["HOUSEKEEPING"]}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/canteen-menu"          element={<ProtectedRoute roles={["CANTEEN_STAFF"]}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/orders"                element={<ProtectedRoute roles={["CANTEEN_STAFF"]}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/my-attendance"         element={<ProtectedRoute roles={["HOUSEKEEPING","CANTEEN_STAFF"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/staff/profile-settings"      element={<ProtectedRoute roles={["HOUSEKEEPING","CANTEEN_STAFF"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/staff/settings"              element={<ProtectedRoute roles={["HOUSEKEEPING","CANTEEN_STAFF"]}><Settings /></ProtectedRoute>} />

        {/* ── IT Admin ────────────────────────────────────────────────────── */}
        <Route path="/it-admin/dashboard"          element={<ProtectedRoute roles={["IT_ADMIN"]}><ITAdminDashboard /></ProtectedRoute>} />
        <Route path="/it-admin/users"              element={<ProtectedRoute roles={["IT_ADMIN"]}><StaffManagement /></ProtectedRoute>} />
        <Route path="/it-admin/logs"               element={<ProtectedRoute roles={["IT_ADMIN"]}><ITAdminDashboard /></ProtectedRoute>} />
        <Route path="/it-admin/settings"           element={<ProtectedRoute roles={["IT_ADMIN"]}><Settings /></ProtectedRoute>} />
        <Route path="/it-admin/integrations"       element={<ProtectedRoute roles={["IT_ADMIN"]}><ITAdminDashboard /></ProtectedRoute>} />
        <Route path="/it-admin/my-attendance"      element={<ProtectedRoute roles={["IT_ADMIN"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/it-admin/profile-settings"   element={<ProtectedRoute roles={["IT_ADMIN"]}><ProfilePage /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
