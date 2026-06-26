export const BACKEND_FEATURE_CATALOG = [
  {
    "id": "GET:/accountant/dashboard/overdue-fees",
    "module": "Accountant",
    "controller": "AccountantDashboardController.java",
    "operation": "View Accountant Dashboard Overdue Fees",
    "method": "GET",
    "path": "/accountant/dashboard/overdue-fees",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "getOverdueFees"
  },
  {
    "id": "GET:/accountant/dashboard/recent-transactions",
    "module": "Accountant",
    "controller": "AccountantDashboardController.java",
    "operation": "View Accountant Dashboard Recent Transactions",
    "method": "GET",
    "path": "/accountant/dashboard/recent-transactions",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "getRecentTransactions"
  },
  {
    "id": "POST:/accountant/dashboard/send-reminders",
    "module": "Accountant",
    "controller": "AccountantDashboardController.java",
    "operation": "Create Accountant Dashboard Send Reminders",
    "method": "POST",
    "path": "/accountant/dashboard/send-reminders",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "sendReminders"
  },
  {
    "id": "GET:/accountant/dashboard/stats",
    "module": "Accountant",
    "controller": "AccountantDashboardController.java",
    "operation": "View Accountant Dashboard Stats",
    "method": "GET",
    "path": "/accountant/dashboard/stats",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "getDashboardStats"
  },
  {
    "id": "POST:/admission/direct",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "Create Admission Direct",
    "method": "POST",
    "path": "/admission/direct",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "directAdmit"
  },
  {
    "id": "POST:/admission/grant",
    "module": "Admission",
    "controller": "AdmissionGrantController.java",
    "operation": "Create Admission Grant",
    "method": "POST",
    "path": "/admission/grant",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "grantAdmission"
  },
  {
    "id": "GET:/admission/schools/{schoolId}",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "View Admission Schools Schoolid",
    "method": "GET",
    "path": "/admission/schools/{schoolId}",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllInquiries"
  },
  {
    "id": "GET:/admission/schools/{schoolId}/dashboard",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "View Admission Schools Schoolid Dashboard",
    "method": "GET",
    "path": "/admission/schools/{schoolId}/dashboard",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getDashboard"
  },
  {
    "id": "POST:/admission/schools/{schoolId}/inquire",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "Create Admission Schools Schoolid Inquire",
    "method": "POST",
    "path": "/admission/schools/{schoolId}/inquire",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "submitInquiry"
  },
  {
    "id": "GET:/admission/{inquiryId}",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "View Admission Inquiryid",
    "method": "GET",
    "path": "/admission/{inquiryId}",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "inquiryId"
    ],
    "handler": "getInquiry"
  },
  {
    "id": "PUT:/admission/{inquiryId}/status",
    "module": "Admission",
    "controller": "AdmissionController.java",
    "operation": "Update Admission Inquiryid Status",
    "method": "PUT",
    "path": "/admission/{inquiryId}/status",
    "roles": [
      "COUNSELOR",
      "RECEPTIONIST",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "inquiryId"
    ],
    "handler": "updateStatus"
  },
  {
    "id": "PATCH:/alumni/events/{eventId}/attendance/{alumniId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Events Eventid Attendance Alumniid",
    "method": "PATCH",
    "path": "/alumni/events/{eventId}/attendance/{alumniId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "eventId",
      "alumniId"
    ],
    "handler": "markAttendance"
  },
  {
    "id": "POST:/alumni/events/{eventId}/register/{alumniId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Events Eventid Register Alumniid",
    "method": "POST",
    "path": "/alumni/events/{eventId}/register/{alumniId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "eventId",
      "alumniId"
    ],
    "handler": "registerForEvent"
  },
  {
    "id": "POST:/alumni/internal/promotion-passout",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Internal Promotion Passout",
    "method": "POST",
    "path": "/alumni/internal/promotion-passout",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createFromPromotion"
  },
  {
    "id": "POST:/alumni/mentorship/request",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Mentorship Request",
    "method": "POST",
    "path": "/alumni/mentorship/request",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "sendMentorshipRequest"
  },
  {
    "id": "GET:/alumni/mentorship/student/{studentId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Mentorship Student Studentid",
    "method": "GET",
    "path": "/alumni/mentorship/student/{studentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getMentorshipByStudent"
  },
  {
    "id": "PATCH:/alumni/mentorship/{requestId}/respond",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Mentorship Requestid Respond",
    "method": "PATCH",
    "path": "/alumni/mentorship/{requestId}/respond",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "requestId"
    ],
    "handler": "respondToMentorshipRequest"
  },
  {
    "id": "DELETE:/alumni/posts/{postId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Delete Alumni Posts Postid",
    "method": "DELETE",
    "path": "/alumni/posts/{postId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "postId"
    ],
    "handler": "deletePost"
  },
  {
    "id": "PATCH:/alumni/posts/{postId}/approve",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Posts Postid Approve",
    "method": "PATCH",
    "path": "/alumni/posts/{postId}/approve",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "postId"
    ],
    "handler": "approvePost"
  },
  {
    "id": "PATCH:/alumni/posts/{postId}/pin",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Posts Postid Pin",
    "method": "PATCH",
    "path": "/alumni/posts/{postId}/pin",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "postId"
    ],
    "handler": "togglePin"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllAlumni"
  },
  {
    "id": "POST:/alumni/schools/{schoolId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Schools Schoolid",
    "method": "POST",
    "path": "/alumni/schools/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "addAlumni"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/events",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Events",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/events",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllEvents"
  },
  {
    "id": "POST:/alumni/schools/{schoolId}/events",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Schools Schoolid Events",
    "method": "POST",
    "path": "/alumni/schools/{schoolId}/events",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createEvent"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/events/upcoming",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Events Upcoming",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/events/upcoming",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getUpcomingEvents"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/mentors",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Mentors",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/mentors",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getMentors"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/passout-years",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Passout Years",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/passout-years",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getPassoutYears"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/posts",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Posts",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/posts",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getApprovedPosts"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/posts/pending",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Posts Pending",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/posts/pending",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getPendingPosts"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/stats",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Stats",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/stats",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getStats"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/status/{status}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Status Status",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/status/{status}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "status"
    ],
    "handler": "getByStatus"
  },
  {
    "id": "GET:/alumni/schools/{schoolId}/year/{year}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Schools Schoolid Year Year",
    "method": "GET",
    "path": "/alumni/schools/{schoolId}/year/{year}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "year"
    ],
    "handler": "getByYear"
  },
  {
    "id": "GET:/alumni/{alumniId}",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Alumniid",
    "method": "GET",
    "path": "/alumni/{alumniId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "getById"
  },
  {
    "id": "GET:/alumni/{alumniId}/mentorship/requests",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Alumniid Mentorship Requests",
    "method": "GET",
    "path": "/alumni/{alumniId}/mentorship/requests",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "getMentorshipRequestsForAlumni"
  },
  {
    "id": "GET:/alumni/{alumniId}/posts",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "View Alumni Alumniid Posts",
    "method": "GET",
    "path": "/alumni/{alumniId}/posts",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "getPostsByAlumni"
  },
  {
    "id": "POST:/alumni/{alumniId}/posts",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Create Alumni Alumniid Posts",
    "method": "POST",
    "path": "/alumni/{alumniId}/posts",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "createPost"
  },
  {
    "id": "PUT:/alumni/{alumniId}/profile",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Alumniid Profile",
    "method": "PUT",
    "path": "/alumni/{alumniId}/profile",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "updateProfile"
  },
  {
    "id": "PATCH:/alumni/{alumniId}/status",
    "module": "Alumni",
    "controller": "AlumniController.java",
    "operation": "Update Alumni Alumniid Status",
    "method": "PATCH",
    "path": "/alumni/{alumniId}/status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "alumniId"
    ],
    "handler": "updateStatus"
  },
  {
    "id": "POST:/attendance/mark",
    "module": "Attendance",
    "controller": "AttendanceController.java",
    "operation": "Create Attendance Mark",
    "method": "POST",
    "path": "/attendance/mark",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "markAttendanceBulk"
  },
  {
    "id": "POST:/attendance/{classroomId}/attendance",
    "module": "Attendance",
    "controller": "AttendanceController.java",
    "operation": "Create Attendance Classroomid Attendance",
    "method": "POST",
    "path": "/attendance/{classroomId}/attendance",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "classroomId"
    ],
    "handler": "markAttendance"
  },
  {
    "id": "POST:/attendance/{classroomId}/student/{studentId}",
    "module": "Attendance",
    "controller": "AttendanceController.java",
    "operation": "Create Attendance Classroomid Student Studentid",
    "method": "POST",
    "path": "/attendance/{classroomId}/student/{studentId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "classroomId",
      "studentId"
    ],
    "handler": "markSingleStudentAttendance"
  },
  {
    "id": "GET:/attendance/{studentId}",
    "module": "Attendance",
    "controller": "AttendanceController.java",
    "operation": "View Attendance Studentid",
    "method": "GET",
    "path": "/attendance/{studentId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getAttendance"
  },
  {
    "id": "POST:/teacher-attendance/mark-self",
    "module": "Attendance",
    "controller": "TeacherGeoAttendanceController.java",
    "operation": "Create Teacher Attendance Mark Self",
    "method": "POST",
    "path": "/teacher-attendance/mark-self",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "markSelfAttendance"
  },
  {
    "id": "GET:/teacher-attendance/today-logs",
    "module": "Attendance",
    "controller": "TeacherGeoAttendanceController.java",
    "operation": "View Teacher Attendance Today Logs",
    "method": "GET",
    "path": "/teacher-attendance/today-logs",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getTodayLogs"
  },
  {
    "id": "GET:/teacher-attendance/today-status",
    "module": "Attendance",
    "controller": "TeacherGeoAttendanceController.java",
    "operation": "View Teacher Attendance Today Status",
    "method": "GET",
    "path": "/teacher-attendance/today-status",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getTodayStatus"
  },
  {
    "id": "POST:/auth/forgot-password",
    "module": "Auth",
    "controller": "PasswordResetController.java",
    "operation": "Create Auth Forgot Password",
    "method": "POST",
    "path": "/auth/forgot-password",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "forgotPassword"
  },
  {
    "id": "POST:/auth/login",
    "module": "Auth",
    "controller": "AuthController.java",
    "operation": "Create Auth Login",
    "method": "POST",
    "path": "/auth/login",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "login"
  },
  {
    "id": "POST:/auth/logout",
    "module": "Auth",
    "controller": "AuthController.java",
    "operation": "Create Auth Logout",
    "method": "POST",
    "path": "/auth/logout",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "logout"
  },
  {
    "id": "POST:/auth/refresh",
    "module": "Auth",
    "controller": "AuthController.java",
    "operation": "Create Auth Refresh",
    "method": "POST",
    "path": "/auth/refresh",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "refresh"
  },
  {
    "id": "POST:/auth/register-school",
    "module": "Auth",
    "controller": "AuthController.java",
    "operation": "Create Auth Register School",
    "method": "POST",
    "path": "/auth/register-school",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "register"
  },
  {
    "id": "POST:/auth/register-school-owner",
    "module": "Auth",
    "controller": "AuthController.java",
    "operation": "Create Auth Register School Owner",
    "method": "POST",
    "path": "/auth/register-school-owner",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "registerSchoolOwner"
  },
  {
    "id": "POST:/auth/reset-password",
    "module": "Auth",
    "controller": "PasswordResetController.java",
    "operation": "Create Auth Reset Password",
    "method": "POST",
    "path": "/auth/reset-password",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "resetPassword"
  },
  {
    "id": "GET:/auth/validate-reset-token",
    "module": "Auth",
    "controller": "PasswordResetController.java",
    "operation": "View Auth Validate Reset Token",
    "method": "GET",
    "path": "/auth/validate-reset-token",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "validateToken"
  },
  {
    "id": "GET:/super-admin/active-schools",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Active Schools",
    "method": "GET",
    "path": "/super-admin/active-schools",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllActiveSchools"
  },
  {
    "id": "POST:/super-admin/create-school",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "Create Super Admin Create School",
    "method": "POST",
    "path": "/super-admin/create-school",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "createSchool"
  },
  {
    "id": "GET:/super-admin/getAllSchoolList",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Getallschoollist",
    "method": "GET",
    "path": "/super-admin/getAllSchoolList",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllSchoolInfo"
  },
  {
    "id": "GET:/super-admin/getAllStudentsList",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Getallstudentslist",
    "method": "GET",
    "path": "/super-admin/getAllStudentsList",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllStudentsInfo"
  },
  {
    "id": "GET:/super-admin/getAllTeacherList",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Getallteacherlist",
    "method": "GET",
    "path": "/super-admin/getAllTeacherList",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllteachersInfo"
  },
  {
    "id": "GET:/super-admin/getDashboard-data",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Getdashboard Data",
    "method": "GET",
    "path": "/super-admin/getDashboard-data",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getDashboardDetilas"
  },
  {
    "id": "GET:/super-admin/inactive-schools",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Inactive Schools",
    "method": "GET",
    "path": "/super-admin/inactive-schools",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllInActiveSchools"
  },
  {
    "id": "POST:/super-admin/schools/{schoolId}/assign-owner",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "Create Super Admin Schools Schoolid Assign Owner",
    "method": "POST",
    "path": "/super-admin/schools/{schoolId}/assign-owner",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "assignSchoolOwner"
  },
  {
    "id": "GET:/super-admin/schools/{schoolId}/owner",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "View Super Admin Schools Schoolid Owner",
    "method": "GET",
    "path": "/super-admin/schools/{schoolId}/owner",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getSchoolOwner"
  },
  {
    "id": "PATCH:/super-admin/{schoolId}/status",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "Update Super Admin Schoolid Status",
    "method": "PATCH",
    "path": "/super-admin/{schoolId}/status",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "changeSchoolStatus"
  },
  {
    "id": "PATCH:/super-admin/{schoolId}/update-school-info",
    "module": "Auth",
    "controller": "SuperAdminController.java",
    "operation": "Update Super Admin Schoolid Update School Info",
    "method": "PATCH",
    "path": "/super-admin/{schoolId}/update-school-info",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "updateSchoolInformation"
  },
  {
    "id": "POST:/classroom",
    "module": "Classroom",
    "controller": "ClassRoomController.java",
    "operation": "Create Classroom",
    "method": "POST",
    "path": "/classroom",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "sendNotification"
  },
  {
    "id": "POST:/classroom/add-students",
    "module": "Classroom",
    "controller": "ClassRoomController.java",
    "operation": "Create Classroom Add Students",
    "method": "POST",
    "path": "/classroom/add-students",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "addStudents"
  },
  {
    "id": "GET:/classroom/getSubjectByClassRoomId",
    "module": "Classroom",
    "controller": "ClassRoomController.java",
    "operation": "View Classroom Getsubjectbyclassroomid",
    "method": "GET",
    "path": "/classroom/getSubjectByClassRoomId",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getSubject"
  },
  {
    "id": "GET:/classroom/{classRoomId}/students",
    "module": "Classroom",
    "controller": "ClassRoomController.java",
    "operation": "View Classroom Classroomid Students",
    "method": "GET",
    "path": "/classroom/{classRoomId}/students",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "getStudents"
  },
  {
    "id": "GET:/classroom/{classroomId}",
    "module": "Classroom",
    "controller": "ClassRoomController.java",
    "operation": "View Classroom Classroomid",
    "method": "GET",
    "path": "/classroom/{classroomId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classroomId"
    ],
    "handler": "getNotifications"
  },
  {
    "id": "GET:/events/school/{schoolId}",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "View Events School Schoolid",
    "method": "GET",
    "path": "/events/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getEvents"
  },
  {
    "id": "POST:/events/school/{schoolId}",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "Create Events School Schoolid",
    "method": "POST",
    "path": "/events/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createEvent"
  },
  {
    "id": "GET:/events/school/{schoolId}/by-status",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "View Events School Schoolid By Status",
    "method": "GET",
    "path": "/events/school/{schoolId}/by-status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getByStatus"
  },
  {
    "id": "GET:/events/school/{schoolId}/{eventId}",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "View Events School Schoolid Eventid",
    "method": "GET",
    "path": "/events/school/{schoolId}/{eventId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "eventId"
    ],
    "handler": "getEvent"
  },
  {
    "id": "PATCH:/events/school/{schoolId}/{eventId}/cancel",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "Update Events School Schoolid Eventid Cancel",
    "method": "PATCH",
    "path": "/events/school/{schoolId}/{eventId}/cancel",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "eventId"
    ],
    "handler": "cancel"
  },
  {
    "id": "POST:/events/school/{schoolId}/{eventId}/dispatch-now",
    "module": "Event",
    "controller": "EventController.java",
    "operation": "Create Events School Schoolid Eventid Dispatch Now",
    "method": "POST",
    "path": "/events/school/{schoolId}/{eventId}/dispatch-now",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "eventId"
    ],
    "handler": "dispatchNow"
  },
  {
    "id": "GET:/api/v1/report-card/class/rank-list",
    "module": "Exam",
    "controller": "ReportCardController.java",
    "operation": "View Api V1 Report Card Class Rank List",
    "method": "GET",
    "path": "/api/v1/report-card/class/rank-list",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getClassRankList"
  },
  {
    "id": "GET:/api/v1/report-card/student/{studentId}",
    "module": "Exam",
    "controller": "ReportCardController.java",
    "operation": "View Api V1 Report Card Student Studentid",
    "method": "GET",
    "path": "/api/v1/report-card/student/{studentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getReportCard"
  },
  {
    "id": "POST:/exam-schedule/add/{examId}",
    "module": "Exam",
    "controller": "ExamScheduleController.java",
    "operation": "Create Exam Schedule Add Examid",
    "method": "POST",
    "path": "/exam-schedule/add/{examId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "examId"
    ],
    "handler": "add"
  },
  {
    "id": "DELETE:/exam-schedule/delete/{scheduleId}",
    "module": "Exam",
    "controller": "ExamScheduleController.java",
    "operation": "Delete Exam Schedule Delete Scheduleid",
    "method": "DELETE",
    "path": "/exam-schedule/delete/{scheduleId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "scheduleId"
    ],
    "handler": "delete"
  },
  {
    "id": "POST:/exam-schedule/upload-exam-schedule",
    "module": "Exam",
    "controller": "ExamScheduleController.java",
    "operation": "Create Exam Schedule Upload Exam Schedule",
    "method": "POST",
    "path": "/exam-schedule/upload-exam-schedule",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "uploadExamSchedule"
  },
  {
    "id": "GET:/exam-schedule/{examId}",
    "module": "Exam",
    "controller": "ExamScheduleController.java",
    "operation": "View Exam Schedule Examid",
    "method": "GET",
    "path": "/exam-schedule/{examId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "examId"
    ],
    "handler": "get"
  },
  {
    "id": "GET:/exam/all",
    "module": "Exam",
    "controller": "ExamController.java",
    "operation": "View Exam All",
    "method": "GET",
    "path": "/exam/all",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getAll"
  },
  {
    "id": "POST:/exam/create",
    "module": "Exam",
    "controller": "ExamController.java",
    "operation": "Create Exam Create",
    "method": "POST",
    "path": "/exam/create",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "create"
  },
  {
    "id": "POST:/exam/create-with-schedule",
    "module": "Exam",
    "controller": "ExamController.java",
    "operation": "Create Exam Create With Schedule",
    "method": "POST",
    "path": "/exam/create-with-schedule",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createWithSchedule"
  },
  {
    "id": "DELETE:/exam/delete/{examId}",
    "module": "Exam",
    "controller": "ExamController.java",
    "operation": "Delete Exam Delete Examid",
    "method": "DELETE",
    "path": "/exam/delete/{examId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "examId"
    ],
    "handler": "delete"
  },
  {
    "id": "PUT:/exam/update/{examId}",
    "module": "Exam",
    "controller": "ExamController.java",
    "operation": "Update Exam Update Examid",
    "method": "PUT",
    "path": "/exam/update/{examId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "examId"
    ],
    "handler": "update"
  },
  {
    "id": "POST:/result/calculate",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Create Result Calculate",
    "method": "POST",
    "path": "/result/calculate",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "calc"
  },
  {
    "id": "POST:/result/calculate-all",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Create Result Calculate All",
    "method": "POST",
    "path": "/result/calculate-all",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "calculateAll"
  },
  {
    "id": "GET:/result/class",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "View Result Class",
    "method": "GET",
    "path": "/result/class",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getClassResult"
  },
  {
    "id": "POST:/result/enter",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Create Result Enter",
    "method": "POST",
    "path": "/result/enter",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "enter"
  },
  {
    "id": "POST:/result/recalculate-all",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Create Result Recalculate All",
    "method": "POST",
    "path": "/result/recalculate-all",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "recalculateAll"
  },
  {
    "id": "GET:/result/student",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "View Result Student",
    "method": "GET",
    "path": "/result/student",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getStudentResult"
  },
  {
    "id": "GET:/result/student/all",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "View Result Student All",
    "method": "GET",
    "path": "/result/student/all",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getAllResultsByStudent"
  },
  {
    "id": "PUT:/result/update/{resultId}",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Update Result Update Resultid",
    "method": "PUT",
    "path": "/result/update/{resultId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "resultId"
    ],
    "handler": "update"
  },
  {
    "id": "POST:/result/upload-excel",
    "module": "Exam",
    "controller": "ResultController.java",
    "operation": "Create Result Upload Excel",
    "method": "POST",
    "path": "/result/upload-excel",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "upload"
  },
  {
    "id": "GET:/expenses/school/{schoolId}",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "View Expenses School Schoolid",
    "method": "GET",
    "path": "/expenses/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllExpenses"
  },
  {
    "id": "POST:/expenses/school/{schoolId}",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "Create Expenses School Schoolid",
    "method": "POST",
    "path": "/expenses/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "addExpense"
  },
  {
    "id": "GET:/expenses/school/{schoolId}/financial-summary",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "View Expenses School Schoolid Financial Summary",
    "method": "GET",
    "path": "/expenses/school/{schoolId}/financial-summary",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getFinancialSummary"
  },
  {
    "id": "DELETE:/expenses/{expenseId}",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "Delete Expenses Expenseid",
    "method": "DELETE",
    "path": "/expenses/{expenseId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "expenseId"
    ],
    "handler": "deleteExpense"
  },
  {
    "id": "GET:/expenses/{expenseId}",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "View Expenses Expenseid",
    "method": "GET",
    "path": "/expenses/{expenseId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "expenseId"
    ],
    "handler": "getExpenseById"
  },
  {
    "id": "PUT:/expenses/{expenseId}",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "Update Expenses Expenseid",
    "method": "PUT",
    "path": "/expenses/{expenseId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "expenseId"
    ],
    "handler": "updateExpense"
  },
  {
    "id": "PUT:/expenses/{expenseId}/status",
    "module": "Expense",
    "controller": "ExpenseController.java",
    "operation": "Update Expenses Expenseid Status",
    "method": "PUT",
    "path": "/expenses/{expenseId}/status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "expenseId"
    ],
    "handler": "updateExpenseStatus"
  },
  {
    "id": "GET:/api/payments/pending-upi",
    "module": "Fees",
    "controller": "WebhookController.java",
    "operation": "View Api Payments Pending Upi",
    "method": "GET",
    "path": "/api/payments/pending-upi",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getPendingUpiPayments"
  },
  {
    "id": "POST:/api/payments/record-upi",
    "module": "Fees",
    "controller": "WebhookController.java",
    "operation": "Create Api Payments Record Upi",
    "method": "POST",
    "path": "/api/payments/record-upi",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "recordUpiPayment"
  },
  {
    "id": "POST:/api/payments/verify-upi/{paymentId}",
    "module": "Fees",
    "controller": "WebhookController.java",
    "operation": "Create Api Payments Verify Upi Paymentid",
    "method": "POST",
    "path": "/api/payments/verify-upi/{paymentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "paymentId"
    ],
    "handler": "verifyUpiPayment"
  },
  {
    "id": "POST:/api/payments/webhook",
    "module": "Fees",
    "controller": "WebhookController.java",
    "operation": "Create Api Payments Webhook",
    "method": "POST",
    "path": "/api/payments/webhook",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "handleWebhook"
  },
  {
    "id": "POST:/fee-receipt/generate",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "Create Fee Receipt Generate",
    "method": "POST",
    "path": "/fee-receipt/generate",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "generate"
  },
  {
    "id": "GET:/fee-receipt/payment/{paymentId}",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "View Fee Receipt Payment Paymentid",
    "method": "GET",
    "path": "/fee-receipt/payment/{paymentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "paymentId"
    ],
    "handler": "getByPayment"
  },
  {
    "id": "GET:/fee-receipt/school",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "View Fee Receipt School",
    "method": "GET",
    "path": "/fee-receipt/school",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "forSchool"
  },
  {
    "id": "GET:/fee-receipt/student/{studentId}",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "View Fee Receipt Student Studentid",
    "method": "GET",
    "path": "/fee-receipt/student/{studentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "forStudent"
  },
  {
    "id": "GET:/fee-receipt/{id}/html",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "View Fee Receipt Id Html",
    "method": "GET",
    "path": "/fee-receipt/{id}/html",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "printHtml"
  },
  {
    "id": "GET:/fee-receipt/{receiptNumber}",
    "module": "Fees",
    "controller": "FeeReceiptController.java",
    "operation": "View Fee Receipt Receiptnumber",
    "method": "GET",
    "path": "/fee-receipt/{receiptNumber}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "receiptNumber"
    ],
    "handler": "getByNumber"
  },
  {
    "id": "POST:/fees/fee-head",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Fee Head",
    "method": "POST",
    "path": "/fees/fee-head",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "createFeeHead"
  },
  {
    "id": "POST:/fees/generate/class/{classroomId}/{schoolId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Generate Class Classroomid Schoolid",
    "method": "POST",
    "path": "/fees/generate/class/{classroomId}/{schoolId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "classroomId",
      "schoolId"
    ],
    "handler": "generateClassFees"
  },
  {
    "id": "POST:/fees/generate/student/{studentId}/{structureId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Generate Student Studentid Structureid",
    "method": "POST",
    "path": "/fees/generate/student/{studentId}/{structureId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId",
      "structureId"
    ],
    "handler": "generateStudentFee"
  },
  {
    "id": "POST:/fees/pay",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Pay",
    "method": "POST",
    "path": "/fees/pay",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "payFee"
  },
  {
    "id": "GET:/fees/payments/{studentFeeId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "View Fees Payments Studentfeeid",
    "method": "GET",
    "path": "/fees/payments/{studentFeeId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentFeeId"
    ],
    "handler": "getPayments"
  },
  {
    "id": "GET:/fees/school/{schoolId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "View Fees School Schoolid",
    "method": "GET",
    "path": "/fees/school/{schoolId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getFeeHeadsBySchool"
  },
  {
    "id": "POST:/fees/structure",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Structure",
    "method": "POST",
    "path": "/fees/structure",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "createStructure"
  },
  {
    "id": "POST:/fees/structure/item",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "Create Fees Structure Item",
    "method": "POST",
    "path": "/fees/structure/item",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "addStructureItem"
  },
  {
    "id": "GET:/fees/student-detail/{studentId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "View Fees Student Detail Studentid",
    "method": "GET",
    "path": "/fees/student-detail/{studentId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getStudentFeeDetail"
  },
  {
    "id": "GET:/fees/student/{studentId}",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "View Fees Student Studentid",
    "method": "GET",
    "path": "/fees/student/{studentId}",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getFee"
  },
  {
    "id": "GET:/fees/students",
    "module": "Fees",
    "controller": "FeeController.java",
    "operation": "View Fees Students",
    "method": "GET",
    "path": "/fees/students",
    "roles": [
      "ACCOUNTANT",
      "CASHIER",
      "PARENT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllStudentsFee"
  },
  {
    "id": "GET:/payments/config",
    "module": "Fees",
    "controller": "PaymentController.java",
    "operation": "View Payments Config",
    "method": "GET",
    "path": "/payments/config",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getConfig"
  },
  {
    "id": "POST:/payments/create-order",
    "module": "Fees",
    "controller": "PaymentController.java",
    "operation": "Create Payments Create Order",
    "method": "POST",
    "path": "/payments/create-order",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "initPayment"
  },
  {
    "id": "POST:/payments/save",
    "module": "Fees",
    "controller": "PaymentController.java",
    "operation": "Create Payments Save",
    "method": "POST",
    "path": "/payments/save",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveConfig"
  },
  {
    "id": "POST:/payments/verify-payment",
    "module": "Fees",
    "controller": "PaymentController.java",
    "operation": "Create Payments Verify Payment",
    "method": "POST",
    "path": "/payments/verify-payment",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "verifyPayment"
  },
  {
    "id": "GET:/public/",
    "module": "Healthcontroller.Java",
    "controller": "HealthController.java",
    "operation": "View Public",
    "method": "GET",
    "path": "/public/",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "home"
  },
  {
    "id": "GET:/public/health",
    "module": "Healthcontroller.Java",
    "controller": "HealthController.java",
    "operation": "View Public Health",
    "method": "GET",
    "path": "/public/health",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "health"
  },
  {
    "id": "POST:/homework/assign",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Create Homework Assign",
    "method": "POST",
    "path": "/homework/assign",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "assign"
  },
  {
    "id": "POST:/homework/assign-with-files",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Create Homework Assign With Files",
    "method": "POST",
    "path": "/homework/assign-with-files",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "assignWithFiles"
  },
  {
    "id": "DELETE:/homework/attachment/{attachmentId}",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Delete Homework Attachment Attachmentid",
    "method": "DELETE",
    "path": "/homework/attachment/{attachmentId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "attachmentId"
    ],
    "handler": "deleteAttachment"
  },
  {
    "id": "GET:/homework/by-teacher",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework By Teacher",
    "method": "GET",
    "path": "/homework/by-teacher",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "byTeacher"
  },
  {
    "id": "GET:/homework/classroom/{classroomId}",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework Classroom Classroomid",
    "method": "GET",
    "path": "/homework/classroom/{classroomId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "classroomId"
    ],
    "handler": "byClassroom"
  },
  {
    "id": "GET:/homework/classroom/{classroomId}/pending",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework Classroom Classroomid Pending",
    "method": "GET",
    "path": "/homework/classroom/{classroomId}/pending",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "classroomId"
    ],
    "handler": "pendingByClassroom"
  },
  {
    "id": "GET:/homework/classroom/{classroomId}/subject/{subjectId}",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework Classroom Classroomid Subject Subjectid",
    "method": "GET",
    "path": "/homework/classroom/{classroomId}/subject/{subjectId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "classroomId",
      "subjectId"
    ],
    "handler": "byClassroomAndSubject"
  },
  {
    "id": "DELETE:/homework/{homeworkId}",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Delete Homework Homeworkid",
    "method": "DELETE",
    "path": "/homework/{homeworkId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "deleteHomework"
  },
  {
    "id": "GET:/homework/{homeworkId}",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework Homeworkid",
    "method": "GET",
    "path": "/homework/{homeworkId}",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "getById"
  },
  {
    "id": "POST:/homework/{homeworkId}/notification/read",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Create Homework Homeworkid Notification Read",
    "method": "POST",
    "path": "/homework/{homeworkId}/notification/read",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "markNotificationRead"
  },
  {
    "id": "POST:/homework/{homeworkId}/notification/seen",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Create Homework Homeworkid Notification Seen",
    "method": "POST",
    "path": "/homework/{homeworkId}/notification/seen",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "markNotificationSeen"
  },
  {
    "id": "GET:/homework/{homeworkId}/notification/stats",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "View Homework Homeworkid Notification Stats",
    "method": "GET",
    "path": "/homework/{homeworkId}/notification/stats",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "getNotificationStats"
  },
  {
    "id": "POST:/homework/{homeworkId}/upload-files",
    "module": "Homework",
    "controller": "HomeworkController.java",
    "operation": "Create Homework Homeworkid Upload Files",
    "method": "POST",
    "path": "/homework/{homeworkId}/upload-files",
    "roles": [
      "CLASS_TEACHER",
      "PARENT",
      "STUDENT",
      "TEACHER"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "uploadFiles"
  },
  {
    "id": "PUT:/hostel/allotments/{allotmentId}/vacate",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "Update Hostel Allotments Allotmentid Vacate",
    "method": "PUT",
    "path": "/hostel/allotments/{allotmentId}/vacate",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "allotmentId"
    ],
    "handler": "vacateRoom"
  },
  {
    "id": "GET:/hostel/hostels/{hostelId}/rooms",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "View Hostel Hostels Hostelid Rooms",
    "method": "GET",
    "path": "/hostel/hostels/{hostelId}/rooms",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "hostelId"
    ],
    "handler": "getRooms"
  },
  {
    "id": "POST:/hostel/rooms",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "Create Hostel Rooms",
    "method": "POST",
    "path": "/hostel/rooms",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "addRoom"
  },
  {
    "id": "GET:/hostel/schools/{schoolId}",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "View Hostel Schools Schoolid",
    "method": "GET",
    "path": "/hostel/schools/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getHostels"
  },
  {
    "id": "POST:/hostel/schools/{schoolId}",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "Create Hostel Schools Schoolid",
    "method": "POST",
    "path": "/hostel/schools/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createHostel"
  },
  {
    "id": "POST:/hostel/schools/{schoolId}/allot",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "Create Hostel Schools Schoolid Allot",
    "method": "POST",
    "path": "/hostel/schools/{schoolId}/allot",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "allotRoom"
  },
  {
    "id": "GET:/hostel/schools/{schoolId}/allotments",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "View Hostel Schools Schoolid Allotments",
    "method": "GET",
    "path": "/hostel/schools/{schoolId}/allotments",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllAllotments"
  },
  {
    "id": "GET:/hostel/schools/{schoolId}/allotments/active",
    "module": "Hostel",
    "controller": "HostelController.java",
    "operation": "View Hostel Schools Schoolid Allotments Active",
    "method": "GET",
    "path": "/hostel/schools/{schoolId}/allotments/active",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getActiveAllotments"
  },
  {
    "id": "GET:/identity-card/staff/school/{schoolId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Staff School Schoolid",
    "method": "GET",
    "path": "/identity-card/staff/school/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "staffCardsBySchool"
  },
  {
    "id": "GET:/identity-card/staff/school/{schoolId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Staff School Schoolid Render",
    "method": "GET",
    "path": "/identity-card/staff/school/{schoolId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "renderStaffCardsBySchool"
  },
  {
    "id": "GET:/identity-card/staff/{staffId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Staff Staffid",
    "method": "GET",
    "path": "/identity-card/staff/{staffId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "staffCard"
  },
  {
    "id": "GET:/identity-card/staff/{staffId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Staff Staffid Render",
    "method": "GET",
    "path": "/identity-card/staff/{staffId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "renderStaffCard"
  },
  {
    "id": "GET:/identity-card/student/{studentId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Student Studentid",
    "method": "GET",
    "path": "/identity-card/student/{studentId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "studentCard"
  },
  {
    "id": "GET:/identity-card/student/{studentId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Student Studentid Render",
    "method": "GET",
    "path": "/identity-card/student/{studentId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "renderStudentCard"
  },
  {
    "id": "GET:/identity-card/students/class/{classRoomId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Students Class Classroomid",
    "method": "GET",
    "path": "/identity-card/students/class/{classRoomId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "studentCardsByClass"
  },
  {
    "id": "GET:/identity-card/students/class/{classRoomId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Students Class Classroomid Render",
    "method": "GET",
    "path": "/identity-card/students/class/{classRoomId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "renderStudentCardsByClass"
  },
  {
    "id": "GET:/identity-card/students/school/{schoolId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Students School Schoolid Render",
    "method": "GET",
    "path": "/identity-card/students/school/{schoolId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "renderStudentCardsBySchool"
  },
  {
    "id": "GET:/identity-card/teacher/{teacherId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Teacher Teacherid",
    "method": "GET",
    "path": "/identity-card/teacher/{teacherId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "teacherCard"
  },
  {
    "id": "GET:/identity-card/teacher/{teacherId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Teacher Teacherid Render",
    "method": "GET",
    "path": "/identity-card/teacher/{teacherId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "renderTeacherCard"
  },
  {
    "id": "GET:/identity-card/teachers/school/{schoolId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Teachers School Schoolid",
    "method": "GET",
    "path": "/identity-card/teachers/school/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "teacherCardsBySchool"
  },
  {
    "id": "GET:/identity-card/teachers/school/{schoolId}/render",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Teachers School Schoolid Render",
    "method": "GET",
    "path": "/identity-card/teachers/school/{schoolId}/render",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "renderTeacherCardsBySchool"
  },
  {
    "id": "POST:/identity-card/template",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "Create Identity Card Template",
    "method": "POST",
    "path": "/identity-card/template",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "createTemplate"
  },
  {
    "id": "GET:/identity-card/template/school/{schoolId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Template School Schoolid",
    "method": "GET",
    "path": "/identity-card/template/school/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllTemplates"
  },
  {
    "id": "GET:/identity-card/template/school/{schoolId}/active",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "View Identity Card Template School Schoolid Active",
    "method": "GET",
    "path": "/identity-card/template/school/{schoolId}/active",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getActiveTemplate"
  },
  {
    "id": "DELETE:/identity-card/template/{templateId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "Delete Identity Card Template Templateid",
    "method": "DELETE",
    "path": "/identity-card/template/{templateId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "templateId"
    ],
    "handler": "deleteTemplate"
  },
  {
    "id": "PUT:/identity-card/template/{templateId}",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "Update Identity Card Template Templateid",
    "method": "PUT",
    "path": "/identity-card/template/{templateId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "templateId"
    ],
    "handler": "updateTemplate"
  },
  {
    "id": "PATCH:/identity-card/template/{templateId}/activate",
    "module": "Idcard",
    "controller": "IdentityCardController.java",
    "operation": "Update Identity Card Template Templateid Activate",
    "method": "PATCH",
    "path": "/identity-card/template/{templateId}/activate",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "templateId"
    ],
    "handler": "activateTemplate"
  },
  {
    "id": "POST:/leave-policy",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "Create Leave Policy",
    "method": "POST",
    "path": "/leave-policy",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "create"
  },
  {
    "id": "POST:/leave-policy/initialize-balances",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "Create Leave Policy Initialize Balances",
    "method": "POST",
    "path": "/leave-policy/initialize-balances",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "initBalances"
  },
  {
    "id": "POST:/leave-policy/initialize-teacher-balances",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "Create Leave Policy Initialize Teacher Balances",
    "method": "POST",
    "path": "/leave-policy/initialize-teacher-balances",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "initMissingTeacherBalances"
  },
  {
    "id": "GET:/leave-policy/school/{schoolId}",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "View Leave Policy School Schoolid",
    "method": "GET",
    "path": "/leave-policy/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getForSchool"
  },
  {
    "id": "GET:/leave-policy/teacher-balances/{schoolId}",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "View Leave Policy Teacher Balances Schoolid",
    "method": "GET",
    "path": "/leave-policy/teacher-balances/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllTeacherBalances"
  },
  {
    "id": "DELETE:/leave-policy/{id}",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "Delete Leave Policy Id",
    "method": "DELETE",
    "path": "/leave-policy/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "delete"
  },
  {
    "id": "PUT:/leave-policy/{id}",
    "module": "Leave",
    "controller": "LeavePolicyController.java",
    "operation": "Update Leave Policy Id",
    "method": "PUT",
    "path": "/leave-policy/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "update"
  },
  {
    "id": "GET:/leave/action",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave Action",
    "method": "GET",
    "path": "/leave/action",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "processEmailAction"
  },
  {
    "id": "POST:/leave/apply",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "Create Leave Apply",
    "method": "POST",
    "path": "/leave/apply",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "apply"
  },
  {
    "id": "GET:/leave/balance/staff/{staffId}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave Balance Staff Staffid",
    "method": "GET",
    "path": "/leave/balance/staff/{staffId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "staffBalance"
  },
  {
    "id": "GET:/leave/balance/teacher/{teacherId}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave Balance Teacher Teacherid",
    "method": "GET",
    "path": "/leave/balance/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "teacherBalance"
  },
  {
    "id": "GET:/leave/history/staff/{staffId}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave History Staff Staffid",
    "method": "GET",
    "path": "/leave/history/staff/{staffId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "staffHistory"
  },
  {
    "id": "GET:/leave/history/teacher/{teacherId}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave History Teacher Teacherid",
    "method": "GET",
    "path": "/leave/history/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "teacherHistory"
  },
  {
    "id": "GET:/leave/pending/{schoolId}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave Pending Schoolid",
    "method": "GET",
    "path": "/leave/pending/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getPending"
  },
  {
    "id": "GET:/leave/{id}",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "View Leave Id",
    "method": "GET",
    "path": "/leave/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getById"
  },
  {
    "id": "POST:/leave/{id}/approve",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "Create Leave Id Approve",
    "method": "POST",
    "path": "/leave/{id}/approve",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "approve"
  },
  {
    "id": "POST:/leave/{id}/cancel",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "Create Leave Id Cancel",
    "method": "POST",
    "path": "/leave/{id}/cancel",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "cancel"
  },
  {
    "id": "POST:/leave/{id}/reject",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "Create Leave Id Reject",
    "method": "POST",
    "path": "/leave/{id}/reject",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "reject"
  },
  {
    "id": "POST:/leave/{id}/revoke",
    "module": "Leave",
    "controller": "LeaveController.java",
    "operation": "Create Leave Id Revoke",
    "method": "POST",
    "path": "/leave/{id}/revoke",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "revoke"
  },
  {
    "id": "POST:/school-holiday",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "Create School Holiday",
    "method": "POST",
    "path": "/school-holiday",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "add"
  },
  {
    "id": "GET:/school-holiday/school/{schoolId}/effective-days",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "View School Holiday School Schoolid Effective Days",
    "method": "GET",
    "path": "/school-holiday/school/{schoolId}/effective-days",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getEffectiveDays"
  },
  {
    "id": "GET:/school-holiday/school/{schoolId}/monthly",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "View School Holiday School Schoolid Monthly",
    "method": "GET",
    "path": "/school-holiday/school/{schoolId}/monthly",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getMonthly"
  },
  {
    "id": "GET:/school-holiday/school/{schoolId}/summary",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "View School Holiday School Schoolid Summary",
    "method": "GET",
    "path": "/school-holiday/school/{schoolId}/summary",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getSummary"
  },
  {
    "id": "GET:/school-holiday/school/{schoolId}/yearly",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "View School Holiday School Schoolid Yearly",
    "method": "GET",
    "path": "/school-holiday/school/{schoolId}/yearly",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getYearly"
  },
  {
    "id": "DELETE:/school-holiday/{id}",
    "module": "Leave",
    "controller": "SchoolHolidayController.java",
    "operation": "Delete School Holiday Id",
    "method": "DELETE",
    "path": "/school-holiday/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "delete"
  },
  {
    "id": "DELETE:/library/books/{bookId}",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Delete Library Books Bookid",
    "method": "DELETE",
    "path": "/library/books/{bookId}",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "bookId"
    ],
    "handler": "deleteBook"
  },
  {
    "id": "GET:/library/books/{bookId}",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Books Bookid",
    "method": "GET",
    "path": "/library/books/{bookId}",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "bookId"
    ],
    "handler": "getBook"
  },
  {
    "id": "PUT:/library/books/{bookId}",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Update Library Books Bookid",
    "method": "PUT",
    "path": "/library/books/{bookId}",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "bookId"
    ],
    "handler": "updateBook"
  },
  {
    "id": "GET:/library/issues/{issueId}",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Issues Issueid",
    "method": "GET",
    "path": "/library/issues/{issueId}",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "issueId"
    ],
    "handler": "getIssueById"
  },
  {
    "id": "PUT:/library/issues/{issueId}/return",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Update Library Issues Issueid Return",
    "method": "PUT",
    "path": "/library/issues/{issueId}/return",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "issueId"
    ],
    "handler": "returnBook"
  },
  {
    "id": "GET:/library/schools/{schoolId}/books",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Schools Schoolid Books",
    "method": "GET",
    "path": "/library/schools/{schoolId}/books",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllBooks"
  },
  {
    "id": "POST:/library/schools/{schoolId}/books",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Create Library Schools Schoolid Books",
    "method": "POST",
    "path": "/library/schools/{schoolId}/books",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "addBook"
  },
  {
    "id": "GET:/library/schools/{schoolId}/books/search",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Schools Schoolid Books Search",
    "method": "GET",
    "path": "/library/schools/{schoolId}/books/search",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "searchBooks"
  },
  {
    "id": "POST:/library/schools/{schoolId}/issue",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Create Library Schools Schoolid Issue",
    "method": "POST",
    "path": "/library/schools/{schoolId}/issue",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "issueBook"
  },
  {
    "id": "GET:/library/schools/{schoolId}/issues",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Schools Schoolid Issues",
    "method": "GET",
    "path": "/library/schools/{schoolId}/issues",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllIssues"
  },
  {
    "id": "POST:/library/schools/{schoolId}/mark-overdue",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "Create Library Schools Schoolid Mark Overdue",
    "method": "POST",
    "path": "/library/schools/{schoolId}/mark-overdue",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "markOverdue"
  },
  {
    "id": "GET:/library/students/{studentId}/books",
    "module": "Library",
    "controller": "LibraryController.java",
    "operation": "View Library Students Studentid Books",
    "method": "GET",
    "path": "/library/students/{studentId}/books",
    "roles": [
      "LIBRARIAN",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getStudentBooks"
  },
  {
    "id": "POST:/profile-photo/me",
    "module": "Media",
    "controller": "ProfilePhotoController.java",
    "operation": "Create Profile Photo Me",
    "method": "POST",
    "path": "/profile-photo/me",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "uploadMyPhoto"
  },
  {
    "id": "POST:/profile-photo/staff/{staffId}",
    "module": "Media",
    "controller": "ProfilePhotoController.java",
    "operation": "Create Profile Photo Staff Staffid",
    "method": "POST",
    "path": "/profile-photo/staff/{staffId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "uploadStaffPhoto"
  },
  {
    "id": "POST:/profile-photo/student/{studentId}",
    "module": "Media",
    "controller": "ProfilePhotoController.java",
    "operation": "Create Profile Photo Student Studentid",
    "method": "POST",
    "path": "/profile-photo/student/{studentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "uploadStudentPhoto"
  },
  {
    "id": "POST:/profile-photo/teacher/{teacherId}",
    "module": "Media",
    "controller": "ProfilePhotoController.java",
    "operation": "Create Profile Photo Teacher Teacherid",
    "method": "POST",
    "path": "/profile-photo/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "uploadTeacherPhoto"
  },
  {
    "id": "POST:/notice",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "Create Notice",
    "method": "POST",
    "path": "/notice",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "create"
  },
  {
    "id": "GET:/notice/admin",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "View Notice Admin",
    "method": "GET",
    "path": "/notice/admin",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "adminList"
  },
  {
    "id": "GET:/notice/feed",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "View Notice Feed",
    "method": "GET",
    "path": "/notice/feed",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "feed"
  },
  {
    "id": "DELETE:/notice/{id}",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "Delete Notice Id",
    "method": "DELETE",
    "path": "/notice/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "delete"
  },
  {
    "id": "GET:/notice/{id}",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "View Notice Id",
    "method": "GET",
    "path": "/notice/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getById"
  },
  {
    "id": "PUT:/notice/{id}",
    "module": "Notice",
    "controller": "NoticeController.java",
    "operation": "Update Notice Id",
    "method": "PUT",
    "path": "/notice/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "update"
  },
  {
    "id": "DELETE:/notifications/device-token",
    "module": "Notification",
    "controller": "DeviceTokenController.java",
    "operation": "Delete Notifications Device Token",
    "method": "DELETE",
    "path": "/notifications/device-token",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "deactivateToken"
  },
  {
    "id": "POST:/notifications/device-token",
    "module": "Notification",
    "controller": "DeviceTokenController.java",
    "operation": "Create Notifications Device Token",
    "method": "POST",
    "path": "/notifications/device-token",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "registerToken"
  },
  {
    "id": "GET:/notifications/school/{schoolId}",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "View Notifications School Schoolid",
    "method": "GET",
    "path": "/notifications/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAll"
  },
  {
    "id": "GET:/notifications/school/{schoolId}/by-status",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "View Notifications School Schoolid By Status",
    "method": "GET",
    "path": "/notifications/school/{schoolId}/by-status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "byStatus"
  },
  {
    "id": "GET:/notifications/school/{schoolId}/by-type",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "View Notifications School Schoolid By Type",
    "method": "GET",
    "path": "/notifications/school/{schoolId}/by-type",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "byType"
  },
  {
    "id": "GET:/notifications/school/{schoolId}/exam/{examId}",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "View Notifications School Schoolid Exam Examid",
    "method": "GET",
    "path": "/notifications/school/{schoolId}/exam/{examId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "examId"
    ],
    "handler": "byExam"
  },
  {
    "id": "POST:/notifications/school/{schoolId}/exam/{examId}/result-published",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "Create Notifications School Schoolid Exam Examid Result Published",
    "method": "POST",
    "path": "/notifications/school/{schoolId}/exam/{examId}/result-published",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "examId"
    ],
    "handler": "notifyResultPublished"
  },
  {
    "id": "POST:/notifications/school/{schoolId}/send",
    "module": "Notification",
    "controller": "NotificationController.java",
    "operation": "Create Notifications School Schoolid Send",
    "method": "POST",
    "path": "/notifications/school/{schoolId}/send",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "send"
  },
  {
    "id": "GET:/parent/attendance/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Attendance Studentid",
    "method": "GET",
    "path": "/parent/attendance/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getAttendance"
  },
  {
    "id": "GET:/parent/bus/tracking/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Bus Tracking Studentid",
    "method": "GET",
    "path": "/parent/bus/tracking/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getBusTracking"
  },
  {
    "id": "GET:/parent/child/{studentId}/profile",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Child Studentid Profile",
    "method": "GET",
    "path": "/parent/child/{studentId}/profile",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getChildProfile"
  },
  {
    "id": "GET:/parent/dashboard",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Dashboard",
    "method": "GET",
    "path": "/parent/dashboard",
    "roles": [
      "PARENT"
    ],
    "pathParams": [],
    "handler": "getDashboard"
  },
  {
    "id": "GET:/parent/dashboard/stats/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Dashboard Stats Studentid",
    "method": "GET",
    "path": "/parent/dashboard/stats/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getDashboardStats"
  },
  {
    "id": "GET:/parent/exams/detail/{examId}/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Exams Detail Examid Studentid",
    "method": "GET",
    "path": "/parent/exams/detail/{examId}/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "examId",
      "studentId"
    ],
    "handler": "getExamDetail"
  },
  {
    "id": "GET:/parent/exams/schedule/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Exams Schedule Studentid",
    "method": "GET",
    "path": "/parent/exams/schedule/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getExamSchedule"
  },
  {
    "id": "GET:/parent/exams/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Exams Studentid",
    "method": "GET",
    "path": "/parent/exams/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getExamResults"
  },
  {
    "id": "GET:/parent/fees/receipts/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Fees Receipts Studentid",
    "method": "GET",
    "path": "/parent/fees/receipts/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getFeeReceipts"
  },
  {
    "id": "GET:/parent/fees/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Fees Studentid",
    "method": "GET",
    "path": "/parent/fees/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getFees"
  },
  {
    "id": "GET:/parent/homework/detail/{homeworkId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Homework Detail Homeworkid",
    "method": "GET",
    "path": "/parent/homework/detail/{homeworkId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "homeworkId"
    ],
    "handler": "getHomeworkDetail"
  },
  {
    "id": "GET:/parent/homework/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Homework Studentid",
    "method": "GET",
    "path": "/parent/homework/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getHomework"
  },
  {
    "id": "GET:/parent/leave/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Leave Studentid",
    "method": "GET",
    "path": "/parent/leave/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getLeaveHistory"
  },
  {
    "id": "POST:/parent/leave/{studentId}/apply",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "Create Parent Leave Studentid Apply",
    "method": "POST",
    "path": "/parent/leave/{studentId}/apply",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "applyLeave"
  },
  {
    "id": "GET:/parent/notifications",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Notifications",
    "method": "GET",
    "path": "/parent/notifications",
    "roles": [
      "PARENT"
    ],
    "pathParams": [],
    "handler": "getNotifications"
  },
  {
    "id": "PUT:/parent/notifications/{notificationId}/read",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "Update Parent Notifications Notificationid Read",
    "method": "PUT",
    "path": "/parent/notifications/{notificationId}/read",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "notificationId"
    ],
    "handler": "markNotificationAsRead"
  },
  {
    "id": "GET:/parent/remarks/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Remarks Studentid",
    "method": "GET",
    "path": "/parent/remarks/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getTeacherRemarks"
  },
  {
    "id": "GET:/parent/timetable/{studentId}",
    "module": "Parent",
    "controller": "ParentController.java",
    "operation": "View Parent Timetable Studentid",
    "method": "GET",
    "path": "/parent/timetable/{studentId}",
    "roles": [
      "PARENT"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getTimetable"
  },
  {
    "id": "POST:/api/v1/increment/process",
    "module": "Payroll",
    "controller": "IncrementController.java",
    "operation": "Create Api V1 Increment Process",
    "method": "POST",
    "path": "/api/v1/increment/process",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "processIncrement"
  },
  {
    "id": "GET:/api/v1/increment/staff/{staffId}",
    "module": "Payroll",
    "controller": "IncrementController.java",
    "operation": "View Api V1 Increment Staff Staffid",
    "method": "GET",
    "path": "/api/v1/increment/staff/{staffId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "staffHistory"
  },
  {
    "id": "GET:/api/v1/increment/teacher/{teacherId}",
    "module": "Payroll",
    "controller": "IncrementController.java",
    "operation": "View Api V1 Increment Teacher Teacherid",
    "method": "GET",
    "path": "/api/v1/increment/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "teacherHistory"
  },
  {
    "id": "POST:/api/v1/payroll/manual/school/{schoolId}",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "Create Api V1 Payroll Manual School Schoolid",
    "method": "POST",
    "path": "/api/v1/payroll/manual/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "runManualPayroll"
  },
  {
    "id": "POST:/api/v1/payroll/manual/teacher/{teacherId}",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "Create Api V1 Payroll Manual Teacher Teacherid",
    "method": "POST",
    "path": "/api/v1/payroll/manual/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "previewTeacherSlip"
  },
  {
    "id": "POST:/api/v1/payroll/run",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "Create Api V1 Payroll Run",
    "method": "POST",
    "path": "/api/v1/payroll/run",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "runPayroll"
  },
  {
    "id": "GET:/api/v1/payroll/school/{schoolId}",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "View Api V1 Payroll School Schoolid",
    "method": "GET",
    "path": "/api/v1/payroll/school/{schoolId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getHistory"
  },
  {
    "id": "GET:/api/v1/payroll/{id}",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "View Api V1 Payroll Id",
    "method": "GET",
    "path": "/api/v1/payroll/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getRecord"
  },
  {
    "id": "POST:/api/v1/payroll/{id}/disburse",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "Create Api V1 Payroll Id Disburse",
    "method": "POST",
    "path": "/api/v1/payroll/{id}/disburse",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "disburse"
  },
  {
    "id": "GET:/api/v1/payroll/{id}/export-bank",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "View Api V1 Payroll Id Export Bank",
    "method": "GET",
    "path": "/api/v1/payroll/{id}/export-bank",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "exportBank"
  },
  {
    "id": "POST:/api/v1/payroll/{id}/finalize",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "Create Api V1 Payroll Id Finalize",
    "method": "POST",
    "path": "/api/v1/payroll/{id}/finalize",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "finalize"
  },
  {
    "id": "GET:/api/v1/payroll/{id}/slips",
    "module": "Payroll",
    "controller": "PayrollController.java",
    "operation": "View Api V1 Payroll Id Slips",
    "method": "GET",
    "path": "/api/v1/payroll/{id}/slips",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getSlips"
  },
  {
    "id": "GET:/api/v1/salary-slip/staff/{staffId}",
    "module": "Payroll",
    "controller": "SalarySlipController.java",
    "operation": "View Api V1 Salary Slip Staff Staffid",
    "method": "GET",
    "path": "/api/v1/salary-slip/staff/{staffId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "staffId"
    ],
    "handler": "getForStaff"
  },
  {
    "id": "GET:/api/v1/salary-slip/teacher/{teacherId}",
    "module": "Payroll",
    "controller": "SalarySlipController.java",
    "operation": "View Api V1 Salary Slip Teacher Teacherid",
    "method": "GET",
    "path": "/api/v1/salary-slip/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "getForTeacher"
  },
  {
    "id": "GET:/api/v1/salary-slip/{id}",
    "module": "Payroll",
    "controller": "SalarySlipController.java",
    "operation": "View Api V1 Salary Slip Id",
    "method": "GET",
    "path": "/api/v1/salary-slip/{id}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getById"
  },
  {
    "id": "POST:/api/v1/salary-slip/{id}/email",
    "module": "Payroll",
    "controller": "SalarySlipController.java",
    "operation": "Create Api V1 Salary Slip Id Email",
    "method": "POST",
    "path": "/api/v1/salary-slip/{id}/email",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "emailSlip"
  },
  {
    "id": "POST:/payroll/manual/school/{schoolId}",
    "module": "Payroll",
    "controller": "ManualPayrollController.java",
    "operation": "Create Payroll Manual School Schoolid",
    "method": "POST",
    "path": "/payroll/manual/school/{schoolId}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "calculateForSchool"
  },
  {
    "id": "POST:/payroll/manual/teacher/{teacherId}",
    "module": "Payroll",
    "controller": "ManualPayrollController.java",
    "operation": "Create Payroll Manual Teacher Teacherid",
    "method": "POST",
    "path": "/payroll/manual/teacher/{teacherId}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "calculateForTeacher"
  },
  {
    "id": "GET:/payroll/manual/teacher/{teacherId}/leave-summary",
    "module": "Payroll",
    "controller": "ManualPayrollController.java",
    "operation": "View Payroll Manual Teacher Teacherid Leave Summary",
    "method": "GET",
    "path": "/payroll/manual/teacher/{teacherId}/leave-summary",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "getTeacherLeaveSummary"
  },
  {
    "id": "GET:/payroll/manual/teacher/{teacherId}/slip",
    "module": "Payroll",
    "controller": "ManualPayrollController.java",
    "operation": "View Payroll Manual Teacher Teacherid Slip",
    "method": "GET",
    "path": "/payroll/manual/teacher/{teacherId}/slip",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "getTeacherSlip"
  },
  {
    "id": "POST:/payroll/scheduler/trigger",
    "module": "Payroll",
    "controller": "PayrollSchedulerController.java",
    "operation": "Create Payroll Scheduler Trigger",
    "method": "POST",
    "path": "/payroll/scheduler/trigger",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "triggerScheduler"
  },
  {
    "id": "POST:/salary-structure",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "Create Salary Structure",
    "method": "POST",
    "path": "/salary-structure",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "create"
  },
  {
    "id": "POST:/salary-structure/assign",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "Create Salary Structure Assign",
    "method": "POST",
    "path": "/salary-structure/assign",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "assign"
  },
  {
    "id": "POST:/salary-structure/preview",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "Create Salary Structure Preview",
    "method": "POST",
    "path": "/salary-structure/preview",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [],
    "handler": "preview"
  },
  {
    "id": "GET:/salary-structure/school/{schoolId}",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "View Salary Structure School Schoolid",
    "method": "GET",
    "path": "/salary-structure/school/{schoolId}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getBySchool"
  },
  {
    "id": "DELETE:/salary-structure/{id}",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "Delete Salary Structure Id",
    "method": "DELETE",
    "path": "/salary-structure/{id}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "delete"
  },
  {
    "id": "GET:/salary-structure/{id}",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "View Salary Structure Id",
    "method": "GET",
    "path": "/salary-structure/{id}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "getById"
  },
  {
    "id": "PUT:/salary-structure/{id}",
    "module": "Payroll",
    "controller": "SalaryStructureController.java",
    "operation": "Update Salary Structure Id",
    "method": "PUT",
    "path": "/salary-structure/{id}",
    "roles": [
      "ACCOUNTANT",
      "SCHOOL_ADMIN"
    ],
    "pathParams": [
      "id"
    ],
    "handler": "update"
  },
  {
    "id": "GET:/api/v1/promotion/history",
    "module": "Promotion",
    "controller": "PromotionController.java",
    "operation": "View Api V1 Promotion History",
    "method": "GET",
    "path": "/api/v1/promotion/history",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "history"
  },
  {
    "id": "POST:/api/v1/promotion/prepare",
    "module": "Promotion",
    "controller": "PromotionController.java",
    "operation": "Create Api V1 Promotion Prepare",
    "method": "POST",
    "path": "/api/v1/promotion/prepare",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "prepare"
  },
  {
    "id": "POST:/api/v1/promotion/{jobId}/execute",
    "module": "Promotion",
    "controller": "PromotionController.java",
    "operation": "Create Api V1 Promotion Jobid Execute",
    "method": "POST",
    "path": "/api/v1/promotion/{jobId}/execute",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "jobId"
    ],
    "handler": "execute"
  },
  {
    "id": "GET:/api/v1/promotion/{jobId}/status",
    "module": "Promotion",
    "controller": "PromotionController.java",
    "operation": "View Api V1 Promotion Jobid Status",
    "method": "GET",
    "path": "/api/v1/promotion/{jobId}/status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "jobId"
    ],
    "handler": "status"
  },
  {
    "id": "POST:/school-admin",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin",
    "method": "POST",
    "path": "/school-admin",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createSingleTeacher"
  },
  {
    "id": "PATCH:/school-admin/Adding-classTeacher",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Update School Admin Adding Classteacher",
    "method": "PATCH",
    "path": "/school-admin/Adding-classTeacher",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "changeRole"
  },
  {
    "id": "POST:/school-admin/classroom/create",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Classroom Create",
    "method": "POST",
    "path": "/school-admin/classroom/create",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createClassRoom"
  },
  {
    "id": "POST:/school-admin/classroom/{classRoomId}/finalize-rolls",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Classroom Classroomid Finalize Rolls",
    "method": "POST",
    "path": "/school-admin/classroom/{classRoomId}/finalize-rolls",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "finalizeRollNumbers"
  },
  {
    "id": "POST:/school-admin/create-student",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Create Student",
    "method": "POST",
    "path": "/school-admin/create-student",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createSingleStudent"
  },
  {
    "id": "POST:/school-admin/create-teachers",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Create Teachers",
    "method": "POST",
    "path": "/school-admin/create-teachers",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createNewTeacher"
  },
  {
    "id": "GET:/school-admin/getClassRoom",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "View School Admin Getclassroom",
    "method": "GET",
    "path": "/school-admin/getClassRoom",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getAllClassRooms"
  },
  {
    "id": "GET:/school-admin/getSchoolDashboardData",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "View School Admin Getschooldashboarddata",
    "method": "GET",
    "path": "/school-admin/getSchoolDashboardData",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getSchoolDashData"
  },
  {
    "id": "GET:/school-admin/getStudentDetails",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "View School Admin Getstudentdetails",
    "method": "GET",
    "path": "/school-admin/getStudentDetails",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getStudentsDetails"
  },
  {
    "id": "GET:/school-admin/getTeacherDetails",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "View School Admin Getteacherdetails",
    "method": "GET",
    "path": "/school-admin/getTeacherDetails",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getTeacherDetails"
  },
  {
    "id": "POST:/school-admin/student/{studentId}/assign-parent",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Student Studentid Assign Parent",
    "method": "POST",
    "path": "/school-admin/student/{studentId}/assign-parent",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "assignParentToStudent"
  },
  {
    "id": "POST:/school-admin/{classroomId}/subjects",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Classroomid Subjects",
    "method": "POST",
    "path": "/school-admin/{classroomId}/subjects",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classroomId"
    ],
    "handler": "createSingleSubject"
  },
  {
    "id": "POST:/school-admin/{schoolId}/{classroomId}/assign-students",
    "module": "School",
    "controller": "SchoolAdminController.java",
    "operation": "Create School Admin Schoolid Classroomid Assign Students",
    "method": "POST",
    "path": "/school-admin/{schoolId}/{classroomId}/assign-students",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "classroomId"
    ],
    "handler": "assignStudents"
  },
  {
    "id": "POST:/auth/change-password",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Create Auth Change Password",
    "method": "POST",
    "path": "/auth/change-password",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "changePassword"
  },
  {
    "id": "GET:/school-admin/appearance/settings",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "View School Admin Appearance Settings",
    "method": "GET",
    "path": "/school-admin/appearance/settings",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getAppearance"
  },
  {
    "id": "PUT:/school-admin/appearance/settings",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Update School Admin Appearance Settings",
    "method": "PUT",
    "path": "/school-admin/appearance/settings",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveAppearance"
  },
  {
    "id": "GET:/school-admin/notifications/settings",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "View School Admin Notifications Settings",
    "method": "GET",
    "path": "/school-admin/notifications/settings",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getNotifications"
  },
  {
    "id": "PUT:/school-admin/notifications/settings",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Update School Admin Notifications Settings",
    "method": "PUT",
    "path": "/school-admin/notifications/settings",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveNotifications"
  },
  {
    "id": "GET:/school-admin/roles/permissions",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "View School Admin Roles Permissions",
    "method": "GET",
    "path": "/school-admin/roles/permissions",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getRoles"
  },
  {
    "id": "PUT:/school-admin/roles/permissions",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Update School Admin Roles Permissions",
    "method": "PUT",
    "path": "/school-admin/roles/permissions",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveRoles"
  },
  {
    "id": "PUT:/school-admin/school/{schoolId}",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Update School Admin School Schoolid",
    "method": "PUT",
    "path": "/school-admin/school/{schoolId}",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "updateSchool"
  },
  {
    "id": "PUT:/school-admin/security/settings",
    "module": "Settings",
    "controller": "SettingsController.java",
    "operation": "Update School Admin Security Settings",
    "method": "PUT",
    "path": "/school-admin/security/settings",
    "roles": [
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveSecuritySettings"
  },
  {
    "id": "GET:/schools/{schoolId}/staff",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "View Schools Schoolid Staff",
    "method": "GET",
    "path": "/schools/{schoolId}/staff",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllStaff"
  },
  {
    "id": "POST:/schools/{schoolId}/staff",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "Create Schools Schoolid Staff",
    "method": "POST",
    "path": "/schools/{schoolId}/staff",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createStaff"
  },
  {
    "id": "GET:/schools/{schoolId}/staff/department",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "View Schools Schoolid Staff Department",
    "method": "GET",
    "path": "/schools/{schoolId}/staff/department",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getStaffByDepartment"
  },
  {
    "id": "GET:/schools/{schoolId}/staff/role",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "View Schools Schoolid Staff Role",
    "method": "GET",
    "path": "/schools/{schoolId}/staff/role",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getStaffByRole"
  },
  {
    "id": "PUT:/schools/{schoolId}/staff/{staffId}/assign-route",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "Update Schools Schoolid Staff Staffid Assign Route",
    "method": "PUT",
    "path": "/schools/{schoolId}/staff/{staffId}/assign-route",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "staffId"
    ],
    "handler": "assignRoute"
  },
  {
    "id": "PUT:/schools/{schoolId}/staff/{staffId}/deactivate",
    "module": "Staff",
    "controller": "StaffController.java",
    "operation": "Update Schools Schoolid Staff Staffid Deactivate",
    "method": "PUT",
    "path": "/schools/{schoolId}/staff/{staffId}/deactivate",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "staffId"
    ],
    "handler": "deactivateStaff"
  },
  {
    "id": "PATCH:/subject/assign-teacher",
    "module": "Subject",
    "controller": "SubjectController.java",
    "operation": "Update Subject Assign Teacher",
    "method": "PATCH",
    "path": "/subject/assign-teacher",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "assignTeacherToSubject"
  },
  {
    "id": "GET:/super-admin/subscription/dashboard",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "View Super Admin Subscription Dashboard",
    "method": "GET",
    "path": "/super-admin/subscription/dashboard",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getDashboard"
  },
  {
    "id": "POST:/super-admin/subscription/run-expiry-check",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Create Super Admin Subscription Run Expiry Check",
    "method": "POST",
    "path": "/super-admin/subscription/run-expiry-check",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "runExpiryCheck"
  },
  {
    "id": "POST:/super-admin/subscription/saas-webhook",
    "module": "Subscription",
    "controller": "SaasWebhookController.java",
    "operation": "Create Super Admin Subscription Saas Webhook",
    "method": "POST",
    "path": "/super-admin/subscription/saas-webhook",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "handleRazorpayWebhook"
  },
  {
    "id": "POST:/super-admin/subscription/school/{schoolId}/create-order",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Create Super Admin Subscription School Schoolid Create Order",
    "method": "POST",
    "path": "/super-admin/subscription/school/{schoolId}/create-order",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createOrderForSchool"
  },
  {
    "id": "PATCH:/super-admin/subscription/school/{schoolId}/payment-status",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Update Super Admin Subscription School Schoolid Payment Status",
    "method": "PATCH",
    "path": "/super-admin/subscription/school/{schoolId}/payment-status",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "updateSchoolPaymentStatus"
  },
  {
    "id": "GET:/super-admin/subscription/school/{schoolId}/payments",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "View Super Admin Subscription School Schoolid Payments",
    "method": "GET",
    "path": "/super-admin/subscription/school/{schoolId}/payments",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getSchoolPaymentHistory"
  },
  {
    "id": "GET:/super-admin/subscription/settings",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "View Super Admin Subscription Settings",
    "method": "GET",
    "path": "/super-admin/subscription/settings",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getSettings"
  },
  {
    "id": "POST:/super-admin/subscription/settings",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Create Super Admin Subscription Settings",
    "method": "POST",
    "path": "/super-admin/subscription/settings",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "saveSettings"
  },
  {
    "id": "POST:/super-admin/subscription/trust/{trustId}/create-order",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Create Super Admin Subscription Trust Trustid Create Order",
    "method": "POST",
    "path": "/super-admin/subscription/trust/{trustId}/create-order",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "createOrderForTrust"
  },
  {
    "id": "PATCH:/super-admin/subscription/trust/{trustId}/payment-status",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Update Super Admin Subscription Trust Trustid Payment Status",
    "method": "PATCH",
    "path": "/super-admin/subscription/trust/{trustId}/payment-status",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "updateTrustPaymentStatus"
  },
  {
    "id": "GET:/super-admin/subscription/trust/{trustId}/payments",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "View Super Admin Subscription Trust Trustid Payments",
    "method": "GET",
    "path": "/super-admin/subscription/trust/{trustId}/payments",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "getTrustPaymentHistory"
  },
  {
    "id": "GET:/super-admin/subscription/trusts",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "View Super Admin Subscription Trusts",
    "method": "GET",
    "path": "/super-admin/subscription/trusts",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllTrusts"
  },
  {
    "id": "POST:/super-admin/subscription/verify-payment",
    "module": "Subscription",
    "controller": "SubscriptionController.java",
    "operation": "Create Super Admin Subscription Verify Payment",
    "method": "POST",
    "path": "/super-admin/subscription/verify-payment",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "verifyPayment"
  },
  {
    "id": "POST:/teacher-dashboard/assign-students",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "Create Teacher Dashboard Assign Students",
    "method": "POST",
    "path": "/teacher-dashboard/assign-students",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "assignStudentsToMyClassroom"
  },
  {
    "id": "POST:/teacher-dashboard/create-student",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "Create Teacher Dashboard Create Student",
    "method": "POST",
    "path": "/teacher-dashboard/create-student",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "createStudent"
  },
  {
    "id": "GET:/teacher-dashboard/fees",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Fees",
    "method": "GET",
    "path": "/teacher-dashboard/fees",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyClassroomFees"
  },
  {
    "id": "GET:/teacher-dashboard/fees/heads",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Fees Heads",
    "method": "GET",
    "path": "/teacher-dashboard/fees/heads",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getSchoolFeeHeads"
  },
  {
    "id": "GET:/teacher-dashboard/fees/structure",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Fees Structure",
    "method": "GET",
    "path": "/teacher-dashboard/fees/structure",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyClassroomFeeStructure"
  },
  {
    "id": "GET:/teacher-dashboard/fees/student/{studentId}",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Fees Student Studentid",
    "method": "GET",
    "path": "/teacher-dashboard/fees/student/{studentId}",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [
      "studentId"
    ],
    "handler": "getStudentFeeInMyClassroom"
  },
  {
    "id": "POST:/teacher-dashboard/finalize-rolls",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "Create Teacher Dashboard Finalize Rolls",
    "method": "POST",
    "path": "/teacher-dashboard/finalize-rolls",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "finalizeRollNumbers"
  },
  {
    "id": "GET:/teacher-dashboard/my-classroom",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard My Classroom",
    "method": "GET",
    "path": "/teacher-dashboard/my-classroom",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyClassroom"
  },
  {
    "id": "GET:/teacher-dashboard/students",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Students",
    "method": "GET",
    "path": "/teacher-dashboard/students",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyClassroomStudents"
  },
  {
    "id": "GET:/teacher-dashboard/subjects",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "View Teacher Dashboard Subjects",
    "method": "GET",
    "path": "/teacher-dashboard/subjects",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyClassroomSubjects"
  },
  {
    "id": "POST:/teacher-dashboard/subjects",
    "module": "Teacher",
    "controller": "TeacherDashboardController.java",
    "operation": "Create Teacher Dashboard Subjects",
    "method": "POST",
    "path": "/teacher-dashboard/subjects",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "addSubjectToMyClassroom"
  },
  {
    "id": "GET:/teacher/getTeachersDetilas",
    "module": "Teacher",
    "controller": "Teacher_Controller.java",
    "operation": "View Teacher Getteachersdetilas",
    "method": "GET",
    "path": "/teacher/getTeachersDetilas",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "geTeacherDetails"
  },
  {
    "id": "GET:/teacher/getTeachersDetilasForAdmin",
    "module": "Teacher",
    "controller": "Teacher_Controller.java",
    "operation": "View Teacher Getteachersdetilasforadmin",
    "method": "GET",
    "path": "/teacher/getTeachersDetilasForAdmin",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "geTeacherDetailsForDashboard"
  },
  {
    "id": "GET:/teacher/get_todayslects",
    "module": "Teacher",
    "controller": "Teacher_Controller.java",
    "operation": "View Teacher Get Todayslects",
    "method": "GET",
    "path": "/teacher/get_todayslects",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getTodaysLecturesForTeahers"
  },
  {
    "id": "GET:/teacher/my-timetable",
    "module": "Teacher",
    "controller": "Teacher_Controller.java",
    "operation": "View Teacher My Timetable",
    "method": "GET",
    "path": "/teacher/my-timetable",
    "roles": [
      "CLASS_TEACHER",
      "TEACHER"
    ],
    "pathParams": [],
    "handler": "getMyTimetable"
  },
  {
    "id": "POST:/lecture-topics",
    "module": "Timetable",
    "controller": "LectureTopicController.java",
    "operation": "Create Lecture Topics",
    "method": "POST",
    "path": "/lecture-topics",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "createTopic"
  },
  {
    "id": "GET:/lecture-topics/class/{classRoomId}",
    "module": "Timetable",
    "controller": "LectureTopicController.java",
    "operation": "View Lecture Topics Class Classroomid",
    "method": "GET",
    "path": "/lecture-topics/class/{classRoomId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "getByClassAndDate"
  },
  {
    "id": "GET:/lecture-topics/lecture/{lectureSlotId}",
    "module": "Timetable",
    "controller": "LectureTopicController.java",
    "operation": "View Lecture Topics Lecture Lectureslotid",
    "method": "GET",
    "path": "/lecture-topics/lecture/{lectureSlotId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "lectureSlotId"
    ],
    "handler": "getByLecture"
  },
  {
    "id": "POST:/lectures/add",
    "module": "Timetable",
    "controller": "LectureController.java",
    "operation": "Create Lectures Add",
    "method": "POST",
    "path": "/lectures/add",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "addLecture"
  },
  {
    "id": "GET:/lectures/full/{classRoomId}",
    "module": "Timetable",
    "controller": "LectureController.java",
    "operation": "View Lectures Full Classroomid",
    "method": "GET",
    "path": "/lectures/full/{classRoomId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "getFull"
  },
  {
    "id": "GET:/lectures/today/{classRoomId}",
    "module": "Timetable",
    "controller": "LectureController.java",
    "operation": "View Lectures Today Classroomid",
    "method": "GET",
    "path": "/lectures/today/{classRoomId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classRoomId"
    ],
    "handler": "getToday"
  },
  {
    "id": "GET:/tablecontroller/class/all",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Class All",
    "method": "GET",
    "path": "/tablecontroller/class/all",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getByAll"
  },
  {
    "id": "GET:/tablecontroller/class/{classId}/day",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Class Classid Day",
    "method": "GET",
    "path": "/tablecontroller/class/{classId}/day",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classId"
    ],
    "handler": "getByDay"
  },
  {
    "id": "GET:/tablecontroller/class/{classId}/today",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Class Classid Today",
    "method": "GET",
    "path": "/tablecontroller/class/{classId}/today",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classId"
    ],
    "handler": "getToday"
  },
  {
    "id": "GET:/tablecontroller/class/{classId}/tomorrow",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Class Classid Tomorrow",
    "method": "GET",
    "path": "/tablecontroller/class/{classId}/tomorrow",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classId"
    ],
    "handler": "getTomorrow"
  },
  {
    "id": "GET:/tablecontroller/class/{classId}/week",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Class Classid Week",
    "method": "GET",
    "path": "/tablecontroller/class/{classId}/week",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classId"
    ],
    "handler": "getByWeak"
  },
  {
    "id": "POST:/tablecontroller/create",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "Create Tablecontroller Create",
    "method": "POST",
    "path": "/tablecontroller/create",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "create"
  },
  {
    "id": "POST:/tablecontroller/generate/{classId}",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "Create Tablecontroller Generate Classid",
    "method": "POST",
    "path": "/tablecontroller/generate/{classId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "classId"
    ],
    "handler": "generate"
  },
  {
    "id": "GET:/tablecontroller/teacher/{teacherId}",
    "module": "Timetable",
    "controller": "TimeTableController.java",
    "operation": "View Tablecontroller Teacher Teacherid",
    "method": "GET",
    "path": "/tablecontroller/teacher/{teacherId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "teacherId"
    ],
    "handler": "getTeacherSchedule"
  },
  {
    "id": "GET:/api/v1/schools/{schoolId}/transport/routes",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "View Api V1 Schools Schoolid Transport Routes",
    "method": "GET",
    "path": "/api/v1/schools/{schoolId}/transport/routes",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAllRoutes"
  },
  {
    "id": "POST:/api/v1/schools/{schoolId}/transport/routes",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Create Api V1 Schools Schoolid Transport Routes",
    "method": "POST",
    "path": "/api/v1/schools/{schoolId}/transport/routes",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "createRoute"
  },
  {
    "id": "POST:/api/v1/schools/{schoolId}/transport/routes/assign-student",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Create Api V1 Schools Schoolid Transport Routes Assign Student",
    "method": "POST",
    "path": "/api/v1/schools/{schoolId}/transport/routes/assign-student",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "assignStudent"
  },
  {
    "id": "DELETE:/api/v1/schools/{schoolId}/transport/routes/remove-student/{studentId}",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Delete Api V1 Schools Schoolid Transport Routes Remove Student Studentid",
    "method": "DELETE",
    "path": "/api/v1/schools/{schoolId}/transport/routes/remove-student/{studentId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "studentId"
    ],
    "handler": "removeStudent"
  },
  {
    "id": "GET:/api/v1/schools/{schoolId}/transport/routes/{routeId}",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "View Api V1 Schools Schoolid Transport Routes Routeid",
    "method": "GET",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "getRouteById"
  },
  {
    "id": "PUT:/api/v1/schools/{schoolId}/transport/routes/{routeId}",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Update Api V1 Schools Schoolid Transport Routes Routeid",
    "method": "PUT",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "updateRoute"
  },
  {
    "id": "PUT:/api/v1/schools/{schoolId}/transport/routes/{routeId}/assign-driver",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Update Api V1 Schools Schoolid Transport Routes Routeid Assign Driver",
    "method": "PUT",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}/assign-driver",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "assignDriver"
  },
  {
    "id": "PUT:/api/v1/schools/{schoolId}/transport/routes/{routeId}/status",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Update Api V1 Schools Schoolid Transport Routes Routeid Status",
    "method": "PUT",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}/status",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "changeStatus"
  },
  {
    "id": "POST:/api/v1/schools/{schoolId}/transport/routes/{routeId}/stops",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "Create Api V1 Schools Schoolid Transport Routes Routeid Stops",
    "method": "POST",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}/stops",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "replaceStops"
  },
  {
    "id": "GET:/api/v1/schools/{schoolId}/transport/routes/{routeId}/students",
    "module": "Transport",
    "controller": "RouteController.java",
    "operation": "View Api V1 Schools Schoolid Transport Routes Routeid Students",
    "method": "GET",
    "path": "/api/v1/schools/{schoolId}/transport/routes/{routeId}/students",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "routeId"
    ],
    "handler": "getStudentsOnRoute"
  },
  {
    "id": "GET:/api/v1/transport/routes/{routeId}/live-location",
    "module": "Transport",
    "controller": "BusLocationController.java",
    "operation": "View Api V1 Transport Routes Routeid Live Location",
    "method": "GET",
    "path": "/api/v1/transport/routes/{routeId}/live-location",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "routeId"
    ],
    "handler": "getLatestLocation"
  },
  {
    "id": "POST:/super-admin/schools/onboard-single",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "Create Super Admin Schools Onboard Single",
    "method": "POST",
    "path": "/super-admin/schools/onboard-single",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "onboardSingleSchool"
  },
  {
    "id": "GET:/super-admin/trusts",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "View Super Admin Trusts",
    "method": "GET",
    "path": "/super-admin/trusts",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllTrusts"
  },
  {
    "id": "GET:/super-admin/trusts/active",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "View Super Admin Trusts Active",
    "method": "GET",
    "path": "/super-admin/trusts/active",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "getAllActiveTrusts"
  },
  {
    "id": "POST:/super-admin/trusts/onboard",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "Create Super Admin Trusts Onboard",
    "method": "POST",
    "path": "/super-admin/trusts/onboard",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [],
    "handler": "onboardTrust"
  },
  {
    "id": "GET:/super-admin/trusts/{trustId}",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "View Super Admin Trusts Trustid",
    "method": "GET",
    "path": "/super-admin/trusts/{trustId}",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "getTrustDetails"
  },
  {
    "id": "POST:/super-admin/trusts/{trustId}/add-school",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "Create Super Admin Trusts Trustid Add School",
    "method": "POST",
    "path": "/super-admin/trusts/{trustId}/add-school",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "addSchoolToTrust"
  },
  {
    "id": "PATCH:/super-admin/trusts/{trustId}/status",
    "module": "Trust",
    "controller": "TrustController.java",
    "operation": "Update Super Admin Trusts Trustid Status",
    "method": "PATCH",
    "path": "/super-admin/trusts/{trustId}/status",
    "roles": [
      "SUPER_ADMIN"
    ],
    "pathParams": [
      "trustId"
    ],
    "handler": "toggleTrustStatus"
  },
  {
    "id": "PUT:/user/change-password",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Update User Change Password",
    "method": "PUT",
    "path": "/user/change-password",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "changePassword"
  },
  {
    "id": "POST:/user/data-export",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Create User Data Export",
    "method": "POST",
    "path": "/user/data-export",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "requestDataExport"
  },
  {
    "id": "GET:/user/notification-preferences",
    "module": "User",
    "controller": "UserController.java",
    "operation": "View User Notification Preferences",
    "method": "GET",
    "path": "/user/notification-preferences",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getNotificationPreferences"
  },
  {
    "id": "PUT:/user/notification-preferences",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Update User Notification Preferences",
    "method": "PUT",
    "path": "/user/notification-preferences",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "saveNotificationPreferences"
  },
  {
    "id": "GET:/user/preferences",
    "module": "User",
    "controller": "UserController.java",
    "operation": "View User Preferences",
    "method": "GET",
    "path": "/user/preferences",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getPreferences"
  },
  {
    "id": "PUT:/user/preferences",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Update User Preferences",
    "method": "PUT",
    "path": "/user/preferences",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "savePreferences"
  },
  {
    "id": "GET:/user/privacy-settings",
    "module": "User",
    "controller": "UserController.java",
    "operation": "View User Privacy Settings",
    "method": "GET",
    "path": "/user/privacy-settings",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getPrivacySettings"
  },
  {
    "id": "PUT:/user/privacy-settings",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Update User Privacy Settings",
    "method": "PUT",
    "path": "/user/privacy-settings",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "savePrivacySettings"
  },
  {
    "id": "GET:/user/profile",
    "module": "User",
    "controller": "UserController.java",
    "operation": "View User Profile",
    "method": "GET",
    "path": "/user/profile",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getMyProfile"
  },
  {
    "id": "PUT:/user/profile",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Update User Profile",
    "method": "PUT",
    "path": "/user/profile",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "updateMyProfile"
  },
  {
    "id": "GET:/user/sessions",
    "module": "User",
    "controller": "UserController.java",
    "operation": "View User Sessions",
    "method": "GET",
    "path": "/user/sessions",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "getActiveSessions"
  },
  {
    "id": "DELETE:/user/sessions/all-others",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Delete User Sessions All Others",
    "method": "DELETE",
    "path": "/user/sessions/all-others",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [],
    "handler": "revokeAllOtherSessions"
  },
  {
    "id": "DELETE:/user/sessions/{sessionId}",
    "module": "User",
    "controller": "UserController.java",
    "operation": "Delete User Sessions Sessionid",
    "method": "DELETE",
    "path": "/user/sessions/{sessionId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "sessionId"
    ],
    "handler": "revokeSession"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getAll"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/by-date",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors By Date",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/by-date",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getByDate"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/by-range",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors By Range",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/by-range",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getByRange"
  },
  {
    "id": "POST:/schools/{schoolId}/visitors/checkin",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "Create Schools Schoolid Visitors Checkin",
    "method": "POST",
    "path": "/schools/{schoolId}/visitors/checkin",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "checkIn"
  },
  {
    "id": "POST:/schools/{schoolId}/visitors/flag-overstay",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "Create Schools Schoolid Visitors Flag Overstay",
    "method": "POST",
    "path": "/schools/{schoolId}/visitors/flag-overstay",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "flagOverstay"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/inside",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Inside",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/inside",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getCurrentlyInside"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/overstay",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Overstay",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/overstay",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getOverstay"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/search",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Search",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/search",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "search"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/summary/day",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Summary Day",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/summary/day",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getDaySummary"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/summary/range",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Summary Range",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/summary/range",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId"
    ],
    "handler": "getRangeSummary"
  },
  {
    "id": "DELETE:/schools/{schoolId}/visitors/{visitorId}",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "Delete Schools Schoolid Visitors Visitorid",
    "method": "DELETE",
    "path": "/schools/{schoolId}/visitors/{visitorId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "visitorId"
    ],
    "handler": "delete"
  },
  {
    "id": "GET:/schools/{schoolId}/visitors/{visitorId}",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "View Schools Schoolid Visitors Visitorid",
    "method": "GET",
    "path": "/schools/{schoolId}/visitors/{visitorId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "visitorId"
    ],
    "handler": "getById"
  },
  {
    "id": "PUT:/schools/{schoolId}/visitors/{visitorId}",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "Update Schools Schoolid Visitors Visitorid",
    "method": "PUT",
    "path": "/schools/{schoolId}/visitors/{visitorId}",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "visitorId"
    ],
    "handler": "update"
  },
  {
    "id": "PATCH:/schools/{schoolId}/visitors/{visitorId}/checkout",
    "module": "Visitor",
    "controller": "VisitorController.java",
    "operation": "Update Schools Schoolid Visitors Visitorid Checkout",
    "method": "PATCH",
    "path": "/schools/{schoolId}/visitors/{visitorId}/checkout",
    "roles": [
      "IT_ADMIN",
      "PRINCIPAL",
      "SCHOOL_ADMIN",
      "SCHOOL_OWNER",
      "SUPER_ADMIN",
      "VICE_PRINCIPAL"
    ],
    "pathParams": [
      "schoolId",
      "visitorId"
    ],
    "handler": "checkOut"
  }
];

export default BACKEND_FEATURE_CATALOG;
