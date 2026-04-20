import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import "../styles/Exam.css"; 
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