import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";

export default function Classes() {

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await API.get("/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  return (

    <div className="flex">

      {/* Sidebar */}
      <SchoolAdminSidebar />

      {/* Page Content */}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Classes
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <table className="w-full">

            <thead>

              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Class Name</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Class Teacher</th>
              </tr>

            </thead>

            <tbody>

              {classes.length > 0 ? (

                classes.map((c) => (

                  <tr key={c.id} className="border-b hover:bg-gray-50">

                    <td className="p-3">{c.className}</td>

                    <td className="p-3">{c.section}</td>

                    <td className="p-3">{c.teacher}</td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No classes available
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}