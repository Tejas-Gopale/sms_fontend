import { motion } from "framer-motion";

export default function StudentTable({ students, loading }) {

  if (loading) {
    return <p className="text-gray-500">Loading students...</p>;
  }

  if (!students.length) {
    return <p className="text-gray-500">No students found.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-auto max-h-[600px]">

        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-gray-600 text-left">

              <th className="p-3">Name</th>
              <th className="p-3">Admission No</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Section</th>
              <th className="p-3">Roll No</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>

            </tr>
          </thead>

          {/* BODY */}
          <tbody>

            {students.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-t hover:bg-gray-50 transition"
              >

                <td className="p-3 font-medium">
                  {student.firstName} {student.lastName}
                </td>

                <td className="p-3">
                  {student.admissionNumber}
                </td>

                <td className="p-3">
                  {student.gender}
                </td>

                <td className="p-3">
                  {student.section}
                </td>

                <td className="p-3">
                  {student.rollNumber}
                </td>

                <td className="p-3">
                  {student.user?.email}
                </td>

                {/* STATUS */}
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded ${
                    student.active
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {student.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* ACTION */}
                <td className="p-3 text-center">
                  <button className="text-blue-600 hover:underline text-sm">
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
// import StudentCard from "./StudentCard";

// export default function StudentTable({ students, loading }) {

//   if (loading) {
//     return <p className="text-gray-500">Loading students...</p>;
//   }

//   if (!students.length) {
//     return <p className="text-gray-500">No students found.</p>;
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//       {students.map((student) => (
//         <StudentCard key={student.id} student={student} />
//       ))}

//     </div>
//   );
// }