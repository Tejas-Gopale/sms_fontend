import ParentSidebar from "../components/ParentSidebar";

import {
  ClipboardCheck,
  BookOpen,
  FileText,
  MapPin
} from "lucide-react";

export default function ParentDashboard() {

  const stats = [

    {
      title: "Attendance %",
      value: "92%",
      icon: ClipboardCheck,
      color: "border-blue-500"
    },

    {
      title: "Homework Pending",
      value: 3,
      icon: BookOpen,
      color: "border-green-500"
    },

    {
      title: "Tests Completed",
      value: 5,
      icon: FileText,
      color: "border-purple-500"
    },

    {
      title: "Bus Status",
      value: "On Route",
      icon: MapPin,
      color: "border-yellow-500"
    }

  ];

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">

        <h1 className="text-3xl font-bold mb-6">
          Parent Dashboard
        </h1>

        {/* Child Summary */}

        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <h2 className="text-xl font-bold mb-2">
            Student Information
          </h2>

          <p><b>Name:</b> Rahul Sharma</p>
          <p><b>Class:</b> 7 A</p>
          <p><b>Roll Number:</b> 23</p>

        </div>

        {/* Dashboard Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((stat, index) => {

            const Icon = stat.icon;

            return (

              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow border-l-4 ${stat.color}`}
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl font-bold">
                      {stat.value}
                    </h2>

                  </div>

                  <Icon size={28} />

                </div>

              </div>

            );

          })}

        </div>

        {/* Teacher Remarks */}

        <div className="mt-8 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Latest Teacher Remarks
          </h2>

          <ul className="space-y-3">

            <li className="border-b pb-2">
              Rahul performed well in Mathematics today.
            </li>

            <li className="border-b pb-2">
              Needs improvement in Science homework.
            </li>

            <li>
              Very active in classroom discussion.
            </li>

          </ul>

        </div>

        {/* Bus Tracking */}

        <div className="mt-8 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Bus Tracking
          </h2>

          <p>Bus is currently <b>2 km away</b> from pickup location.</p>

        </div>

      </div>

    </div>

  );
}