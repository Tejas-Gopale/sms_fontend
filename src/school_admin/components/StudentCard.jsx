import { motion } from "framer-motion";

export default function StudentCard({ student, onClick }) {
  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`;
  const parent = student.parent;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white rounded-xl border p-4 hover:shadow-lg transition cursor-pointer"
    >
      {/* Student Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
          {initials}
        </div>
        <div>
          <h3 className="font-medium text-slate-800">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-xs text-gray-500">{student.studentEmail}</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p>🎓 {student.admissionNumber}</p>
        <p>📚 {student.classRoom
          ? `Grade ${student.classRoom.grade} ${student.classRoom.section || ""}`
          : student.section || "No Class"
        }</p>
        <p>🚌 Bus: {student.isUsingBus ? "Yes" : "No"}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
          student.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {student.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Parent Info */}
      {parent ? (
        <div className="border-t pt-2 mt-2 space-y-0.5">
          <p className="text-xs font-semibold text-indigo-600 mb-1">
            👨‍👩‍👧 {parent.relationType || "Parent"}
          </p>
          <p className="text-xs text-gray-700 font-medium">{parent.fullName}</p>
          <p className="text-xs text-gray-500">{parent.email}</p>
          <p className="text-xs text-gray-500">{parent.phoneNumber}</p>
        </div>
      ) : (
        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-slate-400 italic">No parent linked</p>
        </div>
      )}
    </motion.div>
  );
}