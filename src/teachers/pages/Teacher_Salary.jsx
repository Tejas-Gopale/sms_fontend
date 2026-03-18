import TeacherSidebar from "../components/Teacher_Sidebar";

export default function Salary() {

  const salary = {
    basic: 30000,
    allowance: 5000,
    deductions: 2000,
    net: 33000
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">My Salary</h2>

        <div className="bg-white p-6 rounded-xl shadow max-w-md">

          <div className="flex justify-between mb-2">
            <span>Basic Salary</span>
            <span>₹{salary.basic}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Allowance</span>
            <span>₹{salary.allowance}</span>
          </div>

          <div className="flex justify-between mb-2 text-red-500">
            <span>Deductions</span>
            <span>- ₹{salary.deductions}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-bold text-lg">
            <span>Net Salary</span>
            <span>₹{salary.net}</span>
          </div>

        </div>
      </div>
    </div>
  );
}