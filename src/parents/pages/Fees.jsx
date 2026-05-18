import { useEffect, useState, useRef } from "react";
import ParentSidebar from "../components/ParentSidebar";
import {
  Loader2, AlertCircle, IndianRupee, CreditCard, QrCode,
  CheckCircle, Clock, Copy, RefreshCw
} from "lucide-react";
import { getStudentFees } from "../../common/services/parentService";
import useParentStudent from "../../common/hooks/useParentStudent";
import API from "../../common/services/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

const msgCls = (t) =>
  t === "success" ? "bg-green-50 border-green-200 text-green-700"
  : t === "error"  ? "bg-red-50 border-red-200 text-red-600"
  :                  "bg-blue-50 border-blue-200 text-blue-600";

const statusCls = (s) => {
  const v = (s || "").toUpperCase();
  if (v === "PAID")                 return "bg-green-100 text-green-700";
  if (v === "PARTIAL")              return "bg-blue-100 text-blue-700";
  if (v === "OVERDUE")              return "bg-red-100 text-red-600";
  if (v === "PENDING_VERIFICATION") return "bg-orange-100 text-orange-700";
  if (v === "SUCCESS")              return "bg-green-100 text-green-700";
  if (v === "REJECTED")             return "bg-red-100 text-red-600";
  return "bg-yellow-100 text-yellow-700";
};

export default function ParentFees() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();

  const [fees,       setFees]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [msg,        setMsg]        = useState(null);

  // Razorpay
  const [paying,     setPaying]     = useState(false);
  const [rzpAmount,  setRzpAmount]  = useState("");

  // UPI UTR
  const [showUtr,    setShowUtr]    = useState(false);
  const [utrNumber,  setUtrNumber]  = useState("");
  const [utrAmount,  setUtrAmount]  = useState("");
  const [utrLoading, setUtrLoading] = useState(false);

  const printRef = useRef();

  const loadFees = () => {
    if (!studentId) return;
    setLoading(true);
    getStudentFees(studentId)
      .then((res) => setFees(res.data))
      .catch(() => setError("Could not load fees data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFees(); }, [studentId]);

  // ── Razorpay — partial amount support ──────────────────────────────────────
  const handlePayNow = async () => {
    setMsg(null);
    const payAmt = rzpAmount ? Number(rzpAmount) : fees?.remainingAmount;

    if (!payAmt || payAmt <= 0) {
      setMsg({ type: "error", text: "Valid amount enter karo." }); return;
    }
    if (payAmt > (fees?.remainingAmount ?? 0) + 0.01) {
      setMsg({ type: "error", text: `Amount ₹${fmt(fees.remainingAmount)} (due) se zyada nahi ho sakta.` }); return;
    }
    if (!fees.schoolId || !fees.studentFeeId) {
      setMsg({ type: "error", text: "Page refresh karo — details load nahi hui." }); return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK load nahi hua. Internet check karo.");

      const { data } = await API.post("/payments/create-order", {
        schoolId:     fees.schoolId,
        amount:       payAmt,
        studentFeeId: fees.studentFeeId,
      });

      const options = {
        key:         data.keyId,
        amount:      Math.round(payAmt * 100),
        currency:    "INR",
        name:        "School Fees",
        description: `Fees - ${fees.studentName}`,
        order_id:    data.orderId,
        prefill:     { name: fees.studentName },
        theme:       { color: "#4F46E5" },
        handler: () => {
          setMsg({ type: "success", text: "Payment successful! 🎉 Fees update ho rahi hai..." });
          setRzpAmount("");
          setTimeout(loadFees, 2500);
          setPaying(false);
        },
        modal: {
          ondismiss: () => { setMsg({ type: "info", text: "Payment cancel." }); setPaying(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setMsg({ type: "error", text: `Payment fail: ${r.error.description}` });
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data || err.message });
      setPaying(false);
    }
  };

  // ── UPI UTR record ─────────────────────────────────────────────────────────
  const handleUtrSubmit = async () => {
    setMsg(null);
    const amt = Number(utrAmount);
    if (!utrNumber.trim())           { setMsg({ type: "error", text: "UTR / Transaction ID daalo." }); return; }
    if (!amt || amt <= 0)            { setMsg({ type: "error", text: "Valid amount daalo." }); return; }
    if (amt > (fees?.remainingAmount ?? 0) + 0.01)
      { setMsg({ type: "error", text: `Amount ₹${fmt(fees.remainingAmount)} se zyada nahi ho sakta.` }); return; }
    if (!fees?.studentFeeId)         { setMsg({ type: "error", text: "Page refresh karo." }); return; }

    setUtrLoading(true);
    try {
      await API.post("/api/payments/record-upi", {
        studentFeeId: fees.studentFeeId,
        amount:       amt,
        utrNumber:    utrNumber.trim().toUpperCase(),
      });
      setMsg({
        type: "success",
        text: `UTR ${utrNumber.trim().toUpperCase()} record ho gaya ✅  Admin verify karne ke baad fees ghatti dikhegi.`,
      });
      setUtrNumber("");
      setUtrAmount("");
      setShowUtr(false);
      setTimeout(loadFees, 1500);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data || err.message });
    } finally {
      setUtrLoading(false);
    }
  };

  // QR — NO fixed amount (am= parameter hata diya) so user UPI app mein khud type kare
  const upiQrUrl = fees?.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `upi://pay?pa=${fees.upiId}&pn=SchoolFees&cu=INR`
      )}`
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <IndianRupee className="text-green-600" size={28} /> Fees Payment
          </h1>
          <button onClick={loadFees} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {(loading || sidLoading) && (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        )}
        {(error || sidError) && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
            <AlertCircle size={20} />{error || sidError}
          </div>
        )}

        {fees && !loading && !sidLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs text-gray-500 mb-1">Total Fees</p>
                <p className="text-xl font-bold text-slate-800">₹{fmt(fees.totalFees)}</p>
              </div>
              <div className="bg-green-50 p-5 rounded-2xl shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Paid</p>
                <p className="text-xl font-bold text-green-700">₹{fmt(fees.paidAmount)}</p>
              </div>
              <div className={`p-5 rounded-2xl shadow-sm border ${
                fees.remainingAmount > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
              }`}>
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className={`text-xl font-bold ${fees.remainingAmount > 0 ? "text-red-600" : "text-green-700"}`}>
                  ₹{fmt(fees.remainingAmount)}
                </p>
              </div>
            </div>

            {/* Global message */}
            {msg && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${msgCls(msg.type)}`}>
                {msg.text}
              </div>
            )}

            {/* Fee Items Table */}
            <div ref={printRef} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h2 className="text-base font-bold mb-4 text-slate-800">Fee Breakdown</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3 text-left font-semibold">Fee Head</th>
                    <th className="p-3 text-left font-semibold">Amount</th>
                    <th className="p-3 text-left font-semibold">Due Date</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.feeTerms?.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{f.termName}</td>
                      <td className="p-3">₹{fmt(f.amount)}</td>
                      <td className="p-3 text-slate-500">{f.dueDate ?? "—"}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCls(f.status)}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {fees.remainingAmount > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* ── UPI / QR Card ──────────────────────────────────────── */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-base font-bold mb-1 text-slate-800 flex items-center gap-2">
                    <QrCode size={18} /> UPI / QR Se Pay Karo
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    PhonePe / GPay / Paytm se scan karo —{" "}
                    <strong>app mein khud amount type karo (partial bhi ok)</strong>
                  </p>

                  {upiQrUrl ? (
                    <>
                      <div className="flex justify-center mb-3">
                        <img src={upiQrUrl} alt="UPI QR" className="rounded-xl border-4 border-indigo-50 w-44 h-44" />
                      </div>
                      {fees.upiId && (
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-indigo-600">{fees.upiId}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(fees.upiId); setMsg({ type: "info", text: "UPI ID copied!" }); }}
                            className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-0.5 flex items-center gap-1"
                          ><Copy size={11} /> Copy</button>
                        </div>
                      )}
                      <p className="text-xs text-center text-amber-600 font-medium mb-4">
                        ⚠️ QR scan ke baad UPI app mein manually amount type karo (koi bhi amount doge toh chalega)
                      </p>

                      {/* UTR Entry */}
                      <div className="border-t pt-4">
                        {!showUtr ? (
                          <button
                            onClick={() => { setShowUtr(true); setUtrAmount(String(fees.remainingAmount)); }}
                            className="w-full border-2 border-indigo-300 text-indigo-600 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-50"
                          >
                            ✅ Pay kar diya? UTR / Transaction ID daalo
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-medium">
                              PhonePe / GPay mein payment ke baad UTR ya Transaction ID milta hai
                            </p>
                            <input
                              type="text"
                              placeholder="UTR / Transaction ID (e.g. 506123456789)"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <input
                                type="number"
                                placeholder="Kitna pay kiya? (partial bhi ok)"
                                value={utrAmount}
                                onChange={(e) => setUtrAmount(e.target.value)}
                                className="w-full border rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                min="1"
                                max={fees.remainingAmount}
                              />
                            </div>
                            <p className="text-xs text-gray-400">Due: ₹{fmt(fees.remainingAmount)} — partial amount bhi de sakte ho</p>

                            <div className="flex gap-2">
                              <button
                                onClick={handleUtrSubmit}
                                disabled={utrLoading}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-1"
                              >
                                {utrLoading
                                  ? <><Loader2 size={14} className="animate-spin" />Saving...</>
                                  : <><CheckCircle size={14} />Record Payment</>}
                              </button>
                              <button
                                onClick={() => { setShowUtr(false); setUtrNumber(""); setUtrAmount(""); }}
                                className="px-4 border rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                              >Cancel</button>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                              <p className="font-semibold mb-1">⏳ Verification Process:</p>
                              <p>1. Tumhara UTR record hoga (status: Pending Verification)</p>
                              <p>2. School admin bank statement se match karega</p>
                              <p>3. Approve hone par fees automatically update ho jayegi</p>
                              <p className="mt-1 text-gray-400">Normally 1–2 working days mein verify hota hai</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-sm text-gray-400 py-8">School ne UPI ID set nahi ki hai abhi.</p>
                  )}
                </div>

                {/* ── Online Pay Card ────────────────────────────────────── */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-base font-bold mb-1 text-slate-800 flex items-center gap-2">
                    <CreditCard size={18} /> Card / Net Banking
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">Razorpay se — partial amount bhi de sakte ho</p>

                  <div className="mb-3">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Kitna pay karna hai? (blank chhodo = full ₹{fmt(fees.remainingAmount)})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder={`Max ₹${fmt(fees.remainingAmount)}`}
                        value={rzpAmount}
                        onChange={(e) => setRzpAmount(e.target.value)}
                        className="w-full border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        min="1"
                        max={fees.remainingAmount}
                      />
                    </div>
                    {rzpAmount && Number(rzpAmount) < fees.remainingAmount && (
                      <p className="text-xs text-blue-500 mt-1">
                        Partial payment: ₹{fmt(Number(rzpAmount))} — baki ₹{fmt(fees.remainingAmount - Number(rzpAmount))} baad mein
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="w-full bg-indigo-600 text-white p-3.5 rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
                  >
                    {paying
                      ? <><Loader2 size={16} className="animate-spin" />Processing...</>
                      : <><CreditCard size={16} />Pay ₹{rzpAmount ? fmt(Number(rzpAmount)) : fmt(fees.remainingAmount)} Now</>}
                  </button>

                  <button onClick={() => window.print()} className="w-full bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black">
                    Print Receipt
                  </button>
                </div>
              </div>
            )}

            {fees.remainingAmount <= 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center text-green-700 font-semibold mb-6">
                ✅ Saari fees pay ho chuki hai! Koi balance nahi.
              </div>
            )}

            {/* Payment History */}
            {fees.paymentHistory?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-base font-bold mb-4 text-slate-800">Payment History</h2>
                <div>
                  {fees.paymentHistory.map((ph) => (
                    <div key={ph.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">₹{fmt(ph.amount)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ph.paymentDate} · {ph.paymentMode}</p>
                        {ph.transactionId && <p className="text-xs text-slate-400">Ref: {ph.transactionId}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(ph.status)}`}>
                        {ph.status === "PENDING_VERIFICATION"
                          ? <span className="flex items-center gap-1"><Clock size={10} /> Pending</span>
                          : ph.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// import { useEffect, useState, useRef } from "react";
// import ParentSidebar from "../components/ParentSidebar";
// import { Loader2, AlertCircle, IndianRupee, CreditCard, QrCode } from "lucide-react";
// import { getStudentFees } from "../../common/services/parentService";
// import useParentStudent from "../../common/hooks/useParentStudent";
// import API from "../../common/services/api";

// // ✅ Load Razorpay script dynamically
// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (document.getElementById("razorpay-script")) {
//       resolve(true);
//       return;
//     }
//     const script = document.createElement("script");
//     script.id = "razorpay-script";
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// }

// export default function ParentFees() {
//   const { studentId, loading: sidLoading, error: sidError } = useParentStudent();
//   const [fees,    setFees]    = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState(null);
//   const [paying,  setPaying]  = useState(false);
//   const [payMsg,  setPayMsg]  = useState(null);
//   const printRef = useRef();

//   useEffect(() => {
//     if (!studentId) return;
//     setLoading(true);
//     getStudentFees(studentId)
//       .then((res) => setFees(res.data))
//       .catch(() => setError("Could not load fees data."))
//       .finally(() => setLoading(false));
//   }, [studentId]);

//   const handlePrint = () => window.print();

//   const handleDownload = () => {
//     const element = printRef.current;
//     if (!element) return;
//     const blob = new Blob([element.innerText], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "fees_receipt.txt";
//     link.click();
//   };

//   // ✅ Razorpay Pay Now handler
//   const handlePayNow = async () => {
//     if (!fees?.remainingAmount || fees.remainingAmount <= 0) {
//       setPayMsg({ type: "success", text: "Koi baki fees nahi hai! Sab paid ho gaya hai ✅" });
//       return;
//     }

//     setPaying(true);
//     setPayMsg(null);

//     try {
//       // 1. Load Razorpay SDK
//       const loaded = await loadRazorpayScript();
//       if (!loaded) throw new Error("Razorpay SDK load nahi hua. Internet check karo.");

//       // 2. Backend se order create karo
//       if (!fees.schoolId || !fees.studentFeeId) {
//         throw new Error(`Payment details missing. schoolId=${fees.schoolId}, studentFeeId=${fees.studentFeeId}. Page refresh karo.`);
//       }

//       const orderRes = await API.post("/payments/create-order", {
//         schoolId: fees.schoolId,
//         amount: fees.remainingAmount,
//         studentFeeId: fees.studentFeeId,
//       });

//       const { orderId, keyId, amount, schoolName } = orderRes.data;

//       // 3. Razorpay Checkout open karo
//       const options = {
//         key: keyId,
//         amount: Math.round(fees.remainingAmount * 100), // paise
//         currency: "INR",
//         name: schoolName || "School Fees",
//         description: `Fees payment for ${fees.studentName}`,
//         order_id: orderId,
//         prefill: {
//           name: fees.studentName,
//         },
//         theme: { color: "#4F46E5" },
//         handler: async function (response) {
//           // 4. Payment success — backend ko verify karne do (webhook handles DB)
//           setPayMsg({
//             type: "success",
//             text: `Payment successful! 🎉 Payment ID: ${response.razorpay_payment_id}`,
//           });
//           // Fees refresh karo
//           setTimeout(() => {
//             getStudentFees(studentId)
//               .then((res) => setFees(res.data))
//               .catch(() => {});
//           }, 2000);
//         },
//         modal: {
//           ondismiss: () => {
//             setPaying(false);
//             setPayMsg({ type: "info", text: "Payment cancel kar diya." });
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on("payment.failed", (response) => {
//         setPayMsg({
//           type: "error",
//           text: `Payment fail ho gaya: ${response.error.description}`,
//         });
//         setPaying(false);
//       });
//       rzp.open();

//     } catch (err) {
//       setPayMsg({ type: "error", text: err.response?.data || err.message || "Payment mein kuch gadbad hui." });
//     } finally {
//       setPaying(false);
//     }
//   };

//   const statusStyle = (s) =>
//     s === "Paid" || s === "PAID"
//       ? "bg-green-100 text-green-700"
//       : s === "Overdue"
//       ? "bg-red-100 text-red-600"
//       : s === "Partial" || s === "PARTIAL"
//       ? "bg-blue-100 text-blue-700"
//       : "bg-yellow-100 text-yellow-700";

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <ParentSidebar />
//       <div className="flex-1 p-6 md:p-8">
//         <h1 className="text-3xl font-bold mb-6 text-slate-800">
//           <IndianRupee className="inline mr-2 text-green-600" size={28} />
//           Fees Payment
//         </h1>

//         {(loading || sidLoading) && (
//           <div className="flex justify-center mt-20">
//             <Loader2 className="animate-spin text-indigo-500" size={40} />
//           </div>
//         )}
//         {(error || sidError) && (
//           <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
//             <AlertCircle size={20} />{error || sidError}
//           </div>
//         )}

//         {fees && !loading && !sidLoading && (
//           <>
//             {/* Summary Cards */}
//             <div className="grid md:grid-cols-3 gap-5 mb-6">
//               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                 <p className="text-sm text-gray-500">Total Fees</p>
//                 <h2 className="text-2xl font-bold text-slate-800">₹{fees.totalFees?.toLocaleString("en-IN") ?? "—"}</h2>
//               </div>
//               <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
//                 <p className="text-sm text-gray-600">Paid</p>
//                 <h2 className="text-2xl font-bold text-green-700">₹{fees.paidAmount?.toLocaleString("en-IN") ?? "—"}</h2>
//               </div>
//               <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
//                 <p className="text-sm text-gray-600">Remaining</p>
//                 <h2 className="text-2xl font-bold text-red-600">₹{fees.remainingAmount?.toLocaleString("en-IN") ?? "—"}</h2>
//               </div>
//             </div>

//             {/* Fees Table */}
//             <div ref={printRef} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
//               <h2 className="text-lg font-bold mb-4 text-slate-800">Fees Details</h2>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b bg-slate-50">
//                     <th className="p-3 text-left font-semibold text-slate-600">Term</th>
//                     <th className="p-3 text-left font-semibold text-slate-600">Amount</th>
//                     <th className="p-3 text-left font-semibold text-slate-600">Due Date</th>
//                     <th className="p-3 text-left font-semibold text-slate-600">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {fees.feeTerms?.map((f) => (
//                     <tr key={f.id} className="border-b hover:bg-slate-50">
//                       <td className="p-3 font-medium">{f.termName}</td>
//                       <td className="p-3">₹{f.amount?.toLocaleString("en-IN")}</td>
//                       <td className="p-3 text-slate-500">{f.dueDate ?? "—"}</td>
//                       <td className="p-3">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(f.status)}`}>
//                           {f.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Payment section */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* QR Code */}
//               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
//                 <h2 className="text-lg font-bold mb-1 text-slate-800 flex items-center justify-center gap-2">
//                   <QrCode size={20} /> UPI Se Pay Karo
//                 </h2>
//                 <p className="text-sm text-gray-500 mb-4">PhonePe / Google Pay / Paytm se scan karo</p>
//                 <img
//                   src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${fees.upiId ?? "school@upi"}&pn=SchoolFees&am=${fees.remainingAmount ?? ""}&cu=INR`}
//                   alt="UPI QR Code"
//                   className="mx-auto rounded-xl border-4 border-indigo-50"
//                 />
//                 <p className="mt-3 text-xs text-gray-400">Scan karke directly school account mein jayega</p>
//                 {fees.upiId && (
//                   <div className="mt-2 flex items-center justify-center gap-2">
//                     <span className="text-sm font-semibold text-indigo-600">{fees.upiId}</span>
//                     <button
//                       onClick={() => navigator.clipboard.writeText(fees.upiId)}
//                       className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-0.5"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Pay Now + Actions */}
//               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                 <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
//                   <CreditCard size={20} /> Online Payment
//                 </h2>

//                 {/* ✅ Pay Now Button */}
//                 {fees.remainingAmount > 0 ? (
//                   <button
//                     onClick={handlePayNow}
//                     disabled={paying}
//                     className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 font-bold text-base mb-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {paying ? (
//                       <><Loader2 className="animate-spin" size={18} /> Processing...</>
//                     ) : (
//                       <><CreditCard size={18} /> Pay ₹{fees.remainingAmount?.toLocaleString("en-IN")} Now</>
//                     )}
//                   </button>
//                 ) : (
//                   <div className="w-full bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl font-semibold text-center mb-3">
//                     ✅ Fees Fully Paid!
//                   </div>
//                 )}

//                 {/* Status message */}
//                 {payMsg && (
//                   <div className={`mb-3 px-4 py-3 rounded-xl text-sm font-medium ${
//                     payMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200"
//                     : payMsg.type === "error" ? "bg-red-50 text-red-600 border border-red-200"
//                     : "bg-blue-50 text-blue-600 border border-blue-200"
//                   }`}>
//                     {payMsg.text}
//                   </div>
//                 )}

//                 <div className="space-y-3">
//                   <button
//                     onClick={handleDownload}
//                     className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium"
//                   >
//                     Download Receipt
//                   </button>
//                   <button
//                     onClick={handlePrint}
//                     className="w-full bg-slate-800 text-white p-3 rounded-xl hover:bg-black font-medium"
//                   >
//                     Print Receipt
//                   </button>
//                 </div>

//                 {/* Payment History */}
//                 {fees.paymentHistory?.length > 0 && (
//                   <div className="mt-6">
//                     <h3 className="text-sm font-semibold text-slate-600 mb-3">Payment History</h3>
//                     {fees.paymentHistory.map((ph) => (
//                       <div key={ph.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
//                         <div>
//                           <p className="font-medium text-slate-700">₹{ph.amount?.toLocaleString("en-IN")}</p>
//                           <p className="text-xs text-slate-400">{ph.paymentDate} · {ph.paymentMode}</p>
//                           {ph.receiptNumber && (
//                             <p className="text-xs text-slate-400">Receipt: {ph.receiptNumber}</p>
//                           )}
//                         </div>
//                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                           ph.status === "SUCCESS" || ph.status === "Success"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-yellow-100 text-yellow-700"
//                         }`}>
//                           {ph.status}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
