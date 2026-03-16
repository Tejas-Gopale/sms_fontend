import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import API from "../../common/services/api";

export default function Teachers() {

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {

      const res = await API.get("/super-admin/getAllTeacherList");

      setTeachers(res.data);

    } catch (error) {

      console.error("Error fetching teachers", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (

    <div className="flex">

      <SuperAdminSidebar/>

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Teachers Overview
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-lg">

          {loading ? (

            <div className="text-center py-10 text-gray-500">
              Loading teachers...
            </div>

          ) : (

            <table className="w-full border-collapse">

              <thead>
                <tr className="border-b bg-gray-100 text-gray-700">
                  <th className="p-4 text-left">Employee ID</th>
                  <th className="p-4 text-left">Subject</th>
                  <th className="p-4 text-left">Qualification</th>
                  <th className="p-4 text-left">Salary</th>
                  <th className="p-4 text-left">Joining Date</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>

                {teachers.map((teacher) => (

                  <tr
                    key={teacher.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="p-4 font-medium">
                      {teacher.employeeId}
                    </td>

                    <td className="p-4">
                      {teacher.subjectSpecialization ?? "N/A"}
                    </td>

                    <td className="p-4">
                      {teacher.qualification ?? "N/A"}
                    </td>

                    <td className="p-4">
                      {teacher.salary ? `₹${teacher.salary}` : "N/A"}
                    </td>

                    <td className="p-4">
                      {teacher.joiningDate ?? "N/A"}
                    </td>

                    <td className="p-4">

                      {teacher.active ? (

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