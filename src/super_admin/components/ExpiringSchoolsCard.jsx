// src/super-admin/components/ExpiringSchoolsCard.jsx
import { AlertTriangle } from "lucide-react";

export default function ExpiringSchoolsCard() {
  const schools = [
    { name: "Sunrise Public School", city: "Mumbai", daysLeft: 5 },
    { name: "Modern Academy",        city: "Pune",   daysLeft: 2 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">Schools Near Deactivation</h2>
          <p className="text-xs text-gray-400">Subscriptions expiring soon</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pl-1">School</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">City</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Days Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {schools.map((school, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pl-1">
                  <p className="text-sm font-medium text-gray-800">{school.name}</p>
                </td>
                <td className="py-3">
                  <p className="text-sm text-gray-500">{school.city}</p>
                </td>
                <td className="py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    school.daysLeft <= 3
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }`}>
                    <AlertTriangle size={10} />
                    {school.daysLeft} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
// export default function ExpiringSchoolsCard() {

//   const schools = [
//     {
//       name: "Sunrise Public School",
//       city: "Mumbai",
//       daysLeft: 5
//     },
//     {
//       name: "Modern Academy",
//       city: "Pune",
//       daysLeft: 2
//     }
//   ];

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg">

//       <h2 className="text-xl font-bold mb-4">
//         Schools Near Deactivation
//       </h2>

//       <table className="w-full">

//         <thead>
//           <tr className="border-b text-left">
//             <th className="p-2">School</th>
//             <th className="p-2">City</th>
//             <th className="p-2">Days Left</th>
//           </tr>
//         </thead>

//         <tbody>

//           {schools.map((school, index) => (
//             <tr key={index} className="border-b">

//               <td className="p-2">{school.name}</td>
//               <td className="p-2">{school.city}</td>

//               <td className="p-2 text-red-600 font-bold">
//                 {school.daysLeft} Days
//               </td>

//             </tr>
//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// }