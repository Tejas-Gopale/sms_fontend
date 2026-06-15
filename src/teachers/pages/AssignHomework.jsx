import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API, { getClassrooms } from "../../common/services/api";
import { BookOpen, Trash2, Upload, Eye, X, Plus } from "lucide-react";

export default function AssignHomework() {
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHomework, setFetchingHomework] = useState(true);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("assign"); // assign | history

  const [formData, setFormData] = useState({
    classroomId: "",
    subjectId: "",
    title: "",
    description: "",
    dueDate: "",
    maxMarks: "",
  });

  // Fetch classrooms on mount
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const data = await getClassrooms();
        setClassrooms(data?.content || data || []);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };
    loadClassrooms();
    fetchHomeworkHistory();
  }, []);

  // Update subjects when classroom changes
  const handleClassroomChange = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, classroomId: id, subjectId: "" });
    const cls = classrooms.find((c) => String(c.id) === String(id));
    setSubjects(cls?.subjects || []);
  };

  const fetchHomeworkHistory = async () => {
    setFetchingHomework(true);
    try {
      const res = await API.get("/homework/by-teacher");
      setHomeworkList(res.data || []);
    } catch (err) {
      console.error("Error fetching homework history:", err);
    } finally {
      setFetchingHomework(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.classroomId || !formData.subjectId || !formData.title || !formData.dueDate) {
      alert("Please fill all required fields ⚠️");
      return;
    }

    setLoading(true);
    try {
      if (files.length > 0) {
        // Use multipart endpoint when files are present
        const fd = new FormData();
        fd.append("title", formData.title);
        fd.append("description", formData.description);
        fd.append("classroomId", formData.classroomId);
        fd.append("subjectId", formData.subjectId);
        fd.append("dueDate", formData.dueDate);
        if (formData.maxMarks) fd.append("maxMarks", formData.maxMarks);
        files.forEach((f) => fd.append("files", f));

        await API.post("/homework/assign-with-files", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // JSON endpoint for text-only
        await API.post("/homework/assign", {
          title: formData.title,
          description: formData.description,
          classroomId: Number(formData.classroomId),
          subjectId: Number(formData.subjectId),
          dueDate: formData.dueDate,
          maxMarks: formData.maxMarks ? Number(formData.maxMarks) : null,
        });
      }

      alert("Homework Assigned Successfully ✅");
      setFormData({ classroomId: "", subjectId: "", title: "", description: "", dueDate: "", maxMarks: "" });
      setFiles([]);
      fetchHomeworkHistory();
      setActiveTab("history");
    } catch (err) {
      console.error("Error assigning homework:", err);
      alert("Failed to assign homework ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework?")) return;
    try {
      await API.delete(`/homework/${id}`);
      setHomeworkList(homeworkList.filter((h) => h.id !== id));
    } catch (err) {
      alert("Failed to delete ❌");
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "-");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Homework Manager</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["assign", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              {tab === "assign" ? "Assign Homework" : "My Homework"}
            </button>
          ))}
        </div>

        {/* ASSIGN TAB */}
        {activeTab === "assign" && (
          <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">New Homework Assignment</h3>

            {/* Classroom + Subject */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Classroom *</label>
                <select
                  name="classroomId"
                  value={formData.classroomId}
                  onChange={handleClassroomChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject *</label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  disabled={!subjects.length}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Chapter 3 Exercise"
                value={formData.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Homework instructions..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Due Date + Max Marks */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Marks</label>
                <input
                  type="number"
                  name="maxMarks"
                  placeholder="e.g. 10"
                  value={formData.maxMarks}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">Attachments (optional)</label>
              <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 px-4 py-3 rounded cursor-pointer hover:border-blue-400 transition">
                <Upload size={18} className="text-gray-400" />
                <span className="text-gray-500 text-sm">Click to upload files (PDF, images, Word, etc.)</span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded text-sm">
                      <span className="truncate max-w-xs">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              {loading ? "Assigning..." : "Assign Homework"}
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {fetchingHomework ? (
              <div className="p-8 text-center text-gray-500">Loading homework...</div>
            ) : homeworkList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No homework assigned yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-gray-600">
                      <th className="p-3">Title</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Assigned</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Max Marks</th>
                      <th className="p-3">Files</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeworkList.map((hw) => (
                      <tr key={hw.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{hw.title}</td>
                        <td className="p-3">{hw.grade} - {hw.section}</td>
                        <td className="p-3">{hw.subjectName}</td>
                        <td className="p-3">{formatDate(hw.assignedDate)}</td>
                        <td className="p-3">
                          <span className={`${new Date(hw.dueDate) < new Date() ? "text-red-500" : "text-green-600"} font-medium`}>
                            {formatDate(hw.dueDate)}
                          </span>
                        </td>
                        <td className="p-3">{hw.maxMarks ?? "-"}</td>
                        <td className="p-3">{hw.attachments?.length ?? 0}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(hw.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}