import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import StudentTable from "../components/studentTable";
import API from "../../common/services/api";
import { X, Upload } from "lucide-react";

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
    section: "",
  });

  const [file, setFile] = useState(null);

  // ✅ FETCH CLASSROOMS
  const fetchClassrooms = async () => {
  try {
    const res = await API.get("/school-admin/getClassRoom");

    console.log("Fetched classrooms:", res.data);

    setClassrooms(res.data.content || []); // ✅ FIXED

  } catch (err) {
    console.error("Error fetching classrooms", err);
  }
};

  // ✅ FETCH STUDENTS
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
      console.log("Fetched students:", data);
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

  // INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CREATE STUDENT
  const handleCreateStudent = async () => {
    try {
      const res = await API.post("/school-admin/create-student", {
        body: JSON.stringify({
          ...formData,
          classRoomId: selectedClassroom, 
        }),
      });
      console.log("Create student response:", res);
      if (!res.ok) throw new Error("Failed");

      alert("Student Created ✅");
      setShowAddStudent(false);
      fetchStudents(page, selectedClassroom);

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
      fetchStudents(page, selectedClassroom);

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

          {/* HEADER */}
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

          {/* ✅ CLASSROOM FILTER */}
          <div className="mb-4">
            <select
              value={selectedClassroom}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedClassroom(value);
                fetchStudents(0, value);
              }}
              className="border p-2 rounded-lg"
            >
              <option value="">All Classes</option>

              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.grade} {cls.section ? `- ${cls.section}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="text-center py-6">Loading students...</p>
          ) : (
            <StudentTable students={students} />
          )}

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-6">

            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>

            <div className="flex gap-2">

              <button
                onClick={() => fetchStudents(page - 1, selectedClassroom)}
                disabled={page === 0}
                className="px-3 py-1 rounded-lg border"
              >
                Prev
              </button>

              {[...Array(totalPages).keys()].map((p) => (
                <button
                  key={p}
                  onClick={() => fetchStudents(p, selectedClassroom)}
                  className={`px-3 py-1 rounded-lg ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                onClick={() => fetchStudents(page + 1, selectedClassroom)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-lg border"
              >
                Next
              </button>

            </div>
          </div>

        </motion.div>
      </div>

      {/* ADD STUDENT MODAL */}
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

              {/* AUTO CLASSROOM */}
              <select
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="border p-2 rounded"
              >
                <option>Select Class</option>
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade} {cls.section}
                  </option>
                ))}
              </select>
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

      {/* BULK UPLOAD */}
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
}
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import StudentTable from "../components/studentTable";
// import API, { getStudents } from "../../common/services/api";
// import { X, Upload } from "lucide-react";

// export default function Students() {

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ SERVER PAGINATION
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const itemsPerPage = 10;

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

//   // ✅ FETCH STUDENTS WITH PAGE
//   const fetchStudents = async (currentPage = 0) => {
//     setLoading(true);
//     try {
//       const data = await getStudents(currentPage, itemsPerPage);

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
//   }, []);

//   // INPUT
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // CREATE
//   const handleCreateStudent = async () => {
//     try {
//       const res = await fetch("http://localhost:8085/api/v1/school-admin/create-student", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!res.ok) throw new Error("Failed");

//       alert("Student Created ✅");
//       setShowAddStudent(false);
//       fetchStudents(page);

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
//       fetchStudents(page);

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

//           {/* TABLE */}
//           {loading ? (
//             <p className="text-center py-6">Loading students...</p>
//           ) : (
//             <StudentTable students={students} />
//           )}

//           {/* ✅ PAGINATION */}
//           <div className="flex justify-between items-center mt-6">

//             <span className="text-sm text-gray-500">
//               Page {page + 1} of {totalPages}
//             </span>

//             <div className="flex gap-2">

//               {/* PREV */}
//               <button
//                 onClick={() => fetchStudents(page - 1)}
//                 disabled={page === 0}
//                 className={`px-3 py-1 rounded-lg border ${
//                   page === 0
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-white hover:bg-gray-100"
//                 }`}
//               >
//                 Prev
//               </button>

//               {/* PAGE NUMBERS */}
//               {[...Array(totalPages).keys()].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => fetchStudents(p)}
//                   className={`px-3 py-1 rounded-lg ${
//                     page === p
//                       ? "bg-blue-600 text-white"
//                       : "bg-white border hover:bg-gray-100"
//                   }`}
//                 >
//                   {p + 1}
//                 </button>
//               ))}

//               {/* NEXT */}
//               <button
//                 onClick={() => fetchStudents(page + 1)}
//                 disabled={page >= totalPages - 1}
//                 className={`px-3 py-1 rounded-lg border ${
//                   page >= totalPages - 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-white hover:bg-gray-100"
//                 }`}
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
//               <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded col-span-2" />
//               <input name="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded col-span-2" />
//               <input name="admissionNumber" placeholder="Admission No" onChange={handleChange} className="border p-2 rounded" />
//               <input type="date" name="dateOfBirth" onChange={handleChange} className="border p-2 rounded" />

//               <select name="gender" onChange={handleChange} className="border p-2 rounded">
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//               </select>

//               <input name="classRoomId" placeholder="ClassRoom ID" onChange={handleChange} className="border p-2 rounded" />
//               <input name="section" placeholder="Section" onChange={handleChange} className="border p-2 rounded" />
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

//       {/* BULK UPLOAD MODAL */}
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