// src/parents/pages/ParentFees.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Single API:  GET /parent/fees/{studentId}
//   → StudentFeesResponse  (feeTerms[] + paymentHistory[] + upiId + schoolId)
//
// Tabs:
//   1. Fee Summary  — stat cards + fee breakdown + Payment section (UPI QR + Razorpay)
//   2. My Receipts  — receipt list from paymentHistory + View/Download modal
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import ParentSidebar from "../components/ParentSidebar";
import FeeReceiptTemplate from "../components/FeeReceiptTemplate";
import useParentStudent from "../../common/hooks/useParentStudent";
import API from "../../common/services/api";
import {
  IndianRupee, ReceiptText, RefreshCcw, Eye, Printer,
  Loader2, AlertCircle, CheckCircle, Clock, Copy,
  CreditCard, QrCode, X,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtNum = (n) => (n ?? 0).toLocaleString("en-IN");
const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", minimumFractionDigits: 2,
      }).format(n)
    : "—";
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Razorpay script loader ────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const s = document.createElement("script");
    s.id      = "razorpay-script";
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── shared styles ─────────────────────────────────────────────────────────────
const S = {
  card: {
    background: "#fff", borderRadius: 14,
    boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  btn: (bg = "#1e3a5f", fg = "#fff") => ({
    background: bg, color: fg, border: "none", borderRadius: 8,
    padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
  }),
  th: {
    padding: "10px 14px", textAlign: "left", fontWeight: 700,
    color: "#fff", fontSize: 12, background: "#1e3a5f",
  },
  td:    { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f8fafc" },
  input: {
    width: "100%", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "10px 14px", fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  },
};

// ── sub-components ────────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24, zIndex: 9999,
      background: ok ? "#059669" : "#dc2626", color: "#fff",
      padding: "12px 22px", borderRadius: 10, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 13,
    }}>{msg}</div>
  );
}

function Stat({ label, value, bg, color, icon }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ParentFees() {
  const { studentId, loading: sidLoading, error: sidError } = useParentStudent();

  const [tab,        setTab]        = useState("summary");
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [feeSummary, setFeeSummary] = useState(null);
  const [modalReceipt, setModalReceipt] = useState(null);

  // Payment inline messages
  const [msg,        setMsg]        = useState(null); // { type, text }

  // Razorpay
  const [paying,     setPaying]     = useState(false);
  const [rzpAmount,  setRzpAmount]  = useState("");

  // UPI UTR
  const [showUtr,    setShowUtr]    = useState(false);
  const [utrNumber,  setUtrNumber]  = useState("");
  const [utrAmount,  setUtrAmount]  = useState("");
  const [utrLoading, setUtrLoading] = useState(false);

  const notify = (text, ok = true) => {
    setToast({ msg: text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fee summary load ───────────────────────────────────────────────────────
  const loadSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await API.get(`/parent/fees/${studentId}`);
      setFeeSummary(r.data);
    } catch (e) {
      notify(e.response?.data?.message || "Fee summary load nahi hui", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, [studentId]);

  // ── Razorpay payment ───────────────────────────────────────────────────────
 const handlePayNow = async () => {
  setMsg(null);
  const payAmt = rzpAmount ? Number(rzpAmount) : feeSummary?.remainingAmount;
 
  if (!payAmt || payAmt <= 0) {
    setMsg({ type: "error", text: "Valid amount enter karo." }); return;
  }
  if (payAmt > (feeSummary?.remainingAmount ?? 0) + 0.01) {
    setMsg({ type: "error", text: `Amount ₹${fmtNum(feeSummary.remainingAmount)} (due) se zyada nahi ho sakta.` }); return;
  }
  if (!feeSummary?.schoolId || !feeSummary?.studentFeeId) {
    setMsg({ type: "error", text: "Page refresh karo — details load nahi hui." }); return;
  }
 
  setPaying(true);
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Razorpay SDK load nahi hua. Internet check karo.");
 
    const { data } = await API.post("/payments/create-order", {
      schoolId:     feeSummary.schoolId,
      amount:       payAmt,
      studentFeeId: feeSummary.studentFeeId,
    });
 
    const options = {
      key:         data.keyId,
      amount:      Math.round(payAmt * 100),
      currency:    "INR",
      name:        "School Fees",
      description: `Fees - ${feeSummary.studentName}`,
      order_id:    data.orderId,
      prefill:     { name: feeSummary.studentName },
      theme:       { color: "#1e3a5f" },
 
      // ✅ FIX: response capture karo — razorpay_payment_id, order_id, signature yahan aate hain
      handler: async (response) => {
        try {
          // Backend ko verify karne bhejo — tabhi DB mein entry hogi
          await API.post("/payments/verify-payment", {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId:   response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            studentFeeId:      feeSummary.studentFeeId,
            amount:            payAmt,
          });
 
          setMsg({ type: "success", text: "Payment successful! 🎉 Fees update ho rahi hai..." });
          setRzpAmount("");
          setTimeout(loadSummary, 2000);
        } catch (verifyErr) {
          // Payment Razorpay pe ho gayi lekin backend verify fail hua
          // (rare case — webhook backup ke taur pe catch kar lega)
          setMsg({
            type: "error",
            text: `Payment ho gayi lekin record nahi hua: ${verifyErr.response?.data || verifyErr.message}. School admin se contact karo.`,
          });
        } finally {
          setPaying(false);
        }
      },
 
      modal: {
        ondismiss: () => {
          setMsg({ type: "info", text: "Payment cancel ho gayi." });
          setPaying(false);
        },
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

  // ── UPI UTR submission ─────────────────────────────────────────────────────
  const handleUtrSubmit = async () => {
    setMsg(null);
    const amt = Number(utrAmount);
    if (!utrNumber.trim()) { setMsg({ type: "error", text: "UTR / Transaction ID daalo." }); return; }
    if (!amt || amt <= 0)  { setMsg({ type: "error", text: "Valid amount daalo." }); return; }
    if (amt > (feeSummary?.remainingAmount ?? 0) + 0.01) {
      setMsg({ type: "error", text: `Amount ₹${fmtNum(feeSummary.remainingAmount)} se zyada nahi ho sakta.` }); return;
    }
    if (!feeSummary?.studentFeeId) { setMsg({ type: "error", text: "Page refresh karo." }); return; }

    setUtrLoading(true);
    try {
      await API.post("/payments/record-upi", {
        studentFeeId: feeSummary.studentFeeId,
        amount:       amt,
        utrNumber:    utrNumber.trim().toUpperCase(),
      });
      setMsg({
        type: "success",
        text: `UTR ${utrNumber.trim().toUpperCase()} record ho gaya ✅  Admin verify karne ke baad fees update hogi.`,
      });
      setUtrNumber(""); setUtrAmount(""); setShowUtr(false);
      setTimeout(loadSummary, 1500);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data || err.message });
    } finally {
      setUtrLoading(false);
    }
  };

  // ── Receipts constructed from paymentHistory ───────────────────────────────
  const buildReceipts = () => {
    if (!feeSummary?.paymentHistory?.length) return [];
    return feeSummary.paymentHistory.map((ph) => ({
      id:             ph.id,
      receiptNumber:  ph.receiptNumber || `PAY-${ph.id}`,
      issuedAt:       ph.paymentDate,
      issuedOn:       ph.paymentDate,
      amountPaid:     ph.amount,
      balanceDue:     feeSummary.remainingAmount,
      totalFees:      feeSummary.totalFees,
      paymentMode:    ph.paymentMode,
      transactionRef: ph.transactionId,
      academicYear:   null,
      studentName:    feeSummary.studentName,
      admissionNumber: feeSummary.rollNumber?.toString(),
      className:      feeSummary.className,
      section:        null,
      schoolName:     feeSummary.schoolName    || null,
      schoolAddress:  feeSummary.schoolAddress || null,
      schoolPhone:    feeSummary.schoolPhone   || null,
      schoolLogoUrl:  feeSummary.schoolLogoUrl || null,
      lineItems: (feeSummary.feeTerms || []).map((t) => ({
        feeName: t.termName,
        amount:  t.amount,
        status:  t.status || "PENDING",
      })),
    }));
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const receipts  = buildReceipts();
  const feeTerms  = feeSummary?.feeTerms || [];
  const totalFees = feeSummary?.totalFees      ?? 0;
  const totalPaid = feeSummary?.paidAmount     ?? feeSummary?.amountPaid    ?? 0;
  const totalDue  = feeSummary?.remainingAmount ?? feeSummary?.dueAmount    ?? 0;

  // UPI QR — no fixed amount so user sets it in the UPI app
  const upiQrUrl = feeSummary?.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `upi://pay?pa=${feeSummary.upiId}&pn=SchoolFees&cu=INR`
      )}`
    : null;

  // Inline message style
  const msgStyle = (type) => ({
    padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
    marginBottom: 14, border: "1px solid",
    background: type === "success" ? "#f0fdf4" : type === "error" ? "#fef2f2" : "#eff6ff",
    color:      type === "success" ? "#059669" : type === "error" ? "#dc2626" : "#1d4ed8",
    borderColor:type === "success" ? "#bbf7d0" : type === "error" ? "#fecaca" : "#bfdbfe",
  });

  const TABS = [
    { id: "summary",  label: "Fee Summary",  icon: <IndianRupee size={14} /> },
    { id: "receipts", label: "My Receipts",  icon: <ReceiptText size={14} /> },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
      <ParentSidebar />

      {toast && <Toast {...toast} />}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Fee Management</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              Apne bachche ki fees, payments aur receipts yahan dekho
            </p>
          </div>
          <button onClick={loadSummary} disabled={loading}
            style={{ ...S.btn("#f8fafc", "#64748b"), padding: "7px 14px", fontSize: 12, marginTop: 4 }}>
            <RefreshCcw size={12} /> Refresh
          </button>
        </div>

        {/* Hook loading */}
        {sidLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", marginBottom: 20 }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13 }}>Student details load ho rahi hain...</span>
          </div>
        )}

        {/* Hook error */}
        {!sidLoading && (sidError || !studentId) && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "14px 18px", marginBottom: 20,
            color: "#dc2626", display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {sidError || "Student ID nahi mila — logout karke dobara login karein."}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...S.btn(tab === t.id ? "#1e3a5f" : "#fff", tab === t.id ? "#fff" : "#475569"),
                boxShadow: tab === t.id ? "0 2px 8px rgba(30,58,95,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB 1 — FEE SUMMARY ══════════════ */}
        {tab === "summary" && (
          <div>
            {/* Stat cards */}
            <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <Stat label="Total Fees"  value={fmt(totalFees)} icon="🏷️" bg="#eff6ff" color="#1d4ed8" />
              <Stat label="Amount Paid" value={fmt(totalPaid)} icon="✅" bg="#f0fdf4" color="#059669" />
              <Stat
                label="Balance Due"
                value={fmt(totalDue)}
                icon={totalDue > 0 ? "⚠️" : "✅"}
                bg={totalDue > 0 ? "#fef2f2" : "#f0fdf4"}
                color={totalDue > 0 ? "#dc2626" : "#059669"}
              />
            </div>

            {/* Fee breakdown table */}
            <div style={S.card}>
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  Fee Breakdown
                  {feeSummary?.studentName && (
                    <span style={{ marginLeft: 10, fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                      — {feeSummary.studentName} ({feeSummary.className})
                    </span>
                  )}
                </h2>
              </div>

              {loading || sidLoading ? (
                <div style={{ padding: 52, textAlign: "center", color: "#94a3b8" }}>
                  <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ marginTop: 10 }}>Loading...</p>
                </div>
              ) : feeTerms.length === 0 ? (
                <div style={{ padding: 52, textAlign: "center", color: "#94a3b8" }}>
                  <IndianRupee size={36} color="#e2e8f0" style={{ marginBottom: 10 }} />
                  <p>Koi fee record nahi mila</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Fee Head","Amount","Due Date","Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {feeTerms.map((item) => {
                        const s      = (item.status || "PENDING").toUpperCase();
                        const sBg    = {PAID:"#dcfce7",PARTIAL:"#fef9c3",PENDING:"#fee2e2",DUE:"#fee2e2"}[s] ?? "#f1f5f9";
                        const sColor = {PAID:"#059669",PARTIAL:"#d97706",PENDING:"#dc2626",DUE:"#dc2626"}[s] ?? "#475569";
                        return (
                          <tr key={item.id}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>{item.termName || "—"}</td>
                            <td style={{ ...S.td, fontWeight: 600 }}>{fmt(item.amount)}</td>
                            <td style={{ ...S.td, color: "#64748b" }}>{fmtDate(item.dueDate)}</td>
                            <td style={S.td}>
                              <span style={{ background: sBg, color: sColor, borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                                {item.status || "PENDING"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#1e3a5f" }}>
                        <td style={{ ...S.td, fontWeight: 800, color: "#fff", borderBottom: "none" }}>TOTAL</td>
                        <td style={{ ...S.td, fontWeight: 800, color: "#fff", borderBottom: "none" }}>{fmt(totalFees)}</td>
                        <td style={{ ...S.td, borderBottom: "none" }} />
                        <td style={{ ...S.td, borderBottom: "none" }}>
                          <span style={{ background: totalDue > 0 ? "#dc2626" : "#059669", color: "#fff", borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>
                            {totalDue > 0 ? `Due: ${fmt(totalDue)}` : "CLEARED"}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* ── Inline payment message ── */}
            {msg && (
              <div style={msgStyle(msg.type)}>{msg.text}</div>
            )}

            {/* ── Payment Section (only when amount due) ── */}
            {!loading && !sidLoading && totalDue > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>

                {/* ── UPI / QR Card ── */}
                <div style={{ ...S.card, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <QrCode size={18} color="#1e3a5f" />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>UPI / QR Se Pay Karo</h3>
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8" }}>
                    PhonePe / GPay / Paytm se scan karo — <strong>app mein khud amount type karo (partial bhi ok)</strong>
                  </p>

                  {upiQrUrl ? (
                    <>
                      {/* QR image */}
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                        <img
                          src={upiQrUrl}
                          alt="UPI QR"
                          style={{ width: 176, height: 176, borderRadius: 12, border: "4px solid #eff6ff" }}
                        />
                      </div>

                      {/* UPI ID + Copy */}
                      {feeSummary?.upiId && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>{feeSummary.upiId}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(feeSummary.upiId);
                              notify("UPI ID copied! ✓");
                            }}
                            style={{
                              background: "#f1f5f9", border: "1px solid #e2e8f0",
                              borderRadius: 6, padding: "3px 8px",
                              cursor: "pointer", fontSize: 11, color: "#64748b",
                              display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Copy size={10} /> Copy
                          </button>
                        </div>
                      )}

                      <p style={{
                        textAlign: "center", fontSize: 11, color: "#d97706",
                        fontWeight: 600, marginBottom: 16,
                      }}>
                        ⚠️ QR scan ke baad UPI app mein manually amount type karo
                      </p>

                      {/* UTR Entry */}
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                        {!showUtr ? (
                          <button
                            onClick={() => { setShowUtr(true); setUtrAmount(String(feeSummary.remainingAmount)); }}
                            style={{
                              width: "100%", border: "2px solid #6366f1", color: "#4f46e5",
                              background: "#fff", borderRadius: 10, padding: "10px 16px",
                              fontSize: 13, fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            ✅ Pay kar diya? UTR / Transaction ID daalo
                          </button>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                              PhonePe / GPay mein payment ke baad UTR ya Transaction ID milta hai
                            </p>
                            <input
                              style={S.input}
                              type="text"
                              placeholder="UTR / Transaction ID (e.g. 506123456789)"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                            />
                            <div style={{ position: "relative" }}>
                              <span style={{
                                position: "absolute", left: 12, top: "50%",
                                transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13,
                              }}>₹</span>
                              <input
                                style={{ ...S.input, paddingLeft: 28 }}
                                type="number"
                                placeholder={`Kitna pay kiya? (max ₹${fmtNum(feeSummary.remainingAmount)})`}
                                value={utrAmount}
                                onChange={(e) => setUtrAmount(e.target.value)}
                                min="1"
                                max={feeSummary.remainingAmount}
                              />
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                              Due: ₹{fmtNum(feeSummary.remainingAmount)} — partial amount bhi de sakte ho
                            </p>

                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={handleUtrSubmit}
                                disabled={utrLoading}
                                style={{
                                  flex: 1, background: "#4f46e5", color: "#fff",
                                  border: "none", borderRadius: 10, padding: "10px 16px",
                                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                  opacity: utrLoading ? 0.6 : 1,
                                }}
                              >
                                {utrLoading
                                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Saving...</>
                                  : <><CheckCircle size={14} />Record Payment</>
                                }
                              </button>
                              <button
                                onClick={() => { setShowUtr(false); setUtrNumber(""); setUtrAmount(""); }}
                                style={{
                                  background: "#f8fafc", color: "#64748b",
                                  border: "1px solid #e2e8f0", borderRadius: 10,
                                  padding: "10px 14px", cursor: "pointer", fontSize: 13,
                                  display: "flex", alignItems: "center", gap: 4,
                                }}
                              >
                                <X size={13} /> Cancel
                              </button>
                            </div>

                            {/* Verification note */}
                            <div style={{
                              background: "#fffbeb", border: "1px solid #fde68a",
                              borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#92400e",
                            }}>
                              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>⏳ Verification Process:</p>
                              <p style={{ margin: "2px 0" }}>1. Tumhara UTR record hoga (status: Pending Verification)</p>
                              <p style={{ margin: "2px 0" }}>2. School admin bank statement se match karega</p>
                              <p style={{ margin: "2px 0" }}>3. Approve hone par fees automatically update ho jayegi</p>
                              <p style={{ margin: "6px 0 0", color: "#a16207" }}>Normally 1–2 working days mein verify hota hai</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", padding: "24px 0" }}>
                      School ne UPI ID set nahi ki hai abhi.
                    </p>
                  )}
                </div>

                {/* ── Card / Net Banking (Razorpay) Card ── */}
                <div style={{ ...S.card, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <CreditCard size={18} color="#1e3a5f" />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Card / Net Banking</h3>
                  </div>
                  <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94a3b8" }}>
                    Razorpay se — partial amount bhi de sakte ho
                  </p>

                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Kitna pay karna hai? (blank chhodo = full ₹{fmtNum(feeSummary?.remainingAmount)})
                  </label>
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%",
                      transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13,
                    }}>₹</span>
                    <input
                      style={{ ...S.input, paddingLeft: 28 }}
                      type="number"
                      placeholder={`Max ₹${fmtNum(feeSummary?.remainingAmount)}`}
                      value={rzpAmount}
                      onChange={(e) => setRzpAmount(e.target.value)}
                      min="1"
                      max={feeSummary?.remainingAmount}
                    />
                  </div>

                  {rzpAmount && Number(rzpAmount) < (feeSummary?.remainingAmount ?? 0) && (
                    <p style={{ margin: "0 0 14px", fontSize: 11, color: "#3b82f6" }}>
                      Partial payment: ₹{fmtNum(Number(rzpAmount))} —
                      baki ₹{fmtNum((feeSummary?.remainingAmount ?? 0) - Number(rzpAmount))} baad mein
                    </p>
                  )}

                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    style={{
                      width: "100%", background: paying ? "#94a3b8" : "#1e3a5f",
                      color: "#fff", border: "none", borderRadius: 10,
                      padding: "13px 16px", fontSize: 14, fontWeight: 700,
                      cursor: paying ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {paying
                      ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />Processing...</>
                      : <><CreditCard size={16} />Pay ₹{rzpAmount ? fmtNum(Number(rzpAmount)) : fmtNum(feeSummary?.remainingAmount)} Now</>
                    }
                  </button>

                  {/* Powered by */}
                  <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    🔒 Secured by Razorpay — Card, UPI, Net Banking, Wallet
                  </p>
                </div>
              </div>
            )}

            {/* All cleared message */}
            {!loading && !sidLoading && totalDue <= 0 && feeSummary && (
              <div style={{
                marginTop: 20, background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 12, padding: "20px 24px", textAlign: "center",
                color: "#059669", fontWeight: 700, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <CheckCircle size={20} /> Saari fees pay ho chuki hai! Koi balance nahi.
              </div>
            )}

            {/* Payment History */}
            {feeSummary?.paymentHistory?.length > 0 && (
              <div style={{ ...S.card, marginTop: 20 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Payment History</h2>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Date","Amount","Mode","Ref / Transaction ID","Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {feeSummary.paymentHistory.map((ph) => {
                        const s   = (ph.status || "").toUpperCase();
                        const bg  = {SUCCESS:"#dcfce7",PENDING_VERIFICATION:"#fef9c3",REJECTED:"#fee2e2"}[s] ?? "#f1f5f9";
                        const clr = {SUCCESS:"#059669",PENDING_VERIFICATION:"#d97706",REJECTED:"#dc2626"}[s] ?? "#475569";
                        return (
                          <tr key={ph.id}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ ...S.td, color: "#475569" }}>{fmtDate(ph.paymentDate)}</td>
                            <td style={{ ...S.td, fontWeight: 700, color: "#059669" }}>{fmt(ph.amount)}</td>
                            <td style={S.td}>
                              <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 8px", fontWeight: 600, fontSize: 12 }}>
                                {ph.paymentMode || "—"}
                              </span>
                            </td>
                            <td style={{ ...S.td, color: "#64748b", fontSize: 12 }}>{ph.transactionId || "—"}</td>
                            <td style={S.td}>
                              <span style={{
                                background: bg, color: clr,
                                borderRadius: 6, padding: "3px 10px",
                                fontWeight: 700, fontSize: 12,
                                display: "inline-flex", alignItems: "center", gap: 4,
                              }}>
                                {s === "SUCCESS" && <CheckCircle size={10} />}
                                {s === "PENDING_VERIFICATION" && <Clock size={10} />}
                                {ph.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Go to receipts */}
            {!loading && totalPaid > 0 && (
              <div style={{
                marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "12px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "#1d4ed8" }}>
                  💡 Apni payment receipts dekhne/download karne ke liye "My Receipts" tab pe jao
                </span>
                <button onClick={() => setTab("receipts")} style={{ ...S.btn("#1d4ed8"), padding: "6px 14px", fontSize: 12 }}>
                  View Receipts →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 2 — RECEIPTS ══════════════ */}
        {tab === "receipts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={loadSummary} disabled={loading}
                style={{ ...S.btn("#f8fafc", "#64748b"), padding: "7px 14px", fontSize: 12 }}>
                <RefreshCcw size={12} /> {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loading || sidLoading ? (
              <div style={{ ...S.card, padding: 52, textAlign: "center", color: "#94a3b8" }}>
                <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: 10 }}>Receipts load ho rahi hain...</p>
              </div>
            ) : receipts.length === 0 ? (
              <div style={{ ...S.card, padding: 52, textAlign: "center", color: "#94a3b8" }}>
                <ReceiptText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Koi payment nahi mili abhi</p>
                <p style={{ margin: "6px 0 0", fontSize: 12 }}>Payment ke baad receipt yahan dikhegi</p>
              </div>
            ) : (
              <div style={S.card}>
                <div style={{
                  padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                    Payment Receipts
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                      ({receipts.length} receipt{receipts.length > 1 ? "s" : ""})
                    </span>
                  </h2>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Receipt No.","Date","Student","Amount Paid","Mode","Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {receipts.map((rc, i) => (
                        <tr key={rc.id || i}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ ...S.td, fontWeight: 700, color: "#1e3a5f" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <ReceiptText size={13} color="#1e3a5f" />
                              {rc.receiptNumber}
                            </div>
                          </td>
                          <td style={{ ...S.td, color: "#475569" }}>{fmtDate(rc.issuedAt)}</td>
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{rc.studentName || "—"}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                              {rc.className}{rc.admissionNumber ? ` · Roll ${rc.admissionNumber}` : ""}
                            </div>
                          </td>
                          <td style={{ ...S.td, fontWeight: 700, color: "#059669" }}>{fmt(rc.amountPaid)}</td>
                          <td style={S.td}>
                            <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 8px", fontWeight: 600, fontSize: 12 }}>
                              {rc.paymentMode || "—"}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => setModalReceipt(rc)}
                                style={{
                                  background: "#eff6ff", color: "#1d4ed8", border: "none",
                                  borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
                                }}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                onClick={() => setModalReceipt(rc)}
                                style={{
                                  background: "#f0fdf4", color: "#059669", border: "none",
                                  borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
                                }}
                              >
                                <Printer size={12} /> Print/PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{
                  padding: "10px 20px", background: "#f8fafc",
                  borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#64748b",
                }}>
                  💡 <strong>View</strong> → receipt modal khulegi &nbsp;|&nbsp;
                  Modal mein <strong>Download PDF</strong> se save karo &nbsp;|&nbsp;
                  <strong>Print/PDF</strong> → printer dialog
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Receipt modal */}
      {modalReceipt && (
        <FeeReceiptTemplate
          receipt={modalReceipt}
          onClose={() => setModalReceipt(null)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      `}</style>
    </div>
  );
}