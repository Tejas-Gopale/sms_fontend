import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function StudentRemarks() {

  const [remarks, setRemarks] = useState([
    { id: 1, name: "Rahul Sharma", remark: "" },
    { id: 2, name: "Priya Patel", remark: "" },
  ]);

  const handleChange = (id, value) => {
    setRemarks(remarks.map(r =>
      r.id === id ? { ...r, remark: value } : r
    ));
  };

  const handleSave = () => {
    console.log("Remarks:", remarks);
    alert("Remarks Saved ✅");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Student Remarks</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          {remarks.map((r) => (
            <div key={r.id} className="mb-4">
              <p className="font-medium">{r.name}</p>
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Write remark..."
                value={r.remark}
                onChange={(e) => handleChange(r.id, e.target.value)}
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Remarks
          </button>
        </div>
      </div>
    </div>
  );
}