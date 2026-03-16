import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import API from "../../common/services/api";

export default function Students() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {

      const res = await API.get("/super-admin/getAllStudentsList"); // change if your endpoint differs

      setStudents(res.data);

    } catch (error) {

      console.error("Error fetching students", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (

    <div className="flex">

      <SuperAdminSidebar/>

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Students Overview
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-lg">

          {loading ? (

            <div className="text-center py-10 text-gray-500">
              Loading students...
            </div>

          ) : (

            <table className="w-full border-collapse">

              <thead>
                <tr className="border-b bg-gray-100 text-gray-700">
                  <th className="p-4 text-left">Student Name</th>
                  <th className="p-4 text-left">Admission No</th>
                  <th className="p-4 text-left">Roll No</th>
                  <th className="p-4 text-left">Gender</th>
                  <th className="p-4 text-left">School</th>
                  <th className="p-4 text-left">Section</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>

                {students.map((student) => (

                  <tr
                    key={student.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="p-4 font-medium">
                      {student.firstName} {student.lastName}
                    </td>

                    <td className="p-4">
                      {student.admissionNumber}
                    </td>

                    <td className="p-4">
                      {student.rollNumber ?? "Not Assigned"}
                    </td>

                    <td className="p-4 capitalize">
                      {student.gender}
                    </td>

                    <td className="p-4">
                      {student.user?.school_Identity?.schoolName}
                    </td>

                    <td className="p-4">
                      {student.section}
                    </td>

                    <td className="p-4">

                      {student.active ? (

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Active
                        </span>

                      ) : (

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          Inactive
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );
}