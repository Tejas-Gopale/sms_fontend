import { useEffect, useState, useRef } from "react";
import ParentSidebar from "../components/ParentSidebar";
import { Loader2, AlertCircle, IndianRupee } from "lucide-react";
import { getStudentFees } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";

export default function ParentFees() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
  const [fees,    setFees]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const printRef = useRef();

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentFees(studentId)
      .then((res) => setFees(res.data))
      .catch(() => setError("Could not load fees data."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const element = printRef.current;
    if (!element) return;
    const blob = new Blob([element.innerText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fees_receipt.txt";
    link.click();
  };

  const statusStyle = (s) =>
    s === "Paid"
      ? "bg-green-100 text-green-700"
      : s === "Overdue"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          <IndianRupee className="inline mr-2 text-green-600" size={28} />
          Fees Payment
        </h1>

        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        )}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}

        {fees && !loading && !sidLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm text-gray-500">Total Fees</p>
                <h2 className="text-2xl font-bold text-slate-800">₹{fees.totalFees?.toLocaleString("en-IN") ?? "—"}</h2>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-600">Paid</p>
                <h2 className="text-2xl font-bold text-green-700">₹{fees.paidAmount?.toLocaleString("en-IN") ?? "—"}</h2>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
                <p className="text-sm text-gray-600">Remaining</p>
                <h2 className="text-2xl font-bold text-red-600">₹{fees.remainingAmount?.toLocaleString("en-IN") ?? "—"}</h2>
              </div>
            </div>

            {/* Fees Table */}
            <div ref={printRef} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Fees Details</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3 text-left font-semibold text-slate-600">Term</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Amount</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Due Date</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.feeTerms?.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{f.termName}</td>
                      <td className="p-3">₹{f.amount?.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-slate-500">{f.dueDate ?? "—"}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(f.status)}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <h2 className="text-lg font-bold mb-4 text-slate-800">Pay Fees</h2>
                <p className="text-sm text-gray-500 mb-4">Scan QR Code to Pay</p>
                {fees.paymentQRCode ? (
                  <img
                    src={fees.paymentQRCode}
                    alt="QR Code"
                    className="mx-auto w-40 h-40 object-contain"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${fees.upiId ?? "SchoolFeesPayment"}`}
                    alt="QR Code"
                    className="mx-auto"
                  />
                )}
                <p className="mt-3 text-xs text-gray-400">UPI / PhonePe / Google Pay</p>
                {fees.upiId && (
                  <p className="mt-1 text-sm font-medium text-indigo-600">{fees.upiId}</p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-4 text-slate-800">Actions</h2>
                <div className="space-y-4">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium"
                  >
                    Download Receipt
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full bg-slate-800 text-white p-3 rounded-xl hover:bg-black font-medium"
                  >
                    Print Receipt
                  </button>
                </div>

                {/* Payment History */}
                {fees.paymentHistory?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Payment History</h3>
                    {fees.paymentHistory.map((ph) => (
                      <div key={ph.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                        <div>
                          <p className="font-medium text-slate-700">₹{ph.amount?.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-slate-400">{ph.paymentDate} · {ph.paymentMode}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ph.status === "Success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {ph.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
