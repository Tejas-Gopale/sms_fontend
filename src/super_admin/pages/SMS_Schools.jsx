import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { Plus, Search, Pencil, School, CheckCircle, XCircle, MapPin, Globe } from "lucide-react";
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

  // Derived Stats for the UI
  const totalSchools = schools.length;
  const activeCount = schools.filter(s => s.active).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <main className="flex-1 p-8">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Schools Management
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Oversee and manage institutional registration and status.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
            <Plus size={20} />
            Add New School
          </button>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Schools" value={totalSchools} icon={<School className="text-blue-600" />} />
          <StatCard title="Active Units" value={activeCount} icon={<CheckCircle className="text-green-600" />} />
          <StatCard title="Inactive/Pending" value={totalSchools - activeCount} icon={<XCircle className="text-red-600" />} />
        </div>

        {/* ACTIONS & FILTERS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by school name, code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-gray-700 font-medium"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-semibold italic">Syncing school database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-5">School Info</th>
                    <th className="p-5">Code</th>
                    <th className="p-5">Board</th>
                    <th className="p-5">Location</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="group hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                             <School size={20} />
                          </div>
                          <span className="font-bold text-gray-800">
                            {school.schoolName}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {school.schoolCode}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <Globe size={14} className="text-gray-400" />
                          {school.boardType}
                        </div>
                      </td>
                      <td className="p-5 text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="text-gray-400" />
                          {school.city}
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset transition-all
                            ${school.active
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-red-600/20"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${school.active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          {school.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center gap-2 font-bold text-sm">
                          <Pencil size={16} />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredSchools.length === 0 && (
            <div className="py-20 text-center">
              <Search className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-medium">No schools match your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Reusable Stat Component
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        {icon}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import SuperAdminSidebar from "../components/SuperAdminSidebar";
// import { Plus, Search, Pencil } from "lucide-react";
// import API from "../../common/services/api";

// export default function Schools() {

//   const [schools, setSchools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchSchools();
//   }, []);

//   const fetchSchools = async () => {
//     try {

//       const res = await API.get("super-admin/getAllSchoolList");
      
//       setSchools(res.data);

//     } catch (error) {

//       console.error("Error fetching schools", error);

//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredSchools = schools.filter((school) =>
//     school.schoolName.toLowerCase().includes(search.toLowerCase())
//   );

//   return (

//     <div className="flex">

//       <SuperAdminSidebar />

//       <div className="flex-1 p-6 bg-gray-100 min-h-screen">

//         {/* HEADER */}

//         <div className="flex justify-between items-center mb-6">

//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">
//               Schools Management
//             </h1>
//             <p className="text-gray-500">
//               Manage all registered schools
//             </p>
//           </div>

//           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105">

//             <Plus size={18} />
//             Add School

//           </button>

//         </div>

//         {/* SEARCH BAR */}

//         <div className="bg-white p-4 rounded-xl shadow mb-6 flex items-center gap-3">

//           <Search className="text-gray-400" />

//           <input
//             type="text"
//             placeholder="Search school..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full outline-none"
//           />

//         </div>

//         {/* TABLE */}

//         <div className="bg-white rounded-xl shadow overflow-hidden">

//           {loading ? (
//             <div className="p-10 text-center text-gray-500">
//               Loading Schools...
//             </div>
//           ) : (

//             <table className="w-full">

//               <thead>

//                 <tr className="bg-gray-50 text-gray-600 text-sm">

//                   <th className="p-4 text-left">School Name</th>
//                   <th className="p-4 text-left">School Code</th>
//                   <th className="p-4 text-left">Board</th>
//                   <th className="p-4 text-left">City</th>
//                   <th className="p-4 text-left">Status</th>
//                   <th className="p-4 text-left">Actions</th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {filteredSchools.map((school) => (

//                   <tr
//                     key={school.id}
//                     className="border-t hover:bg-gray-50 transition duration-200"
//                   >

//                     <td className="p-4 font-medium">
//                       {school.schoolName}
//                     </td>

//                     <td className="p-4">
//                       {school.schoolCode}
//                     </td>

//                     <td className="p-4">
//                       {school.boardType}
//                     </td>

//                     <td className="p-4">
//                       {school.city}
//                     </td>

//                     <td className="p-4">

//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-medium
//                           ${school.active
//                             ? "bg-green-100 text-green-600"
//                             : "bg-red-100 text-red-600"
//                           }`}
//                       >
//                         {school.active ? "Active" : "Inactive"}
//                       </span>

//                     </td>

//                     <td className="p-4">

//                       <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition">

//                         <Pencil size={16} />
//                         Update

//                       </button>

//                     </td>

//                   </tr>

//                 ))}

//               </tbody>

//             </table>

//           )}

//         </div>

//       </div>

//     </div>

//   );
// }