import SuperAdminSidebar from "../components/SuperAdminSidebar";

export default function Subscriptions() {

  const subscriptions = [
    {
      school: "Vidhay Vikas Public School",
      plan: "Premium",
      expiry: "31 Dec 2026",
      status: "Active"
    },
    {
      school: "Green Valley School",
      plan: "Standard",
      expiry: "15 Oct 2026",
      status: "Active"
    },
    {
      school: "Sunrise International",
      plan: "Basic",
      expiry: "10 Jun 2025",
      status: "Expired"
    },
    {
      school: "Oxford Public School",
      plan: "Premium",
      expiry: "05 Jan 2027",
      status: "Active"
    },
    {
      school: "Little Flower School",
      plan: "Standard",
      expiry: "01 Mar 2026",
      status: "Expiring Soon"
    }
  ];

  const getStatusStyle = (status) => {
    if (status === "Active")
      return "bg-green-100 text-green-700";
    if (status === "Expired")
      return "bg-red-100 text-red-600";
    if (status === "Expiring Soon")
      return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="flex">

      <SuperAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Subscriptions
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Total Schools</h2>
            <p className="text-3xl font-bold mt-2">25</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Active Subscriptions</h2>
            <p className="text-3xl font-bold mt-2 text-green-600">18</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Expiring Soon</h2>
            <p className="text-3xl font-bold mt-2 text-yellow-600">4</p>
          </div>

        </div>

        {/* Table Section */}

        <div className="bg-white p-6 rounded-xl shadow">

          <div className="flex justify-between mb-4">

            <input
              type="text"
              placeholder="Search school..."
              className="border p-2 rounded-lg w-64"
            />

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Add Subscription
            </button>

          </div>

          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="p-3 text-left">School</th>
                <th className="p-3 text-left">Plan</th>
                <th className="p-3 text-left">Expiry</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>

              {subscriptions.map((sub, index) => (

                <tr key={index} className="border-b hover:bg-gray-50">

                  <td className="p-3 font-medium">
                    {sub.school}
                  </td>

                  <td className="p-3">
                    {sub.plan}
                  </td>

                  <td className="p-3">
                    {sub.expiry}
                  </td>

                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="p-3 space-x-2">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>

                    <button className="text-green-600 hover:underline">
                      Renew
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}