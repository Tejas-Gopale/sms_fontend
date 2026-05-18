import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { getStudentHomework } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

export default function ParentHomework() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [homework, setHomework] = useState([]);
  const [filter,   setFilter]   = useState("ALL");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    const status = filter === "ALL" ? null : filter.toLowerCase();
    getStudentHomework(studentId, status)
      .then((res) => setHomework(res.data ?? []))
      .catch(() => setError("Could not load homework."))
      .finally(() => setLoading(false));
  }, [studentId, filter]);

  const getStatusColor = (s) => {
    if (!s) return "bg-gray-100 text-gray-600";
    const status = s.toLowerCase();
    if (status === "submitted") return "bg-green-100 text-green-700";
    if (status === "pending")   return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const filters = ["ALL", "PENDING", "SUBMITTED", "LATE"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">📚 Homework</h1>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
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

        {!loading && !sidLoading && !error && !sidError && (
          homework.length === 0 ? (
            <div className="flex flex-col items-center mt-20 text-slate-400 gap-3">
              <BookOpen size={48} />
              <p className="text-lg font-medium">No homework found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homework.map((hw) => (
                <div key={hw.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-blue-700">{hw.subject}</h2>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(hw.status)}`}>
                      {hw.status ? hw.status.charAt(0).toUpperCase() + hw.status.slice(1).toLowerCase() : "—"}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{hw.title}</p>
                  <p className="mt-2 text-gray-600 text-sm">{hw.description}</p>
                  <p className="text-gray-500 mt-3 text-sm">👨‍🏫 Teacher: {hw.teacherName}</p>
                  <p className="text-gray-600 mt-1 text-sm">📅 Due Date: <span className="font-medium">{hw.dueDate}</span></p>
                  {hw.submission && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
                      ✅ Submitted on {hw.submission.submittedDate}
                      {hw.submission.marks != null && (
                        <span> · Marks: {hw.submission.marks}/{hw.submission.totalMarks}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      View Details
                    </button>
                    {hw.attachments?.length > 0 && (
                      <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 text-slate-700">
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
