import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Exams() {

  return (

    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Exam Management
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Exam
          </button>

        </div>

      </div>

    </div>

  );
}