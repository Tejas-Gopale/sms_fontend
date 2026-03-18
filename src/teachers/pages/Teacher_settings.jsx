import { useState } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";

export default function Settings() {

  const [form, setForm] = useState({
    name: "Rajesh Kumar",
    email: "rajesh@gmail.com",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Updated:", form);
    alert("Profile Updated ✅");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        <div className="bg-white p-6 rounded-xl shadow max-w-md">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded"
            placeholder="Name"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded"
            placeholder="Email"
          />

          <input
            name="password"
            type="password"
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded"
            placeholder="New Password"
          />

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
}