import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { getTeacherRemarks } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

const CATEGORIES = ["All", "Academic", "Behavior", "Sports", "General"];

export default function ParentRemarks() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [remarks,  setRemarks]  = useState([]);
  const [category, setCategory] = useState("All");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    const cat = category === "All" ? null : category;
    getTeacherRemarks(studentId, cat)
      .then((res) => setRemarks(res.data?.remarks ?? []))
      .catch(() => setError("Could not load teacher remarks."))
      .finally(() => setLoading(false));
  }, [studentId, category]);

  const typeBadge = (type) => {
    if (!type) return "bg-gray-100 text-gray-600";
    switch (type.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-700";
      case "negative": return "bg-red-100 text-red-600";
      default:         return "bg-yellow-100 text-yellow-700";
    }
  };

  const typeLabel = (type) => {
    if (!type) return "General";
    switch (type.toLowerCase()) {
      case "positive": return "Positive";
      case "negative": return "Needs Improvement";
      default:         return "Neutral";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-indigo-600" size={28} />
            Teacher Remarks
          </h1>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  category === c
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
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
          remarks.length === 0 ? (
            <div className="flex flex-col items-center mt-20 text-slate-400 gap-3">
              <MessageSquare size={48} />
              <p className="text-lg font-medium">No remarks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {remarks.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div>
                      <h2 className="font-semibold text-lg text-slate-800">{r.subject}</h2>
                      <p className="text-sm text-slate-500">
                        {r.teacherName}
                        {r.category && <span> · {r.category}</span>}
                        {r.date    && <span> · {r.date}</span>}
                        {r.time    && <span> at {r.time}</span>}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge(r.type)}`}>
                      {typeLabel(r.type)}
                    </span>
                  </div>
                  <p className="text-slate-700">{r.remark}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
