import { useState, useEffect } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getExamResults } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

export default function ParentResults() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [exams,        setExams]        = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getExamResults(studentId)
      .then((res) => {
        const data = res.data ?? [];
        setExams(data);
        if (data.length > 0) setSelectedExam(data[0]);
      })
      .catch(() => setError("Could not load exam results."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    const input = document.getElementById("resultCard");
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`${selectedExam?.examName ?? "Result"}.pdf`);
  };

  const getGrade = (p) => {
    if (p >= 90) return "A+";
    if (p >= 80) return "A";
    if (p >= 70) return "B";
    if (p >= 60) return "C";
    if (p >= 50) return "D";
    return "F";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-slate-800">📊 Exam Result</h1>
          <div className="flex gap-3 flex-wrap">
            {exams.length > 0 && (
              <select
                value={selectedExam?.examId ?? ""}
                onChange={(e) => {
                  const found = exams.find((x) => String(x.examId) === e.target.value);
                  setSelectedExam(found ?? null);
                }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {exams.map((exam) => (
                  <option key={exam.examId} value={exam.examId}>{exam.examName}</option>
                ))}
              </select>
            )}
            <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow text-sm">Download PDF</button>
            <button onClick={handlePrint}    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow text-sm">Print Result</button>
          </div>
        </div>

        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        )}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}

        {!loading && !sidLoading && !error && !sidError && !selectedExam && (
          <div className="flex flex-col items-center mt-20 text-slate-400 gap-3">
            <FileText size={48} /><p>No exam results found.</p>
          </div>
        )}

        {selectedExam && (
          <div id="resultCard" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            {/* Student Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-slate-800">{selectedExam.examName}</h2>
              <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                <p><strong>Student Name:</strong> {selectedExam.studentName}</p>
                <p><strong>Class:</strong> {selectedExam.className}</p>
                <p><strong>Roll Number:</strong> {selectedExam.rollNumber}</p>
                <p><strong>Academic Year:</strong> {selectedExam.academicYear}</p>
              </div>
            </div>

            {/* Marks Table */}
            <table className="w-full border mb-6 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border text-left">Subject</th>
                  <th className="p-3 border">Marks</th>
                  <th className="p-3 border">Max</th>
                  <th className="p-3 border">Grade</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedExam.subjects?.map((r, i) => (
                  <tr key={i} className="text-center border-t hover:bg-gray-50">
                    <td className="p-3 border text-left">{r.subjectName}</td>
                    <td className="p-3 border">{r.marksObtained}</td>
                    <td className="p-3 border">{r.maxMarks}</td>
                    <td className="p-3 border">{r.grade ?? getGrade((r.marksObtained / r.maxMarks) * 100)}</td>
                    <td className="p-3 border">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 text-center mb-6">
              {[
                { label: "Total",   value: `${selectedExam.totalMarks}/${selectedExam.maxMarks}` },
                { label: "%",       value: `${selectedExam.percentage ?? 0}%` },
                { label: "Grade",   value: selectedExam.grade ?? getGrade(selectedExam.percentage ?? 0) },
                { label: "Result",  value: selectedExam.result ?? (selectedExam.percentage >= 40 ? "Pass" : "Fail"), className: (selectedExam.result ?? (selectedExam.percentage >= 40 ? "Pass" : "Fail")) === "Pass" ? "text-green-600" : "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.className ?? "text-slate-800"}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {selectedExam.classRank && (
              <p className="text-sm text-slate-500 mb-4">🏆 Class Rank: <b>{selectedExam.classRank}</b></p>
            )}

            {selectedExam.teacherRemark && (
              <div>
                <h3 className="font-semibold mb-1 text-slate-700">Teacher Remark</h3>
                <p className="text-gray-600 text-sm">{selectedExam.teacherRemark}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
