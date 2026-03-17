import { motion } from "framer-motion";

export default function StudentCard({ student }) {

  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all"
    >

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
          {initials}
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-gray-500">
            {student.user?.email}
          </p>
        </div>

      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600">

        <p><span className="font-medium">Admission:</span> {student.admissionNumber}</p>
        <p><span className="font-medium">Gender:</span> {student.gender}</p>
        <p><span className="font-medium">Section:</span> {student.section}</p>
        <p><span className="font-medium">Roll No:</span> {student.rollNumber}</p>

      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center">

        <span className={`text-xs px-3 py-1 rounded-full ${
          student.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
          {student.active ? "Active" : "Inactive"}
        </span>

        <button className="text-blue-500 text-sm hover:underline">
          View
        </button>

      </div>

    </motion.div>
  );
}