import SchoolAdminSidebar from "../components/SchoolAdminSidebar";

export default function Notifications() {

  return (

    <div className="flex">
      <SchoolAdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Notifications
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <textarea
            placeholder="Write notification..."
            className="border p-3 w-full mb-4"
          />

          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Send Notification
          </button>

        </div>

      </div>

    </div>

  );
}