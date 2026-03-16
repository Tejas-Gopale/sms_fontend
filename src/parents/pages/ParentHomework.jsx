import ParentSidebar from "../components/ParentSidebar";

export default function ParentHomework() {

  const homework = [
    {
      subject: "Mathematics",
      task: "Complete Exercise 5.1 from the textbook",
      teacher: "Mrs. Sharma",
      due: "15 Mar 2025",
      status: "Pending"
    },
    {
      subject: "Science",
      task: "Read Chapter 3 and write short notes",
      teacher: "Mr. Verma",
      due: "16 Mar 2025",
      status: "Submitted"
    },
    {
      subject: "English",
      task: "Write an essay on 'My Favorite Book'",
      teacher: "Mrs. Dutta",
      due: "18 Mar 2025",
      status: "Pending"
    }
  ];

  const getStatusColor = (status) => {
    if (status === "Submitted") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          📚 Homework
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {homework.map((hw, i) => (

            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >

              {/* Subject */}

              <div className="flex justify-between items-center">

                <h2 className="text-lg font-bold text-blue-700">
                  {hw.subject}
                </h2>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${getStatusColor(hw.status)}`}
                >
                  {hw.status}
                </span>

              </div>

              {/* Task */}

              <p className="mt-4 text-gray-700">
                {hw.task}
              </p>

              {/* Teacher */}

              <p className="text-gray-500 mt-3 text-sm">
                👨‍🏫 Teacher: {hw.teacher}
              </p>

              {/* Due Date */}

              <p className="text-gray-600 mt-2 text-sm">
                📅 Due Date: <span className="font-medium">{hw.due}</span>
              </p>

              {/* Action Buttons */}

              <div className="flex gap-3 mt-4">

                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  View Details
                </button>

                <button className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                  Download
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
} 