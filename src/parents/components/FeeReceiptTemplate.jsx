// src/parents/components/FeeReceiptTemplate.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Beautiful fee receipt template — shown in a modal
// Features:
//   • School branding (logo, name, address)
//   • Student info + fee breakdown table
//   • Amount paid / balance / payment mode
//   • Browser Print  (Ctrl+P / window.print)
//   • PDF Download   (pure JS — no extra lib needed, uses print-to-PDF trick)
//   • Backend HTML   (fallback via /fee-receipt/{id}/html endpoint)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import {
  X, Printer, Download, CheckCircle, Clock,
  CreditCard, Building2, User, Calendar, Hash,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n)
    : "—";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d)
    ? s
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const STATUS_COLOR = { PAID: "#059669", PARTIAL: "#d97706", DUE: "#dc2626" };
const MODE_ICON    = { ONLINE: "💳", CASH: "💵", CHEQUE: "🏦", UPI: "📱" };

// ─────────────────────────────────────────────────────────────────────────────
export default function FeeReceiptTemplate({ receipt, onClose }) {
  const printRef = useRef(null);

  if (!receipt) return null;

  const {
    receiptNumber, studentName, admissionNumber,
    className, section, academicYear,
    issuedAt, issuedOn,
    totalFees, amountPaid, balanceDue,
    paymentMode, transactionRef, paymentGateway,
    lineItems = [],
    schoolName, schoolLogoUrl, schoolAddress, schoolPhone,
    remarks,
  } = receipt;

  const isPaid        = (balanceDue ?? 0) <= 0;
  const displayDate   = issuedAt ? fmtDate(issuedAt) : (issuedOn ?? "—");
  const modeDisplay   = paymentMode ?? "—";
  const modeIcon      = MODE_ICON[modeDisplay] ?? "💳";

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=600");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>Fee Receipt — ${receiptNumber}</title>
          <style>
            @page { size: A5; margin: 8mm; }
            @media print { body { margin: 0; } }
            * { box-sizing: border-box; }
            body {
              font-family: 'Arial', sans-serif;
              font-size: 11px;
              color: #111;
              background: #fff;
            }
            .receipt-wrapper { max-width: 540px; margin: 0 auto; padding: 4mm; }
            .school-header { display: flex; align-items: center; gap: 10px;
              border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; margin-bottom: 8px; }
            .school-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 4px; }
            .school-logo-placeholder {
              width: 48px; height: 48px; background: #e2e8f0; border-radius: 4px;
              display: flex; align-items: center; justify-content: center;
              font-size: 20px; flex-shrink: 0;
            }
            .school-info h2 { margin: 0; color: #1e3a5f; font-size: 14px; }
            .school-info p  { margin: 1px 0; font-size: 10px; color: #555; }
            .receipt-title {
              background: #1e3a5f; color: #fff; text-align: center;
              padding: 5px; font-size: 13px; font-weight: bold;
              letter-spacing: 2px; margin: 8px 0;
            }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px;
              margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; }
            .info-row { display: contents; }
            .info-label { font-weight: bold; color: #334155; font-size: 10px; }
            .info-value { color: #111; font-size: 10px; }
            .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .fee-table th { background: #1e3a5f; color: #fff; padding: 5px 8px;
              text-align: left; font-size: 10px; }
            .fee-table td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
            .fee-table tr:last-child td { border-bottom: none; }
            .fee-table .right { text-align: right; }
            .summary-box { border: 2px solid #1e3a5f; border-radius: 6px; padding: 8px 12px; }
            .summary-row { display: flex; justify-content: space-between;
              padding: 3px 0; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .summary-row:last-child { border-bottom: none; }
            .summary-row.total { font-size: 14px; font-weight: bold; padding-top: 6px; }
            .paid-badge {
              display: inline-block; background: #059669; color: #fff;
              border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: bold;
            }
            .pending-badge {
              display: inline-block; background: #dc2626; color: #fff;
              border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: bold;
            }
            .footer { margin-top: 12px; text-align: center; font-size: 9px; color: #94a3b8;
              border-top: 1px solid #e2e8f0; padding-top: 6px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg);
              font-size: 72px; color: rgba(5,150,105,0.07); font-weight: 900;
              pointer-events: none; white-space: nowrap; }
          </style>
        </head>
        <body>
          ${isPaid ? '<div class="watermark">PAID</div>' : ''}
          <div class="receipt-wrapper">${content}</div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 800); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ── PDF Download via print dialog ─────────────────────────────────────────
  const handleDownload = () => {
    // same as print — user selects "Save as PDF" in print dialog
    handlePrint();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#f8fafc",
            borderRadius: 16,
            width: "100%",
            maxWidth: 620,
            maxHeight: "96vh",
            overflowY: "auto",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          {/* Modal Header bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            background: "#1e3a5f",
            borderRadius: "16px 16px 0 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CreditCard size={18} color="#fff" />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                Fee Receipt — {receiptNumber}
              </span>
              <span style={{
                background: isPaid ? "#059669" : "#f59e0b",
                color: "#fff", borderRadius: 6,
                padding: "2px 10px", fontSize: 11, fontWeight: 700,
              }}>
                {isPaid ? "✓ FULLY PAID" : "PARTIAL"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handlePrint}
                title="Print receipt"
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none",
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  color: "#fff", display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600,
                }}
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={handleDownload}
                title="Download as PDF"
                style={{
                  background: "#f59e0b", border: "none",
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  color: "#fff", display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600,
                }}
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none",
                  borderRadius: 8, padding: "7px 10px", cursor: "pointer",
                  color: "#fff",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Printable receipt area ────────────────────────────────────── */}
          <div style={{ padding: "24px 28px" }}>
            <div ref={printRef}>

              {/* School header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                borderBottom: "3px solid #1e3a5f",
                paddingBottom: 14, marginBottom: 14,
              }}>
                {schoolLogoUrl
                  ? <img src={schoolLogoUrl} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6 }} />
                  : (
                    <div style={{
                      width: 56, height: 56, background: "#e2e8f0",
                      borderRadius: 8, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 24, flexShrink: 0,
                    }}>🏫</div>
                  )
                }
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#1e3a5f" }}>
                    {schoolName || "School Name"}
                  </div>
                  {schoolAddress && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{schoolAddress}</div>
                  )}
                  {schoolPhone && (
                    <div style={{ fontSize: 11, color: "#64748b" }}>📞 {schoolPhone}</div>
                  )}
                </div>
              </div>

              {/* RECEIPT title banner */}
              <div style={{
                background: "#1e3a5f", color: "#fff",
                textAlign: "center", padding: "7px 0",
                fontWeight: 800, fontSize: 14, letterSpacing: 3,
                borderRadius: 6, marginBottom: 16,
              }}>
                FEE RECEIPT
              </div>

              {/* Info grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "6px 12px",
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
              }}>
                {[
                  [<Hash size={11} />, "Receipt No.", receiptNumber],
                  [<Calendar size={11} />, "Date & Time", displayDate],
                  [<User size={11} />, "Student Name", studentName],
                  [null, "Admission No.", admissionNumber],
                  [null, "Class / Section", `${className || "—"} ${section ? `– ${section}` : ""}`],
                  [null, "Academic Year", academicYear],
                  [null, "Payment Mode", `${modeIcon} ${modeDisplay}`],
                  [null, "Transaction Ref.", transactionRef || "—"],
                  ...(paymentGateway ? [[null, "Gateway", paymentGateway]] : []),
                ].map(([icon, label, value], i) => (
                  <div key={i} style={{ display: "contents" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      {icon} {label}
                    </div>
                    <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Fee breakdown table */}
              {lineItems.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Fee Breakdown
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#1e3a5f" }}>
                        <th style={{ padding: "8px 12px", color: "#fff", textAlign: "left", fontWeight: 700, fontSize: 12, borderRadius: "6px 0 0 0" }}>
                          Fee Head
                        </th>
                        <th style={{ padding: "8px 12px", color: "#fff", textAlign: "right", fontWeight: 700, fontSize: 12 }}>
                          Amount
                        </th>
                        <th style={{ padding: "8px 12px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 12, borderRadius: "0 6px 0 0" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 === 0 ? "#f8fafc" : "#fff",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <td style={{ padding: "8px 12px", fontWeight: 500, color: "#1e293b" }}>
                            {item.feeName || "—"}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>
                            {fmt(item.amount)}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <span style={{
                              background: `${STATUS_COLOR[item.status] || "#6b7280"}22`,
                              color: STATUS_COLOR[item.status] || "#6b7280",
                              borderRadius: 5, padding: "2px 8px",
                              fontSize: 11, fontWeight: 700,
                            }}>
                              {item.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary box */}
              <div style={{
                border: "2px solid #1e3a5f", borderRadius: 10,
                overflow: "hidden", marginBottom: 16,
              }}>
                <div style={{
                  background: "#1e3a5f", color: "#fff",
                  padding: "7px 14px", fontWeight: 700, fontSize: 12,
                }}>
                  Payment Summary
                </div>
                <div style={{ padding: "10px 14px" }}>
                  {[
                    ["Total Fees", fmt(totalFees), "#1e293b"],
                    ["Amount Paid", fmt(amountPaid), "#059669"],
                    ["Balance Due", fmt(balanceDue), (balanceDue ?? 0) > 0 ? "#dc2626" : "#059669"],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "7px 0", borderBottom: "1px solid #f1f5f9",
                    }}>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color }}>{value}</span>
                    </div>
                  ))}

                  {/* BIG amount paid */}
                  <div style={{
                    background: "#f0fdf4", borderRadius: 8,
                    padding: "12px 14px", marginTop: 10,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>AMOUNT RECEIVED</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#059669" }}>
                        {fmt(amountPaid)}
                      </div>
                    </div>
                    <div style={{
                      background: isPaid ? "#059669" : "#f59e0b",
                      color: "#fff", borderRadius: 8,
                      padding: "8px 16px", fontWeight: 800, fontSize: 14,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {isPaid
                        ? <><CheckCircle size={16} /> PAID</>
                        : <><Clock size={16} /> PARTIAL</>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {remarks && (
                <div style={{
                  background: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: 8, padding: "8px 12px", marginBottom: 14,
                  fontSize: 12, color: "#92400e",
                }}>
                  <strong>Remarks:</strong> {remarks}
                </div>
              )}

              {/* Footer */}
              <div style={{
                borderTop: "1px solid #e2e8f0", paddingTop: 12,
                textAlign: "center", fontSize: 10, color: "#94a3b8",
              }}>
                <p style={{ margin: 0 }}>
                  This is a computer-generated receipt and does not require a physical signature.
                </p>
                <p style={{ margin: "3px 0 0" }}>
                  Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>

            </div>{/* /printRef */}
          </div>

        </div>
      </div>
    </>
  );
}