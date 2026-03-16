import ParentSidebar from "../components/ParentSidebar";

export default function ParentRemarks() {

  const remarks = [
    {
      teacher: "Mrs. Sharma",
      subject: "Mathematics",
      date: "12 Aug 2025",
      remark: "Rahul is very active in class and participates regularly.",
      type: "Positive"
    },
    {
      teacher: "Mr. Verma",
      subject: "English",
      date: "15 Aug 2025",
      remark: "Needs improvement in homework submission.",
      type: "Improvement"
    },
    {
      teacher: "Mrs. Kapoor",
      subject: "Science",
      date: "20 Aug 2025",
      remark: "Excellent performance in the recent unit test.",
      type: "Positive"
    }
  ];

  return (
    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">Teacher Remarks</h1>

        <div className="space-y-5">

          {remarks.map((r, i) => (

            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >

              {/* Header */}
              <div className="flex justify-between items-center mb-3">

                <div>
                  <h2 className="font-semibold text-lg">{r.subject}</h2>
                  <p className="text-sm text-gray-500">
                    {r.teacher} • {r.date}
                  </p>
                </div>

                {/* Status Badge */}
                {r.type === "Positive" ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Positive
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Needs Improvement
                  </span>
                )}

              </div>

              {/* Remark Text */}
              <p className="text-gray-700">{r.remark}</p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}