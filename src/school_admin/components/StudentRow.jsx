import { motion } from "framer-motion";

export default function StudentRow({ student }) {

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="text-center hover:bg-gray-50 transition"
    >

      <td className="p-3 border">
        {student.firstName} {student.lastName}
      </td>

      <td className="p-3 border">
        {student.admissionNumber}
      </td>

      <td className="p-3 border">
        {student.gender}
      </td>

      <td className="p-3 border">
        {student.section}
      </td>

      <td className="p-3 border">
        {student.rollNumber}
      </td>

      <td className="p-3 border">
        {student.user?.email}
      </td>

    </motion.tr>
  );
}