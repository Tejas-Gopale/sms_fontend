import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import StudentTable from "../components/studentTable";
import API from "../../common/services/api";
import StudentProfileModal from "../components/StudentProfileModal";
import { X, Upload, Plus, Users, Filter, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function Students() {
  const queryClient = useQueryClient();
  
  // PAGINATION & FILTERS (Inhe state mein hi rakhna hai query trigger karne ke liye)
  const [page, setPage] = useState(0);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const itemsPerPage = 10;

  // MODALS
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  // FORM STATE
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "",
    admissionNumber: "", dateOfBirth: "", gender: "male",
  });
  const [file, setFile] = useState(null);

  // ✅ 1. FETCH CLASSROOMS (Cached for 1 hour kyunki classes roz nahi badalti)
  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const res = await API.get("/school-admin/getClassRoom");
      return res.data.content || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  // ✅ 2. FETCH STUDENTS (Auto-triggers when page or selectedClassroom changes)
  const { data: studentData, isLoading: loading } = useQuery({
    queryKey: ["students", page, selectedClassroom],
    queryFn: async () => {
      const res = await API.get("/school-admin/getStudentDetails", {
        params: {
          page: page,
          size: itemsPerPage,
          sortBy: "id",
          sortDir: "asc",
          classroomId: selectedClassroom || null,
        },
      });
      return res.data;
    },
    keepPreviousData: true, // Pagination ke waqt smooth experience deta hai
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  const students = studentData?.content || [];
  const totalPages = studentData?.totalPages || 1;

  // ✅ 3. CREATE STUDENT MUTATION
  const createStudentMutation = useMutation({
    mutationFn: (newData) => API.post("/school-admin/create-student", newData),
    onSuccess: () => {
      alert("Student Created ✅");
      setShowAddStudent(false);
      queryClient.invalidateQueries(["students"]); // Refresh List
    },
    onError: () => alert("Error creating student ❌")
  });

  // ✅ 4. BULK UPLOAD MUTATION
  const bulkUploadMutation = useMutation({
    mutationFn: (fileData) => API.post("/super-admin/school-onbarding/upload-classromm-students", fileData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    onSuccess: () => {
      alert("Bulk Upload Success ✅");
      setShowBulkUpload(false);
      setFile(null);
      queryClient.invalidateQueries(["students"]);
    },
    onError: () => alert("Upload failed ❌")
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateStudent = () => {
    createStudentMutation.mutate({ ...formData, classRoomId: selectedClassroom });
  };

  const handleBulkUpload = () => {
    if (!file) return alert("Select file first");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    bulkUploadMutation.mutate(formDataUpload);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Student Directory
            </motion.h1>
            <p className="text-slate-500 mt-1">Manage enrollments and classroom assignments.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium">
              <Upload size={18} /> Bulk Upload
            </button>
            <button onClick={() => setShowAddStudent(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium">
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-white border border-slate-200 rounded-xl flex items-center px-3 py-2 shadow-sm">
                <Filter size={18} className="text-slate-400 mr-2" />
                <select
                  value={selectedClassroom}
                  onChange={(e) => { setSelectedClassroom(e.target.value); setPage(0); }}
                  className="bg-transparent outline-none text-sm font-medium text-slate-700 min-w-[150px] cursor-pointer"
                >
                  <option value="">All Classrooms</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>Grade {cls.grade} {cls.section ? `- ${cls.section}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500">
              Total Enrolled: <span className="text-indigo-600">{students.length}</span>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="p-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500">Syncing student records...</p>
              </div>
            ) : (
              <StudentTable students={students} onView={(studentData) => setViewStudent(studentData)} />
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-800 font-bold">{page + 1}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(prev => prev - 1)} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600">
                <ChevronLeft size={20} />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(prev => prev + 1)} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MODALS (Keep your existing Modal UI code here, just use the new handle functions) */}
      {/* ... Add Student Modal, Bulk Upload Modal, etc. ... */}
      {/* MODAL: ADD STUDENT */}
      <AnimatePresence>
        {showAddStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddStudent(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Enroll New Student</h3>
                  <p className="text-sm text-slate-500">Enter personal and academic details.</p>
                </div>
                <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input name="firstName" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="John" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input name="lastName" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Doe" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input name="email" type="email" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="john.doe@school.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission Number</label>
                  <input name="admissionNumber" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="ADM-2024-001" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <input type="date" name="dateOfBirth" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select name="gender" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Class</label>
                  <select onChange={(e) => setSelectedClassroom(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    <option value="">Select Class</option>
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>Grade {cls.grade} {cls.section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateStudent}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Complete Enrollment
              </button>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

      <AnimatePresence>
        {viewStudent && (
          <StudentProfileModal 
            student={viewStudent} classrooms={classrooms}
            onClose={() => setViewStudent(null)}
            onRefresh={() => queryClient.invalidateQueries(["students"])}
          />
        )}
      </AnimatePresence>

            {/* MODAL: BULK UPLOAD */}
      <AnimatePresence>
        {showBulkUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBulkUpload(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 text-center w-full">Bulk Student Import</h3>
                <button onClick={() => setShowBulkUpload(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <label className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all mb-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {file ? <span className="text-indigo-600 font-bold">{file.name}</span> : "Drop Excel file or Click to Browse"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
              </label>

              <button
                onClick={handleBulkUpload}
                disabled={!file}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
              >
                Start Import
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



//--------------------------------------------------------------------------------------------------------------
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import StudentTable from "../components/studentTable";
// import API from "../../common/services/api";
// import StudentProfileModal from "../components/StudentProfileModal";
// import { X, Upload, Plus, Users, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";

// export default function Students() {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // PAGINATION
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const itemsPerPage = 10;

//   // CLASSROOM DROPDOWN
//   const [classrooms, setClassrooms] = useState([]);
//   const [selectedClassroom, setSelectedClassroom] = useState("");

//   // MODALS
//   const [showAddStudent, setShowAddStudent] = useState(false);
//   const [showBulkUpload, setShowBulkUpload] = useState(false);


// const [viewStudent, setViewStudent] = useState(null); // <-- ADD THIS

//   // FORM
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     admissionNumber: "",
//     dateOfBirth: "",
//     gender: "male",
//     classRoomId: "",
//   });

//   const [file, setFile] = useState(null);

//   const fetchClassrooms = async () => {
//     try {
//       const res = await API.get("/school-admin/getClassRoom");
//       setClassrooms(res.data.content || []);
//     } catch (err) {
//       console.error("Error fetching classrooms", err);
//     }
//   };

//   const fetchStudents = async (currentPage = 0, classroomId = selectedClassroom) => {
//     setLoading(true);
//     try {
//       const res = await API.get("/school-admin/getStudentDetails", {
//         params: {
//           page: currentPage,
//           size: itemsPerPage,
//           sortBy: "id",
//           sortDir: "asc",
//           classroomId: classroomId || null,
//         },
//       });
//       const data = res.data;
//       setStudents(data.content || []);
//       setTotalPages(data.totalPages || 1);
//       setPage(data.number || 0);
//     } catch (err) {
//       console.error("Error fetching students", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents(0);
//     fetchClassrooms();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleCreateStudent = async () => {
//     try {
//       const res = await API.post("/school-admin/create-student", {
//         ...formData,
//         classRoomId: selectedClassroom,
//       });
//       if (res.status !== 200 && res.status !== 201) throw new Error("Failed");
//       alert("Student Created ✅");
//       setShowAddStudent(false);
//       fetchStudents(page, selectedClassroom);
//     } catch (err) {
//       alert("Error creating student ❌");
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!file) return alert("Select file first");
//     const formDataUpload = new FormData();
//     formDataUpload.append("file", file);
//     try {
//       const res = await API.post("/super-admin/school-onbarding/upload-classromm-students", formDataUpload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("Bulk Upload Success ✅");
//       setShowBulkUpload(false);
//       fetchStudents(page, selectedClassroom);
//     } catch (err) {
//       alert("Upload failed ❌");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F8FAFC]">
//       <SchoolAdminSidebar />

//       <main className="flex-1 p-8">
//         {/* HEADER SECTION */}
//         <div className="flex justify-between items-end mb-8">
//           <div>
//             <motion.h1
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="text-3xl font-extrabold text-slate-800 tracking-tight"
//             >
//               Student Directory
//             </motion.h1>
//             <p className="text-slate-500 mt-1">Manage enrollments and classroom assignments.</p>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowBulkUpload(true)}
//               className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
//             >
//               <Upload size={18} /> Bulk Upload
//             </button>
//             <button
//               onClick={() => setShowAddStudent(true)}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
//             >
//               <Plus size={18} /> Add Student
//             </button>
//           </div>
//         </div>

//         {/* MAIN CONTENT CARD */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
//         >
//           {/* FILTER BAR */}
//           <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
//             <div className="flex items-center gap-3 w-full md:w-auto">
//               <div className="bg-white border border-slate-200 rounded-xl flex items-center px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20">
//                 <Filter size={18} className="text-slate-400 mr-2" />
//                 <select
//                   value={selectedClassroom}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setSelectedClassroom(value);
//                     fetchStudents(0, value);
//                   }}
//                   className="bg-transparent outline-none text-sm font-medium text-slate-700 min-w-[150px] cursor-pointer"
//                 >
//                   <option value="">All Classrooms</option>
//                   {classrooms.map((cls) => (
//                     <option key={cls.id} value={cls.id}>
//                       Grade {cls.grade} {cls.section ? `- ${cls.section}` : ""}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="text-sm font-medium text-slate-500">
//               Total Enrolled: <span className="text-indigo-600">{students.length}</span>
//             </div>
//           </div>

//           {/* TABLE AREA */}
//           <div className="p-4">
//             {loading ? (
//               <div className="py-20 flex flex-col items-center gap-3">
//                 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//                 <p className="text-slate-500 animate-pulse">Syncing student records...</p>
//               </div>
//             ) : (
//               <StudentTable 
//                   students={students} 
//                   onView={(studentData) => setViewStudent(studentData)} // <-- ADD THIS PROP
//               />
//             )}
//           </div>

//           {/* PAGINATION */}
//           <div className="p-5 border-t border-slate-100 flex items-center justify-between">
//             <p className="text-sm text-slate-500 font-medium">
//               Page <span className="text-slate-800 font-bold">{page + 1}</span> of {totalPages}
//             </p>
//             <div className="flex gap-2">
//               <button
//                 disabled={page === 0}
//                 onClick={() => fetchStudents(page - 1, selectedClassroom)}
//                 className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 disabled={page >= totalPages - 1}
//                 onClick={() => fetchStudents(page + 1, selectedClassroom)}
//                 className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* MODAL: ADD STUDENT */}
//       <AnimatePresence>
//         {showAddStudent && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setShowAddStudent(false)}
//               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
//             />
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-2xl relative z-10"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold text-slate-800">Enroll New Student</h3>
//                   <p className="text-sm text-slate-500">Enter personal and academic details.</p>
//                 </div>
//                 <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
//                   <input name="firstName" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="John" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
//                   <input name="lastName" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Doe" />
//                 </div>
//                 <div className="col-span-2 space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
//                   <input name="email" type="email" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="john.doe@school.com" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission Number</label>
//                   <input name="admissionNumber" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="ADM-2024-001" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
//                   <input type="date" name="dateOfBirth" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
//                   <select name="gender" onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none">
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Class</label>
//                   <select onChange={(e) => setSelectedClassroom(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none">
//                     <option value="">Select Class</option>
//                     {classrooms.map((cls) => (
//                       <option key={cls.id} value={cls.id}>Grade {cls.grade} {cls.section}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <button
//                 onClick={handleCreateStudent}
//                 className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
//               >
//                 Complete Enrollment
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//         {/* MODAL: VIEW / EDIT STUDENT PROFILE */}
//           <AnimatePresence>
//             {viewStudent && (
//               <StudentProfileModal 
//                 student={viewStudent}
//                 classrooms={classrooms}
//                 onClose={() => setViewStudent(null)}
//                 onRefresh={() => fetchStudents(page, selectedClassroom)}
//               />
//             )}
//         </AnimatePresence>

//       {/* MODAL: BULK UPLOAD */}
//       <AnimatePresence>
//         {showBulkUpload && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setShowBulkUpload(false)}
//               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
//             />
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative z-10"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-bold text-slate-800 text-center w-full">Bulk Student Import</h3>
//                 <button onClick={() => setShowBulkUpload(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
//               </div>

//               <label className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all mb-6">
//                 <div className="flex flex-col items-center justify-center">
//                   <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
//                     <FileText size={28} />
//                   </div>
//                   <p className="text-sm text-slate-600 font-medium">
//                     {file ? <span className="text-indigo-600 font-bold">{file.name}</span> : "Drop Excel file or Click to Browse"}
//                   </p>
//                 </div>
//                 <input type="file" className="hidden" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
//               </label>

//               <button
//                 onClick={handleBulkUpload}
//                 disabled={!file}
//                 className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
//               >
//                 Start Import
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
