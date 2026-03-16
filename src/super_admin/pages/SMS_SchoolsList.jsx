import SuperAdminSidebar from "../components/SuperAdminSidebar";

export default function Schools() {

  return (

    <div className="flex">

      <SuperAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Schools
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
            Add School
          </button>

          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">School Name</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Board</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="p-3">Vidhay Vikas Public School</td>
                <td className="p-3">27261000805</td>
                <td className="p-3">CBSE</td>
                <td className="p-3 text-green-600">Active</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}