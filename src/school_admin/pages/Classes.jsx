import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, X } from "lucide-react";
import API from "../../common/services/api";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const schoolId = localStorage.getItem("schoolId");

  const [showClassModal, setShowClassModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [excelFile, setExcelFile] = useState(null);

  // ================= LOAD DATA =================
  const loadClasses = async () => {
    try {
      const res = await API.get(`school-admin/getClassRoom`, {
        params: { page, size: 10 }
      });
      console.log("Classes API response:", res.data); // DEBUG LOG
      setClasses(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTeachers = async () => {
    const res = await API.get("/school-admin/getTeacherDetails");
    console.log("Teachers API response:", res.data); // DEBUG LOG
    setTeachers(res.data.content || []);
  };

  const loadStudents = async () => {
    const res = await API.get("/school-admin/getStudentDetails");
    console.log("Students API response:", res.data); // DEBUG LOG
    setStudents(res.data.content || []);
  };

  useEffect(() => {
    loadClasses();
  }, [page]);

  // ================= ACTIONS =================
  const createClass = async () => {
    await API.post("/school-admin/createClassRoom", { grade, section });
    console.log("Class created with grade:", grade, "and section:", section); // DEBUG LOG
    setShowClassModal(false);
    setGrade("");
    setSection("");
    loadClasses();
  };

  const assignTeacher = async () => {
    await API.patch("/school-admin/Adding-classTeacher", {
      classRomeId: selectedClassId,
      userId: selectedTeacher
    });
    console.log("Assigned teacher ID:", selectedTeacher, "to class ID:", selectedClassId); // DEBUG LOG

    setShowTeacherModal(false);
    loadClasses();
  };

  const addStudents = async () => {
    await API.post("/school-admin/addStudentsToClass", {
    
    
      classId: selectedClassId,
      studentIds: selectedStudents
    });
    console.log("Students added to class ID:", selectedClassId); // DEBUG LOG
    setShowStudentModal(false);
  };

  const uploadExcel = async () => {
    if (!excelFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("schoolId", schoolId);

    try {
      await API.post(`/super-admin/school-onbarding/upload-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("Excel file uploaded successfully"); // DEBUG LOG
      alert("Excel uploaded successfully 🚀");
      setShowBulkModal(false);
      setExcelFile(null);
      loadClasses();
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  // ================= UI =================
  return (
    <div className="flex">
      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Classes</h1>
            <p className="text-sm text-gray-500">Manage classrooms</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Bulk Add Classes
            </button>

            <button
              onClick={() => setShowClassModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Class
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Class</th>
                <th className="p-3">Section</th>
                <th className="p-3">Teacher</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.grade}</td>
                  <td className="p-3">{c.section}</td>

                  {/* ✅ UPDATED TEACHER COLUMN */}
                  <td className="p-3">
                    {c.classTeacher ? (
                      <div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          Class Teacher
                        </span>
                        <div className="text-sm mt-1">
                          {c.classTeacher.employeeId} ({c.classTeacher.subjectSpecialization})
                        </div>
                      </div>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                        Not Assigned
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedClassId(c.id);
                          loadTeachers();
                          setShowTeacherModal(true);
                        }}
                        className="text-green-600"
                      >
                        Assign Teacher
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClassId(c.id);
                          loadStudents();
                          setShowStudentModal(true);
                        }}
                        className="text-purple-600"
                      >
                        Add Students
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Next
          </button>
        </div>

        {/* MODALS */}
        {showClassModal && (
          <Modal onClose={() => setShowClassModal(false)} title="Add Class">
            <input
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="input"
            />
            <input
              placeholder="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="input"
            />
            <button onClick={createClass} className="btn-blue">
              Create
            </button>
          </Modal>
        )}

        {showTeacherModal && (
          <Modal onClose={() => setShowTeacherModal(false)} title="Assign Teacher">
            <select
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                console.log("Selected teacher ID:", e.target.value);
              }}
              className="input"
            >
              <option>Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.userName} - {t.subjectSpecialization}
                </option>
              ))}
            </select>
            <button onClick={assignTeacher} className="btn-green">
              Save
            </button>
          </Modal>
        )}

        {showStudentModal && (
          <Modal onClose={() => setShowStudentModal(false)} title="Add Students">
            <select
              multiple
              onChange={(e) =>
                setSelectedStudents(
                  [...e.target.selectedOptions].map((o) => o.value)
                )
              }
              className="input h-40"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button onClick={addStudents} className="btn-purple">
              Add Students
            </button>
          </Modal>
        )}

        {showBulkModal && (
          <Modal onClose={() => setShowBulkModal(false)} title="Bulk Upload Classes">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setExcelFile(e.target.files[0])}
              className="input"
            />
            <button onClick={uploadExcel} className="btn-purple">
              Upload
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

// ================= MODAL =================
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 relative">

        <button onClick={onClose} className="absolute top-2 right-2">
          <X />
        </button>

        <h2 className="mb-4 font-semibold">{title}</h2>

        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { Plus, X } from "lucide-react";
// import API from "../../common/services/api";
// import { form } from "framer-motion/client";

// export default function Classes() {
//   const [classes, setClasses] = useState([]);
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const schoolId = localStorage.getItem("schoolId");
//   const userId = localStorage.getItem("userId");
//   const [showClassModal, setShowClassModal] = useState(false);
//   const [showTeacherModal, setShowTeacherModal] = useState(false);
//   const [showStudentModal, setShowStudentModal] = useState(false);
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [selectedClassId, setSelectedClassId] = useState(null);
//   const [teacherEmail, setTeacherEmail] = useState("");
//   const [grade, setGrade] = useState("");
//   const [section, setSection] = useState("");
//   const [teachers, setTeachers] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [selectedTeacher, setSelectedTeacher] = useState("");
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [excelFile, setExcelFile] = useState(null);

//   // ================= LOAD DATA =================
//   const loadClasses = async () => {
//     try {
//       console.log("Loading classes for schoolId:", schoolId, userId); // DEBUG LOG
//       const res = await API.get(`school-admin/getClassRoom`, {
//         params: { page, size: 10 }
//       });
//       setClasses(res.data.content || []);
//       setTotalPages(res.data.totalPages || 0);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadTeachers = async () => {
//     const res = await API.get("/school-admin/getTeacherDetails");
//     setTeachers(res.data.content || []);
//   };

//   const loadStudents = async () => {
//     const res = await API.get("/school-admin/getStudentDetails");
//     setStudents(res.data.content || []);
//   };

//   useEffect(() => {
//     loadClasses();
//   }, [page]);

//   // ================= ACTIONS =================
//   const createClass = async () => {
//     await API.post("/school-admin/createClassRoom", { grade, section });
//     setShowClassModal(false);
//     setGrade("");
//     setSection("");
//     loadClasses();
//   };

//   const assignTeacher = async () => {
//     await API.patch("/school-admin/assignTeacher", {
//       classId: selectedClassId,
//       teacherId: selectedTeacher,

//     });
//     setShowTeacherModal(false);
//     loadClasses();
//   };

//   const addStudents = async () => {
//     await API.post("/school-admin/addStudentsToClass", {
//       classId: selectedClassId,
//       studentIds: selectedStudents
//     });
//     setShowStudentModal(false);
//   };

//   const uploadExcel = async () => {
//     if (!excelFile) {
//       alert("Please select a file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", excelFile);
//     formData.append("schoolId", schoolId); // Append schoolId to form data  

//     try {
//       await API.post(
//         `/super-admin/school-onbarding/upload-excel`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
//         }
//       );

//       alert("Excel uploaded successfully 🚀");
//       setShowBulkModal(false);
//       setExcelFile(null);
//       loadClasses();
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed ❌");
//     }
//   };

//   // ================= UI =================
//   return (
//     <div className="flex">
//       <SchoolAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">Classes</h1>
//             <p className="text-sm text-gray-500">Manage classrooms</p>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowBulkModal(true)}
//               className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <Plus size={16} /> Bulk Add Classes
//             </button>

//             <button
//               onClick={() => setShowClassModal(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <Plus size={16} /> Add Class
//             </button>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded shadow">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3">Class</th>
//                 <th className="p-3">Section</th>
//                 <th className="p-3">Teacher</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {classes.map((c) => (
//                 <tr key={c.id} className="border-t">
//                   <td className="p-3">{c.grade}</td>
//                   <td className="p-3">{c.section}</td>
//                   <td className="p-3">
//                     {c.classTeacher?.employeeId || "Not Assigned"}
//                   </td>

//                   <td className="p-3 text-center">
//                     <div className="flex justify-center gap-4">
//                       <button
//                         onClick={() => {
//                           setSelectedClassId(c.id);
//                           loadTeachers();
//                           setShowTeacherModal(true);
//                         }}
//                         className="text-green-600"
//                       >
//                         Assign Teacher
//                       </button>

//                       <button
//                         onClick={() => {
//                           setSelectedClassId(c.id);
//                           loadStudents();
//                           setShowStudentModal(true);
//                         }}
//                         className="text-purple-600"
//                       >
//                         Add Students
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* PAGINATION */}
//         <div className="flex justify-between mt-4">
//           <button
//             disabled={page === 0}
//             onClick={() => setPage(page - 1)}
//             className="bg-gray-200 px-4 py-2 rounded"
//           >
//             Prev
//           </button>

//           <button
//             disabled={page === totalPages - 1}
//             onClick={() => setPage(page + 1)}
//             className="bg-gray-200 px-4 py-2 rounded"
//           >
//             Next
//           </button>
//         </div>

//         {/* ADD CLASS MODAL */}
//         {showClassModal && (
//           <Modal onClose={() => setShowClassModal(false)} title="Add Class">
//             <input
//               placeholder="Grade"
//               value={grade}
//               onChange={(e) => setGrade(e.target.value)}
//               className="input"
//             />
//             <input
//               placeholder="Section"
//               value={section}
//               onChange={(e) => setSection(e.target.value)}
//               className="input"
//             />
//             <button onClick={createClass} className="btn-blue">
//               Create
//             </button>
//           </Modal>
//         )}

//         {/* TEACHER MODAL */}
//         {showTeacherModal && (
//           <Modal onClose={() => setShowTeacherModal(false)} title="Assign Teacher">
//             <select
//               onChange={(e) => setSelectedTeacher(e.target.value)}
//               className="input"
//             >
//               <option>Select Teacher</option>
//               {teachers.map((t) => (
//                 <option key={t.id} value={t.id}>
//                   {t.employeeId} - {t.subjectSpecialization}
//                 </option>
//               ))}
//             </select>
//             <button onClick={assignTeacher} className="btn-green">
//               Save
//             </button>
//           </Modal>
//         )}

//         {/* STUDENT MODAL */}
//         {showStudentModal && (
//           <Modal onClose={() => setShowStudentModal(false)} title="Add Students">
//             <select
//               multiple
//               onChange={(e) =>
//                 setSelectedStudents(
//                   [...e.target.selectedOptions].map((o) => o.value)
//                 )
//               }
//               className="input h-40"
//             >
//               {students.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.name}
//                 </option>
//               ))}
//             </select>
//             <button onClick={addStudents} className="btn-purple">
//               Add Students
//             </button>
//           </Modal>
//         )}

//         {/* BULK UPLOAD MODAL */}
//         {showBulkModal && (
//           <Modal onClose={() => setShowBulkModal(false)} title="Bulk Upload Classes">
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={(e) => setExcelFile(e.target.files[0])}
//               className="input"
//             />
//             <button onClick={uploadExcel} className="btn-purple">
//               Upload
//             </button>
//           </Modal>
//         )}
//       </div>
//     </div>
//   );
// }

// // ================= REUSABLE MODAL =================
// function Modal({ children, onClose, title }) {
//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
//       <div className="bg-white p-6 rounded w-96 relative">

//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2"
//         >
//           <X />
//         </button>

//         <h2 className="mb-4 font-semibold">{title}</h2>

//         <div className="flex flex-col gap-3">{children}</div>
//       </div>
//     </div>
//   );
// }