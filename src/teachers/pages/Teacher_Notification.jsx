import TeacherSidebar from "../components/Teacher_Sidebar";

export default function Notifications() {

  const notifications = [
    { id: 1, text: "New Homework Assigned to Class 10-A" },
    { id: 2, text: "Staff Meeting at 2 PM" },
    { id: 3, text: "Exam Schedule Updated" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>

        <div className="bg-white rounded-xl shadow p-4">

          {notifications.map((n) => (
            <div key={n.id} className="border-b py-3">
              {n.text}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}