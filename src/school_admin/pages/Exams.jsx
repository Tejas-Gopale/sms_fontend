import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { Search, Calculator, FileUp } from "lucide-react";

export default function Results() {

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Grade Logic
  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 75) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 40) return "C";
    return "F";
  };

  // ================= LOAD DATA =================

  const fetchExams = async () => {
    const res = await API.get("/exam/all");
    const data = res.data || [];
    setExams(data);

    if (data.length > 0) {
      setSelectedExamId(data[0].id);
    }
  };

  const fetchClasses = async () => {
    const res = await API.get("/school-admin/getClassRoom", {
      params: { page: 0, size: 100 }
    });

    const data = res.data.content || [];
    setClasses(data);

    if (data.length > 0) {
      setSelectedClassId(data[0].id);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  // ================= RESULTS =================

  const fetchResults = async () => {
    if (!selectedExamId || !selectedClassId) {
      alert("Select exam & class");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get(
        `/result/class?examId=${selectedExamId}&classId=${selectedClassId}`
      );

      setStudents(res.data || []);

    } catch (err) {
      console.error(err);
      alert("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async () => {
    if (!selectedExamId || !selectedClassId) {
      alert("Select exam & class");
      return;
    }

    try {
      await API.post(
        `/result/calculate-all?examId=${selectedExamId}&classId=${selectedClassId}`
      );

      alert("Calculated ✅");
      fetchResults();
    } catch (err) {
      console.error(err);
      alert("Calculation Failed");
    }
  };

  // ================= EXCEL =================

  const uploadExcel = async () => {
    if (!file) return alert("Select file");
    if (!selectedExamId || !selectedClassId)
      return alert("Select exam & class");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", selectedExamId);
    formData.append("classId", selectedClassId);

    try {
      await API.post("/result/upload-excel", formData);

      alert("Uploaded ✅");
      fetchResults();
    } catch (err) {
      console.error(err);
      alert("Upload Failed");
    }
  };

  // ================= UI =================

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .res-page {
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #F8F9FC;
          min-height: 100vh;
        }

        .res-main {
          flex: 1;
          padding: 32px 28px;
          overflow-x: auto;
        }

        .res-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          gap: 16px;
        }

        .res-title-block h1 {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.5px;
        }

        .res-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 3px;
          font-family: 'DM Mono', monospace;
        }

        .res-controls {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .res-select {
          flex: 1;
          min-width: 200px;
          padding: 10px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          background: #F8F9FC;
        }

        .res-select:focus { border-color: #6366F1; background: #fff; }

        .btn-base {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }

        .btn-primary { background: #0F172A; color: #fff; }
        .btn-primary:hover { background: #1E293B; transform: translateY(-1px); }

        .btn-success { background: #15803D; color: #fff; }
        .btn-success:hover { background: #166534; transform: translateY(-1px); }

        .btn-outline {
          background: #fff;
          border: 1.5px solid #E2E8F0;
          color: #475569;
        }
        .btn-outline:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .file-input-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .file-input-wrapper input[type=file] {
          font-size: 100px;
          position: absolute;
          left: 0; top: 0;
          opacity: 0;
          cursor: pointer;
        }

        .res-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
        }

        table { width: 100%; border-collapse: collapse; }
        thead { background: #F8F9FC; border-bottom: 1.5px solid #E2E8F0; }
        thead th {
          padding: 14px;
          text-align: left;
          font-weight: 600;
          color: #64748B;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        tbody tr { border-bottom: 1px solid #F1F5F9; transition: background 0.1s; }
        tbody tr:hover { background: #FAFBFF; }
        tbody td { padding: 14px; color: #1E293B; font-size: 14px; }

        .badge-pct {
          font-family: 'DM Mono', monospace;
          background: #F1F5F9;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          color: #475569;
        }

        .grade-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          border: 1.5px solid;
        }

        .grade-A { background: #F0FDF4; border-color: #BBF7D0; color: #15803D; }
        .grade-F { background: #FFF1F2; border-color: #FECDD3; color: #BE123C; }
        .grade-default { background: #EFF6FF; border-color: #DBEAFE; color: #1D4ED8; }

        .status-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #E2E8F0;
          border-top-color: #6366F1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

    <div className="res-page">
      <SchoolAdminSidebar />

      <div className="res-main">

        {/* HEADER */}
        <div className="res-header">
          <div className="res-title-block">
            <h1>📊 Result Management</h1>
            <div className="res-subtitle">
              Process grades, calculate standings & upload data
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="res-controls">

          {/* ✅ EXAM */}
          <select
            className="res-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
          >
            <option value="">— Select Examination —</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.examName}
              </option>
            ))}
          </select>

          {/* ✅ CLASS (ADDED) */}
          <select
            className="res-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">— Select Class —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade} - {c.section}
              </option>
            ))}
          </select>

          {/* LOAD */}
          <button
            className="btn-base btn-primary"
            onClick={fetchResults}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Search size={16} />}
            Load Results
          </button>

          {/* CALCULATE */}
          <button
            className="btn-base btn-success"
            onClick={calculateResults}
            disabled={loading}
          >
            <Calculator size={16} /> Calculate All
          </button>

          <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

          {/* FILE */}
          <div className="file-input-wrapper">
            <button className="btn-base btn-outline">
              <FileUp size={16} /> {file ? file.name : "Select Excel"}
            </button>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* UPLOAD */}
          <button
            className="btn-base bg-purple-600 text-white hover:bg-purple-700"
            onClick={uploadExcel}
          >
            Upload Data
          </button>
        </div>

        {/* TABLE */}
        <div className="res-card">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
                    No Data
                  </td>
                </tr>
              ) : (
                students.map((s) => {

                  const percentage = s.percentage || 0;
                  const grade = s.grade || getGrade(percentage);
                  const isPass = percentage >= 40;

                  return (
                    <tr key={s.id}>
                      <td>{s.student?.name}</td>
                      <td>{s.totalObtained}</td>
                      <td>{percentage.toFixed(1)}%</td>
                      <td>{grade}</td>
                      <td>{isPass ? "Pass" : "Fail"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
    </>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import { Calculator, FileUp, RefreshCw, Search } from "lucide-react";
// import API from "../../common/services/api";

// export default function Results() {
//   const [exams, setExams] = useState([]);
//   const [selectedExamId, setSelectedExamId] = useState("");
//   const [students, setStudents] = useState([]);
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ✅ Grade Logic
//   const getGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 75) return "A";
//     if (percentage >= 60) return "B";
//     if (percentage >= 40) return "C";
//     return "F";
//   };

//   // 🔥 LOAD EXAMS
//   const fetchExams = async () => {
//     try {
//       const res = await API.get("/exam/all");
//       const data = res.data || [];
//       setExams(data);
//       if (data.length > 0) {
//         setSelectedExamId(data[0].id);
//       }
//     } catch (err) {
//       console.error("Exam Error:", err);
//       alert("Failed to load exams");
//     }
//   };

//   // 🔥 FETCH RESULTS
//   const fetchResults = async () => {
//     if (!selectedExamId) {
//       alert("Select exam first");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await API.get(`/result/class?examId=${selectedExamId}`);
//       setStudents(res.data || []);
//     } catch (err) {
//       console.error("Result Error:", err);
//       alert("Failed to load results");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔥 CALCULATE
//   const calculateResults = async () => {
//     if (!selectedExamId) return;
//     try {
//       setLoading(true);
//       await API.post(`/result/calculate-all?examId=${selectedExamId}`);
//       alert("Results Calculated ✅");
//       fetchResults();
//     } catch (err) {
//       console.error(err);
//       alert("Calculation Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔥 UPLOAD EXCEL
//   const uploadExcel = async () => {
//     if (!file) { alert("Select file first"); return; }
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("examId", selectedExamId);

//     try {
//       setLoading(true);
//       await API.post("/result/upload-excel", formData);
//       alert("Uploaded Successfully ✅");
//       fetchResults();
//     } catch (err) {
//       console.error(err);
//       alert("Upload Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

//         .res-page {
//           display: flex;
//           font-family: 'DM Sans', sans-serif;
//           background: #F8F9FC;
//           min-height: 100vh;
//         }

//         .res-main {
//           flex: 1;
//           padding: 32px 28px;
//           overflow-x: auto;
//         }

//         .res-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           margin-bottom: 28px;
//           gap: 16px;
//         }

//         .res-title-block h1 {
//           font-size: 26px;
//           font-weight: 700;
//           color: #0F172A;
//           letter-spacing: -0.5px;
//         }

//         .res-subtitle {
//           font-size: 13px;
//           color: #64748B;
//           margin-top: 3px;
//           font-family: 'DM Mono', monospace;
//         }

//         .res-controls {
//           background: #fff;
//           border-radius: 16px;
//           border: 1.5px solid #E2E8F0;
//           padding: 20px;
//           margin-bottom: 24px;
//           display: flex;
//           align-items: center;
//           gap: 15px;
//           flex-wrap: wrap;
//         }

//         .res-select {
//           flex: 1;
//           min-width: 200px;
//           padding: 10px 14px;
//           border: 1.5px solid #E2E8F0;
//           border-radius: 10px;
//           font-size: 14px;
//           font-weight: 500;
//           outline: none;
//           background: #F8F9FC;
//         }

//         .res-select:focus { border-color: #6366F1; background: #fff; }

//         .btn-base {
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           padding: 10px 18px;
//           border-radius: 10px;
//           font-size: 13.5px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.15s;
//           border: none;
//         }

//         .btn-primary { background: #0F172A; color: #fff; }
//         .btn-primary:hover { background: #1E293B; transform: translateY(-1px); }

//         .btn-success { background: #15803D; color: #fff; }
//         .btn-success:hover { background: #166534; transform: translateY(-1px); }

//         .btn-outline {
//           background: #fff;
//           border: 1.5px solid #E2E8F0;
//           color: #475569;
//         }
//         .btn-outline:hover { background: #F8FAFC; border-color: #CBD5E1; }

//         .file-input-wrapper {
//           position: relative;
//           overflow: hidden;
//           display: inline-block;
//         }

//         .file-input-wrapper input[type=file] {
//           font-size: 100px;
//           position: absolute;
//           left: 0; top: 0;
//           opacity: 0;
//           cursor: pointer;
//         }

//         .res-card {
//           background: #fff;
//           border-radius: 16px;
//           border: 1.5px solid #E2E8F0;
//           overflow: hidden;
//           box-shadow: 0 1px 4px rgba(15,23,42,0.04);
//         }

//         table { width: 100%; border-collapse: collapse; }
//         thead { background: #F8F9FC; border-bottom: 1.5px solid #E2E8F0; }
//         thead th {
//           padding: 14px;
//           text-align: left;
//           font-weight: 600;
//           color: #64748B;
//           font-size: 12px;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }

//         tbody tr { border-bottom: 1px solid #F1F5F9; transition: background 0.1s; }
//         tbody tr:hover { background: #FAFBFF; }
//         tbody td { padding: 14px; color: #1E293B; font-size: 14px; }

//         .badge-pct {
//           font-family: 'DM Mono', monospace;
//           background: #F1F5F9;
//           padding: 4px 8px;
//           border-radius: 6px;
//           font-weight: 600;
//           color: #475569;
//         }

//         .grade-pill {
//           display: inline-block;
//           padding: 3px 10px;
//           border-radius: 8px;
//           font-weight: 700;
//           font-size: 12px;
//           border: 1.5px solid;
//         }

//         .grade-A { background: #F0FDF4; border-color: #BBF7D0; color: #15803D; }
//         .grade-F { background: #FFF1F2; border-color: #FECDD3; color: #BE123C; }
//         .grade-default { background: #EFF6FF; border-color: #DBEAFE; color: #1D4ED8; }

//         .status-tag {
//           font-size: 11px;
//           font-weight: 700;
//           text-transform: uppercase;
//           padding: 2px 8px;
//           border-radius: 12px;
//         }

//         .spinner {
//           width: 18px; height: 18px;
//           border: 2px solid #E2E8F0;
//           border-top-color: #6366F1;
//           border-radius: 50%;
//           animation: spin 0.7s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>

//       <div className="res-page">
//         <SchoolAdminSidebar />
//         <div className="res-main">
          
//           {/* HEADER */}
//           <div className="res-header">
//             <div className="res-title-block">
//               <h1>📊 Result Management</h1>
//               <div className="res-subtitle">Process grades, calculate standings & upload data</div>
//             </div>
//           </div>

//           {/* ACTION BAR */}
//           <div className="res-controls">
//             <select
//               className="res-select"
//               value={selectedExamId}
//               onChange={(e) => setSelectedExamId(e.target.value)}
//             >
//               <option value="">— Select Examination —</option>
//               {exams.map((exam) => (
//                 <option key={exam.id} value={exam.id}>
//                   {exam.examName}
//                 </option>
//               ))}
//             </select>

//             <button className="btn-base btn-primary" onClick={fetchResults} disabled={loading}>
//               {loading ? <div className="spinner" /> : <Search size={16} />} Load Results
//             </button>

//             <button className="btn-base btn-success" onClick={calculateResults} disabled={loading}>
//               <Calculator size={16} /> Calculate All
//             </button>

//             <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

//             <div className="file-input-wrapper">
//               <button className="btn-base btn-outline">
//                 <FileUp size={16} /> {file ? file.name : "Select Excel"}
//               </button>
//               <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//             </div>

//             <button className="btn-base bg-purple-600 text-white hover:bg-purple-700" onClick={uploadExcel}>
//               Upload Data
//             </button>
//           </div>

//           {/* TABLE */}
//           <div className="res-card">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Student Name</th>
//                   <th>Total Marks</th>
//                   <th>Percentage</th>
//                   <th>Grade</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="spinner" style={{ width: 30, height: 30 }} />
//                         <span className="text-gray-400 font-medium">Processing Data...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : students.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
//                       <div className="text-4xl mb-3">📁</div>
//                       <div className="text-gray-400">No student records found for this exam.</div>
//                     </td>
//                   </tr>
//                 ) : (
//                   students.map((s) => {
//                     const percentage = s.percentage || 0;
//                     const grade = s.grade || getGrade(percentage);
//                     const isPass = percentage >= 40;

//                     return (
//                       <tr key={s.id}>
//                         <td className="font-semibold">{s.student?.name || "N/A"}</td>
//                         <td>{s.totalObtained || 0}</td>
//                         <td><span className="badge-pct">{percentage.toFixed(1)}%</span></td>
//                         <td>
//                           <span className={`grade-pill ${grade.startsWith('A') ? 'grade-A' : grade === 'F' ? 'grade-F' : 'grade-default'}`}>
//                             {grade}
//                           </span>
//                         </td>
//                         <td>
//                           <span className={`status-tag ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                             {isPass ? "Qualified" : "Failed"}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }