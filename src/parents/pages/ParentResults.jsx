import ParentSidebar from "../components/ParentSidebar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ParentResults() {

  const student = {
    name: "Rahul Sharma",
    class: "8-A",
    roll: "23",
    exam: "Mid Term Examination"
  };

  const results = [
    { subject: "Mathematics", marks: 85, max: 100 },
    { subject: "Science", marks: 78, max: 100 },
    { subject: "English", marks: 90, max: 100 },
    { subject: "Social Studies", marks: 82, max: 100 },
    { subject: "Computer", marks: 88, max: 100 },
  ];

  const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
  const maxMarks = results.reduce((sum, r) => sum + r.max, 0);
  const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);

  const getGrade = (p) => {
    if (p >= 90) return "A+";
    if (p >= 80) return "A";
    if (p >= 70) return "B";
    if (p >= 60) return "C";
    if (p >= 50) return "D";
    return "F";
  };

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Function
  const handleDownload = async () => {

    const input = document.getElementById("resultCard");

    const canvas = await html2canvas(input);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    pdf.save("Student_Result.pdf");

  };

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            📊 Exam Result
          </h1>

          <div className="flex gap-4">

            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              Download PDF
            </button>

            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            >
              Print Result
            </button>

          </div>

        </div>

        {/* Result Card */}

        <div
          id="resultCard"
          className="bg-white p-8 rounded-xl shadow"
        >

          {/* Student Info */}

          <div className="mb-6">

            <h2 className="text-xl font-semibold mb-3">
              {student.exam}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-gray-700">

              <p><strong>Student Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class}</p>
              <p><strong>Roll Number:</strong> {student.roll}</p>
              <p><strong>Academic Year:</strong> 2025</p>

            </div>

          </div>

          {/* Marks Table */}

          <table className="w-full border mb-6">

            <thead className="bg-gray-200">

              <tr>

                <th className="p-3 border">Subject</th>
                <th className="p-3 border">Marks Obtained</th>
                <th className="p-3 border">Maximum Marks</th>

              </tr>

            </thead>

            <tbody>

              {results.map((r, i) => (

                <tr key={i} className="text-center">

                  <td className="p-3 border">{r.subject}</td>
                  <td className="p-3 border">{r.marks}</td>
                  <td className="p-3 border">{r.max}</td>

                </tr>

              ))}

            </tbody>

          </table>

          {/* Result Summary */}

          <div className="grid grid-cols-4 gap-6 text-center mb-6">

            <div>

              <p className="text-gray-500">Total Marks</p>

              <p className="text-xl font-bold">
                {totalMarks} / {maxMarks}
              </p>

            </div>

            <div>

              <p className="text-gray-500">Percentage</p>

              <p className="text-xl font-bold">
                {percentage}%
              </p>

            </div>

            <div>

              <p className="text-gray-500">Grade</p>

              <p className="text-xl font-bold">
                {getGrade(percentage)}
              </p>

            </div>

            <div>

              <p className="text-gray-500">Result</p>

              <p className={`text-xl font-bold ${
                percentage >= 40 ? "text-green-600" : "text-red-600"
              }`}>

                {percentage >= 40 ? "Pass" : "Fail"}

              </p>

            </div>

          </div>

          {/* Teacher Remark */}

          <div>

            <h3 className="text-lg font-semibold mb-2">
              Teacher Remark
            </h3>

            <p className="text-gray-700">
              Good performance. Keep improving your analytical skills and maintain consistency.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}