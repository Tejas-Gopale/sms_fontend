import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import StudentTable from "../components/studentTable";
import API from "../../common/services/api";
import { X, Upload, Plus, Users, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // CLASSROOM DROPDOWN
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");

  // MODALS
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // FORM
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "male",
    classRoomId: "",
  });

  const [file, setFile] = useState(null);

  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/school-admin/getClassRoom");
      setClassrooms(res.data.content || []);
    } catch (err) {
      console.error("Error fetching classrooms", err);
    }
  };

  const fetchStudents = async (currentPage = 0, classroomId = selectedClassroom) => {
    setLoading(true);
    try {
      const res = await API.get("/school-admin/getStudentDetails", {
        params: {
          page: currentPage,
          size: itemsPerPage,
          sortBy: "id",
          sortDir: "asc",
          classroomId: classroomId || null,
        },
      });
      const data = res.data;
      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.number || 0);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(0);
    fetchClassrooms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = async () => {
    try {
      const res = await API.post("/school-admin/create-student", {
        ...formData,
        classRoomId: selectedClassroom,
      });
      if (res.status !== 200 && res.status !== 201) throw new Error("Failed");
      alert("Student Created ✅");
      setShowAddStudent(false);
      fetchStudents(page, selectedClassroom);
    } catch (err) {
      alert("Error creating student ❌");
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return alert("Select file first");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    try {
      const res = await API.post("/super-admin/school-onbarding/upload-classromm-students", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Bulk Upload Success ✅");
      setShowBulkUpload(false);
      fetchStudents(page, selectedClassroom);
    } catch (err) {
      alert("Upload failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold text-slate-800 tracking-tight"
            >
              Student Directory
            </motion.h1>
            <p className="text-slate-500 mt-1">Manage enrollments and classroom assignments.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
            >
              <Upload size={18} /> Bulk Upload
            </button>
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* FILTER BAR */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-white border border-slate-200 rounded-xl flex items-center px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20">
                <Filter size={18} className="text-slate-400 mr-2" />
                <select
                  value={selectedClassroom}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClassroom(value);
                    fetchStudents(0, value);
                  }}
                  className="bg-transparent outline-none text-sm font-medium text-slate-700 min-w-[150px] cursor-pointer"
                >
                  <option value="">All Classrooms</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Grade {cls.grade} {cls.section ? `- ${cls.section}` : ""}
                    </option>
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
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 animate-pulse">Syncing student records...</p>
              </div>
            ) : (
              <StudentTable students={students} />
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-800 font-bold">{page + 1}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => fetchStudents(page - 1, selectedClassroom)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchStudents(page + 1, selectedClassroom)}
                className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

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

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import StudentTable from "../components/studentTable";
// import API from "../../common/services/api";
// import { X, Upload } from "lucide-react";

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
//     section: "",
//   });

//   const [file, setFile] = useState(null);

//   // ✅ FETCH CLASSROOMS
//   const fetchClassrooms = async () => {
//   try {
//     const res = await API.get("/school-admin/getClassRoom");

//     console.log("Fetched classrooms:", res.data);

//     setClassrooms(res.data.content || []); // ✅ FIXED

//   } catch (err) {
//     console.error("Error fetching classrooms", err);
//   }
// };

//   // ✅ FETCH STUDENTS
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
//       console.log("Fetched students:", data);
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

//   // INPUT
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // CREATE STUDENT
//   const handleCreateStudent = async () => {
//     try {
//       console.log("Creating student with data:", { ...formData, classRoomId: selectedClassroom });  
//       const res = await API.post("/school-admin/create-student", {
//         body: JSON.stringify({
//           ...formData,
//           classRoomId: selectedClassroom, 
//         }),
//       });
//       console.log("Create student response:", res);
//       if (!res.ok) throw new Error("Failed");
//       alert("Student Created ✅");
//       setShowAddStudent(false);
//       fetchStudents(page, selectedClassroom);

//     } catch (err) {
//       console.error(err);
//       alert("Error creating student ❌");
//     }
//   };

//   // BULK UPLOAD
//   const handleBulkUpload = async () => {
//     if (!file) return alert("Select file first");

//     const formDataUpload = new FormData();
//     formDataUpload.append("file", file);

//     try {
//       const res = await API.post(
//         "/super-admin/school-onbarding/upload-classromm-students",
//         formDataUpload,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (res.status !== 200) throw new Error("Upload failed");

//       alert("Bulk Upload Success ✅");
//       setShowBulkUpload(false);
//       fetchStudents(page, selectedClassroom);

//     } catch (err) {
//       console.error(err);
//       alert("Upload failed ❌");
//     }
//   };

//   return (
//     <div className="flex">

//       <SchoolAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">

//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-3xl font-bold mb-6"
//         >
//           Students
//         </motion.h1>

//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow"
//         >

//           {/* HEADER */}
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Student List</h2>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowAddStudent(true)}
//                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
//               >
//                 + Add Student
//               </button>

//               <button
//                 onClick={() => setShowBulkUpload(true)}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//               >
//                 <Upload size={16} />
//                 Bulk Upload
//               </button>
//             </div>
//           </div>

//           {/* ✅ CLASSROOM FILTER */}
//           <div className="mb-4">
//             <select
//               value={selectedClassroom}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 setSelectedClassroom(value);
//                 fetchStudents(0, value);
//               }}
//               className="border p-2 rounded-lg"
//             >
//               <option value="">All Classes</option>

//               {classrooms.map((cls) => (
//                 <option key={cls.id} value={cls.id}>
//                   {cls.grade} {cls.section ? `- ${cls.section}` : ""}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* TABLE */}
//           {loading ? (
//             <p className="text-center py-6">Loading students...</p>
//           ) : (
//             <StudentTable students={students} />
//           )}

//           {/* PAGINATION */}
//           <div className="flex justify-between items-center mt-6">

//             <span className="text-sm text-gray-500">
//               Page {page + 1} of {totalPages}
//             </span>

//             <div className="flex gap-2">

//               <button
//                 onClick={() => fetchStudents(page - 1, selectedClassroom)}
//                 disabled={page === 0}
//                 className="px-3 py-1 rounded-lg border"
//               >
//                 Prev
//               </button>

//               {[...Array(totalPages).keys()].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => fetchStudents(p, selectedClassroom)}
//                   className={`px-3 py-1 rounded-lg ${
//                     page === p
//                       ? "bg-blue-600 text-white"
//                       : "bg-white border"
//                   }`}
//                 >
//                   {p + 1}
//                 </button>
//               ))}

//               <button
//                 onClick={() => fetchStudents(page + 1, selectedClassroom)}
//                 disabled={page >= totalPages - 1}
//                 className="px-3 py-1 rounded-lg border"
//               >
//                 Next
//               </button>

//             </div>
//           </div>

//         </motion.div>
//       </div>

//       {/* ADD STUDENT MODAL */}
//       {showAddStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
//           <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg">
//             <div className="flex justify-between mb-4">
//               <h2 className="text-xl font-semibold">Add Student</h2>
//               <X onClick={() => setShowAddStudent(false)} className="cursor-pointer" />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <input name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" />
//               <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" />
//              <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded col-span-2" /> 
//               <input name="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded col-span-2" />
//               <input name="admissionNumber" placeholder="Admission No" onChange={handleChange} className="border p-2 rounded" />
//               <input type="date" name="dateOfBirth" onChange={handleChange} className="border p-2 rounded" />

//               <select name="gender" onChange={handleChange} className="border p-2 rounded">
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//               </select>

//               {/* AUTO CLASSROOM */}
//               <select
//                 onChange={(e) => setSelectedClassroom(e.target.value)}
//                 className="border p-2 rounded"
//               >
//                 <option>Select Class</option>
//                 {classrooms.map((cls) => (
//                   <option key={cls.id} value={cls.id}>
//                     {cls.grade} {cls.section}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button
//               onClick={handleCreateStudent}
//               className="mt-4 w-full bg-green-600 text-white py-2 rounded"
//             >
//               Create Student
//             </button>
//           </div>
//         </div>
//       )}

//        {/* BULK UPLOAD  */}
//       {showBulkUpload && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
//           <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
//             <div className="flex justify-between mb-4">
//               <h2 className="text-xl font-semibold">Bulk Upload</h2>
//               <X onClick={() => setShowBulkUpload(false)} className="cursor-pointer" />
//             </div>

//             <input
//               type="file"
//               accept=".xlsx"
//               onChange={(e) => setFile(e.target.files[0])}
//               className="mb-4"
//             />

//             <button
//               onClick={handleBulkUpload}
//               className="w-full bg-blue-600 text-white py-2 rounded"
//             >
//               Upload File
//             </button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

//-------------------------------------------------------------------------------------------------------------------

// PREVIOUS VERSION WITHOUT CLASSROOM FILTER
/*
 import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import StudentTable from "../components/studentTable";
import API, { getStudents } from "../../common/services/api";
import { X, Upload } from "lucide-react";

export default function Students() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ SERVER PAGINATION
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // MODALS
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // FORM
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "male",
    classRoomId: "",
    section: "",
  });

  const [file, setFile] = useState(null);

  // ✅ FETCH STUDENTS WITH PAGE
  const fetchStudents = async (currentPage = 0) => {
    setLoading(true);
    try {
      const data = await getStudents(currentPage, itemsPerPage);

      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.number || 0);

    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(0);
  }, []);

  // INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CREATE
  const handleCreateStudent = async () => {
    try {
      const res = await fetch("http://localhost:8085/api/v1/school-admin/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Student Created ✅");
      setShowAddStudent(false);
      fetchStudents(page);

    } catch (err) {
      console.error(err);
      alert("Error creating student ❌");
    }
  };

  // BULK UPLOAD
  const handleBulkUpload = async () => {
    if (!file) return alert("Select file first");

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await API.post(
        "/super-admin/school-onbarding/upload-classromm-students",
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status !== 200) throw new Error("Upload failed");

      alert("Bulk Upload Success ✅");
      setShowBulkUpload(false);
      fetchStudents(page);

    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Students
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow"
        >

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Student List</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddStudent(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                + Add Student
              </button>

              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload size={16} />
                Bulk Upload
              </button>
            </div>
          </div>

          // TABLE
          {loading ? (
            <p className="text-center py-6">Loading students...</p>
          ) : (
            <StudentTable students={students} />
          )}

          // ✅ PAGINATION 
          <div className="flex justify-between items-center mt-6">

            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>

            <div className="flex gap-2">

              // PREV 
              <button
                onClick={() => fetchStudents(page - 1)}
                disabled={page === 0}
                className={`px-3 py-1 rounded-lg border ${
                  page === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Prev
              </button>

              // PAGE NUMBERS 
              {[...Array(totalPages).keys()].map((p) => (
                <button
                  key={p}
                  onClick={() => fetchStudents(p)}
                  className={`px-3 py-1 rounded-lg ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white border hover:bg-gray-100"
                  }`}
                >
                  {p + 1}
                </button>
              ))}

             //NEXT *
              <button
                onClick={() => fetchStudents(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-3 py-1 rounded-lg border ${
                  page >= totalPages - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Next
              </button>

            </div>
          </div>

        </motion.div>
      </div>

      //ADD STUDENT MODAL
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Student</h2>
              <X onClick={() => setShowAddStudent(false)} className="cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" />
              <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded col-span-2" />
              <input name="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded col-span-2" />
              <input name="admissionNumber" placeholder="Admission No" onChange={handleChange} className="border p-2 rounded" />
              <input type="date" name="dateOfBirth" onChange={handleChange} className="border p-2 rounded" />

              <select name="gender" onChange={handleChange} className="border p-2 rounded">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <input name="classRoomId" placeholder="ClassRoom ID" onChange={handleChange} className="border p-2 rounded" />
              <input name="section" placeholder="Section" onChange={handleChange} className="border p-2 rounded" />
            </div>

            <button
              onClick={handleCreateStudent}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded"
            >
              Create Student
            </button>
          </div>
        </div>
      )}

      // BULK UPLOAD MODAL 
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Bulk Upload</h2>
              <X onClick={() => setShowBulkUpload(false)} className="cursor-pointer" />
            </div>

            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="mb-4"
            />

            <button
              onClick={handleBulkUpload}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Upload File
            </button>
          </div>
        </div>
      )}

    </div>
  );
}*/