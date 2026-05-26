import { useEffect, useState, useCallback } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import { getClassrooms, getStudentsByClassroom } from "../../common/services/api";
import {
  markClassAttendance,
  markSingleStudentAttendance,
} from "../../common/services/attendanceService";

const todayStr = () => new Date().toISOString().split("T")[0];

const STATUS = {
  PRESENT: { label: "Present", bg: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
  ABSENT:  { label: "Absent",  bg: "bg-rose-100 text-rose-700 border-rose-300",         dot: "bg-rose-500"    },
  LEAVE:   { label: "Leave",   bg: "bg-amber-100 text-amber-700 border-amber-300",       dot: "bg-amber-400"   },
};

export default function TakeAttendance() {
  const [classrooms,          setClassrooms]          = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedSubjectId,   setSelectedSubjectId]   = useState("");
  const [subjects,            setSubjects]            = useState([]);
  const [students,            setStudents]            = useState([]);
  const [periodNumber,        setPeriodNumber]        = useState(1);
  const [date,                setDate]                = useState(todayStr());
  const [saving,              setSaving]              = useState(false);
  const [savingId,            setSavingId]            = useState(null);
  const [toast,               setToast]               = useState(null);
  const [loadingStudents,     setLoadingStudents]     = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getClassrooms()
      .then((d) => setClassrooms(d?.content || []))
      .catch(() => showToast("Failed to load classrooms", "error"));
  }, []);

  const handleClassroomChange = async (e) => {
    const id = e.target.value;
    setSelectedClassroomId(id);
    setSelectedSubjectId("");
    setStudents([]);
    const cls = classrooms.find((c) => c.id === Number(id));
    setSubjects(cls?.subjects || []);
    if (!id) return;
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClassroom(id);
      setStudents(
        (data || []).map((s) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName || ""}`.trim(),
          rollNo: s.rollNo || s.admissionNumber || "—",
          status: "PRESENT",
        }))
      );
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStatus = (id, status) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

  const markAll = (status) =>
    setStudents((prev) => prev.map((s) => ({ ...s, status })));

  const validate = useCallback(() => {
    if (!selectedClassroomId) return "Please select a classroom.";
    if (!selectedSubjectId)   return "Please select a subject.";
    if (!periodNumber)        return "Please select a period.";
    if (!date)                return "Please select a date.";
    return null;
  }, [selectedClassroomId, selectedSubjectId, periodNumber, date]);

  const handleSaveAll = async () => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSaving(true);
    try {
      await markClassAttendance(selectedClassroomId, {
        subjectId:    Number(selectedSubjectId),
        date,
        periodNumber: Number(periodNumber),
        students: students.map((s) => ({ studentId: s.id, status: s.status })),
      });
      showToast(`Attendance saved for ${students.length} students`);
    } catch (e) {
      const msg = e?.response?.data;
      showToast(typeof msg === "string" ? msg : "Failed to save attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (student) => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }
    setSavingId(student.id);
    try {
      await markSingleStudentAttendance(selectedClassroomId, student.id, {
        subjectId:    Number(selectedSubjectId),
        date,
        periodNumber: Number(periodNumber),
        status:       student.status,
      });
      showToast(`${student.name} marked ${student.status.toLowerCase()}`);
    } catch (e) {
      const msg = e?.response?.data;
      showToast(typeof msg === "string" ? msg : "Failed to save", "error");
    } finally {
      setSavingId(null);
    }
  };

  const counts = students.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />

      <div className="flex-1 p-6">

        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
            ${toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
            {toast.msg}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Take Attendance</h1>
            <p className="text-sm text-slate-500 mt-0.5">Mark for all students or individually</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                       text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow transition"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</>
              : <>💾 Save All</>}
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Classroom</label>
              <select value={selectedClassroomId} onChange={handleClassroomChange}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">Select classroom</option>
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.grade} – {cls.section}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</label>
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={subjects.length === 0}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50">
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</label>
              <select value={periodNumber} onChange={(e) => setPeriodNumber(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {[1,2,3,4,5,6,7,8].map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
              <input type="date" value={date} max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
        </div>

        {/* Summary + bulk buttons */}
        {students.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {Object.entries(counts).map(([status, count]) => (
              <span key={status}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS[status]?.bg}`}>
                <span className={`w-2 h-2 rounded-full ${STATUS[status]?.dot}`}/>
                {count} {STATUS[status]?.label}
              </span>
            ))}
            <div className="ml-auto flex gap-2">
              <button onClick={() => markAll("PRESENT")}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold transition">
                ✓ All Present
              </button>
              <button onClick={() => markAll("ABSENT")}
                className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold transition">
                ✗ All Absent
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingStudents ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
              <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/>
              Loading students…
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <div className="text-4xl mb-3">🎒</div>
              <p className="font-medium">Select a classroom to load students</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold text-center">Present</th>
                    <th className="px-4 py-3 font-semibold text-center">Absent</th>
                    <th className="px-4 py-3 font-semibold text-center">Leave</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Save One</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const cfg = STATUS[student.status];
                    const isSavingThis = savingId === student.id;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{student.name}</p>
                              <p className="text-xs text-slate-400">{student.rollNo}</p>
                            </div>
                          </div>
                        </td>
                        {["PRESENT","ABSENT","LEAVE"].map((s) => (
                          <td key={s} className="px-4 py-3 text-center">
                            <input type="radio" name={`status-${student.id}`}
                              checked={student.status === s}
                              onChange={() => toggleStatus(student.id, s)}
                              className="w-4 h-4 cursor-pointer accent-indigo-600" />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSaveSingle(student)}
                            disabled={isSavingThis || !selectedSubjectId || !selectedClassroomId}
                            className="inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5
                                       bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200
                                       rounded-lg font-semibold transition disabled:opacity-40">
                            {isSavingThis
                              ? <span className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import TeacherSidebar from "../components/Teacher_Sidebar";
// import API, {
//   getClassrooms,
//   getStudentsByClassroom,
// } from "../../common/services/api";

// export default function TakeAttendance() {

//   const [classrooms, setClassrooms] = useState([]);
//   const [selectedClassroomId, setSelectedClassroomId] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [saving, setSaving] = useState(false);

//   // 🔹 Fetch Classrooms
//   useEffect(() => {
//     const fetchClassrooms = async () => {
//       try {
//         const data = await getClassrooms();
//         setClassrooms(data?.content || []);
//       } catch (err) {
//         console.error("Error fetching classrooms:", err);
//       }
//     };

//     fetchClassrooms();
//   }, []);

//   // 🔹 Handle Classroom Change
//   const handleClassroomChange = async (e) => {
//     const classroomId = e.target.value;
//     setSelectedClassroomId(classroomId);

//     // reset
//     setSelectedSubject("");
//     setStudents([]);
//     setSubjects([]);

//     const selectedClassroom = classrooms.find(
//       (c) => c.id === Number(classroomId)
//     );

//     if (selectedClassroom) {
//       setSubjects(selectedClassroom.subjects || []);
//     }

//     // fetch students
//     try {
//       const data = await getStudentsByClassroom(classroomId);

//       const formattedStudents = (data || []).map((s) => ({
//         id: s.id,
//         name: `${s.firstName} ${s.lastName}`,
//         status: "Present",
//       }));

//       setStudents(formattedStudents);
//     } catch (err) {
//       console.error("Error fetching students:", err);
//     }
//   };

//   // 🔹 Toggle Attendance
//   const toggleStatus = (id, status) => {
//     const updated = students.map((s) =>
//       s.id === id ? { ...s, status } : s
//     );
//     setStudents(updated);
//   };

//   // 🔥 SAVE ATTENDANCE API
//   const handleSave = async () => {
//     if (!selectedClassroomId || !selectedSubject) {
//       alert("Please select classroom and subject ⚠️");
//       return;
//     }

//     try {
//       setSaving(true);

//       // find subjectId
//       const selectedSub = subjects.find(
//         (s) => s.subjectName === selectedSubject
//       );

//       const payload = {
//         subjectId: selectedSub?.id,
//         date: new Date().toISOString().split("T")[0],
//         students: students.map((s) => ({
//           studentId: s.id,
//           status: s.status === "Present" ? "PRESENT" : "ABSENT",
//         })),
//       };

//       console.log("Payload:", payload);

//       await API.post(
//         `/attendance/${selectedClassroomId}/attendance`,
//         payload
//       );

//       alert("Attendance Saved Successfully ✅");

//     } catch (err) {
//       console.error("Error saving attendance:", err);
//       alert("Failed to save attendance ❌");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       <TeacherSidebar />

//       <div className="flex-1 p-6">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Take Attendance
//           </h2>

//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//           >
//             {saving ? "Saving..." : "Save Attendance"}
//           </button>
//         </div>

//         {/* DROPDOWNS */}
//         <div className="flex gap-4 mb-6">

//           {/* CLASSROOM */}
//           <select
//             value={selectedClassroomId}
//             onChange={handleClassroomChange}
//             className="border px-3 py-2 rounded bg-white"
//           >
//             <option value="">Select Classroom</option>
//             {classrooms.map((cls) => (
//               <option key={cls.id} value={cls.id}>
//                 {cls.grade} - {cls.section}
//               </option>
//             ))}
//           </select>

//           {/* SUBJECT */}
//           <select
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             className="border px-3 py-2 rounded bg-white"
//           >
//             <option value="">Select Subject</option>
//             {subjects.map((sub) => (
//               <option key={sub.id} value={sub.subjectName}>
//                 {sub.subjectName}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           <div className="overflow-auto max-h-[65vh]">
//             <table className="w-full text-sm">

//               <thead className="bg-gray-100 sticky top-0 z-10">
//                 <tr className="text-left text-gray-600">
//                   <th className="p-3">Student Name</th>
//                   <th className="p-3 text-center">Present</th>
//                   <th className="p-3 text-center">Absent</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {students.length > 0 ? (
//                   students.map((student) => (
//                     <tr key={student.id} className="border-t hover:bg-gray-50">
//                       <td className="p-3 font-medium">
//                         {student.name}
//                       </td>

//                       <td className="p-3 text-center">
//                         <input
//                           type="radio"
//                           name={`status-${student.id}`}
//                           checked={student.status === "Present"}
//                           onChange={() =>
//                             toggleStatus(student.id, "Present")
//                           }
//                         />
//                       </td>

//                       <td className="p-3 text-center">
//                         <input
//                           type="radio"
//                           name={`status-${student.id}`}
//                           checked={student.status === "Absent"}
//                           onChange={() =>
//                             toggleStatus(student.id, "Absent")
//                           }
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="text-center p-4 text-gray-500">
//                       No students found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>

//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }