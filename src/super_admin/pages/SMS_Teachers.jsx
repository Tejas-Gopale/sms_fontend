import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { UserCheck, UserX, Briefcase, GraduationCap, Calendar, Search, Plus, User } from "lucide-react";
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
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teachers Overview</h1>
            <p className="text-gray-500 mt-1">Manage and monitor teaching staff details and status.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Plus size={18} />
            Add Teacher
          </button>
        </div>

        {/* SEARCH & FILTER BAR (UI ONLY) */}
        <div className="bg-white p-4 rounded-t-2xl border-x border-t border-gray-200 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search teachers..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Fetching faculty list...</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-5">Employee</th>
                    <th className="p-5">Specialization</th>
                    <th className="p-5">Qualification</th>
                    <th className="p-5">Salary</th>
                    <th className="p-5">Joined</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{teacher.employeeId}</p>
                            <p className="text-xs text-gray-400">ID: {teacher.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase size={14} className="text-blue-500" />
                          {teacher.subjectSpecialization ?? "N/A"}
                        </div>
                      </td>

                      <td className="p-5 text-sm">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                          {teacher.qualification ?? "N/A"}
                        </span>
                      </td>

                      <td className="p-5">
                        <p className="text-sm font-bold text-gray-900">
                          {teacher.salary ? `₹${teacher.salary.toLocaleString()}` : "N/A"}
                        </p>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {teacher.joiningDate ?? "N/A"}
                        </div>
                      </td>

                      <td className="p-5">
                        {teacher.active ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
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
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No teacher records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import SuperAdminSidebar from "../components/SuperAdminSidebar";
// import API from "../../common/services/api";

// export default function Teachers() {

//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTeachers = async () => {
//     try {

//       const res = await API.get("/super-admin/getAllTeacherList");

//       setTeachers(res.data);

//     } catch (error) {

//       console.error("Error fetching teachers", error);

//     } finally {

//       setLoading(false);

//     }
//   };

//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   return (

//     <div className="flex">

//       <SuperAdminSidebar/>

//       <div className="flex-1 p-8 bg-gray-100 min-h-screen">

//         <h1 className="text-3xl font-bold mb-6">
//           Teachers Overview
//         </h1>

//         <div className="bg-white p-6 rounded-xl shadow-lg">

//           {loading ? (

//             <div className="text-center py-10 text-gray-500">
//               Loading teachers...
//             </div>

//           ) : (

//             <table className="w-full border-collapse">

//               <thead>
//                 <tr className="border-b bg-gray-100 text-gray-700">
//                   <th className="p-4 text-left">Employee ID</th>
//                   <th className="p-4 text-left">Subject</th>
//                   <th className="p-4 text-left">Qualification</th>
//                   <th className="p-4 text-left">Salary</th>
//                   <th className="p-4 text-left">Joining Date</th>
//                   <th className="p-4 text-left">Status</th>
//                 </tr>
//               </thead>

//               <tbody>

//                 {teachers.map((teacher) => (

//                   <tr
//                     key={teacher.id}
//                     className="border-b hover:bg-gray-50 transition"
//                   >

//                     <td className="p-4 font-medium">
//                       {teacher.employeeId}
//                     </td>

//                     <td className="p-4">
//                       {teacher.subjectSpecialization ?? "N/A"}
//                     </td>

//                     <td className="p-4">
//                       {teacher.qualification ?? "N/A"}
//                     </td>

//                     <td className="p-4">
//                       {teacher.salary ? `₹${teacher.salary}` : "N/A"}
//                     </td>

//                     <td className="p-4">
//                       {teacher.joiningDate ?? "N/A"}
//                     </td>

//                     <td className="p-4">

//                       {teacher.active ? (

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