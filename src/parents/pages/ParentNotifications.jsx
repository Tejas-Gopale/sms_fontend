import ParentSidebar from "../components/ParentSidebar";

export default function ParentNotifications() {

  const notifications = [
    "School will remain closed on Monday.",
    "Annual sports day on 25 March.",
    "Fee payment reminder."
  ];

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <ul className="space-y-3">

            {notifications.map((n, i) => (

              <li key={i} className="border-b pb-2">
                {n}
              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>

  );
}