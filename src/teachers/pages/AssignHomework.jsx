import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function AssignHomework() {

  const [formData, setFormData] = useState({
    className: "10-A",
    subject: "Math",
    title: "",
    description: "",
    dueDate: ""
  });

  const classes = ["10-A", "10-B", "9-A"];
  const subjects = ["Math", "Science", "English"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log("Homework Data:", formData);

    // 👉 Later API call here
    // await axios.post("/api/homework", formData)

    alert("Homework Assigned & Students Notified 📧");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <TeacherSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        <h2 className="text-2xl font-bold mb-6">
          Assign Homework
        </h2>

        <div className="bg-white p-6 rounded-xl shadow max-w-2xl">

          {/* CLASS + SUBJECT */}
          <div className="flex gap-4 mb-4">

            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            >
              {classes.map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>

            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            >
              {subjects.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>

          </div>

          {/* TITLE */}
          <input
            type="text"
            name="title"
            placeholder="Homework Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-4"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Write homework details..."
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full border px-3 py-2 rounded mb-4"
          />

          {/* DUE DATE */}
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded mb-4 w-full"
          />

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Assign Homework
          </button>

        </div>

      </div>
    </div>
  );
}