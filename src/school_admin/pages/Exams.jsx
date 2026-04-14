import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { 
  Search, Calculator, FileUp, Calendar, 
  ListChecks, LayoutDashboard, Database, RefreshCcw 
} from "lucide-react";

export default function Results() {
  const [activeTab, setActiveTab] = useState("view"); // view | schedule | upload
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= DATA FETCHING =================

  useEffect(() => {
    const init = async () => {
      try {
        const [exRes, clRes] = await Promise.all([
          API.get("/exam/all"),
          API.get("/school-admin/getClassRoom", { params: { page: 0, size: 100 } })
        ]);
        setExams(exRes.data || []);
        setClasses(clRes.data.content || []);
      } catch (err) {
        console.error("Initial Load Error:", err);
      }
    };
    init();
  }, []);

  const fetchData = async () => {
    if (!selectedExamId) return alert("Please select an Examination");
    
    setLoading(true);
    try {
      if (activeTab === "view") {
        if (!selectedClassId) return alert("Select a class to view results");
        const res = await API.get(`/result/class?examId=${selectedExamId}&classId=${selectedClassId}`);
        setStudents(res.data || []);
      } else if (activeTab === "schedule") {
        const res = await API.get(`/exam-schedule/${selectedExamId}`);
        setSchedule(res.data || []);
      }
    } catch (err) {
      alert("Failed to fetch data" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAll = async () => {
    if (!selectedExamId || !selectedClassId) return alert("Select Exam & Class");
    setLoading(true);
    try {
      await API.post(`/result/calculate-all?examId=${selectedExamId}&classId=${selectedClassId}`);
      alert("All results calculated successfully! ✅");
      fetchData();
    } catch (err) {
      alert("Calculation failed" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (endpoint) => {
    if (!file) return alert("Please select an Excel file");
    if (!selectedExamId) return alert("Select an Exam first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", selectedExamId);
    if (selectedClassId) formData.append("classId", selectedClassId);

    try {
      setLoading(true);
      await API.post(endpoint, formData);
      alert("Upload Successful! ✅");
      setFile(null);
      fetchData();
    } catch (err) {
      alert("Upload Failed" + (err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    } finally {
      setLoading(false);
    }
  };

  // ================= UI RENDER =================

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .dashboard-container {
          display: flex;
          background: #f1f5f9;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* --- Page Header --- */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .title-section h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .title-section p {
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* --- Tab System --- */
        .tab-nav {
          display: flex;
          background: #e2e8f0;
          padding: 0.25rem;
          border-radius: 0.75rem;
          gap: 0.25rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: white;
          color: #4f46e5;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* --- Filter Bar --- */
        .filter-card {
          background: white;
          padding: 1.25rem;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .form-select {
          flex: 1;
          min-width: 200px;
          padding: 0.625rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          background-color: #f8fafc;
        }

        .form-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

        /* --- Buttons --- */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary { background: #4f46e5; color: white; }
        .btn-primary:hover { background: #4338ca; }
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover { background: #059669; }
        .btn-ghost { background: white; border: 1px solid #e2e8f0; color: #475569; }
        .btn-ghost:hover { background: #f8fafc; }

        /* --- Content Card --- */
        .content-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h2 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }

        /* --- Tables --- */
        .table-responsive { width: 100%; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f8fafc; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #f1f5f9; }
        td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.875rem; }
        tr:hover { background: #f8fafc; }

        .grade-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.75rem;
        }
        .grade-A { background: #dcfce7; color: #166534; }
        .grade-F { background: #fee2e2; color: #991b1b; }
        .grade-default { background: #e0e7ff; color: #3730a3; }

        /* --- Upload View --- */
        .upload-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }

        .upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          transition: border-color 0.2s;
        }

        .upload-box:hover { border-color: #4f46e5; }
        .upload-box h3 { margin-bottom: 1rem; color: #1e293b; }
        
        .file-input { margin-bottom: 1rem; width: 100%; font-size: 0.875rem; }

        .loader {
          width: 1.25rem; height: 1.25rem;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="dashboard-container">
        <SchoolAdminSidebar />

        <main className="main-content">
          <div className="page-header">
            <div className="title-section">
              <h1>Academic Hub</h1>
              <p>Manage examinations, schedules, and grade processing.</p>
            </div>

            <nav className="tab-nav">
              <button 
                className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => setActiveTab('view')}
              >
                <LayoutDashboard size={18} /> Results
              </button>
              <button 
                className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <Calendar size={18} /> Schedule
              </button>
              <button 
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Database size={18} /> Bulk Data
              </button>
            </nav>
          </div>

          {/* GLOBAL FILTERS */}
          <div className="filter-card">
            <select 
              className="form-select" 
              value={selectedExamId} 
              onChange={e => setSelectedExamId(e.target.value)}
            >
              <option value="">— Select Examination —</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
            </select>

            <select 
              className="form-select" 
              value={selectedClassId} 
              onChange={e => setSelectedClassId(e.target.value)}
            >
              <option value="">— Select Class —</option>
              {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.grade} {cl.section}</option>)}
            </select>

            <button className="btn btn-primary" onClick={fetchData} disabled={loading}>
              {loading ? <div className="loader" /> : <Search size={18} />} Load Data
            </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="content-card">
            
            {/* VIEW 1: RESULTS */}
            {activeTab === 'view' && (
              <>
                <div className="card-header">
                  <h2>Class Performance List</h2>
                  <button className="btn btn-success" onClick={handleCalculateAll}>
                    <Calculator size={18} /> Calculate All Results
                  </button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? students.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '600' }}>{s.student?.name}</td>
                          <td>{s.totalObtained}</td>
                          <td>{s.percentage?.toFixed(1)}%</td>
                          <td>
                            <span className={`grade-badge ${s.grade?.startsWith('A') ? 'grade-A' : s.grade === 'F' ? 'grade-F' : 'grade-default'}`}>
                              {s.grade}
                            </span>
                          </td>
                          <td style={{ color: s.percentage >= 40 ? '#059669' : '#dc2626', fontWeight: '700' }}>
                            {s.percentage >= 40 ? 'PASS' : 'FAIL'}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>No result data found. Please select filters and load.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VIEW 2: SCHEDULE */}
            {activeTab === 'schedule' && (
              <>
                <div className="card-header">
                  <h2>Examination Timetable</h2>
                  <button className="btn btn-ghost" onClick={fetchData}>
                    <RefreshCcw size={16} /> Refresh
                  </button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Max Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.length > 0 ? schedule.map(sc => (
                        <tr key={sc.id}>
                          <td style={{ fontWeight: '600' }}>{sc.subjectName}</td>
                          <td>{sc.examDate}</td>
                          <td>{sc.startTime} - {sc.endTime}</td>
                          <td>{sc.maxMarks}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>No schedule found for this exam.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VIEW 3: UPLOAD */}
            {activeTab === 'upload' && (
              <div className="upload-grid">
                <div className="upload-box">
                  <FileUp size={40} color="#4f46e5" style={{marginBottom: '1rem'}} />
                  <h3>Bulk Marks Upload</h3>
                  <p style={{fontSize: '0.815rem', color: '#64748b', marginBottom: '1.5rem'}}>Upload student marks for specific class/exam via Excel.</p>
                  <input type="file" className="file-input" onChange={e => setFile(e.target.files[0])} />
                  <button className="btn btn-primary" style={{width: '100%'}} onClick={() => handleUpload("/result/upload-excel")}>
                    Import Results
                  </button>
                </div>

                <div className="upload-box">
                  <Calendar size={40} color="#10b981" style={{marginBottom: '1rem'}} />
                  <h3>Bulk Schedule Upload</h3>
                  <p style={{fontSize: '0.815rem', color: '#64748b', marginBottom: '1.5rem'}}>Upload dates and subjects for the entire examination.</p>
                  <input type="file" className="file-input" onChange={e => setFile(e.target.files[0])} />
                  <button className="btn btn-success" style={{width: '100%'}} onClick={() => handleUpload("/exam-schedule/upload-exam-schedule")}>
                    Import Schedule
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
// import { useEffect, useState } from "react";
// import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
// import API from "../../common/services/api";
// import { Search, Calculator, FileUp } from "lucide-react";

// export default function Results() {

//   const [exams, setExams] = useState([]);
//   const [classes, setClasses] = useState([]);

//   const [selectedExamId, setSelectedExamId] = useState("");
//   const [selectedClassId, setSelectedClassId] = useState("");

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

//   // ================= LOAD DATA =================

//   const fetchExams = async () => {
//     const res = await API.get("/exam/all");
//     const data = res.data || [];
//     setExams(data);

//     if (data.length > 0) {
//       setSelectedExamId(data[0].id);
//     }
//   };

//   const fetchClasses = async () => {
//     const res = await API.get("/school-admin/getClassRoom", {
//       params: { page: 0, size: 100 }
//     });

//     const data = res.data.content || [];
//     setClasses(data);

//     if (data.length > 0) {
//       setSelectedClassId(data[0].id);
//     }
//   };

//   useEffect(() => {
//     fetchExams();
//     fetchClasses();
//   }, []);

//   // ================= RESULTS =================

//   const fetchResults = async () => {
//     if (!selectedExamId || !selectedClassId) {
//       alert("Select exam & class");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await API.get(
//         `/result/class?examId=${selectedExamId}&classId=${selectedClassId}`
//       );

//       setStudents(res.data || []);

//     } catch (err) {
//       console.error(err);
//       alert("Failed to load results");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateResults = async () => {
//     if (!selectedExamId || !selectedClassId) {
//       alert("Select exam & class");
//       return;
//     }

//     try {
//       await API.post(
//         `/result/calculate-all?examId=${selectedExamId}&classId=${selectedClassId}`
//       );

//       alert("Calculated ✅");
//       fetchResults();
//     } catch (err) {
//       console.error(err);
//       alert("Calculation Failed");
//     }
//   };

//   // ================= EXCEL =================

//   const uploadExcel = async () => {
//     if (!file) return alert("Select file");
//     if (!selectedExamId || !selectedClassId)
//       return alert("Select exam & class");

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("examId", selectedExamId);
//     formData.append("classId", selectedClassId);

//     try {
//       await API.post("/result/upload-excel", formData);

//       alert("Uploaded ✅");
//       fetchResults();
//     } catch (err) {
//       console.error(err);
//       alert("Upload Failed");
//     }
//   };

//   // ================= UI =================

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

//     <div className="res-page">
//       <SchoolAdminSidebar />

//       <div className="res-main">

//         {/* HEADER */}
//         <div className="res-header">
//           <div className="res-title-block">
//             <h1>📊 Result Management</h1>
//             <div className="res-subtitle">
//               Process grades, calculate standings & upload data
//             </div>
//           </div>
//         </div>

//         {/* ACTION BAR */}
//         <div className="res-controls">

//           {/* ✅ EXAM */}
//           <select
//             className="res-select"
//             value={selectedExamId}
//             onChange={(e) => setSelectedExamId(e.target.value)}
//           >
//             <option value="">— Select Examination —</option>
//             {exams.map((exam) => (
//               <option key={exam.id} value={exam.id}>
//                 {exam.examName}
//               </option>
//             ))}
//           </select>

//           {/* ✅ CLASS (ADDED) */}
//           <select
//             className="res-select"
//             value={selectedClassId}
//             onChange={(e) => setSelectedClassId(e.target.value)}
//           >
//             <option value="">— Select Class —</option>
//             {classes.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.grade} - {c.section}
//               </option>
//             ))}
//           </select>

//           {/* LOAD */}
//           <button
//             className="btn-base btn-primary"
//             onClick={fetchResults}
//             disabled={loading}
//           >
//             {loading ? <div className="spinner" /> : <Search size={16} />}
//             Load Results
//           </button>

//           {/* CALCULATE */}
//           <button
//             className="btn-base btn-success"
//             onClick={calculateResults}
//             disabled={loading}
//           >
//             <Calculator size={16} /> Calculate All
//           </button>

//           <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

//           {/* FILE */}
//           <div className="file-input-wrapper">
//             <button className="btn-base btn-outline">
//               <FileUp size={16} /> {file ? file.name : "Select Excel"}
//             </button>
//             <input
//               type="file"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//           </div>

//           {/* UPLOAD */}
//           <button
//             className="btn-base bg-purple-600 text-white hover:bg-purple-700"
//             onClick={uploadExcel}
//           >
//             Upload Data
//           </button>
//         </div>

//         {/* TABLE */}
//         <div className="res-card">
//           <table>
//             <thead>
//               <tr>
//                 <th>Student Name</th>
//                 <th>Total Marks</th>
//                 <th>Percentage</th>
//                 <th>Grade</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
//                     <div className="spinner" />
//                   </td>
//                 </tr>
//               ) : students.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} style={{ padding: "60px", textAlign: "center" }}>
//                     No Data
//                   </td>
//                 </tr>
//               ) : (
//                 students.map((s) => {

//                   const percentage = s.percentage || 0;
//                   const grade = s.grade || getGrade(percentage);
//                   const isPass = percentage >= 40;

//                   return (
//                     <tr key={s.id}>
//                       <td>{s.student?.name}</td>
//                       <td>{s.totalObtained}</td>
//                       <td>{percentage.toFixed(1)}%</td>
//                       <td>{grade}</td>
//                       <td>{isPass ? "Pass" : "Fail"}</td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//       </div>
//     </div>
//     </>
//   );
// }