// src/school_admin/pages/IdentityCard.jsx
// Role: SCHOOL_ADMIN / PRINCIPAL
// Tabs: Print Cards | Manage Templates
// APIs: /api/v1/identity-card/* (see idCardService.js)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { templateService, renderService } from "../../common/services/idCardService";
import API from "../../common/services/api";
import {
  CreditCard, Settings2, Printer, RefreshCcw, Plus, Trash2,
  Pencil, CheckCircle, X, Users, GraduationCap, Briefcase,
  LayoutGrid, ChevronDown, Eye, ZapOff, Zap,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const schoolId = () => localStorage.getItem("schoolId") || "1";

const S = {
  inp: {
    width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
  },
  btn: (bg = "#4f46e5", fg = "#fff") => ({
    background: bg, color: fg, border: "none", borderRadius: 8,
    padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
  }),
  card: {
    background: "#fff", borderRadius: 14,
    boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  th: {
    padding: "11px 16px", textAlign: "left", fontWeight: 600,
    color: "#64748b", borderBottom: "1px solid #f1f5f9",
    fontSize: 13, background: "#f8fafc",
  },
  td: { padding: "11px 16px", fontSize: 14, borderBottom: "1px solid #f8fafc" },
};

const HOLDER_TYPES = ["STUDENT", "TEACHER", "STAFF"];
const HOLDER_ICON = { STUDENT: <Users size={14} />, TEACHER: <GraduationCap size={14} />, STAFF: <Briefcase size={14} /> };
const HOLDER_COLOR = { STUDENT: "#4f46e5", TEACHER: "#059669", STAFF: "#d97706" };

const ORIENTATIONS  = ["PORTRAIT", "LANDSCAPE"];
const CARD_STYLES   = ["GRADIENT", "SOLID", "PATTERN", "MINIMAL"];
const LOGO_POSITIONS = ["TOP_CENTER", "TOP_LEFT", "TOP_RIGHT"];

const BLANK_TEMPLATE = {
  templateName: "", holderType: "STUDENT", isActive: true,
  cardOrientation: "PORTRAIT", cardStyle: "GRADIENT",
  logoPosition: "TOP_CENTER",
  primaryColor: "#1A3C6E", secondaryColor: "#2E5BBA",
  backgroundColor: "#FFFFFF", textColor: "#1E2A3A", accentColor: "#F7941D",
  backgroundImageUrl: "",
  showPhoto: true, showDateOfBirth: true, showGender: true,
  showBloodGroup: false, showPhone: true, showEmergencyContact: true,
  showBusRoute: false, showSchoolAddress: true, showSchoolWebsite: false,
  showSchoolPhone: true, showSchoolEmail: false,
  showValidityDates: true, showQrCode: false,
  footerText: "If found, please return to school.",
};

// ── Components ─────────────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 24, background: ok ? "#059669" : "#dc2626",
      color: "#fff", padding: "12px 22px", borderRadius: 10, fontWeight: 600,
      zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 14,
    }}>
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "95%", maxWidth: wide ? 860 : 560,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children, half, note }) => (
  <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
    <label style={{
      display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
      marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {label}
    </label>
    {children}
    {note && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>{note}</p>}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label style={{
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    padding: "7px 12px", borderRadius: 8, background: checked ? "#ede9fe" : "#f8fafc",
    border: `1px solid ${checked ? "#c4b5fd" : "#e2e8f0"}`,
    transition: "all 0.15s",
  }}>
    <div style={{
      width: 36, height: 20, borderRadius: 10,
      background: checked ? "#4f46e5" : "#cbd5e1",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: checked ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }} />
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? "#4f46e5" : "#475569" }}>{label}</span>
  </label>
);

// ── ID Card Visual Preview ─────────────────────────────────────────────────────
function CardPreview({ template, data }) {
  const t = template || {};
  const d = data || {};
  const isPortrait = t.cardOrientation !== "LANDSCAPE";

  const cardStyle = {
    width: isPortrait ? 240 : 340,
    height: isPortrait ? 340 : 200,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    flexShrink: 0,
    background: t.cardStyle === "GRADIENT"
      ? `linear-gradient(135deg, ${t.primaryColor || "#1A3C6E"}, ${t.secondaryColor || "#2E5BBA"})`
      : (t.backgroundColor || "#fff"),
  };

  return (
    <div style={cardStyle}>
      {/* Header strip */}
      <div style={{
        background: t.primaryColor || "#1A3C6E",
        padding: "10px 12px", textAlign: "center",
      }}>
        {d.schoolLogoUrl && (
          <img src={d.schoolLogoUrl} alt="logo"
            style={{ height: 28, objectFit: "contain", marginBottom: 4, display: "block", margin: "0 auto 4px" }} />
        )}
        <p style={{ color: "#fff", fontWeight: 800, fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {d.schoolName || "School Name"}
        </p>
        <p style={{ color: `${t.accentColor || "#F7941D"}`, fontWeight: 600, fontSize: 9, margin: "1px 0 0" }}>
          IDENTITY CARD — {t.holderType || "STUDENT"}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px", display: "flex", gap: 10 }}>
        {/* Photo */}
        {t.showPhoto !== false && (
          <div style={{
            width: 56, height: 68, borderRadius: 8, flexShrink: 0,
            background: "#e2e8f0", display: "flex", alignItems: "center",
            justifyContent: "center", border: `2px solid ${t.accentColor || "#F7941D"}`,
            overflow: "hidden",
          }}>
            {d.profilePhotoUrl
              ? <img src={d.profilePhotoUrl} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 22 }}>👤</span>
            }
          </div>
        )}
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, color: t.textColor || "#fff", fontSize: 13, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {d.fullName || "Student Name"}
          </p>
          <p style={{ color: t.accentColor || "#F7941D", fontSize: 10, margin: "0 0 4px", fontWeight: 700 }}>
            {d.designation || "Class / Designation"}
          </p>
          {d.employeeId && (
            <p style={{ color: t.textColor || "#fff", fontSize: 9, margin: "0 0 2px", opacity: 0.85 }}>
              ID: {d.employeeId}
            </p>
          )}
          {t.showDateOfBirth !== false && d.dateOfBirth && (
            <p style={{ color: t.textColor || "#fff", fontSize: 9, margin: "0 0 2px", opacity: 0.85 }}>
              DOB: {d.dateOfBirth}
            </p>
          )}
          {t.showPhone !== false && d.phoneNumber && (
            <p style={{ color: t.textColor || "#fff", fontSize: 9, margin: "0 0 2px", opacity: 0.85 }}>
              📞 {d.phoneNumber}
            </p>
          )}
          {t.showEmergencyContact !== false && d.emergencyContact && (
            <p style={{ color: t.textColor || "#fff", fontSize: 9, margin: "0 0 2px", opacity: 0.85 }}>
              🚨 {d.emergencyContact}
            </p>
          )}
          {t.showValidityDates !== false && (d.validFrom || d.validUpto) && (
            <p style={{ color: t.accentColor || "#F7941D", fontSize: 9, margin: "4px 0 0", fontWeight: 600 }}>
              Valid: {d.validFrom} — {d.validUpto}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      {t.footerText && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(0,0,0,0.35)", padding: "4px 10px", textAlign: "center",
        }}>
          <p style={{ color: "#fff", fontSize: 8, margin: 0, opacity: 0.8 }}>{t.footerText}</p>
        </div>
      )}
    </div>
  );
}

// ── Printable ID Cards HTML ────────────────────────────────────────────────────
function printCards(cards) {
  if (!cards || cards.length === 0) return;
  const html = `
    <html><head><title>ID Cards</title>
    <style>
      @page { margin: 10mm; }
      body { margin: 0; font-family: 'Arial', sans-serif; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12mm; }
      .card {
        border-radius: 10px; overflow: hidden; page-break-inside: avoid;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .header { padding: 8px 10px; text-align: center; }
      .school { font-weight: 800; font-size: 10px; color: #fff; margin: 0; text-transform: uppercase; }
      .type   { font-size: 8px; font-weight: 700; margin: 1px 0 0; }
      .body   { padding: 8px 10px; display: flex; gap: 8px; }
      .photo  { width: 50px; height: 60px; border-radius: 6px; object-fit: cover; flex-shrink: 0; border: 2px solid; }
      .info   { flex: 1; }
      .name   { font-weight: 800; font-size: 11px; margin: 0 0 2px; }
      .desig  { font-size: 9px; font-weight: 600; margin: 0 0 3px; }
      .row    { font-size: 8px; margin: 0 0 1px; }
      .footer { text-align: center; font-size: 7px; padding: 3px; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    <div class="grid">
      ${cards.map(({ data: d, template: t }) => {
        const bg = t?.cardStyle === "GRADIENT"
          ? `linear-gradient(135deg, ${t?.primaryColor || "#1A3C6E"}, ${t?.secondaryColor || "#2E5BBA"})`
          : (t?.backgroundColor || "#fff");
        return `
          <div class="card" style="background:${bg};">
            <div class="header" style="background:${t?.primaryColor || "#1A3C6E"};">
              <p class="school">${d?.schoolName || "School"}</p>
              <p class="type" style="color:${t?.accentColor || "#F7941D"};">ID CARD — ${t?.holderType || ""}</p>
            </div>
            <div class="body">
              ${t?.showPhoto !== false && d?.profilePhotoUrl ? `<img class="photo" src="${d.profilePhotoUrl}" style="border-color:${t?.accentColor || '#F7941D'};" />` : ""}
              <div class="info">
                <p class="name" style="color:${t?.textColor || '#1E2A3A'};">${d?.fullName || ""}</p>
                <p class="desig" style="color:${t?.accentColor || '#F7941D'};">${d?.designation || ""}</p>
                ${d?.employeeId ? `<p class="row" style="color:${t?.textColor || '#1E2A3A'};">ID: ${d.employeeId}</p>` : ""}
                ${t?.showDateOfBirth !== false && d?.dateOfBirth ? `<p class="row" style="color:${t?.textColor || '#1E2A3A'};">DOB: ${d.dateOfBirth}</p>` : ""}
                ${t?.showPhone !== false && d?.phoneNumber ? `<p class="row" style="color:${t?.textColor || '#1E2A3A'};">📞 ${d.phoneNumber}</p>` : ""}
                ${t?.showEmergencyContact !== false && d?.emergencyContact ? `<p class="row" style="color:${t?.textColor || '#1E2A3A'};">🚨 ${d.emergencyContact}</p>` : ""}
                ${t?.showValidityDates !== false ? `<p class="row" style="color:${t?.accentColor || '#F7941D'};font-weight:700;">Valid: ${d?.validFrom || ""} – ${d?.validUpto || ""}</p>` : ""}
              </div>
            </div>
            ${t?.footerText ? `<div class="footer" style="background:rgba(0,0,0,0.3);color:#fff;">${t.footerText}</div>` : ""}
          </div>
        `;
      }).join("")}
    </div>
    <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }<\/script>
    </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
export default function IdentityCard() {
  const [tab, setTab]               = useState("print");
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);

  // Print tab state
  const [holderType, setHolderType] = useState("STUDENT");
  const [classRoomId, setClassRoomId] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [previewCards, setPreviewCards] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Templates tab state
  const [templates, setTemplates]   = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState({ ...BLANK_TEMPLATE });
  const [activeTemplatePreview, setActiveTemplatePreview] = useState(null);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };
  const wrap = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };
  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  // ── Load templates ──────────────────────────────────────────────────────────
  const loadTemplates = async () => {
    try {
      const r = await templateService.getAllBySchool(schoolId());
      setTemplates(r.data || []);
    } catch {
      notify("Templates load nahi hue", false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);
  useEffect(() => {
    API.get("/school-admin/getClassRoom")
      .then((res) => setClassrooms(res.data?.content || []))
      .catch(() => setClassrooms([]));
  }, []);

  // ── Template CRUD ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...BLANK_TEMPLATE });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setForm({ ...BLANK_TEMPLATE, ...t });
    setEditingId(t.templateId);
    setShowModal(true);
  };

  const submitTemplate = () => wrap(async () => {
    if (!form.templateName.trim()) return notify("Template name required", false);
    try {
      if (editingId) {
        await templateService.update(editingId, form);
        notify("Template update ho gaya ✅");
      } else {
        await templateService.create(form);
        notify("Template create ho gaya ✅");
      }
      setShowModal(false);
      await loadTemplates();
    } catch (e) {
      notify(e.response?.data?.message || "Save failed", false);
    }
  });

  const activateTemplate = (id) => wrap(async () => {
    try {
      await templateService.activate(id);
      notify("Template activate ho gaya ✅");
      await loadTemplates();
    } catch (e) {
      notify(e.response?.data?.message || "Activate failed", false);
    }
  });

  const deleteTemplate = (id) => wrap(async () => {
    if (!window.confirm("Yeh template delete ho jayega. Sure?")) return;
    try {
      await templateService.remove(id);
      notify("Template delete ho gaya");
      await loadTemplates();
    } catch {
      notify("Delete failed", false);
    }
  });

  // ── Print / Preview ─────────────────────────────────────────────────────────
  const loadPreview = async () => {
    if (!holderType) return notify("Holder type select karo", false);
    setPreviewLoading(true);
    setPreviewCards([]);
    try {
      let r;
      if (holderType === "STUDENT") {
        r = await renderService.studentsBySchool(schoolId(), classRoomId || null);
      } else if (holderType === "TEACHER") {
        r = await renderService.teachersBySchool(schoolId());
      } else {
        r = await renderService.staffBySchool(schoolId());
      }
      const cards = r.data || [];
      setPreviewCards(cards);
      if (cards.length === 0) notify(`Koi ${holderType.toLowerCase()} nahi mila`, false);
    } catch (e) {
      notify(e.response?.data?.message || "Cards load nahi hue", false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrint = () => {
    if (previewCards.length === 0) return notify("Pehle cards load karo", false);
    printCards(previewCards);
  };

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "print",     label: "Print Cards",       icon: <Printer size={15} /> },
    { id: "templates", label: "Manage Templates",  icon: <Settings2 size={15} /> },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter',sans-serif" }}>
      <SchoolAdminSidebar />

      {toast && <Toast {...toast} />}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
            Identity Card Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            ID card templates banao aur students / teachers / staff ke cards print karo
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...S.btn(tab === t.id ? "#4f46e5" : "#fff", tab === t.id ? "#fff" : "#475569"),
                boxShadow: tab === t.id ? "0 2px 8px rgba(79,70,229,0.35)" : "0 1px 4px rgba(0,0,0,0.08)",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ PRINT TAB ══════════════ */}
        {tab === "print" && (
          <div>
            {/* Controls */}
            <div style={{
              ...S.card, padding: "20px 24px", marginBottom: 20,
              display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end",
            }}>
              {/* Holder type */}
              <div style={{ minWidth: 180 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>
                  Card Type
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {HOLDER_TYPES.map((ht) => (
                    <button key={ht} onClick={() => { setHolderType(ht); setPreviewCards([]); }}
                      style={{
                        ...S.btn(holderType === ht ? HOLDER_COLOR[ht] : "#f1f5f9",
                          holderType === ht ? "#fff" : "#475569"),
                        padding: "7px 14px", fontSize: 13,
                      }}>
                      {HOLDER_ICON[ht]} {ht.charAt(0) + ht.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class filter (students only) */}
              {holderType === "STUDENT" && (
                <div style={{ minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>
                    Filter by Classroom (optional)
                  </label>
                  <select
                    value={classRoomId}
                    onChange={(e) => setClassRoomId(e.target.value)}
                    style={{ ...S.inp, maxWidth: 220 }}
                  >
                    <option value="">All Classrooms</option>
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Grade {cls.grade}{cls.section ? ` - ${cls.section}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={loadPreview} disabled={previewLoading} style={S.btn("#059669")}>
                  <Eye size={14} /> {previewLoading ? "Loading..." : "Preview Cards"}
                </button>
                <button onClick={handlePrint} disabled={previewCards.length === 0} style={{ ...S.btn(), opacity: previewCards.length === 0 ? 0.5 : 1 }}>
                  <Printer size={14} /> Print All ({previewCards.length})
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12,
              padding: "12px 18px", marginBottom: 20, fontSize: 13, color: "#1d4ed8",
            }}>
              <strong>💡 Tip:</strong> Pehle <em>Manage Templates</em> tab mein ek template activate karo.
              Active template auto-pick hota hai aur har card usi style mein print hoga.
              Koi template nahi = system default use hota hai.
            </div>

            {/* Card preview grid */}
            {previewLoading && (
              <div style={{ textAlign: "center", padding: 52, color: "#94a3b8" }}>
                <RefreshCcw size={24} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: 12 }}>Cards load ho rahe hain...</p>
              </div>
            )}

            {!previewLoading && previewCards.length > 0 && (
              <div>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  <strong>{previewCards.length}</strong> cards ready for printing
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 20,
                }}>
                  {previewCards.map((card, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <CardPreview template={card.template} data={card.data} />
                      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                        {card.data?.fullName || `Card ${i + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!previewLoading && previewCards.length === 0 && (
              <div style={{ ...S.card, padding: 52, textAlign: "center" }}>
                <CreditCard size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  Card type select karo aur Preview Cards click karo
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TEMPLATES TAB ══════════════ */}
        {tab === "templates" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={openCreate} style={S.btn()}>
                <Plus size={15} /> New Template
              </button>
            </div>

            {templates.length === 0 && !loading ? (
              <div style={{ ...S.card, padding: 52, textAlign: "center" }}>
                <Settings2 size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  Abhi koi template nahi hai. New Template click karo.
                </p>
              </div>
            ) : (
              <div style={S.card}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Template Name", "Holder Type", "Style", "Orientation", "Status", "Actions"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t.templateId}
                        style={{ background: t.isActive ? "#f0fdf4" : "transparent" }}
                      >
                        <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* Color swatch */}
                            <div style={{
                              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                              background: `linear-gradient(135deg, ${t.primaryColor || "#1A3C6E"}, ${t.secondaryColor || "#2E5BBA"})`,
                            }} />
                            {t.templateName}
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={{
                            background: `${HOLDER_COLOR[t.holderType]}22`,
                            color: HOLDER_COLOR[t.holderType],
                            borderRadius: 6, padding: "3px 10px",
                            fontWeight: 700, fontSize: 12, display: "inline-flex",
                            alignItems: "center", gap: 4,
                          }}>
                            {HOLDER_ICON[t.holderType]} {t.holderType}
                          </span>
                        </td>
                        <td style={{ ...S.td, color: "#475569" }}>{t.cardStyle}</td>
                        <td style={{ ...S.td, color: "#475569" }}>{t.cardOrientation}</td>
                        <td style={S.td}>
                          <span style={{
                            background: t.isActive ? "#dcfce7" : "#f1f5f9",
                            color: t.isActive ? "#059669" : "#94a3b8",
                            borderRadius: 6, padding: "3px 10px",
                            fontWeight: 700, fontSize: 12,
                          }}>
                            {t.isActive ? "✓ Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEdit(t)}
                              style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                              <Pencil size={12} /> Edit
                            </button>
                            {!t.isActive && (
                              <button onClick={() => activateTemplate(t.templateId)}
                                style={{ background: "#f0fdf4", color: "#059669", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                                <Zap size={12} /> Activate
                              </button>
                            )}
                            <button onClick={() => deleteTemplate(t.templateId)}
                              style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════ TEMPLATE MODAL ══════════ */}
      {showModal && (
        <Modal title={editingId ? "Template Edit Karo" : "Naya Template Banao"} onClose={() => setShowModal(false)} wide>

          {/* Live mini preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <CardPreview template={form} data={{
              fullName: "Aanya Sharma", designation: form.holderType === "STUDENT" ? "Nursery-A" : "Teacher",
              employeeId: "ADM2026-0145", dateOfBirth: "12/04/2022",
              phoneNumber: form.holderType !== "STUDENT" ? "9876543210" : null,
              emergencyContact: "9876543210", validFrom: "2026", validUpto: "2027",
              schoolName: "Little Stars School",
            }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {/* Basic info */}
            <Field label="Template Name *">
              <input style={S.inp} value={form.templateName}
                onChange={(e) => set("templateName", e.target.value)}
                placeholder="e.g. Student Card 2026-27" />
            </Field>

            <Field label="Holder Type" half>
              <select style={S.inp} value={form.holderType}
                onChange={(e) => set("holderType", e.target.value)}
                disabled={!!editingId}
                title={editingId ? "Holder type change nahi ho sakta — naya template banao" : ""}>
                {HOLDER_TYPES.map((h) => <option key={h}>{h}</option>)}
              </select>
            </Field>

            <Field label="Card Orientation" half>
              <select style={S.inp} value={form.cardOrientation}
                onChange={(e) => set("cardOrientation", e.target.value)}>
                {ORIENTATIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="Card Style" half>
              <select style={S.inp} value={form.cardStyle}
                onChange={(e) => set("cardStyle", e.target.value)}>
                {CARD_STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Logo Position" half>
              <select style={S.inp} value={form.logoPosition}
                onChange={(e) => set("logoPosition", e.target.value)}>
                {LOGO_POSITIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>

            {/* Colors */}
            <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase" }}>
                Colors
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  ["Primary", "primaryColor"], ["Secondary", "secondaryColor"],
                  ["Background", "backgroundColor"], ["Text", "textColor"],
                  ["Accent", "accentColor"],
                ].map(([label, field]) => (
                  <div key={field} style={{ textAlign: "center" }}>
                    <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
                    <input type="color" value={form[field] || "#000000"}
                      onChange={(e) => set(field, e.target.value)}
                      style={{ width: 44, height: 44, border: "2px solid #e2e8f0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer text */}
            <Field label="Footer Text">
              <input style={S.inp} value={form.footerText || ""}
                onChange={(e) => set("footerText", e.target.value)}
                placeholder="If found, please return to school." />
            </Field>

            {/* Show/hide toggles */}
            <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase" }}>
                Fields to Show on Card
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {[
                  ["Photo", "showPhoto"], ["Date of Birth", "showDateOfBirth"],
                  ["Gender", "showGender"], ["Blood Group", "showBloodGroup"],
                  ["Phone", "showPhone"], ["Emergency Contact", "showEmergencyContact"],
                  ["Bus Route", "showBusRoute"], ["School Address", "showSchoolAddress"],
                  ["School Website", "showSchoolWebsite"], ["School Phone", "showSchoolPhone"],
                  ["School Email", "showSchoolEmail"], ["Validity Dates", "showValidityDates"],
                  ["QR Code", "showQrCode"],
                ].map(([label, field]) => (
                  <Toggle key={field} label={label}
                    checked={form[field] ?? false}
                    onChange={(e) => set(field, e.target.checked)} />
                ))}
              </div>
            </div>

            {/* Set active */}
            <div style={{ gridColumn: "1 / -1", marginBottom: 8 }}>
              <Toggle
                label="Set as Active Template (auto-deactivates other templates of same type)"
                checked={form.isActive ?? true}
                onChange={(e) => set("isActive", e.target.checked)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={submitTemplate} disabled={loading}
              style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
              <CheckCircle size={14} /> {loading ? "Saving..." : (editingId ? "Update Template" : "Create Template")}
            </button>
            <button onClick={() => setShowModal(false)}
              style={{ ...S.btn("#94a3b8"), flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}