import ParentSidebar from "../components/ParentSidebar";

export default function ParentSettings() {

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="bg-white p-6 rounded-xl shadow max-w-md">

          <label className="block mb-2">Parent Name</label>
          <input className="w-full border p-2 mb-4 rounded"/>

          <label className="block mb-2">Email</label>
          <input className="w-full border p-2 mb-4 rounded"/>

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );
}