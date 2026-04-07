import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { Users, UserCheck, UserX, Search, Filter, Download } from "lucide-react";
import API from "../../common/services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/super-admin/getAllStudentsList");
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

  // Simple Derived Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.active).length;
  const inactiveStudents = totalStudents - activeStudents;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students Directory</h1>
            <p className="text-gray-500 mt-1">Manage and view all students across the network.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Students" count={totalStudents} icon={<Users className="text-blue-600" />} bgColor="bg-blue-50" />
          <StatCard title="Active" count={activeStudents} icon={<UserCheck className="text-green-600" />} bgColor="bg-green-50" />
          <StatCard title="Inactive" count={inactiveStudents} icon={<UserX className="text-red-600" />} bgColor="bg-red-50" />
        </div>

        {/* TABLE CONTROLS */}
        <div className="bg-white rounded-t-xl border-x border-t border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or admission no..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Fetching student records...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">School</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{student.admissionNumber}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {student.rollNumber ?? "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm capitalize text-gray-600">{student.gender}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-[180px] truncate">
                        {student.user?.school_Identity?.schoolName || "—"}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{student.section}</td>
                      <td className="p-4">
                        {student.active ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No students found in the database.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ title, count, icon, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import SuperAdminSidebar from "../components/SuperAdminSidebar";
// import API from "../../common/services/api";

// export default function Students() {

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchStudents = async () => {
//     try {

//       const res = await API.get("/super-admin/getAllStudentsList"); // change if your endpoint differs

//       setStudents(res.data);

//     } catch (error) {

//       console.error("Error fetching students", error);

//     } finally {

//       setLoading(false);

//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   return (

//     <div className="flex">

//       <SuperAdminSidebar/>

//       <div className="flex-1 p-8 bg-gray-100 min-h-screen">

//         <h1 className="text-3xl font-bold mb-6">
//           Students Overview
//         </h1>

//         <div className="bg-white p-6 rounded-xl shadow-lg">

//           {loading ? (

//             <div className="text-center py-10 text-gray-500">
//               Loading students...
//             </div>

//           ) : (

//             <table className="w-full border-collapse">

//               <thead>
//                 <tr className="border-b bg-gray-100 text-gray-700">
//                   <th className="p-4 text-left">Student Name</th>
//                   <th className="p-4 text-left">Admission No</th>
//                   <th className="p-4 text-left">Roll No</th>
//                   <th className="p-4 text-left">Gender</th>
//                   <th className="p-4 text-left">School</th>
//                   <th className="p-4 text-left">Section</th>
//                   <th className="p-4 text-left">Status</th>
//                 </tr>
//               </thead>

//               <tbody>

//                 {students.map((student) => (

//                   <tr
//                     key={student.id}
//                     className="border-b hover:bg-gray-50 transition"
//                   >

//                     <td className="p-4 font-medium">
//                       {student.firstName} {student.lastName}
//                     </td>

//                     <td className="p-4">
//                       {student.admissionNumber}
//                     </td>

//                     <td className="p-4">
//                       {student.rollNumber ?? "Not Assigned"}
//                     </td>

//                     <td className="p-4 capitalize">
//                       {student.gender}
//                     </td>

//                     <td className="p-4">
//                       {student.user?.school_Identity?.schoolName}
//                     </td>

//                     <td className="p-4">
//                       {student.section}
//                     </td>

//                     <td className="p-4">

//                       {student.active ? (

//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
//                           Active
//                         </span>

//                       ) : (

//                         <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
//                           Inactive
//                         </span>

//                       )}

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