
import { useState, useEffect, useCallback, useRef } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import API from "../../common/services/api";
import {
  Plus, Search, RefreshCw, ChevronDown, ChevronRight, X, AlertCircle,
  CheckCircle, Loader2, Building2, School, Users, IndianRupee, Crown,
  Copy, Check, Eye, EyeOff, Zap, Layers,
  TrendingUp, CreditCard, Globe, MapPin, Phone, Mail, Hash, Calendar,
  Power, PowerOff, ArrowRight, BadgePercent, Wallet, QrCode, Info,
  Banknote, ClipboardCheck, AlertTriangle, CircleDollarSign,
  ReceiptText, ShieldCheck, BadgeCheck, Clock, Filter, Key, Edit2,
} from "lucide-react";

// ─── Pricing Constants ─────────────────────────────────────────────────────────
const PRICING = {
  single: { BASIC: 3000, STANDARD: 5000, PREMIUM: 8000 },
  trust:  { BASIC: 2000, STANDARD: 1700, PREMIUM: 1500 },
  limits: { BASIC: { schools: 3, students: 500 }, STANDARD: { schools: 10, students: 1500 }, PREMIUM: { schools: 999, students: 99999 } },
};
const planFor = (cap) => cap <= 500 ? "BASIC" : cap <= 1500 ? "STANDARD" : "PREMIUM";
const singlePrice  = (plan, discount = 0) => Math.round(PRICING.single[plan] * (1 - discount / 100));
const trustPrice   = (plan, n, discount = 0) => Math.round(PRICING.trust[plan] * n * (1 - discount / 100));
const fmtDate      = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const daysLeft     = (endDate) => {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
};

// ─── Tiny Shared Components ────────────────────────────────────────────────────
const DLabel = ({ children }) => (
  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{children}</p>
);
const DInput = ({ label, name, value, onChange, type = "text", placeholder = "", required = false, hint = "", icon }) => (
  <div>
    {label && <DLabel>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</DLabel>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label}
        className={`w-full ${icon ? "pl-9" : "px-3"} pr-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all`}
      />
    </div>
    {hint && <p className="text-xs text-gray-600 mt-0.5">{hint}</p>}
  </div>
);
const DSelect = ({ label, name, value, onChange, options, required = false }) => (
  <div>
    <DLabel>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</DLabel>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500/60 transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const DDivider = ({ title }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-gray-800" />
    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">{title}</p>
    <div className="flex-1 h-px bg-gray-800" />
  </div>
);
const PlanChip = ({ plan }) => {
  const map = { BASIC: "bg-blue-500/10 text-blue-400 border-blue-500/20", STANDARD: "bg-purple-500/10 text-purple-400 border-purple-500/20", PREMIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[plan] || "bg-gray-800 text-gray-400 border-gray-700"}`}>{plan}</span>;
};
const PayStatusChip = ({ status }) => {
  const map = {
    PAID:    "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>{status || "PENDING"}</span>;
};

// ─── Expiry Badge ──────────────────────────────────────────────────────────────
const ExpiryBadge = ({ endDate }) => {
  const days = daysLeft(endDate);
  if (days === null) return null;
  if (days < 0)  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle size={10}/>Expired</span>;
  if (days <= 3) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle size={10}/>{days}d left</span>;
  if (days <= 7) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={10}/>{days}d left</span>;
  if (days <= 30) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock size={10}/>{days}d left</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={10}/>{days}d</span>;
};

// ─── Razorpay Checkout Hook ────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout({ order, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) { onFailure("Razorpay SDK failed to load."); return; }
  const options = {
    key:          order.keyId,
    amount:       Math.round(order.amount * 100),
    currency:     order.currency || "INR",
    name:         "ShalaOne by KaryaSoft",
    description:  order.description,
    order_id:     order.orderId,
    prefill:      { email: order.entityEmail, name: order.entityName },
    theme:        { color: "#3B82F6" },
    handler: (response) => {
      onSuccess({
        paymentRecordId:   order.paymentRecordId,
        razorpayOrderId:   response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: { ondismiss: () => onFailure("Payment cancelled by user.") },
  };
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (resp) => onFailure(resp.error?.description || "Payment failed"));
  rzp.open();
}

// ─── Plan Pricing Card ─────────────────────────────────────────────────────────
function DPricingCard({ plan, discount, schoolCount = 1, isTrust = false, selected, onClick }) {
  const final    = isTrust ? trustPrice(plan, schoolCount, discount) : singlePrice(plan, discount);
  const original = isTrust ? PRICING.trust[plan] * schoolCount : PRICING.single[plan];
  return (
    <button onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selected ? "border-blue-500 bg-blue-500/5" : "border-gray-700 hover:border-blue-500/40 bg-[#0f1117]"}`}>
      <div className="flex items-center justify-between mb-2">
        <PlanChip plan={plan} />
        {selected && <CheckCircle size={15} className="text-blue-400" />}
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-xl font-black text-white">₹{final.toLocaleString("en-IN")}</span>
        <span className="text-xs text-gray-500">/month</span>
      </div>
      {discount > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-600 line-through">₹{original.toLocaleString("en-IN")}</span>
          <span className="text-xs font-bold text-green-400">{discount}% OFF</span>
        </div>
      )}
      <p className="text-xs text-gray-600 mt-2">
        {isTrust ? `₹${PRICING.trust[plan].toLocaleString()}/school × ${schoolCount}` : `Up to ${PRICING.limits[plan].students.toLocaleString()} students`}
      </p>
      <p className="text-xs font-semibold text-blue-500 mt-1">Annual: ₹{(final * 12).toLocaleString("en-IN")}</p>
    </button>
  );
}

// ─── School Row in Trust Modal ─────────────────────────────────────────────────
const emptySchool = () => ({
  schoolName: "", schoolEmail: "", boardType: "CBSE", establishedYear: "",
  contactNumber: "", addressLine1: "", addressLine2: "", city: "", state: "",
  country: "India", pincode: "", adminFullName: "", adminEmail: "",
  adminPassword: "", adminContactNumber: "", studentCapacity: 300, schoolCode: "",
});

function SchoolRow({ idx, school, onChange, onRemove, total }) {
  const [open, setOpen] = useState(idx === 0);
  const handle = (e) => onChange(idx, e.target.name, e.target.value);
  return (
    <div className={`border rounded-2xl overflow-hidden ${open ? "border-blue-500/30" : "border-gray-700"}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition ${open ? "bg-blue-500/5" : "bg-[#1a1d27] hover:bg-[#0f1117]"}`}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">{idx + 1}</div>
          <span className="font-semibold text-white text-sm">{school.schoolName || `School ${idx + 1}`}</span>
          {school.city && <span className="text-xs text-gray-500">— {school.city}</span>}
        </div>
        <div className="flex items-center gap-2">
          <PlanChip plan={planFor(Number(school.studentCapacity))} />
          {total > 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(idx); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition">
              <X size={14} />
            </button>
          )}
          {open ? <ChevronDown size={15} className="text-gray-500" /> : <ChevronRight size={15} className="text-gray-500" />}
        </div>
      </button>
      {open && (
        <div className="p-5 space-y-4 bg-[#0f1117]">
          <div className="grid md:grid-cols-3 gap-4">
            <DInput label="School Name" name="schoolName" value={school.schoolName} onChange={handle} required />
            <DInput label="School Email" name="schoolEmail" value={school.schoolEmail} onChange={handle} type="email" required />
            <DInput label="School Code" name="schoolCode" value={school.schoolCode} onChange={handle} hint="Auto-generated if blank" />
            <DSelect label="Board" name="boardType" value={school.boardType} onChange={handle} options={["CBSE","ICSE","STATE","IB","NIOS"].map(b => ({ value: b, label: b }))} required />
            <DInput label="Established Year" name="establishedYear" value={school.establishedYear} onChange={handle} type="number" />
            <DInput label="Contact Number" name="contactNumber" value={school.contactNumber} onChange={handle} />
          </div>
          <DDivider title="Address" />
          <div className="grid md:grid-cols-3 gap-4">
            <DInput label="Address Line 1" name="addressLine1" value={school.addressLine1} onChange={handle} required />
            <DInput label="Address Line 2" name="addressLine2" value={school.addressLine2} onChange={handle} />
            <DInput label="City" name="city" value={school.city} onChange={handle} required />
            <DInput label="State" name="state" value={school.state} onChange={handle} required />
            <DInput label="Country" name="country" value={school.country} onChange={handle} />
            <DInput label="Pincode" name="pincode" value={school.pincode} onChange={handle} required />
          </div>
          <DDivider title="School Admin" />
          <div className="grid md:grid-cols-2 gap-4">
            <DInput label="Admin Full Name" name="adminFullName" value={school.adminFullName} onChange={handle} required />
            <DInput label="Admin Email" name="adminEmail" value={school.adminEmail} onChange={handle} type="email" required />
            <DInput label="Admin Contact" name="adminContactNumber" value={school.adminContactNumber} onChange={handle} />
            <DInput label="Admin Password" name="adminPassword" value={school.adminPassword} onChange={handle} type="password" hint="Auto-generated if blank" />
          </div>
          <DDivider title="Capacity" />
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <DInput label="Student Capacity" name="studentCapacity" value={school.studentCapacity} onChange={handle} type="number" required hint={`Auto plan: ${planFor(Number(school.studentCapacity))}`} />
            </div>
            <div className="pb-1"><PlanChip plan={planFor(Number(school.studentCapacity))} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trust Onboard Modal ───────────────────────────────────────────────────────
function TrustOnboardModal({ onClose, onSuccess }) {
  const [step, setStep]       = useState(1);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [discount, setDiscount] = useState(0);
  const [customPrice, setCustomPrice] = useState("");   // super admin override price
  const [trust, setTrust] = useState({
    trustName: "", trustEmail: "", phoneNumber: "", websiteUrl: "",
    registrationNumber: "", addressLine1: "", addressLine2: "", city: "",
    state: "", country: "India", pincode: "", subscriptionPlan: "BASIC",
  });
  const [schools, setSchools] = useState([emptySchool()]);
  const handleTrust  = (e) => setTrust(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSchool = (idx, name, value) => setSchools(p => p.map((s, i) => i === idx ? { ...s, [name]: value } : s));
  const addSchool    = () => setSchools(p => [...p, emptySchool()]);
  const removeSchool = (idx) => setSchools(p => p.filter((_, i) => i !== idx));
  const totalStudents  = schools.reduce((a, s) => a + Number(s.studentCapacity || 0), 0);
  const baseMonthly    = PRICING.trust[trust.subscriptionPlan] * schools.length;
  const finalMonthly   = customPrice ? Number(customPrice) : trustPrice(trust.subscriptionPlan, schools.length, discount);

  const validate1 = () => {
    if (!trust.trustName || !trust.trustEmail || !trust.phoneNumber) return "Trust name, email, and phone are required.";
    if (!trust.city || !trust.state || !trust.pincode) return "Trust city, state, and pincode are required.";
    return "";
  };
  const validate2 = () => {
    for (let i = 0; i < schools.length; i++) {
      const s = schools[i];
      if (!s.schoolName || !s.schoolEmail || !s.adminFullName || !s.adminEmail) return `School ${i + 1}: name, email, admin name, and admin email are required.`;
      if (!s.city || !s.state || !s.pincode) return `School ${i + 1}: city, state, pincode are required.`;
    }
    return "";
  };
  const handleNext = () => {
    setError("");
    if (step === 1) { const e = validate1(); if (e) return setError(e); }
    if (step === 2) { const e = validate2(); if (e) return setError(e); }
    setStep(s => s + 1);
  };
  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      const payload = {
        ...trust,
        schools: schools.map(s => ({ ...s, studentCapacity: Number(s.studentCapacity) })),
        discountPercent: customPrice ? 0 : discount,
        customMonthlyPrice: customPrice ? Number(customPrice) : null,
      };
      const res = await API.post("/super-admin/trusts/onboard", payload);
      onSuccess(res.data);
      onClose();
    } catch (e) { setError(e?.response?.data?.message || "Failed to onboard trust."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="px-7 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2"><Layers size={20} className="text-purple-400" /> Onboard Trust / Chain</h2>
            <p className="text-xs text-gray-500 mt-0.5">Multi-school trust with centralized billing</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-colors"><X size={16} /></button>
        </div>
        {/* Step indicator */}
        <div className="px-7 pt-5">
          <div className="flex items-center gap-2">
            {["Trust Details", "Schools", "Billing & Confirm"].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${step > i + 1 ? "bg-green-500 text-black" : step === i + 1 ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-500"}`}>
                  {step > i + 1 ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${step === i + 1 ? "text-white" : "text-gray-600"}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-px mx-1 ${step > i + 1 ? "bg-green-500/40" : "bg-gray-800"}`} />}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <DInput label="Trust / Chain Name" name="trustName" value={trust.trustName} onChange={handleTrust} required />
                <DInput label="Trust Email" name="trustEmail" value={trust.trustEmail} onChange={handleTrust} type="email" required />
                <DInput label="Phone Number" name="phoneNumber" value={trust.phoneNumber} onChange={handleTrust} required />
                <DInput label="Website URL" name="websiteUrl" value={trust.websiteUrl} onChange={handleTrust} />
                <DInput label="Registration Number" name="registrationNumber" value={trust.registrationNumber} onChange={handleTrust} hint="Trust deed / NGO registration" />
              </div>
              <DDivider title="Trust Address" />
              <div className="grid md:grid-cols-3 gap-4">
                <DInput label="Address Line 1" name="addressLine1" value={trust.addressLine1} onChange={handleTrust} required />
                <DInput label="Address Line 2" name="addressLine2" value={trust.addressLine2} onChange={handleTrust} />
                <DInput label="City" name="city" value={trust.city} onChange={handleTrust} required />
                <DInput label="State" name="state" value={trust.state} onChange={handleTrust} required />
                <DInput label="Country" name="country" value={trust.country} onChange={handleTrust} />
                <DInput label="Pincode" name="pincode" value={trust.pincode} onChange={handleTrust} required />
              </div>
              <DDivider title="Subscription Plan" />
              <div className="grid md:grid-cols-3 gap-4">
                {["BASIC", "STANDARD", "PREMIUM"].map(plan => (
                  <DPricingCard key={plan} plan={plan} isTrust schoolCount={schools.length} discount={discount}
                    selected={trust.subscriptionPlan === plan} onClick={() => setTrust(p => ({ ...p, subscriptionPlan: plan }))} />
                ))}
              </div>
              {/* Custom Price OR Discount */}
              <div className="bg-[#0f1117] border border-gray-700 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Override</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Custom Price */}
                  <div>
                    <DLabel>Custom Monthly Price (₹) <span className="text-gray-600 font-normal normal-case tracking-normal">— Super Admin negotiated amount</span></DLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                      <input
                        type="number" min={0} value={customPrice}
                        onChange={e => setCustomPrice(e.target.value)}
                        placeholder={`Standard: ₹${(PRICING.trust[trust.subscriptionPlan] * schools.length).toLocaleString()}`}
                        className="w-full pl-7 pr-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all"
                      />
                    </div>
                    <p className="text-xs text-blue-400 mt-1">If set, this overrides the standard price. Leave blank to use plan pricing.</p>
                  </div>
                  {/* Discount */}
                  <div className={customPrice ? "opacity-40 pointer-events-none" : ""}>
                    <DLabel>Onboarding Discount % <span className="text-gray-600 font-normal normal-case tracking-normal">— disabled if custom price set</span></DLabel>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={50} value={discount} onChange={e => setDiscount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500/60 transition-all" />
                      <span className="text-sm font-bold text-amber-400 whitespace-nowrap">% OFF</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
                  <IndianRupee size={15} className="text-blue-400" />
                  <span className="text-sm font-bold text-white">Final Monthly: ₹{finalMonthly.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-gray-500 ml-1">· Annual: ₹{(finalMonthly * 12).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-400">{schools.length} school{schools.length > 1 ? "s" : ""} to onboard</p>
                <button onClick={addSchool} disabled={schools.length >= PRICING.limits[trust.subscriptionPlan].schools}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all">
                  <Plus size={14} /> Add School
                </button>
              </div>
              {schools.map((s, i) => <SchoolRow key={i} idx={i} school={s} onChange={handleSchool} onRemove={removeSchool} total={schools.length} />)}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Schools", value: schools.length, icon: <School size={20} className="text-blue-400" />, bg: "bg-blue-500/10" },
                  { label: "Total Students", value: totalStudents.toLocaleString(), icon: <Users size={20} className="text-purple-400" />, bg: "bg-purple-500/10" },
                  { label: "Monthly Billing", value: `₹${finalMonthly.toLocaleString("en-IN")}`, icon: <IndianRupee size={20} className="text-green-400" />, bg: "bg-green-500/10" },
                ].map(({ label, value, icon, bg }) => (
                  <div key={label} className={`${bg} border border-gray-700 rounded-2xl p-5 text-center`}>
                    <div className="flex justify-center mb-2">{icon}</div>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0f1117] border border-gray-800 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-300 mb-4">Billing Breakdown</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Plan</span><PlanChip plan={trust.subscriptionPlan} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Schools</span><span className="font-semibold text-white">{schools.length}</span></div>
                  {customPrice ? (
                    <div className="flex justify-between text-blue-400"><span>Custom (Negotiated) Price</span><span className="font-bold">₹{Number(customPrice).toLocaleString("en-IN")}/month</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-gray-500">Rate / School</span><span className="font-semibold text-white">₹{PRICING.trust[trust.subscriptionPlan].toLocaleString()}/month</span></div>
                      {discount > 0 && <div className="flex justify-between text-amber-400"><span>Discount</span><span className="font-bold">-{discount}% (₹{(baseMonthly - finalMonthly).toLocaleString("en-IN")})</span></div>}
                    </>
                  )}
                  <div className="border-t border-gray-800 pt-2 flex justify-between font-black text-white">
                    <span>Monthly Total</span><span className="text-green-400">₹{finalMonthly.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-500"><span>Annual Total</span><span className="font-semibold">₹{(finalMonthly * 12).toLocaleString("en-IN")}</span></div>
                </div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-400/80">Subscription starts today. First payment collection will be prompted after onboarding via the Collect Payment button on the trust row.</p>
              </div>
              <div className="border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-[#0f1117] border-b border-gray-800">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Schools Being Onboarded</p>
                </div>
                {schools.map((s, i) => (
                  <div key={i} className="px-5 py-3 border-b border-gray-800/50 last:border-none flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">{s.schoolName || `School ${i + 1}`}</p>
                      <p className="text-xs text-gray-500">{s.adminEmail} — {s.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{s.studentCapacity} students</span>
                      <PlanChip plan={planFor(Number(s.studentCapacity))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-7 py-4 border-t border-gray-800 flex items-center justify-between">
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="px-5 py-2.5 text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all">
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-2">
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-black bg-green-400 hover:bg-green-300 disabled:opacity-60 rounded-xl transition-all flex items-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><CheckCircle size={14} /> Onboard Trust</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Single School Modal ───────────────────────────────────────────────────────
function SingleSchoolModal({ onClose, onSuccess }) {
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [discount, setDiscount]   = useState(0);
  const [customPrice, setCustomPrice] = useState("");   // super admin override
  const [form, setForm] = useState({
    schoolName: "", schoolCode: "", boardType: "CBSE", establishedYear: "",
    schoolEmail: "", contactNumber: "", websiteUrl: "",
    addressLine1: "", addressLine2: "", city: "", state: "", country: "India", pincode: "",
    adminFullName: "", adminEmail: "", adminPassword: "", adminContactNumber: "",
    studentCapacity: 300, subscriptionPlan: "",
    enableSms: false, enableOnlinePayment: false, enableMobileAppAccess: true,
  });
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const autoPlan      = planFor(Number(form.studentCapacity));
  const effectivePlan = form.subscriptionPlan || autoPlan;
  const standardPrice = singlePrice(effectivePlan, discount);
  const finalPrice    = customPrice ? Number(customPrice) : standardPrice;

  const handleSubmit = async () => {
    setError("");
    if (!form.schoolName || !form.schoolEmail || !form.adminFullName || !form.adminEmail) return setError("School name, email, admin name, and admin email are required.");
    if (!form.city || !form.state || !form.pincode) return setError("City, state, and pincode are required.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        studentCapacity:  Number(form.studentCapacity),
        discountPercent:  customPrice ? 0 : discount,
        customMonthlyPrice: customPrice ? Number(customPrice) : null,
      };
      const res = await API.post("/super-admin/schools/onboard-single", payload);
      onSuccess(res.data);
      onClose();
    } catch (e) { setError(e?.response?.data?.message || "Failed to onboard school."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="px-7 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2"><School size={20} className="text-blue-400" /> Onboard Single School</h2>
            <p className="text-xs text-gray-500 mt-0.5">Standalone school — not under any trust</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-colors"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-4">
          {error && <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"><AlertCircle size={15} className="flex-shrink-0 mt-0.5" />{error}</div>}
          <div className="grid md:grid-cols-3 gap-4">
            <DInput label="School Name" name="schoolName" value={form.schoolName} onChange={handle} required />
            <DInput label="School Email" name="schoolEmail" value={form.schoolEmail} onChange={handle} type="email" required />
            <DInput label="School Code" name="schoolCode" value={form.schoolCode} onChange={handle} hint="Auto-generated if blank" />
            <DSelect label="Board" name="boardType" value={form.boardType} onChange={handle} options={["CBSE","ICSE","STATE","IB","NIOS"].map(b => ({ value: b, label: b }))} required />
            <DInput label="Established Year" name="establishedYear" value={form.establishedYear} onChange={handle} type="number" />
            <DInput label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handle} />
            <DInput label="Website URL" name="websiteUrl" value={form.websiteUrl} onChange={handle} />
          </div>
          <DDivider title="Address" />
          <div className="grid md:grid-cols-3 gap-4">
            <DInput label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handle} required />
            <DInput label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handle} />
            <DInput label="City" name="city" value={form.city} onChange={handle} required />
            <DInput label="State" name="state" value={form.state} onChange={handle} required />
            <DInput label="Country" name="country" value={form.country} onChange={handle} />
            <DInput label="Pincode" name="pincode" value={form.pincode} onChange={handle} required />
          </div>
          <DDivider title="School Admin" />
          <div className="grid md:grid-cols-2 gap-4">
            <DInput label="Admin Full Name" name="adminFullName" value={form.adminFullName} onChange={handle} required />
            <DInput label="Admin Email" name="adminEmail" value={form.adminEmail} onChange={handle} type="email" required />
            <DInput label="Admin Contact" name="adminContactNumber" value={form.adminContactNumber} onChange={handle} />
            <DInput label="Admin Password" name="adminPassword" value={form.adminPassword} onChange={handle} type="password" hint="Auto-generated if blank — sent via email" />
          </div>
          <DDivider title="Subscription & Pricing" />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <DInput label="Student Capacity" name="studentCapacity" value={form.studentCapacity} onChange={handle} type="number" required />
              <p className="text-xs text-blue-400 font-semibold mt-1">Auto-plan: <span className="ml-1"><PlanChip plan={autoPlan} /></span></p>
            </div>
            <DSelect label="Override Plan (optional)" name="subscriptionPlan" value={form.subscriptionPlan} onChange={handle}
              options={[{ value: "", label: "Auto (based on capacity)" }, ...["BASIC","STANDARD","PREMIUM"].map(p => ({ value: p, label: p }))]} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {["BASIC","STANDARD","PREMIUM"].map(plan => (
              <DPricingCard key={plan} plan={plan} discount={discount} selected={effectivePlan === plan} onClick={() => setForm(p => ({ ...p, subscriptionPlan: plan }))} />
            ))}
          </div>
          {/* Pricing Override */}
          <div className="bg-[#0f1117] border border-gray-700 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Override</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <DLabel>Custom Monthly Price (₹) <span className="text-gray-600 font-normal normal-case tracking-normal">— negotiated</span></DLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                  <input type="number" min={0} value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                    placeholder={`Standard: ₹${standardPrice.toLocaleString()}`}
                    className="w-full pl-7 pr-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all" />
                </div>
                <p className="text-xs text-blue-400 mt-1">Leave blank to use plan pricing.</p>
              </div>
              <div className={customPrice ? "opacity-40 pointer-events-none" : ""}>
                <DLabel>Discount % <span className="text-gray-600 font-normal normal-case tracking-normal">— disabled if custom price set</span></DLabel>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={50} value={discount} onChange={e => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm font-bold text-amber-300 focus:outline-none" />
                  <span className="text-sm font-bold text-amber-400 whitespace-nowrap">% OFF</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
              <IndianRupee size={15} className="text-blue-400" />
              <span className="text-sm font-bold text-white">Final Monthly: ₹{finalPrice.toLocaleString("en-IN")}</span>
              <span className="text-xs text-gray-500 ml-1">· Annual: ₹{(finalPrice * 12).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <DDivider title="Feature Flags" />
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { name: "enableSms", label: "SMS Alerts" },
              { name: "enableOnlinePayment", label: "Online Payment" },
              { name: "enableMobileAppAccess", label: "Mobile App" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-3 p-3 bg-[#0f1117] border border-gray-700 rounded-xl cursor-pointer hover:border-blue-500/40 transition">
                <input type="checkbox" name={name} checked={form[name]} onChange={handle} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm font-medium text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="px-7 py-4 border-t border-gray-800 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 text-sm font-bold text-black bg-green-400 hover:bg-green-300 disabled:opacity-60 rounded-xl transition-all flex items-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><CheckCircle size={14} /> Onboard School</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function CollectPaymentModal({ trust, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCollect = async () => {
    setLoading(true); setError("");
    try {
      // 1. Create Razorpay order from backend
      const res = await API.post(`/super-admin/subscription/trust/${trust.trustId}/create-order`);
      const order = res.data;
      // 2. Open Razorpay checkout
      await openRazorpayCheckout({
        order,
        onSuccess: async (verifyPayload) => {
          try {
            const vRes = await API.post("/super-admin/subscription/verify-payment", verifyPayload);
            onSuccess(trust.trustId, "PAID", vRes.data.newEndDate);
            onClose();
          } catch (err) {
            setError(err?.response?.data?.message || "Payment verification failed.");
            setLoading(false);
          }
        },
        onFailure: (msg) => { setError(msg); setLoading(false); },
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create payment order. Check Razorpay settings.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#1a1d27] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CreditCard size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Collect Subscription</h3>
              <p className="text-xs text-gray-500">{trust.trustName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500">Plan</span>
            <PlanChip plan={trust.subscriptionPlan} />
          </div>
          <div className="flex justify-between items-center bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="font-black text-green-400 text-lg">₹{(trust.effectiveMonthlyPrice || trust.monthlyPrice || 0).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500">Current Expiry</span>
            <span className="text-sm font-semibold text-white">{fmtDate(trust.subscriptionEndDate)}</span>
          </div>
          <div className="flex justify-between items-center bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500">New Expiry (after pay)</span>
            <span className="text-sm font-semibold text-blue-400">
              {fmtDate(trust.subscriptionEndDate
                ? new Date(new Date(trust.subscriptionEndDate).getTime() + 30 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button onClick={handleCollect} disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Opening Razorpay...</> : <><CreditCard size={16} /> Pay ₹{(trust.effectiveMonthlyPrice || trust.monthlyPrice || 0).toLocaleString("en-IN")} via Razorpay</>}
        </button>
        <p className="text-xs text-center text-gray-600 mt-3">Secured by Razorpay · UPI / Cards / Net Banking</p>
      </div>
    </div>
  );
}

// ─── Trust Row ─────────────────────────────────────────────────────────────────
function TrustRow({ trust, onToggle, onPaymentUpdate }) {
  const [open, setOpen]               = useState(false);
  const [payModal, setPayModal]       = useState(false);
  const [toggling, setToggling]       = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const days = daysLeft(trust.subscriptionEndDate);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await API.patch(`/super-admin/trusts/${trust.trustId}/status`, null, { params: { active: !trust.active } });
      onToggle(trust.trustId, !trust.active);
    } catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      await API.patch(`/super-admin/subscription/trust/${trust.trustId}/payment-status`, null, { params: { status: "PAID" } });
      onPaymentUpdate(trust.trustId, "PAID");
    } catch (e) { console.error(e); }
    finally { setMarkingPaid(false); }
  };

  const handleMarkOverdue = async () => {
    try {
      await API.patch(`/super-admin/subscription/trust/${trust.trustId}/payment-status`, null, { params: { status: "OVERDUE" } });
      onPaymentUpdate(trust.trustId, "OVERDUE");
      onToggle(trust.trustId, false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`bg-[#1a1d27] border rounded-2xl overflow-hidden transition-all ${
      trust.paymentStatus === "OVERDUE" ? "border-red-500/30" :
      days !== null && days <= 7 ? "border-amber-500/30" : "border-gray-800"
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-4 text-left min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-white text-sm truncate">{trust.trustName}</p>
              <PlanChip plan={trust.subscriptionPlan} />
              <PayStatusChip status={trust.paymentStatus} />
              <ExpiryBadge endDate={trust.subscriptionEndDate} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1"><Hash size={11} />{trust.trustCode}</span>
              <span className="flex items-center gap-1"><School size={11} />{trust.schools?.length || 0} schools</span>
              <span className="flex items-center gap-1"><Users size={11} />{trust.totalStudentCapacity?.toLocaleString()} students</span>
              <span className="flex items-center gap-1 text-green-400 font-semibold"><IndianRupee size={11} />₹{(trust.effectiveMonthlyPrice || trust.monthlyPrice || 0).toLocaleString("en-IN")}/mo</span>
              {trust.subscriptionEndDate && (
                <span className="flex items-center gap-1"><Calendar size={11} />Expires {fmtDate(trust.subscriptionEndDate)}</span>
              )}
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {open ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Collect Payment via Razorpay */}
          <button onClick={() => setPayModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all">
            <CreditCard size={13} /> Collect
          </button>
          {/* Manual Mark Paid */}
          {trust.paymentStatus !== "PAID" && (
            <button onClick={handleMarkPaid} disabled={markingPaid}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/10 border border-green-500/20 rounded-xl transition">
              {markingPaid ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Paid
            </button>
          )}
          {trust.paymentStatus !== "OVERDUE" && trust.active && (
            <button onClick={handleMarkOverdue}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition">
              <AlertTriangle size={12} /> Overdue
            </button>
          )}
          {/* Activate / Deactivate */}
          <button onClick={handleToggle} disabled={toggling}
            className={`p-2 rounded-xl transition flex items-center justify-center ${trust.active ? "text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20" : "text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"}`}>
            {toggling ? <Loader2 size={15} className="animate-spin" /> : trust.active ? <Power size={15} /> : <PowerOff size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gray-800 px-5 pb-5 pt-4 space-y-4 bg-[#0f1117]">
          {/* Subscription period bar */}
          <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subscription Period</p>
              <PayStatusChip status={trust.paymentStatus} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div><p className="text-xs text-gray-600">Start</p><p className="font-semibold text-white">{fmtDate(trust.subscriptionStartDate)}</p></div>
              <div className="flex-1 h-px bg-gray-700 relative">
                {trust.subscriptionEndDate && (
                  <div className="absolute -top-0.5 right-0 w-2 h-2 rounded-full bg-blue-400" />
                )}
              </div>
              <div className="text-right"><p className="text-xs text-gray-600">End</p><p className="font-semibold text-white">{fmtDate(trust.subscriptionEndDate)}</p></div>
            </div>
            {days !== null && days >= 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Time remaining</span><span className={days <= 7 ? "text-amber-400 font-bold" : ""}>{days} days</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${days <= 3 ? "bg-red-500" : days <= 7 ? "bg-amber-500" : days <= 15 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.max(2, Math.min(100, (days / 30) * 100))}%` }} />
                </div>
              </div>
            )}
          </div>
          {/* Contact info */}
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-500"><Mail size={12} />{trust.trustEmail}</div>
            <div className="flex items-center gap-2 text-gray-500"><Phone size={12} />{trust.phoneNumber}</div>
            <div className="flex items-center gap-2 text-gray-500"><MapPin size={12} />{trust.city}, {trust.state} {trust.pincode}</div>
            {trust.registrationNumber && <div className="flex items-center gap-2 text-gray-500"><Hash size={12} />{trust.registrationNumber}</div>}
          </div>
          {/* Schools list */}
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Schools Under Trust</p>
            <div className="space-y-2">
              {(trust.schools || []).map(s => (
                <div key={s.schoolId} className="flex items-center justify-between bg-[#1a1d27] border border-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <School size={15} className="text-blue-400" />
                    <div>
                      <p className="font-semibold text-white text-sm">{s.schoolName}</p>
                      <p className="text-xs text-gray-500">{s.schoolCode} · {s.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{s.studentCapacity} students</span>
                    {s.active ? <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                      : <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-center">
            <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500">Effective Monthly</p>
              <p className="text-xl font-black text-green-400">₹{(trust.effectiveMonthlyPrice || trust.monthlyPrice || 0).toLocaleString("en-IN")}</p>
              {trust.customMonthlyPrice && <p className="text-xs text-blue-400 mt-0.5">Custom</p>}
            </div>
            <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500">Annual</p>
              <p className="text-xl font-black text-blue-400">₹{((trust.effectiveMonthlyPrice || trust.monthlyPrice || 0) * 12).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-500">Active Schools</p>
              <p className="text-xl font-black text-purple-400">{trust.activeSchoolCount || 0}/{trust.schools?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
      {payModal && <CollectPaymentModal trust={trust} onClose={() => setPayModal(false)} onSuccess={(trustId, status, newEndDate) => {
        onPaymentUpdate(trustId, status);
        if (newEndDate) {
          // Update local trust end date
          onPaymentUpdate(trustId, status);
        }
        setPayModal(false);
      }} />}
    </div>
  );
}

// ─── Success Banner ────────────────────────────────────────────────────────────
function SuccessBanner({ data, type, onDismiss }) {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const schools = type === "trust" ? data.schools : [{ schoolName: data.schoolName, adminEmail: data.adminEmail || data.schoolEmail, temporaryPassword: data.temporaryPassword, schoolCode: data.schoolCode }];
  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <div>
            <p className="font-bold text-green-300">{type === "trust" ? `Trust "${data.trustName}" Onboarded!` : `School "${data.schoolName}" Onboarded!`}</p>
            <p className="text-xs text-green-600 mt-0.5">{schools.length} school{schools.length > 1 ? "s" : ""} created · Subscription starts today · Credentials sent via email</p>
          </div>
        </div>
        <button onClick={onDismiss} className="p-1 text-green-500 hover:bg-green-500/10 rounded-lg transition"><X size={16} /></button>
      </div>
      <div className="space-y-2">
        {schools.map((s, i) => (
          <div key={i} className="bg-[#0f1117] border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">{s.schoolName}</p>
              <p className="text-xs text-gray-500">{s.adminEmail}</p>
            </div>
            {s.temporaryPassword && (
              <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <code className="text-xs font-mono text-amber-300 font-bold">{s.temporaryPassword}</code>
                <button onClick={() => copy(s.temporaryPassword, i)} className="text-amber-500 hover:text-amber-300 transition">
                  {copied === i ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SMS_Subscriptions() {
  const [trusts, setTrusts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTab, setActiveTab] = useState("trusts");
  const [showTrustModal, setShowTrustModal]   = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [successType, setSuccessType] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  // Razorpay / UPI settings
  const [upiSettings, setUpiSettings] = useState({ upiId: "", razorpayKey: "", razorpaySecret: "", webhookSecret: "", isTestMode: true, isActive: false });
  const [upiSaving, setUpiSaving]     = useState(false);
  const [upiSaved, setUpiSaved]       = useState(false);
  const [upiError, setUpiError]       = useState("");
  const [showSecret, setShowSecret]   = useState(false);
  const [upiLoading, setUpiLoading]   = useState(false);

  const [payFilter, setPayFilter] = useState("ALL");

  const fetchTrusts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await API.get("/super-admin/trusts");
      setTrusts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await API.get("/super-admin/subscription/dashboard");
      setDashboard(res.data);
    } catch (e) { /* optional */ }
  }, []);

  const fetchUpiSettings = useCallback(async () => {
    setUpiLoading(true);
    try {
      const res = await API.get("/super-admin/subscription/settings");
      if (res.data) setUpiSettings(res.data);
    } catch { /* not saved yet */ }
    finally { setUpiLoading(false); }
  }, []);

  useEffect(() => { fetchTrusts(); fetchDashboard(); }, [fetchTrusts, fetchDashboard]);
  useEffect(() => { if (activeTab === "upi") fetchUpiSettings(); }, [activeTab, fetchUpiSettings]);

  const handleToggleTrust  = (trustId, newActive) => setTrusts(p => p.map(t => t.trustId === trustId ? { ...t, active: newActive } : t));
  const handlePaymentUpdate = (trustId, newStatus) => setTrusts(p => p.map(t => t.trustId === trustId ? { ...t, paymentStatus: newStatus } : t));
  const handleSuccess       = (data, type) => { setSuccessData(data); setSuccessType(type); fetchTrusts(true); fetchDashboard(); };

  const filteredTrusts = trusts.filter(t => {
    const matchSearch = (t.trustName || "").toLowerCase().includes(search.toLowerCase()) ||
                        (t.trustCode || "").toLowerCase().includes(search.toLowerCase()) ||
                        (t.city || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" ? true : filterStatus === "ACTIVE" ? t.active : !t.active;
    const matchPay    = payFilter === "ALL" ? true : (t.paymentStatus || "PENDING") === payFilter;
    return matchSearch && matchStatus && matchPay;
  });

  const totalMonthly  = trusts.filter(t => t.active).reduce((a, t) => a + (t.effectiveMonthlyPrice || t.monthlyPrice || 0), 0);
  const totalSchools  = trusts.reduce((a, t) => a + (t.schools?.length || 0), 0);
  const activeTrusts  = trusts.filter(t => t.active).length;
  const paidCount     = trusts.filter(t => (t.paymentStatus || "PENDING") === "PAID").length;
  const overdueCount  = trusts.filter(t => t.paymentStatus === "OVERDUE").length;
  const expiringCount = trusts.filter(t => { const d = daysLeft(t.subscriptionEndDate); return d !== null && d >= 0 && d <= 7; }).length;

  const handleSaveUpi = async () => {
    setUpiSaving(true); setUpiError("");
    try {
      await API.post("/super-admin/subscription/settings", upiSettings);
      setUpiSaved(true);
      setTimeout(() => setUpiSaved(false), 3000);
    } catch (e) {
      setUpiError(e?.response?.data?.message || "Failed to save settings.");
    } finally { setUpiSaving(false); }
  };

  return (
    <div className="flex bg-[#0f1117] min-h-screen font-sans">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ReceiptText size={18} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Subscriptions & Billing</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage trusts, subscriptions, Razorpay payments & expiry notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => { fetchTrusts(true); fetchDashboard(); }} disabled={refreshing}
                className="p-2.5 text-gray-500 bg-[#1a1d27] border border-gray-800 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setShowSingleModal(true)}
                className="flex items-center gap-2 bg-[#1a1d27] border border-gray-700 text-gray-300 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all">
                <School size={16} className="text-blue-400" /> Single School
              </button>
              <button onClick={() => setShowTrustModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                <Layers size={16} /> Onboard Trust / Chain
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* ── Stats ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Trusts", value: trusts.length, icon: <Layers size={18} className="text-purple-400" />, accent: "purple" },
              { label: "Active", value: activeTrusts, icon: <CheckCircle size={18} className="text-green-400" />, accent: "green" },
              { label: "Schools", value: totalSchools, icon: <School size={18} className="text-blue-400" />, accent: "blue" },
              { label: "Monthly Rev", value: `₹${(totalMonthly/1000).toFixed(1)}K`, icon: <IndianRupee size={18} className="text-amber-400" />, accent: "amber" },
              { label: "Overdue", value: overdueCount, icon: <AlertTriangle size={18} className="text-red-400" />, accent: "red" },
              { label: "Expiring ≤7d", value: expiringCount, icon: <Clock size={18} className="text-orange-400" />, accent: "orange" },
            ].map(({ label, value, icon, accent }) => (
              <div key={label} className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 flex items-center justify-center flex-shrink-0`}>{icon}</div>
                <div>
                  <p className="text-lg font-black text-white leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Success Banner ───────────────────────────────────────────── */}
          {successData && <div className="mb-6"><SuccessBanner data={successData} type={successType} onDismiss={() => setSuccessData(null)} /></div>}

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-[#1a1d27] border border-gray-800 p-1 rounded-xl w-fit mb-6">
            {[["trusts", Layers, "Trusts & Schools"], ["pricing", TrendingUp, "Pricing Tiers"], ["upi", Wallet, "Razorpay / UPI"]].map(([key, Icon, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          {/* ── Tab: Trusts & Schools ──────────────────────────────────── */}
          {activeTab === "trusts" && (
            <div className="space-y-4">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-4 flex gap-4 flex-col md:flex-row items-center">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" placeholder="Search trust name, code or city..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0f1117] border border-gray-700 focus:border-blue-500/60 rounded-xl outline-none transition-all text-sm text-gray-200 placeholder:text-gray-600 font-medium" />
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {["ALL","ACTIVE","INACTIVE"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterStatus === s ? (s === "ACTIVE" ? "bg-green-500 text-black" : s === "INACTIVE" ? "bg-red-500 text-white" : "bg-blue-600 text-white") : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>
                      {s}
                    </button>
                  ))}
                  <div className="w-px bg-gray-700 self-stretch" />
                  {["ALL","PAID","PENDING","OVERDUE"].map(s => (
                    <button key={s} onClick={() => setPayFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${payFilter === s ? (s === "PAID" ? "bg-green-500/20 text-green-400 border border-green-500/30" : s === "OVERDUE" ? "bg-red-500/20 text-red-400 border border-red-500/30" : s === "PENDING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-600 text-white") : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>
                      {s === "ALL" ? "All Pay" : s}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1a1d27] rounded-2xl border border-gray-800">
                  <Loader2 size={28} className="animate-spin text-blue-400 mb-4" />
                  <p className="text-gray-500 font-medium">Loading subscriptions...</p>
                </div>
              ) : filteredTrusts.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1d27] rounded-2xl border border-gray-800">
                  <Layers size={48} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">{search ? "No trusts match your search." : "No trusts yet. Onboard your first trust or school!"}</p>
                  <button onClick={() => setShowTrustModal(true)} className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">
                    + Onboard First Trust
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrusts.map(t => <TrustRow key={t.trustId} trust={t} onToggle={handleToggleTrust} onPaymentUpdate={handlePaymentUpdate} />)}
                </div>
              )}
              {!loading && filteredTrusts.length > 0 && (
                <p className="text-xs text-gray-600 text-right">Showing {filteredTrusts.length} of {trusts.length} entries</p>
              )}
            </div>
          )}

          {/* ── Tab: Pricing Tiers ──────────────────────────────────────── */}
          {activeTab === "pricing" && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center"><School size={18} className="text-blue-400" /></div>
                    <div><p className="font-bold text-white">Single School</p><p className="text-xs text-gray-500">Standalone — no trust</p></div>
                  </div>
                  <div className="space-y-3">
                    {[{ plan: "BASIC", range: "≤ 500 students", price: 3000 }, { plan: "STANDARD", range: "501–1500 students", price: 5000 }, { plan: "PREMIUM", range: "> 1500 students", price: 8000 }].map(({ plan, range, price }) => (
                      <div key={plan} className="flex items-center justify-between p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                        <div><PlanChip plan={plan} /><p className="text-xs text-gray-600 mt-1">{range}</p></div>
                        <div className="text-right"><p className="font-black text-white">₹{price.toLocaleString()}/mo</p><p className="text-xs text-gray-600">₹{(price * 12).toLocaleString()}/yr</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center"><Layers size={18} className="text-purple-400" /></div>
                    <div><p className="font-bold text-white">Trust / Chain</p><p className="text-xs text-gray-500">Per-school rate with bulk discount</p></div>
                  </div>
                  <div className="space-y-3">
                    {[{ plan: "BASIC", max: "Max 3 schools", price: 2000 }, { plan: "STANDARD", max: "Max 10 schools", price: 1700 }, { plan: "PREMIUM", max: "Unlimited schools", price: 1500 }].map(({ plan, max, price }) => (
                      <div key={plan} className="flex items-center justify-between p-4 bg-[#0f1117] rounded-xl border border-gray-800">
                        <div><PlanChip plan={plan} /><p className="text-xs text-gray-600 mt-1">{max}</p></div>
                        <div className="text-right"><p className="font-black text-white">₹{price.toLocaleString()}/school/mo</p><p className="text-xs text-gray-600">Billed at trust level</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                <p className="font-bold text-blue-300 flex items-center gap-2 mb-2"><Edit2 size={16} />Custom Pricing</p>
                <p className="text-sm text-blue-400/70">Super Admin can enter a negotiated custom monthly price in the onboarding modal. This overrides the standard plan pricing and is stored as <code className="font-mono text-xs bg-blue-500/10 px-1 rounded">customMonthlyPrice</code> on the trust/school. FCM expiry notifications and Razorpay collection both use this custom amount.</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <p className="font-bold text-amber-300 flex items-center gap-2 mb-2"><BadgePercent size={16} />Discount Policy</p>
                <ul className="text-sm text-amber-400/70 space-y-1.5 list-disc pl-5">
                  <li>Discounts applied at onboarding time only — not retroactive.</li>
                  <li>Use Custom Price for negotiated flat amounts (e.g. ₹1,200/month for first year).</li>
                  <li>Premium trusts (5+ schools) can be negotiated directly.</li>
                  <li>Annual prepayment: offer additional 10–15% off via custom price.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Tab: Razorpay / UPI ─────────────────────────────────────── */}
          {activeTab === "upi" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center"><CreditCard size={18} className="text-blue-400" /></div>
                  <div>
                    <p className="font-bold text-white">Razorpay / UPI Settings</p>
                    <p className="text-xs text-gray-500">KaryaSoft's Razorpay account — schools pay directly into this</p>
                  </div>
                </div>
                {upiLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-4"><Loader2 size={16} className="animate-spin" /> Loading settings...</div>
                ) : (
                  <div className="space-y-4">
                    <DInput label="Your UPI ID" name="upiId" value={upiSettings.upiId || ""}
                      onChange={e => setUpiSettings(p => ({ ...p, upiId: e.target.value }))}
                      placeholder="yourname@upi or yourname@razorpay" icon={<QrCode size={14} />}
                      hint="Schools can directly pay your UPI. Shown on their payment screen." />
                    <DInput label="Razorpay Key ID" name="razorpayKey" value={upiSettings.razorpayKey || ""}
                      onChange={e => setUpiSettings(p => ({ ...p, razorpayKey: e.target.value }))}
                      placeholder="rzp_live_xxxxxxxxxxxx" icon={<Key size={14} />} />
                    <div>
                      <DLabel>Razorpay Secret Key</DLabel>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><ShieldCheck size={14} /></div>
                        <input type={showSecret ? "text" : "password"} value={upiSettings.razorpaySecret || ""}
                          onChange={e => setUpiSettings(p => ({ ...p, razorpaySecret: e.target.value }))}
                          placeholder="Leave blank to keep existing secret"
                          className="w-full pl-9 pr-10 py-2.5 bg-[#0f1117] border border-gray-700 rounded-xl text-sm text-gray-200 font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-all" />
                        <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <DInput label="Webhook Secret (optional)" name="webhookSecret" value={upiSettings.webhookSecret || ""}
                      onChange={e => setUpiSettings(p => ({ ...p, webhookSecret: e.target.value }))}
                      placeholder="Leave blank to keep existing" icon={<Hash size={14} />} />
                    {[
                      { key: "isTestMode", label: "Test Mode", sub: "Use Razorpay test credentials (rzp_test_...)", activeColor: "bg-amber-500" },
                      { key: "isActive",   label: "Active",    sub: "Enable Razorpay subscription payment collection", activeColor: "bg-green-500" },
                    ].map(({ key, label, sub, activeColor }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-[#0f1117] border border-gray-700 rounded-xl">
                        <div><p className="font-semibold text-gray-200 text-sm">{label}</p><p className="text-xs text-gray-600">{sub}</p></div>
                        <button onClick={() => setUpiSettings(p => ({ ...p, [key]: !p[key] }))}
                          className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${upiSettings[key] ? activeColor : "bg-gray-700"}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${upiSettings[key] ? "left-6" : "left-0.5"}`} />
                        </button>
                      </div>
                    ))}
                    {upiError && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"><AlertCircle size={14} /> {upiError}</div>}
                    <button onClick={handleSaveUpi} disabled={upiSaving}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                      {upiSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                        : upiSaved ? <><CheckCircle size={15} /> Settings Saved!</>
                        : "Save Payment Settings"}
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                <p className="font-bold text-blue-300 mb-3 flex items-center gap-2"><Info size={15} />How SaaS Billing Works</p>
                <ol className="text-sm text-blue-400/70 space-y-1.5 list-decimal pl-5">
                  <li>Onboard a school/trust. Subscription starts immediately (30-day period).</li>
                  <li>Click <strong>Collect</strong> on any trust row → Razorpay checkout opens.</li>
                  <li>School pays via UPI / Card / Net Banking into your Razorpay account.</li>
                  <li>Payment verified automatically → subscription extended by 30 days.</li>
                  <li>FCM push sent to school principal: 30d / 15d / 7d / 3d / 1d before expiry.</li>
                  <li>If unpaid past expiry → scheduler marks OVERDUE and deactivates school.</li>
                  <li>For manual payments (NEFT/cheque) → click <strong>Mark Paid</strong> on trust row.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      {showTrustModal  && <TrustOnboardModal  onClose={() => setShowTrustModal(false)}  onSuccess={d => handleSuccess(d, "trust")} />}
      {showSingleModal && <SingleSchoolModal  onClose={() => setShowSingleModal(false)} onSuccess={d => handleSuccess(d, "single")} />}
    </div>
  );
}