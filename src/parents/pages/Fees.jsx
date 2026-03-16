import ParentSidebar from "../components/ParentSidebar";
import { useRef } from "react";

export default function ParentFees() {

  const printRef = useRef();

  const fees = [
    { term: "Term 1", amount: 15000, status: "Paid" },
    { term: "Term 2", amount: 15000, status: "Pending" },
    { term: "Term 3", amount: 15000, status: "Pending" }
  ];

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = fees.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0);
  const remainingFees = totalFees - paidFees;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = printRef.current;
    const blob = new Blob([element.innerText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fees_receipt.txt";
    link.click();
  };

  return (
    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">Fees Payment</h1>

        {/* Summary Cards */}

        <div className="grid md:grid-cols-3 gap-6 mb-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Fees</p>
            <h2 className="text-2xl font-bold">₹{totalFees}</h2>
          </div>

          <div className="bg-green-100 p-6 rounded-xl shadow">
            <p className="text-gray-600">Paid</p>
            <h2 className="text-2xl font-bold text-green-700">₹{paidFees}</h2>
          </div>

          <div className="bg-red-100 p-6 rounded-xl shadow">
            <p className="text-gray-600">Remaining</p>
            <h2 className="text-2xl font-bold text-red-600">₹{remainingFees}</h2>
          </div>

        </div>

        {/* Fees Table */}

        <div ref={printRef} className="bg-white p-6 rounded-xl shadow mb-6">

          <h2 className="text-xl font-semibold mb-4">Fees Details</h2>

          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Term</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              {fees.map((f, i) => (

                <tr key={i} className="border-b hover:bg-gray-50">

                  <td className="p-3">{f.term}</td>

                  <td className="p-3">₹{f.amount}</td>

                  <td className="p-3">

                    {f.status === "Paid" ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Paid
                      </span>

                    ) : (

                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                        Pending
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Payment Section */}

        <div className="grid md:grid-cols-2 gap-6">

          {/* QR Payment */}

          <div className="bg-white p-6 rounded-xl shadow text-center">

            <h2 className="text-xl font-semibold mb-4">Pay Fees</h2>

            <p className="text-gray-500 mb-4">
              Scan QR Code to Pay
            </p>

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SchoolFeesPayment"
              alt="QR Code"
              className="mx-auto"
            />

            <p className="mt-3 text-gray-500 text-sm">
              UPI / PhonePe / Google Pay
            </p>

          </div>

          {/* Actions */}

          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">Actions</h2>

            <div className="space-y-4">

              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Download Receipt
              </button>

              <button
                onClick={handlePrint}
                className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-black"
              >
                Print Receipt
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}