import { motion } from "framer-motion";

// 1. Destructure 'onView' from the props
export default function StudentTable({ students, loading, onView }) {

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse">Syncing student records...</p>
      </div>
    );
  }

  if (!students || !students.length) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500">No students found in this classroom.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
            <tr className="text-slate-600 text-left">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Admission No</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Section</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {students.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-t border-slate-50 hover:bg-slate-50/80 transition"
              >
                <td className="p-4 font-medium text-slate-800">
                  {student.firstName} {student.lastName}
                </td>
                <td className="p-4 text-slate-600">{student.admissionNumber}</td>
                <td className="p-4 text-slate-600 capitalize">{student.gender}</td>
                <td className="p-4 text-slate-600">{student.section || "N/A"}</td>

                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    student.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {student.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {/* 2. Call onView(student) when clicked */}
                  <button 
                    onClick={() => onView(student)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}