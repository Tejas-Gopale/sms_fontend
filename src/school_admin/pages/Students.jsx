import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Students() {

  return (

    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Students
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <button className="bg-green-500 text-white px-4 py-2 rounded mb-4">
            Add Student
          </button>

          <p className="text-gray-500">
            Students list will appear here.
          </p>

        </div>

      </div>

    </div>

  );
}