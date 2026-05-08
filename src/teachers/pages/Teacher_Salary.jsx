import { useState, useEffect } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import API from "../../common/services/api";
import { IndianRupee, TrendingUp, TrendingDown, Mail, AlertCircle } from "lucide-react";
import { getUserData } from "../../common/utils/tokenStorage";

export default function TeacherSalary() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = getUserData();
    if (userData?.userId) setTeacherId(userData.userId);
  }, []);

  useEffect(() => {
    if (teacherId) fetchSalarySlip();
  }, [teacherId, month, year]);

  const fetchSalarySlip = async () => {
    setLoading(true);
    setError("");
    setSlip(null);
    try {
      const res = await API.get(`/salary-slip/teacher/${teacherId}`, {
        params: { month, year },
      });
      setSlip(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No salary slip found for this period.");
      } else {
        setError("Failed to fetch salary slip.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSlip = async () => {
    if (!slip?.id) return;
    setEmailSending(true);
    try {
      await API.post(`/salary-slip/${slip.id}/email`);
      alert("Salary slip sent to your email ✅");
    } catch {
      alert("Failed to send email ❌");
    } finally {
      setEmailSending(false);
    }
  };

  const fmt = (val) =>
    val != null ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <IndianRupee size={28} className="text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">My Salary</h2>
          </div>

          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border px-3 py-2 rounded bg-white shadow-sm"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border px-3 py-2 rounded bg-white shadow-sm"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Loading salary slip...
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <AlertCircle size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {slip && !loading && (
          <div className="max-w-2xl">
            {/* Employee Info */}
            <div className="bg-white rounded-xl shadow p-6 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{slip.employeeName}</h3>
                  <p className="text-gray-500 text-sm">{slip.designation} · Emp Code: {slip.employeeCode}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Pay Period: {months[slip.payrollMonth - 1]} {slip.payrollYear}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${slip.slipStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {slip.slipStatus}
                </span>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Working Days", value: slip.totalWorkingDays },
                { label: "Present Days", value: slip.presentDays },
                { label: "LOP Days", value: slip.lopDays },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-gray-500 text-sm">{c.label}</p>
                  <p className="text-xl font-bold">{c.value}</p>
                </div>
              ))}
            </div>

            {/* Earnings & Deductions */}
            <div className="bg-white rounded-xl shadow p-6 mb-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-green-700 flex items-center gap-1 mb-3">
                    <TrendingUp size={16} /> Earnings
                  </h4>
                  {[
                    ["Basic Salary", slip.basicSalary],
                    ["HRA", slip.hra],
                    ["DA", slip.da],
                    ["TA", slip.ta],
                    ["Medical", slip.medical],
                    ["Special Allowance", slip.specialAllowance],
                    ["Arrear", slip.arrear],
                  ].map(([label, val]) =>
                    val != null ? (
                      <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium">{fmt(val)}</span>
                      </div>
                    ) : null
                  )}
                  <div className="flex justify-between font-bold mt-2 text-green-700">
                    <span>Gross Earnings</span>
                    <span>{fmt(slip.grossEarnings)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-red-600 flex items-center gap-1 mb-3">
                    <TrendingDown size={16} /> Deductions
                  </h4>
                  {[
                    ["LOP Deduction", slip.lopDeduction],
                    ["PF", slip.pfDeduction],
                    ["ESI", slip.esiDeduction],
                    ["Professional Tax", slip.professionalTax],
                    ["TDS", slip.tdsDeduction],
                  ].map(([label, val]) =>
                    val != null ? (
                      <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium text-red-500">- {fmt(val)}</span>
                      </div>
                    ) : null
                  )}
                  <div className="flex justify-between font-bold mt-2 text-red-600">
                    <span>Total Deductions</span>
                    <span>- {fmt(slip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Net Payable</span>
                <span className="text-2xl font-bold text-green-600">{fmt(slip.netPayable)}</span>
              </div>
            </div>

            {/* Bank Details */}
            {slip.bankName && (
              <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Bank Details</h4>
                <p className="text-sm text-gray-600">Bank: {slip.bankName}</p>
                <p className="text-sm text-gray-600">Account: {slip.bankAccountNumber}</p>
                <p className="text-sm text-gray-600">IFSC: {slip.bankIfscCode}</p>
              </div>
            )}

            {/* Email Button */}
            <button
              onClick={handleEmailSlip}
              disabled={emailSending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg"
            >
              <Mail size={16} />
              {emailSending ? "Sending..." : "Email Salary Slip"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}