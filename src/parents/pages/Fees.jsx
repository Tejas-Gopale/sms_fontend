// src/parents/pages/ParentFees.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FIXES:
//  1. loadReceipts → uses feeReceiptService.getByStudent() instead of getForParent()
//     - getByStudent returns Page<FeeReceiptResponse> with FULL details
//       (school name, logo, student info, lineItems) in ONE call
//     - getForParent returned FeeReceiptSummaryResponse[] — no school details,
//       no lineItems, modal could never render properly
//
//  2. openReceipt → just sets modal from existing list data (no second API call)
//     - Previously called getByReceiptNumber() which hit FeeReceiptController
//       with the (Long) auth.getDetails() bug → ClassCastException → 500
//
//  3. Development fix → clear warning when studentId is null from localStorage
//
// APIs:
//   GET /parent/fees/{studentId}          → StudentFeesResponse   (Tab 1 summary)
//   GET /fee-receipt/student/{studentId}  → Page<FeeReceiptResponse> (Tab 2 receipts)
//   GET /fee-receipt/{id}/html            → print HTML  (Print button)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import FeeReceiptTemplate from "../components/FeeReceiptTemplate";
import feeReceiptService from "../../common/services/feeReceiptService";
import API from "../../common/services/api";
import {
  IndianRupee, ReceiptText, RefreshCcw, Eye,
  Printer, AlertCircle,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
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
  td: { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f8fafc" },
};

function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24,
      background: ok ? "#059669" : "#dc2626",
      color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontWeight: 600, zIndex: 9999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 13,
    }}>
      {msg}
    </div>
  );
}

function Stat({ label, value, bg, color, icon }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ParentFees() {
  const studentId =
    localStorage.getItem("linkedStudentId") ||
    localStorage.getItem("studentId");

  const [tab, setTab]         = useState("summary");
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);

  // Tab 1 — fee summary
  const [feeSummary, setFeeSummary] = useState(null);

  // Tab 2 — full receipts (FeeReceiptResponse[])
  const [receipts, setReceipts]   = useState([]);
  const [rcLoading, setRcLoading] = useState(false);

  // Modal — just a pointer to an item from `receipts`, no extra API call
  const [modalReceipt, setModalReceipt] = useState(null);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load fee summary (Tab 1) ───────────────────────────────────────────────
  const loadSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const r = await API.get(`/parent/fees/${studentId}`);
      setFeeSummary(r.data);
    } catch (e) {
      notify(e.response?.data?.message || "Fee summary load nahi hui", false);
    } finally {
      setLoading(false);
    }
  };

  // ── Load receipts (Tab 2) ─────────────────────────────────────────────────
  // FIX: use getByStudent → returns Page<FeeReceiptResponse>
  //      Full details included: schoolName, schoolLogoUrl, schoolAddress,
  //      studentName, admissionNumber, className, lineItems[], etc.
  //      No second API call needed when user clicks "View".
  const loadReceipts = async () => {
    if (!studentId) return;
    setRcLoading(true);
    try {
      const r = await feeReceiptService.getByStudent(studentId, 0, 50);
      // Page<FeeReceiptResponse> → .data.content is the array
      setReceipts(r.data?.content || []);
    } catch (e) {
      notify(e.response?.data?.message || "Receipts load nahi hue", false);
    } finally {
      setRcLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, []);

  useEffect(() => {
    if (tab === "receipts" && receipts.length === 0) loadReceipts();
  }, [tab]);

  // ── Open modal — rc is already a full FeeReceiptResponse ─────────────────
  // FIX: no API call here; data is already in the list
  const openReceipt = (rc) => setModalReceipt(rc);

  // ── Print via backend HTML endpoint ───────────────────────────────────────
  const printViaBackend = async (rc) => {
    if (!rc.id) {
      notify("Receipt ID missing — View button se PDF download karo", false);
      return;
    }
    try {
      const r = await feeReceiptService.getHtml(rc.id);
      const win = window.open("", "_blank");
      win.document.write(r.data);
      win.document.close();
    } catch {
      notify("Print page load nahi hua — View → Download PDF try karo", false);
    }
  };

  // ── Derive totals ─────────────────────────────────────────────────────────
  const feeItems = feeSummary?.feeItems || feeSummary?.items || [];
  const totalFees = feeSummary?.totalFees   ?? feeSummary?.totalAmount ?? 0;
  const totalPaid = feeSummary?.amountPaid  ?? feeSummary?.paidAmount  ?? 0;
  const totalDue  = feeSummary?.balanceDue  ?? feeSummary?.dueAmount   ?? 0;

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

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
            Fee Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            Apne bachche ki fees aur receipts yahan dekho
          </p>
        </div>

        {/* No student ID — dev / login issue */}
        {!studentId && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            color: "#dc2626", display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Student ID nahi mila localStorage mein — logout karke dobara login karein.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...S.btn(tab === t.id ? "#1e3a5f" : "#fff", tab === t.id ? "#fff" : "#475569"),
                boxShadow: tab === t.id
                  ? "0 2px 8px rgba(30,58,95,0.35)"
                  : "0 1px 4px rgba(0,0,0,0.08)",
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
                </h2>
                <button onClick={loadSummary} disabled={loading}
                  style={{ ...S.btn("#f8fafc", "#64748b"), padding: "6px 12px", fontSize: 12 }}>
                  <RefreshCcw size={12} /> Refresh
                </button>
              </div>

              {loading ? (
                <div style={{ padding: 52, textAlign: "center", color: "#94a3b8" }}>
                  <RefreshCcw size={22} style={{ animation: "spin 1s linear infinite" }} />
                  <p>Loading...</p>
                </div>
              ) : feeItems.length === 0 ? (
                <div style={{ padding: 52, textAlign: "center", color: "#94a3b8" }}>
                  <IndianRupee size={36} color="#e2e8f0" style={{ marginBottom: 10 }} />
                  <p>Koi fee record nahi mila</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Fee Head", "Total Amount", "Paid", "Due", "Status"].map((h) => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {feeItems.map((item, i) => {
                        const status    = item.status || item.feeStatus || "DUE";
                        const statusBg  = { PAID: "#dcfce7", PARTIAL: "#fef9c3", DUE: "#fee2e2" }[status] ?? "#f1f5f9";
                        const statusClr = { PAID: "#059669", PARTIAL: "#d97706", DUE: "#dc2626" }[status] ?? "#475569";
                        return (
                          <tr key={i}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>
                              {item.feeName || item.name || "—"}
                            </td>
                            <td style={S.td}>{fmt(item.amount || item.totalAmount)}</td>
                            <td style={{ ...S.td, color: "#059669", fontWeight: 600 }}>
                              {fmt(item.paidAmount ?? item.amountPaid)}
                            </td>
                            <td style={{
                              ...S.td, fontWeight: 600,
                              color: (item.dueAmount ?? item.balanceDue ?? 0) > 0 ? "#dc2626" : "#059669",
                            }}>
                              {fmt(item.dueAmount ?? item.balanceDue)}
                            </td>
                            <td style={S.td}>
                              <span style={{
                                background: statusBg, color: statusClr,
                                borderRadius: 6, padding: "3px 10px",
                                fontWeight: 700, fontSize: 12,
                              }}>
                                {status}
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
                        <td style={{ ...S.td, fontWeight: 800, color: "#86efac", borderBottom: "none" }}>{fmt(totalPaid)}</td>
                        <td style={{
                          ...S.td, fontWeight: 800, borderBottom: "none",
                          color: totalDue > 0 ? "#fca5a5" : "#86efac",
                        }}>{fmt(totalDue)}</td>
                        <td style={{ ...S.td, borderBottom: "none" }}>
                          <span style={{
                            background: totalDue > 0 ? "#dc2626" : "#059669",
                            color: "#fff", borderRadius: 6, padding: "3px 10px",
                            fontWeight: 700, fontSize: 12,
                          }}>
                            {totalDue > 0 ? "PENDING" : "CLEARED"}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Quick link to receipts tab */}
            {!loading && totalPaid > 0 && (
              <div style={{
                marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "12px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "#1d4ed8" }}>
                  💡 Apni payment receipts dekhne ke liye "My Receipts" tab pe jao
                </span>
                <button onClick={() => setTab("receipts")}
                  style={{ ...S.btn("#1d4ed8"), padding: "6px 14px", fontSize: 12 }}>
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
              <button onClick={loadReceipts} disabled={rcLoading}
                style={{ ...S.btn("#f8fafc", "#64748b"), padding: "7px 14px", fontSize: 12 }}>
                <RefreshCcw size={12} /> {rcLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {rcLoading ? (
              <div style={{ ...S.card, padding: 52, textAlign: "center", color: "#94a3b8" }}>
                <RefreshCcw size={22} style={{ animation: "spin 1s linear infinite" }} />
                <p>Receipts load ho rahi hain...</p>
              </div>
            ) : receipts.length === 0 ? (
              <div style={{ ...S.card, padding: 52, textAlign: "center", color: "#94a3b8" }}>
                <ReceiptText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Koi receipt abhi nahi hai</p>
                <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                  Payment ke baad receipt yahan dikhegi
                </p>
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
                      ({receipts.length} receipts)
                    </span>
                  </h2>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Receipt No.", "Date", "Student", "Amount Paid", "Balance Due", "Mode", "Year", "Actions"].map((h) => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((rc, i) => {
                        const isPaid = (rc.balanceDue ?? 0) <= 0;
                        // FeeReceiptResponse uses issuedAt (LocalDateTime); fallback to issuedOn
                        const dateVal = rc.issuedAt || rc.issuedOn;
                        return (
                          <tr key={rc.id || i}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            {/* Receipt number */}
                            <td style={{ ...S.td, fontWeight: 700, color: "#1e3a5f" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ReceiptText size={13} color="#1e3a5f" />
                                {rc.receiptNumber}
                              </div>
                            </td>

                            {/* Date */}
                            <td style={{ ...S.td, color: "#475569" }}>
                              {fmtDate(dateVal)}
                            </td>

                            {/* Student — available because FeeReceiptResponse is full DTO */}
                            <td style={S.td}>
                              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
                                {rc.studentName || "—"}
                              </div>
                              {rc.admissionNumber && (
                                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                                  {rc.admissionNumber}
                                </div>
                              )}
                            </td>

                            {/* Amount Paid */}
                            <td style={{ ...S.td, fontWeight: 700, color: "#059669" }}>
                              {fmt(rc.amountPaid)}
                            </td>

                            {/* Balance Due */}
                            <td style={{ ...S.td, fontWeight: 600, color: isPaid ? "#059669" : "#dc2626" }}>
                              {fmt(rc.balanceDue)}
                            </td>

                            {/* Payment Mode */}
                            <td style={S.td}>
                              <span style={{
                                background: "#eff6ff", color: "#1d4ed8",
                                borderRadius: 6, padding: "2px 8px",
                                fontWeight: 600, fontSize: 12,
                              }}>
                                {rc.paymentMode || "—"}
                              </span>
                            </td>

                            {/* Academic Year */}
                            <td style={{ ...S.td, color: "#64748b", fontSize: 12 }}>
                              {rc.academicYear || "—"}
                            </td>

                            {/* Actions */}
                            <td style={S.td}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {/* View — opens modal instantly (data already loaded) */}
                                <button
                                  onClick={() => openReceipt(rc)}
                                  title="Receipt modal mein dekho"
                                  style={{
                                    background: "#eff6ff", color: "#1d4ed8",
                                    border: "none", borderRadius: 6,
                                    padding: "5px 10px", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4,
                                    fontSize: 12, fontWeight: 600,
                                  }}
                                >
                                  <Eye size={12} /> View
                                </button>

                                {/* Print via backend HTML endpoint */}
                                <button
                                  onClick={() => printViaBackend(rc)}
                                  title="Print-ready page kholo"
                                  style={{
                                    background: "#f0fdf4", color: "#059669",
                                    border: "none", borderRadius: 6,
                                    padding: "5px 10px", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4,
                                    fontSize: 12, fontWeight: 600,
                                  }}
                                >
                                  <Printer size={12} /> Print
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {receipts.length > 0 && (
              <div style={{
                marginTop: 14, background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#64748b",
              }}>
                💡 <strong>View</strong> — school logo, student details, fee breakdown + PDF download &nbsp;|&nbsp;
                <strong>Print</strong> — seedha print dialog (PDF save bhi ho sakta hai)
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Receipt Modal — FeeReceiptTemplate renders school name, logo, lineItems etc. ── */}
      {modalReceipt && (
        <FeeReceiptTemplate
          receipt={modalReceipt}
          onClose={() => setModalReceipt(null)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
// import { useEffect, useState, useRef } from "react";
// import ParentSidebar from "../components/ParentSidebar";
// import {
//   Loader2, AlertCircle, IndianRupee, CreditCard, QrCode,
//   CheckCircle, Clock, Copy, RefreshCw
// } from "lucide-react";
// import { getStudentFees } from "../../common/services/parentService";
// import useParentStudent from "../../common/hooks/useParentStudent";
// import API from "../../common/services/api";

// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) { resolve(true); return; }
//     if (document.getElementById("razorpay-script")) { resolve(true); return; }
//     const s = document.createElement("script");
//     s.id = "razorpay-script";
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload  = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// const fmt = (n) => (n ?? 0).toLocaleString("en-IN");

// const msgCls = (t) =>
//   t === "success" ? "bg-green-50 border-green-200 text-green-700"
//   : t === "error"  ? "bg-red-50 border-red-200 text-red-600"
//   :                  "bg-blue-50 border-blue-200 text-blue-600";

// const statusCls = (s) => {
//   const v = (s || "").toUpperCase();
//   if (v === "PAID")                 return "bg-green-100 text-green-700";
//   if (v === "PARTIAL")              return "bg-blue-100 text-blue-700";
//   if (v === "OVERDUE")              return "bg-red-100 text-red-600";
//   if (v === "PENDING_VERIFICATION") return "bg-orange-100 text-orange-700";
//   if (v === "SUCCESS")              return "bg-green-100 text-green-700";
//   if (v === "REJECTED")             return "bg-red-100 text-red-600";
//   return "bg-yellow-100 text-yellow-700";
// };

// export default function ParentFees() {
//   const { studentId, loading: sidLoading, error: sidError } = useParentStudent();

//   const [fees,       setFees]       = useState(null);
//   const [loading,    setLoading]    = useState(false);
//   const [error,      setError]      = useState(null);
//   const [msg,        setMsg]        = useState(null);

//   // Razorpay
//   const [paying,     setPaying]     = useState(false);
//   const [rzpAmount,  setRzpAmount]  = useState("");

//   // UPI UTR
//   const [showUtr,    setShowUtr]    = useState(false);
//   const [utrNumber,  setUtrNumber]  = useState("");
//   const [utrAmount,  setUtrAmount]  = useState("");
//   const [utrLoading, setUtrLoading] = useState(false);

//   const printRef = useRef();

//   const loadFees = () => {
//     if (!studentId) return;
//     setLoading(true);
//     getStudentFees(studentId)
//       .then((res) => setFees(res.data))
//       .catch(() => setError("Could not load fees data."))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { loadFees(); }, [studentId]);

//   // ── Razorpay — partial amount support ──────────────────────────────────────
//   const handlePayNow = async () => {
//     setMsg(null);
//     const payAmt = rzpAmount ? Number(rzpAmount) : fees?.remainingAmount;

//     if (!payAmt || payAmt <= 0) {
//       setMsg({ type: "error", text: "Valid amount enter karo." }); return;
//     }
//     if (payAmt > (fees?.remainingAmount ?? 0) + 0.01) {
//       setMsg({ type: "error", text: `Amount ₹${fmt(fees.remainingAmount)} (due) se zyada nahi ho sakta.` }); return;
//     }
//     if (!fees.schoolId || !fees.studentFeeId) {
//       setMsg({ type: "error", text: "Page refresh karo — details load nahi hui." }); return;
//     }

//     setPaying(true);
//     try {
//       const loaded = await loadRazorpayScript();
//       if (!loaded) throw new Error("Razorpay SDK load nahi hua. Internet check karo.");

//       const { data } = await API.post("/payments/create-order", {
//         schoolId:     fees.schoolId,
//         amount:       payAmt,
//         studentFeeId: fees.studentFeeId,
//       });

//       const options = {
//         key:         data.keyId,
//         amount:      Math.round(payAmt * 100),
//         currency:    "INR",
//         name:        "School Fees",
//         description: `Fees - ${fees.studentName}`,
//         order_id:    data.orderId,
//         prefill:     { name: fees.studentName },
//         theme:       { color: "#4F46E5" },
//         handler: () => {
//           setMsg({ type: "success", text: "Payment successful! 🎉 Fees update ho rahi hai..." });
//           setRzpAmount("");
//           setTimeout(loadFees, 2500);
//           setPaying(false);
//         },
//         modal: {
//           ondismiss: () => { setMsg({ type: "info", text: "Payment cancel." }); setPaying(false); },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on("payment.failed", (r) => {
//         setMsg({ type: "error", text: `Payment fail: ${r.error.description}` });
//         setPaying(false);
//       });
//       rzp.open();
//     } catch (err) {
//       setMsg({ type: "error", text: err.response?.data || err.message });
//       setPaying(false);
//     }
//   };

//   // ── UPI UTR record ─────────────────────────────────────────────────────────
//   const handleUtrSubmit = async () => {
//     setMsg(null);
//     const amt = Number(utrAmount);
//     if (!utrNumber.trim())           { setMsg({ type: "error", text: "UTR / Transaction ID daalo." }); return; }
//     if (!amt || amt <= 0)            { setMsg({ type: "error", text: "Valid amount daalo." }); return; }
//     if (amt > (fees?.remainingAmount ?? 0) + 0.01)
//       { setMsg({ type: "error", text: `Amount ₹${fmt(fees.remainingAmount)} se zyada nahi ho sakta.` }); return; }
//     if (!fees?.studentFeeId)         { setMsg({ type: "error", text: "Page refresh karo." }); return; }

//     setUtrLoading(true);
//     try {
//       await API.post("/api/payments/record-upi", {
//         studentFeeId: fees.studentFeeId,
//         amount:       amt,
//         utrNumber:    utrNumber.trim().toUpperCase(),
//       });
//       setMsg({
//         type: "success",
//         text: `UTR ${utrNumber.trim().toUpperCase()} record ho gaya ✅  Admin verify karne ke baad fees ghatti dikhegi.`,
//       });
//       setUtrNumber("");
//       setUtrAmount("");
//       setShowUtr(false);
//       setTimeout(loadFees, 1500);
//     } catch (err) {
//       setMsg({ type: "error", text: err.response?.data || err.message });
//     } finally {
//       setUtrLoading(false);
//     }
//   };

//   // QR — NO fixed amount (am= parameter hata diya) so user UPI app mein khud type kare
//   const upiQrUrl = fees?.upiId
//     ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
//         `upi://pay?pa=${fees.upiId}&pn=SchoolFees&cu=INR`
//       )}`
//     : null;

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <ParentSidebar />
//       <div className="flex-1 p-6 md:p-8">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
//             <IndianRupee className="text-green-600" size={28} /> Fees Payment
//           </h1>
//           <button onClick={loadFees} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
//             <RefreshCw size={15} /> Refresh
//           </button>
//         </div>

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
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
//                 <p className="text-xs text-gray-500 mb-1">Total Fees</p>
//                 <p className="text-xl font-bold text-slate-800">₹{fmt(fees.totalFees)}</p>
//               </div>
//               <div className="bg-green-50 p-5 rounded-2xl shadow-sm border border-green-100">
//                 <p className="text-xs text-gray-500 mb-1">Paid</p>
//                 <p className="text-xl font-bold text-green-700">₹{fmt(fees.paidAmount)}</p>
//               </div>
//               <div className={`p-5 rounded-2xl shadow-sm border ${
//                 fees.remainingAmount > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
//               }`}>
//                 <p className="text-xs text-gray-500 mb-1">Remaining</p>
//                 <p className={`text-xl font-bold ${fees.remainingAmount > 0 ? "text-red-600" : "text-green-700"}`}>
//                   ₹{fmt(fees.remainingAmount)}
//                 </p>
//               </div>
//             </div>

//             {/* Global message */}
//             {msg && (
//               <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${msgCls(msg.type)}`}>
//                 {msg.text}
//               </div>
//             )}

//             {/* Fee Items Table */}
//             <div ref={printRef} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
//               <h2 className="text-base font-bold mb-4 text-slate-800">Fee Breakdown</h2>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b bg-slate-50 text-slate-600">
//                     <th className="p-3 text-left font-semibold">Fee Head</th>
//                     <th className="p-3 text-left font-semibold">Amount</th>
//                     <th className="p-3 text-left font-semibold">Due Date</th>
//                     <th className="p-3 text-left font-semibold">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {fees.feeTerms?.map((f) => (
//                     <tr key={f.id} className="border-b hover:bg-slate-50">
//                       <td className="p-3 font-medium">{f.termName}</td>
//                       <td className="p-3">₹{fmt(f.amount)}</td>
//                       <td className="p-3 text-slate-500">{f.dueDate ?? "—"}</td>
//                       <td className="p-3">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCls(f.status)}`}>
//                           {f.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {fees.remainingAmount > 0 && (
//               <div className="grid md:grid-cols-2 gap-6 mb-6">

//                 {/* ── UPI / QR Card ──────────────────────────────────────── */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                   <h2 className="text-base font-bold mb-1 text-slate-800 flex items-center gap-2">
//                     <QrCode size={18} /> UPI / QR Se Pay Karo
//                   </h2>
//                   <p className="text-xs text-gray-400 mb-4">
//                     PhonePe / GPay / Paytm se scan karo —{" "}
//                     <strong>app mein khud amount type karo (partial bhi ok)</strong>
//                   </p>

//                   {upiQrUrl ? (
//                     <>
//                       <div className="flex justify-center mb-3">
//                         <img src={upiQrUrl} alt="UPI QR" className="rounded-xl border-4 border-indigo-50 w-44 h-44" />
//                       </div>
//                       {fees.upiId && (
//                         <div className="flex items-center justify-center gap-2 mb-3">
//                           <span className="text-sm font-semibold text-indigo-600">{fees.upiId}</span>
//                           <button
//                             onClick={() => { navigator.clipboard.writeText(fees.upiId); setMsg({ type: "info", text: "UPI ID copied!" }); }}
//                             className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-0.5 flex items-center gap-1"
//                           ><Copy size={11} /> Copy</button>
//                         </div>
//                       )}
//                       <p className="text-xs text-center text-amber-600 font-medium mb-4">
//                         ⚠️ QR scan ke baad UPI app mein manually amount type karo (koi bhi amount doge toh chalega)
//                       </p>

//                       {/* UTR Entry */}
//                       <div className="border-t pt-4">
//                         {!showUtr ? (
//                           <button
//                             onClick={() => { setShowUtr(true); setUtrAmount(String(fees.remainingAmount)); }}
//                             className="w-full border-2 border-indigo-300 text-indigo-600 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-50"
//                           >
//                             ✅ Pay kar diya? UTR / Transaction ID daalo
//                           </button>
//                         ) : (
//                           <div className="space-y-2">
//                             <p className="text-xs text-gray-500 font-medium">
//                               PhonePe / GPay mein payment ke baad UTR ya Transaction ID milta hai
//                             </p>
//                             <input
//                               type="text"
//                               placeholder="UTR / Transaction ID (e.g. 506123456789)"
//                               value={utrNumber}
//                               onChange={(e) => setUtrNumber(e.target.value)}
//                               className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                             />
//                             <div className="relative">
//                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
//                               <input
//                                 type="number"
//                                 placeholder="Kitna pay kiya? (partial bhi ok)"
//                                 value={utrAmount}
//                                 onChange={(e) => setUtrAmount(e.target.value)}
//                                 className="w-full border rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                                 min="1"
//                                 max={fees.remainingAmount}
//                               />
//                             </div>
//                             <p className="text-xs text-gray-400">Due: ₹{fmt(fees.remainingAmount)} — partial amount bhi de sakte ho</p>

//                             <div className="flex gap-2">
//                               <button
//                                 onClick={handleUtrSubmit}
//                                 disabled={utrLoading}
//                                 className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-1"
//                               >
//                                 {utrLoading
//                                   ? <><Loader2 size={14} className="animate-spin" />Saving...</>
//                                   : <><CheckCircle size={14} />Record Payment</>}
//                               </button>
//                               <button
//                                 onClick={() => { setShowUtr(false); setUtrNumber(""); setUtrAmount(""); }}
//                                 className="px-4 border rounded-xl text-sm text-gray-500 hover:bg-gray-50"
//                               >Cancel</button>
//                             </div>

//                             <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
//                               <p className="font-semibold mb-1">⏳ Verification Process:</p>
//                               <p>1. Tumhara UTR record hoga (status: Pending Verification)</p>
//                               <p>2. School admin bank statement se match karega</p>
//                               <p>3. Approve hone par fees automatically update ho jayegi</p>
//                               <p className="mt-1 text-gray-400">Normally 1–2 working days mein verify hota hai</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   ) : (
//                     <p className="text-center text-sm text-gray-400 py-8">School ne UPI ID set nahi ki hai abhi.</p>
//                   )}
//                 </div>

//                 {/* ── Online Pay Card ────────────────────────────────────── */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                   <h2 className="text-base font-bold mb-1 text-slate-800 flex items-center gap-2">
//                     <CreditCard size={18} /> Card / Net Banking
//                   </h2>
//                   <p className="text-xs text-gray-400 mb-4">Razorpay se — partial amount bhi de sakte ho</p>

//                   <div className="mb-3">
//                     <label className="text-xs text-gray-500 font-medium mb-1 block">
//                       Kitna pay karna hai? (blank chhodo = full ₹{fmt(fees.remainingAmount)})
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
//                       <input
//                         type="number"
//                         placeholder={`Max ₹${fmt(fees.remainingAmount)}`}
//                         value={rzpAmount}
//                         onChange={(e) => setRzpAmount(e.target.value)}
//                         className="w-full border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                         min="1"
//                         max={fees.remainingAmount}
//                       />
//                     </div>
//                     {rzpAmount && Number(rzpAmount) < fees.remainingAmount && (
//                       <p className="text-xs text-blue-500 mt-1">
//                         Partial payment: ₹{fmt(Number(rzpAmount))} — baki ₹{fmt(fees.remainingAmount - Number(rzpAmount))} baad mein
//                       </p>
//                     )}
//                   </div>

//                   <button
//                     onClick={handlePayNow}
//                     disabled={paying}
//                     className="w-full bg-indigo-600 text-white p-3.5 rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
//                   >
//                     {paying
//                       ? <><Loader2 size={16} className="animate-spin" />Processing...</>
//                       : <><CreditCard size={16} />Pay ₹{rzpAmount ? fmt(Number(rzpAmount)) : fmt(fees.remainingAmount)} Now</>}
//                   </button>

//                   <button onClick={() => window.print()} className="w-full bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black">
//                     Print Receipt
//                   </button>
//                 </div>
//               </div>
//             )}

//             {fees.remainingAmount <= 0 && (
//               <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center text-green-700 font-semibold mb-6">
//                 ✅ Saari fees pay ho chuki hai! Koi balance nahi.
//               </div>
//             )}

//             {/* Payment History */}
//             {fees.paymentHistory?.length > 0 && (
//               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//                 <h2 className="text-base font-bold mb-4 text-slate-800">Payment History</h2>
//                 <div>
//                   {fees.paymentHistory.map((ph) => (
//                     <div key={ph.id} className="flex justify-between items-center py-3 border-b last:border-0">
//                       <div>
//                         <p className="font-semibold text-slate-700 text-sm">₹{fmt(ph.amount)}</p>
//                         <p className="text-xs text-slate-400 mt-0.5">{ph.paymentDate} · {ph.paymentMode}</p>
//                         {ph.transactionId && <p className="text-xs text-slate-400">Ref: {ph.transactionId}</p>}
//                       </div>
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(ph.status)}`}>
//                         {ph.status === "PENDING_VERIFICATION"
//                           ? <span className="flex items-center gap-1"><Clock size={10} /> Pending</span>
//                           : ph.status}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
