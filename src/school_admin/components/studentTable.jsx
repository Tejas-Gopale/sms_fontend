import StudentCard from "./StudentCard";

export default function StudentTable({ students, loading }) {

  if (loading) {
    return <p className="text-gray-500">Loading students...</p>;
  }

  if (!students.length) {
    return <p className="text-gray-500">No students found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}

    </div>
  );
}