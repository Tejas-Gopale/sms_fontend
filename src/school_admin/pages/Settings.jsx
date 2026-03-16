import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Settings() {

  return (

    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Settings
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <input
            type="text"
            placeholder="School Name"
            className="border p-3 w-full mb-3"
          />

          <input
            type="email"
            placeholder="School Email"
            className="border p-3 w-full mb-3"
          />

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Settings
          </button>

        </div>

      </div>

    </div>

  );
}