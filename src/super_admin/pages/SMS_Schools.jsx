import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { Plus, Search, Pencil } from "lucide-react";
import API from "../../common/services/api";

export default function Schools() {

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {

      const res = await API.get("super-admin/getAllSchoolList");
      
      setSchools(res.data);

    } catch (error) {

      console.error("Error fetching schools", error);

    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter((school) =>
    school.schoolName.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="flex">

      <SuperAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Schools Management
            </h1>
            <p className="text-gray-500">
              Manage all registered schools
            </p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105">

            <Plus size={18} />
            Add School

          </button>

        </div>

        {/* SEARCH BAR */}

        <div className="bg-white p-4 rounded-xl shadow mb-6 flex items-center gap-3">

          <Search className="text-gray-400" />

          <input
            type="text"
            placeholder="Search school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading Schools...
            </div>
          ) : (

            <table className="w-full">

              <thead>

                <tr className="bg-gray-50 text-gray-600 text-sm">

                  <th className="p-4 text-left">School Name</th>
                  <th className="p-4 text-left">School Code</th>
                  <th className="p-4 text-left">Board</th>
                  <th className="p-4 text-left">City</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredSchools.map((school) => (

                  <tr
                    key={school.id}
                    className="border-t hover:bg-gray-50 transition duration-200"
                  >

                    <td className="p-4 font-medium">
                      {school.schoolName}
                    </td>

                    <td className="p-4">
                      {school.schoolCode}
                    </td>

                    <td className="p-4">
                      {school.boardType}
                    </td>

                    <td className="p-4">
                      {school.city}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium
                          ${school.active
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                          }`}
                      >
                        {school.active ? "Active" : "Inactive"}
                      </span>

                    </td>

                    <td className="p-4">

                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition">

                        <Pencil size={16} />
                        Update

                      </button>

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