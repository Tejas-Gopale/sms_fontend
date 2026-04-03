import { useEffect, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, LayoutGrid, Table, Upload } from "lucide-react";
import API from "../../common/services/api";

export default function Subjects() {
  const [view, setView] = useState("table");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("ALL");

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Subjects.jsx - Retrieved token:", token);
    fetchClassrooms();
  }
  , []);

  // ✅ FETCH CLASSROOMS
   const fetchClassrooms = async () => {
  try {
    const res = await API.get("/school-admin/getClassRoom");

    console.log("Fetched classrooms:", res.data);

    setClassrooms(res.data.content || []); // ✅ FIXED

  } catch (err) {
    console.error("Error fetching classrooms", err);
  }
};

  // ✅ FETCH SUBJECTS
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      console.log("Fetching subjects for classroom:", selectedClassroom);
      const res = await API.get("/classroom/getSubjectByClassRoomId", {
      params: {
        classroomId: selectedClassroom === "ALL" ? null : selectedClassroom,
        page: 0,
        size: 10,
        sortBy: "id",
        sortDir: "asc",
      },
    });
      setSubjects(res.data.content || []);
    } catch (err) {
      console.error("Error fetching subjects", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILE UPLOAD
  const handleUpload = async () => {
    if (!file) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", file);
      // classroomId = selectedClassroom === "ALL" ? null : selectedClassroom;
     
    
    try {
      await API.post("/super-admin/school-onbarding/upload-subjects", formData,{params: {
        classRoomId: selectedClassroom === "ALL" ? null : selectedClassroom,
      },
        headers : { "Content-Type": "multipart/form-data" }
    }); 
      
      console.log("Upload successful");
      alert("Upload Success");
      setShowUpload(false);
      setFile(null);

      fetchSubjects(); // refresh data
    } catch (err) {
      console.error("File cant be uploaded: " + err.message || "Upload failed", err);
      alert("Upload Failed" + (err.message ? ": " + err.message : ""));
    }
  };

  // ✅ LOAD DATA
  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedClassroom]);

  return (
    <div className="flex">
      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Subjects</h1>

          <div className="flex gap-3 items-center">

            {/* CLASS FILTER */}
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="ALL">All Classes</option>

              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Class {cls.grade} {cls.section ? `- ${cls.section}` : ""}
                </option>
              ))}
            </select>

            {/* VIEW TOGGLE */}
            <div className="flex bg-white rounded shadow-sm">
              <button
                onClick={() => setView("table")}
                className={`p-2 ${
                  view === "table" ? "bg-blue-500 text-white" : ""
                }`}
              >
                <Table size={18} />
              </button>

              <button
                onClick={() => setView("grid")}
                className={`p-2 ${
                  view === "grid" ? "bg-blue-500 text-white" : ""
                }`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[400px]">
              <h2 className="text-lg font-bold mb-4">Upload Excel</h2>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"
                >
                  <Upload size={16} /> Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="bg-white rounded shadow">

          {loading ? (
            <p className="p-4">Loading...</p>
          ) : view === "table" ? (

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id} className="border-t">
                    <td className="p-3">{sub.subjectName}</td>
                    <td className="p-3">{sub.className}</td>
                    <td className="p-3">
                      {sub.teacherName || "Not Assigned"}
                    </td>
                    <td className="p-3">
                      {sub.active ? "Active" : "Inactive"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="text-blue-600">Edit</button>
                      <button className="text-green-600">
                        Assign Teacher
                      </button>
                      <button className="text-red-600">Disable</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (

            <div className="grid grid-cols-3 gap-4 p-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="border p-4 rounded">
                  <h3 className="font-bold">{sub.subjectName}</h3>
                  <p>Class: {sub.className}</p>
                  <p>
                    Teacher: {sub.teacherName || "Not Assigned"}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button className="text-blue-600">Edit</button>
                    <button className="text-green-600">Assign</button>
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>
      </div>
    </div>
  );
}