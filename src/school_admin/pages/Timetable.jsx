import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Timetable() {

  return (

    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Timetable
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Timetable management will appear here.
          </p>

        </div>

      </div>

    </div>

  );
}