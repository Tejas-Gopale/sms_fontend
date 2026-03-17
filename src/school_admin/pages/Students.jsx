import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import StudentTable from "../components/studentTable";
import { getStudents } from "../../common/services/api";

export default function Students() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data.content);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* Header Animation */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Students
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow"
        >

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-lg font-semibold">Student List</h2>

            <button className="bg-green-500 hover:bg-green-600 transition text-white px-4 py-2 rounded-lg">
              + Add Student
            </button>

          </div>

          <StudentTable students={students} loading={loading} />

        </motion.div>

      </div>

    </div>
  );
}