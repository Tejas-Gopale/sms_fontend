// src/teachers/pages/TeacherProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import TeacherSidebar from "../components/Teacher_Sidebar";
import profileService from "../../common/services/profileService";
import {
  Camera, Mail, Phone, User, Save, X, Edit2, Lock,
  MapPin, CheckCircle, AlertCircle, Loader, BookOpen, Calendar
} from "lucide-react";

export default function TeacherProfile() {
  const [profile, setProfile]         = useState(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [editForm, setEditForm]       = useState({});
  const [pwForm, setPwForm]           = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwSection, setShowPwSection] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [toast, setToast]             = useState(null);
  const fileInputRef                  = useRef();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileService.getMyProfile();
      setProfile(data);
      setEditForm({
        fullName:     data.fullName     || "",
        phoneNumber:  data.phoneNumber  || "",
        addressLine1: data.addressLine1 || "",
        addressLine2: data.addressLine2 || "",
        city:         data.city         || "",
        state:        data.state        || "",
        country:      data.country      || "",
        pincode:      data.pincode      || "",
      });
    } catch { showToast("error", "Failed to load profile"); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) return showToast("error", "Full name is required");
    setSaving(true);
    try {
      const { data } = await profileService.updateMyProfile(editForm);
      setProfile(data);
      setIsEditing(false);
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return showToast("error", "Passwords do not match");
    if (pwForm.newPassword.length < 8) return showToast("error", "Password must be at least 8 characters");
    setSaving(true);
    try {
      await profileService.changePassword(pwForm);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPwSection(false);
      showToast("success", "Password changed successfully!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Incorrect current password");
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { data } = await profileService.uploadMyPhoto(file);
      setProfile(prev => ({ ...prev, profilePhotoUrl: data.url }));
      showToast("success", "Photo updated!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Photo upload failed");
    } finally { setPhotoUploading(false); }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName:     profile?.fullName     || "",
      phoneNumber:  profile?.phoneNumber  || "",
      addressLine1: profile?.addressLine1 || "",
      addressLine2: profile?.addressLine2 || "",
      city:         profile?.city         || "",
      state:        profile?.state        || "",
      country:      profile?.country      || "",
      pincode:      profile?.pincode      || "",
    });
  };

  const avatarUrl = profile?.profilePhotoUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "Teacher")}&background=0EA5E9&color=fff&size=200`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .tp-page { display: flex; font-family: 'DM Sans', sans-serif; background: #F0F9FF; min-height: 100vh; }
        .tp-main { flex: 1; padding: 32px 28px; max-width: 960px; }
        .tp-card { background: #fff; border-radius: 16px; border: 1.5px solid #E0F2FE; box-shadow: 0 1px 6px rgba(14,165,233,0.06); margin-bottom: 20px; overflow: hidden; }
        .tp-header-bg { height: 110px; background: linear-gradient(135deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%); }
        .tp-content { padding: 0 32px 32px; margin-top: -56px; }
        .tp-avatar { width: 112px; height: 112px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #E0F2FE; }
        .tp-camera-btn { position: absolute; bottom: 4px; right: 4px; background: #0F172A; color: #fff; border: none; padding: 6px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; }
        .tp-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #E0F2FE; color: #0369A1; margin: 2px; text-transform: uppercase; }
        .tp-section-title { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #F0F9FF; }
        .tp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .tp-field { display: flex; flex-direction: column; gap: 6px; }
        .tp-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.4px; }
        .tp-input { padding: 10px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 14px; background: #F8FAFC; font-family: inherit; transition: all 0.2s; }
        .tp-input:focus { border-color: #0EA5E9; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
        .tp-input:disabled { background: #F1F5F9; color: #64748B; cursor: default; }
        .tp-value { padding: 10px 14px; font-size: 14px; color: #0F172A; background: #F8FAFC; border-radius: 8px; display: flex; align-items: center; gap: 8px; min-height: 40px; }
        .tp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
        .tp-btn-dark { background: #0F172A; color: #fff; } .tp-btn-dark:hover { background: #1E293B; }
        .tp-btn-blue { background: #0369A1; color: #fff; } .tp-btn-blue:hover { background: #075985; }
        .tp-btn-outline { background: #fff; color: #64748B; border: 1.5px solid #E2E8F0; } .tp-btn-outline:hover { background: #F8FAFC; }
        .tp-btn-red { background: #DC2626; color: #fff; }
        .tp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .tp-btn-row { display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #F0F9FF; }
        .tp-info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; padding: 6px 0; }
        .tp-toast { position: fixed; top: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 9999; animation: tpSlide 0.3s ease; }
        .tp-toast-success { background: #F0FDF4; color: #15803D; border: 1.5px solid #BBF7D0; }
        .tp-toast-error { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
        @keyframes tpSlide { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 768px) { .tp-grid { grid-template-columns: 1fr; } .tp-main { padding: 16px; } }
      `}</style>

      {toast && (
        <div className={`tp-toast tp-toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="tp-page">
        <TeacherSidebar />
        <div className="tp-main">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 32, color: "#64748B" }}>
              <Loader size={20} /> Loading profile...
            </div>
          ) : (
            <>
              {/* Header card */}
              <div className="tp-card">
                <div className="tp-header-bg" />
                <div className="tp-content">
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {photoUploading
                      ? <div className="tp-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#E0F2FE" }}><Loader size={24} /></div>
                      : <img src={avatarUrl} alt={profile?.fullName} className="tp-avatar" />
                    }
                    <button className="tp-camera-btn" onClick={() => fileInputRef.current.click()}>
                      <Camera size={14} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>{profile?.fullName}</h1>
                    <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 8px" }}>{profile?.schoolName}</p>
                    <div>{profile?.roles?.map(r => <span key={r} className="tp-badge">{r.replace("_", " ")}</span>)}</div>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: "2px 28px" }}>
                    <div className="tp-info-row"><Mail size={13} />{profile?.email}</div>
                    {profile?.phoneNumber && <div className="tp-info-row"><Phone size={13} />{profile?.phoneNumber}</div>}
                    {profile?.city && <div className="tp-info-row"><MapPin size={13} />{[profile.city, profile.state].filter(Boolean).join(", ")}</div>}
                  </div>
                  {profile?.lastLogin && <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 10 }}>Last login: {new Date(profile.lastLogin).toLocaleString()}</p>}
                </div>
              </div>

              {/* Edit card */}
              <div className="tp-card">
                <div style={{ padding: "24px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <p className="tp-section-title" style={{ margin: 0, borderBottom: "none" }}>Personal Information</p>
                    {!isEditing && <button className="tp-btn tp-btn-dark" onClick={() => setIsEditing(true)}><Edit2 size={13} /> Edit</button>}
                  </div>

                  <form onSubmit={handleSaveProfile}>
                    <div className="tp-grid">
                      <div className="tp-field">
                        <label className="tp-label">Full Name</label>
                        {isEditing
                          ? <input className="tp-input" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required />
                          : <div className="tp-value"><User size={13} />{profile?.fullName}</div>
                        }
                      </div>
                      <div className="tp-field">
                        <label className="tp-label">Email</label>
                        <div className="tp-value"><Mail size={13} />{profile?.email}</div>
                      </div>
                      <div className="tp-field">
                        <label className="tp-label">Phone</label>
                        {isEditing
                          ? <input className="tp-input" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                          : <div className="tp-value"><Phone size={13} />{profile?.phoneNumber || "—"}</div>
                        }
                      </div>
                      <div className="tp-field">
                        <label className="tp-label">City</label>
                        {isEditing
                          ? <input className="tp-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                          : <div className="tp-value"><MapPin size={13} />{profile?.city || "—"}</div>
                        }
                      </div>
                      {isEditing && (
                        <>
                          <div className="tp-field" style={{ gridColumn: "span 2" }}>
                            <label className="tp-label">Address Line 1</label>
                            <input className="tp-input" value={editForm.addressLine1} onChange={e => setEditForm({ ...editForm, addressLine1: e.target.value })} />
                          </div>
                          <div className="tp-field" style={{ gridColumn: "span 2" }}>
                            <label className="tp-label">Address Line 2</label>
                            <input className="tp-input" value={editForm.addressLine2} onChange={e => setEditForm({ ...editForm, addressLine2: e.target.value })} />
                          </div>
                          <div className="tp-field">
                            <label className="tp-label">State</label>
                            <input className="tp-input" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
                          </div>
                          <div className="tp-field">
                            <label className="tp-label">Pincode</label>
                            <input className="tp-input" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} />
                          </div>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="tp-btn-row">
                        <button type="submit" className="tp-btn tp-btn-blue" disabled={saving}>
                          {saving ? <Loader size={13} /> : <Save size={13} />} Save Changes
                        </button>
                        <button type="button" className="tp-btn tp-btn-outline" onClick={cancelEdit}><X size={13} /> Cancel</button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Change password card */}
              <div className="tp-card">
                <div style={{ padding: "24px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p className="tp-section-title" style={{ margin: 0, borderBottom: "none" }}>Security</p>
                    <button className="tp-btn tp-btn-outline" onClick={() => setShowPwSection(v => !v)}>
                      <Lock size={13} /> {showPwSection ? "Cancel" : "Change Password"}
                    </button>
                  </div>
                  {showPwSection && (
                    <form onSubmit={handleChangePassword} style={{ marginTop: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                        {[
                          { key: "currentPassword", label: "Current Password" },
                          { key: "newPassword", label: "New Password" },
                          { key: "confirmPassword", label: "Confirm Password" },
                        ].map(({ key, label }) => (
                          <div key={key} className="tp-field">
                            <label className="tp-label">{label}</label>
                            <input type="password" className="tp-input" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required />
                          </div>
                        ))}
                      </div>
                      <div className="tp-btn-row">
                        <button type="submit" className="tp-btn tp-btn-red" disabled={saving}>
                          {saving ? <Loader size={13} /> : <Lock size={13} />} Update Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
