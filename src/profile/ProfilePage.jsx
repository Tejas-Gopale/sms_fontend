// src/profile/ProfilePage.jsx
import React, { useState, useEffect, useRef } from "react";
import RoleSidebar from "../common/components/RoleSidebar";
import { getUserData } from "../common/utils/tokenStorage";
import profileService from "../common/services/profileService";
import { Camera, Mail, Phone, User, Save, X, Edit2, Lock, MapPin, CheckCircle, AlertCircle, Loader } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile]       = useState(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [editForm, setEditForm]     = useState({});
  const [pwForm, setPwForm]         = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwSection, setShowPwSection] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [toast, setToast]           = useState(null); // { type: 'success'|'error', msg }
  const fileInputRef                = useRef();

  // ── Load profile on mount ──────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

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
    } catch (err) {
      showToast("error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Save profile edits ─────────────────────────────────────────
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
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return showToast("error", "Passwords do not match");
    if (pwForm.newPassword.length < 8)
      return showToast("error", "Password must be at least 8 characters");
    setSaving(true);
    try {
      await profileService.changePassword(pwForm);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPwSection(false);
      showToast("success", "Password changed successfully!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Incorrect current password");
    } finally {
      setSaving(false);
    }
  };

  // ── Photo upload ───────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { data } = await profileService.uploadMyPhoto(file);
      setProfile((prev) => ({ ...prev, profilePhotoUrl: data.url }));
      showToast("success", "Photo updated!");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
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

  const avatarUrl = profile?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=6366F1&color=fff&size=200`;
  const initials  = profile?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .profile-page { display: flex; font-family: 'DM Sans', sans-serif; background: #F8F9FC; min-height: 100vh; }
        .profile-main { flex: 1; padding: 32px 28px; max-width: 960px; }
        .profile-card { background: #fff; border-radius: 16px; border: 1.5px solid #E2E8F0; box-shadow: 0 1px 6px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
        .profile-header-bg { height: 120px; background: linear-gradient(135deg, #4338CA 0%, #6366F1 60%, #818CF8 100%); position: relative; }
        .profile-content { padding: 0 32px 32px; margin-top: -60px; }
        .avatar-wrap { position: relative; display: inline-block; }
        .profile-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); background: #E2E8F0; }
        .camera-btn { position: absolute; bottom: 4px; right: 4px; background: #0F172A; color: #fff; border: none; padding: 7px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .camera-btn:hover { transform: scale(1.1); }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #EEF2FF; color: #4338CA; margin: 2px; text-transform: uppercase; letter-spacing: 0.3px; }
        .section-title { font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #F1F5F9; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.4px; }
        .field-input { padding: 10px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 14px; transition: all 0.2s; background: #F8F9FC; font-family: inherit; }
        .field-input:focus { border-color: #6366F1; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .field-input:disabled { background: #F1F5F9; color: #64748B; cursor: default; }
        .field-value { padding: 10px 14px; font-size: 14px; color: #0F172A; background: #F8F9FC; border-radius: 8px; border: 1.5px solid transparent; min-height: 40px; display: flex; align-items: center; gap: 8px; }
        .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
        .btn-dark { background: #0F172A; color: #fff; }
        .btn-dark:hover { background: #1E293B; }
        .btn-green { background: #15803D; color: #fff; }
        .btn-green:hover { background: #166534; }
        .btn-outline { background: #fff; color: #64748B; border: 1.5px solid #E2E8F0; }
        .btn-outline:hover { background: #F8F9FC; }
        .btn-red { background: #DC2626; color: #fff; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-row { display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #F1F5F9; }
        .toast { position: fixed; top: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 9999; animation: slideIn 0.3s ease; }
        .toast-success { background: #F0FDF4; color: #15803D; border: 1.5px solid #BBF7D0; }
        .toast-error { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; padding: 8px 0; }
        .info-row svg { color: #94A3B8; flex-shrink: 0; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .profile-main { padding: 16px; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="profile-page">
        <RoleSidebar />

        <div className="profile-main">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 32, color: "#64748B" }}>
              <Loader size={20} className="spin" /> Loading profile...
            </div>
          ) : (
            <>
              {/* ── PROFILE CARD ── */}
              <div className="profile-card">
                <div className="profile-header-bg" />
                <div className="profile-content">
                  {/* Avatar */}
                  <div className="avatar-wrap">
                    {photoUploading
                      ? <div className="profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#E2E8F0" }}><Loader size={28} /></div>
                      : <img src={avatarUrl} alt={profile?.fullName} className="profile-avatar" />
                    }
                    <button className="camera-btn" onClick={() => fileInputRef.current.click()} title="Change Photo">
                      <Camera size={16} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
                  </div>

                  {/* Name & Roles */}
                  <div style={{ marginTop: 16 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0 }}>{profile?.fullName}</h1>
                    <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 8px" }}>{profile?.schoolName}</p>
                    <div>{profile?.roles?.map(r => <span key={r} className="badge">{r.replace("_", " ")}</span>)}</div>
                  </div>

                  {/* Quick info */}
                  <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
                    <div className="info-row"><Mail size={14} /> {profile?.email}</div>
                    {profile?.phoneNumber && <div className="info-row"><Phone size={14} /> {profile?.phoneNumber}</div>}
                    {profile?.city && <div className="info-row"><MapPin size={14} /> {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</div>}
                  </div>

                  {/* Last login */}
                  {profile?.lastLogin && (
                    <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12 }}>
                      Last login: {new Date(profile.lastLogin).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* ── EDIT PROFILE CARD ── */}
              <div className="profile-card">
                <div style={{ padding: "24px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Personal Information</p>
                    {!isEditing && (
                      <button className="btn btn-dark" onClick={() => setIsEditing(true)}>
                        <Edit2 size={14} /> Edit Profile
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveProfile}>
                    <div className="form-grid">
                      <div className="field-group">
                        <label className="field-label">Full Name</label>
                        {isEditing
                          ? <input className="field-input" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required />
                          : <div className="field-value"><User size={14} />{profile?.fullName || "—"}</div>
                        }
                      </div>

                      <div className="field-group">
                        <label className="field-label">Email Address</label>
                        <div className="field-value"><Mail size={14} />{profile?.email}</div>
                        {isEditing && <span style={{ fontSize: 11, color: "#94A3B8" }}>Email cannot be changed</span>}
                      </div>

                      <div className="field-group">
                        <label className="field-label">Phone Number</label>
                        {isEditing
                          ? <input className="field-input" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                          : <div className="field-value"><Phone size={14} />{profile?.phoneNumber || "—"}</div>
                        }
                      </div>

                      <div className="field-group">
                        <label className="field-label">City</label>
                        {isEditing
                          ? <input className="field-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} placeholder="Mumbai" />
                          : <div className="field-value">{profile?.city || "—"}</div>
                        }
                      </div>

                      <div className="field-group" style={{ gridColumn: "span 2" }}>
                        <label className="field-label">Address Line 1</label>
                        {isEditing
                          ? <input className="field-input" value={editForm.addressLine1} onChange={e => setEditForm({ ...editForm, addressLine1: e.target.value })} placeholder="Street, Building No." />
                          : <div className="field-value"><MapPin size={14} />{profile?.addressLine1 || "—"}</div>
                        }
                      </div>

                      {isEditing && (
                        <>
                          <div className="field-group" style={{ gridColumn: "span 2" }}>
                            <label className="field-label">Address Line 2</label>
                            <input className="field-input" value={editForm.addressLine2} onChange={e => setEditForm({ ...editForm, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" />
                          </div>
                          <div className="field-group">
                            <label className="field-label">State</label>
                            <input className="field-input" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} placeholder="Maharashtra" />
                          </div>
                          <div className="field-group">
                            <label className="field-label">Pincode</label>
                            <input className="field-input" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} placeholder="400001" />
                          </div>
                          <div className="field-group">
                            <label className="field-label">Country</label>
                            <input className="field-input" value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} placeholder="India" />
                          </div>
                        </>
                      )}
                    </div>

                    {isEditing && (
                      <div className="btn-row">
                        <button type="submit" className="btn btn-green" disabled={saving}>
                          {saving ? <Loader size={14} /> : <Save size={14} />} Save Changes
                        </button>
                        <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* ── CHANGE PASSWORD CARD ── */}
              <div className="profile-card">
                <div style={{ padding: "24px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Security</p>
                    <button className="btn btn-outline" onClick={() => setShowPwSection(v => !v)}>
                      <Lock size={14} /> {showPwSection ? "Cancel" : "Change Password"}
                    </button>
                  </div>

                  {showPwSection && (
                    <form onSubmit={handleChangePassword} style={{ marginTop: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                        {[
                          { key: "currentPassword", label: "Current Password" },
                          { key: "newPassword",     label: "New Password" },
                          { key: "confirmPassword", label: "Confirm New Password" },
                        ].map(({ key, label }) => (
                          <div key={key} className="field-group">
                            <label className="field-label">{label}</label>
                            <input
                              type="password"
                              className="field-input"
                              value={pwForm[key]}
                              onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                              required
                              minLength={key !== "currentPassword" ? 8 : undefined}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="btn-row">
                        <button type="submit" className="btn btn-red" disabled={saving}>
                          {saving ? <Loader size={14} /> : <Lock size={14} />} Update Password
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
};

export default ProfilePage;
// // src/school_admin/pages/ProfilePage.jsx
// import React, { useState, useEffect, useRef } from "react";
// import SchoolAdminSidebar from "../school_admin/components/SchoolAdminSidebar";
// import profileService from "../common/services/profileService";
// import { Camera, Mail, Phone, User, Save, X, Edit2, Lock, MapPin, CheckCircle, AlertCircle, Loader } from "lucide-react";

// const ProfilePage = () => {
//   const [profile, setProfile]       = useState(null);
//   const [isEditing, setIsEditing]   = useState(false);
//   const [editForm, setEditForm]     = useState({});
//   const [pwForm, setPwForm]         = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   const [showPwSection, setShowPwSection] = useState(false);
//   const [loading, setLoading]       = useState(true);
//   const [saving, setSaving]         = useState(false);
//   const [photoUploading, setPhotoUploading] = useState(false);
//   const [toast, setToast]           = useState(null); // { type: 'success'|'error', msg }
//   const fileInputRef                = useRef();

//   // ── Load profile on mount ──────────────────────────────────────
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const { data } = await profileService.getMyProfile();
//       setProfile(data);
//       setEditForm({
//         fullName:     data.fullName     || "",
//         phoneNumber:  data.phoneNumber  || "",
//         addressLine1: data.addressLine1 || "",
//         addressLine2: data.addressLine2 || "",
//         city:         data.city         || "",
//         state:        data.state        || "",
//         country:      data.country      || "",
//         pincode:      data.pincode      || "",
//       });
//     } catch (err) {
//       showToast("error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Save profile edits ─────────────────────────────────────────
//   const handleSaveProfile = async (e) => {
//     e.preventDefault();
//     if (!editForm.fullName.trim()) return showToast("error", "Full name is required");
//     setSaving(true);
//     try {
//       const { data } = await profileService.updateMyProfile(editForm);
//       setProfile(data);
//       setIsEditing(false);
//       showToast("success", "Profile updated successfully!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Failed to update profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Change password ────────────────────────────────────────────
//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (pwForm.newPassword !== pwForm.confirmPassword)
//       return showToast("error", "Passwords do not match");
//     if (pwForm.newPassword.length < 8)
//       return showToast("error", "Password must be at least 8 characters");
//     setSaving(true);
//     try {
//       await profileService.changePassword(pwForm);
//       setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       setShowPwSection(false);
//       showToast("success", "Password changed successfully!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Incorrect current password");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Photo upload ───────────────────────────────────────────────
//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setPhotoUploading(true);
//     try {
//       const { data } = await profileService.uploadMyPhoto(file);
//       setProfile((prev) => ({ ...prev, profilePhotoUrl: data.url }));
//       showToast("success", "Photo updated!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Photo upload failed");
//     } finally {
//       setPhotoUploading(false);
//     }
//   };

//   const showToast = (type, msg) => {
//     setToast({ type, msg });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const cancelEdit = () => {
//     setIsEditing(false);
//     setEditForm({
//       fullName:     profile?.fullName     || "",
//       phoneNumber:  profile?.phoneNumber  || "",
//       addressLine1: profile?.addressLine1 || "",
//       addressLine2: profile?.addressLine2 || "",
//       city:         profile?.city         || "",
//       state:        profile?.state        || "",
//       country:      profile?.country      || "",
//       pincode:      profile?.pincode      || "",
//     });
//   };

//   const avatarUrl = profile?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=6366F1&color=fff&size=200`;
//   const initials  = profile?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
//         .profile-page { display: flex; font-family: 'DM Sans', sans-serif; background: #F8F9FC; min-height: 100vh; }
//         .profile-main { flex: 1; padding: 32px 28px; max-width: 960px; }
//         .profile-card { background: #fff; border-radius: 16px; border: 1.5px solid #E2E8F0; box-shadow: 0 1px 6px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
//         .profile-header-bg { height: 120px; background: linear-gradient(135deg, #4338CA 0%, #6366F1 60%, #818CF8 100%); position: relative; }
//         .profile-content { padding: 0 32px 32px; margin-top: -60px; }
//         .avatar-wrap { position: relative; display: inline-block; }
//         .profile-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); background: #E2E8F0; }
//         .camera-btn { position: absolute; bottom: 4px; right: 4px; background: #0F172A; color: #fff; border: none; padding: 7px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
//         .camera-btn:hover { transform: scale(1.1); }
//         .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #EEF2FF; color: #4338CA; margin: 2px; text-transform: uppercase; letter-spacing: 0.3px; }
//         .section-title { font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #F1F5F9; }
//         .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
//         .field-group { display: flex; flex-direction: column; gap: 6px; }
//         .field-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.4px; }
//         .field-input { padding: 10px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 14px; transition: all 0.2s; background: #F8F9FC; font-family: inherit; }
//         .field-input:focus { border-color: #6366F1; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
//         .field-input:disabled { background: #F1F5F9; color: #64748B; cursor: default; }
//         .field-value { padding: 10px 14px; font-size: 14px; color: #0F172A; background: #F8F9FC; border-radius: 8px; border: 1.5px solid transparent; min-height: 40px; display: flex; align-items: center; gap: 8px; }
//         .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
//         .btn-dark { background: #0F172A; color: #fff; }
//         .btn-dark:hover { background: #1E293B; }
//         .btn-green { background: #15803D; color: #fff; }
//         .btn-green:hover { background: #166534; }
//         .btn-outline { background: #fff; color: #64748B; border: 1.5px solid #E2E8F0; }
//         .btn-outline:hover { background: #F8F9FC; }
//         .btn-red { background: #DC2626; color: #fff; }
//         .btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .btn-row { display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #F1F5F9; }
//         .toast { position: fixed; top: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 9999; animation: slideIn 0.3s ease; }
//         .toast-success { background: #F0FDF4; color: #15803D; border: 1.5px solid #BBF7D0; }
//         .toast-error { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
//         @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
//         .info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; padding: 8px 0; }
//         .info-row svg { color: #94A3B8; flex-shrink: 0; }
//         @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .profile-main { padding: 16px; } }
//       `}</style>

//       {/* Toast */}
//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//           {toast.msg}
//         </div>
//       )}

//       <div className="profile-page">
//         <SchoolAdminSidebar />

//         <div className="profile-main">
//           {loading ? (
//             <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 32, color: "#64748B" }}>
//               <Loader size={20} className="spin" /> Loading profile...
//             </div>
//           ) : (
//             <>
//               {/* ── PROFILE CARD ── */}
//               <div className="profile-card">
//                 <div className="profile-header-bg" />
//                 <div className="profile-content">
//                   {/* Avatar */}
//                   <div className="avatar-wrap">
//                     {photoUploading
//                       ? <div className="profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#E2E8F0" }}><Loader size={28} /></div>
//                       : <img src={avatarUrl} alt={profile?.fullName} className="profile-avatar" />
//                     }
//                     <button className="camera-btn" onClick={() => fileInputRef.current.click()} title="Change Photo">
//                       <Camera size={16} />
//                     </button>
//                     <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
//                   </div>

//                   {/* Name & Roles */}
//                   <div style={{ marginTop: 16 }}>
//                     <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0 }}>{profile?.fullName}</h1>
//                     <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 8px" }}>{profile?.schoolName}</p>
//                     <div>{profile?.roles?.map(r => <span key={r} className="badge">{r.replace("_", " ")}</span>)}</div>
//                   </div>

//                   {/* Quick info */}
//                   <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
//                     <div className="info-row"><Mail size={14} /> {profile?.email}</div>
//                     {profile?.phoneNumber && <div className="info-row"><Phone size={14} /> {profile?.phoneNumber}</div>}
//                     {profile?.city && <div className="info-row"><MapPin size={14} /> {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</div>}
//                   </div>

//                   {/* Last login */}
//                   {profile?.lastLogin && (
//                     <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12 }}>
//                       Last login: {new Date(profile.lastLogin).toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* ── EDIT PROFILE CARD ── */}
//               <div className="profile-card">
//                 <div style={{ padding: "24px 32px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//                     <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Personal Information</p>
//                     {!isEditing && (
//                       <button className="btn btn-dark" onClick={() => setIsEditing(true)}>
//                         <Edit2 size={14} /> Edit Profile
//                       </button>
//                     )}
//                   </div>

//                   <form onSubmit={handleSaveProfile}>
//                     <div className="form-grid">
//                       <div className="field-group">
//                         <label className="field-label">Full Name</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required />
//                           : <div className="field-value"><User size={14} />{profile?.fullName || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">Email Address</label>
//                         <div className="field-value"><Mail size={14} />{profile?.email}</div>
//                         {isEditing && <span style={{ fontSize: 11, color: "#94A3B8" }}>Email cannot be changed</span>}
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">Phone Number</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 XXXXX XXXXX" />
//                           : <div className="field-value"><Phone size={14} />{profile?.phoneNumber || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">City</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} placeholder="Mumbai" />
//                           : <div className="field-value">{profile?.city || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group" style={{ gridColumn: "span 2" }}>
//                         <label className="field-label">Address Line 1</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.addressLine1} onChange={e => setEditForm({ ...editForm, addressLine1: e.target.value })} placeholder="Street, Building No." />
//                           : <div className="field-value"><MapPin size={14} />{profile?.addressLine1 || "—"}</div>
//                         }
//                       </div>

//                       {isEditing && (
//                         <>
//                           <div className="field-group" style={{ gridColumn: "span 2" }}>
//                             <label className="field-label">Address Line 2</label>
//                             <input className="field-input" value={editForm.addressLine2} onChange={e => setEditForm({ ...editForm, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">State</label>
//                             <input className="field-input" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} placeholder="Maharashtra" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">Pincode</label>
//                             <input className="field-input" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} placeholder="400001" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">Country</label>
//                             <input className="field-input" value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} placeholder="India" />
//                           </div>
//                         </>
//                       )}
//                     </div>

//                     {isEditing && (
//                       <div className="btn-row">
//                         <button type="submit" className="btn btn-green" disabled={saving}>
//                           {saving ? <Loader size={14} /> : <Save size={14} />} Save Changes
//                         </button>
//                         <button type="button" className="btn btn-outline" onClick={cancelEdit}>
//                           <X size={14} /> Cancel
//                         </button>
//                       </div>
//                     )}
//                   </form>
//                 </div>
//               </div>

//               {/* ── CHANGE PASSWORD CARD ── */}
//               <div className="profile-card">
//                 <div style={{ padding: "24px 32px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Security</p>
//                     <button className="btn btn-outline" onClick={() => setShowPwSection(v => !v)}>
//                       <Lock size={14} /> {showPwSection ? "Cancel" : "Change Password"}
//                     </button>
//                   </div>

//                   {showPwSection && (
//                     <form onSubmit={handleChangePassword} style={{ marginTop: 20 }}>
//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
//                         {[
//                           { key: "currentPassword", label: "Current Password" },
//                           { key: "newPassword",     label: "New Password" },
//                           { key: "confirmPassword", label: "Confirm New Password" },
//                         ].map(({ key, label }) => (
//                           <div key={key} className="field-group">
//                             <label className="field-label">{label}</label>
//                             <input
//                               type="password"
//                               className="field-input"
//                               value={pwForm[key]}
//                               onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
//                               required
//                               minLength={key !== "currentPassword" ? 8 : undefined}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                       <div className="btn-row">
//                         <button type="submit" className="btn btn-red" disabled={saving}>
//                           {saving ? <Loader size={14} /> : <Lock size={14} />} Update Password
//                         </button>
//                       </div>
//                     </form>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProfilePage;

// // src/profile/ProfilePage.jsx
// import React, { useState, useEffect, useRef } from "react";
// import SchoolAdminSidebar from "../school_admin/components/SchoolAdminSidebar";
// import TeacherSidebar from "../teachers/components/Teacher_Sidebar";
// import ParentSidebar from "../parents/components/ParentSidebar";
// import SuperAdminSidebar from "../super_admin/components/SuperAdminSidebar";
// import { getUserData } from "../common/utils/tokenStorage";
// import profileService from "../common/services/profileService";
// import { Camera, Mail, Phone, User, Save, X, Edit2, Lock, MapPin, CheckCircle, AlertCircle, Loader } from "lucide-react";

// // Resolves the correct sidebar based on the logged-in user's primary role
// function RoleSidebar() {
//   const userData = getUserData();
//   const roles = userData?.roles || [];

//   if (roles.includes("SUPER_ADMIN"))  return <SuperAdminSidebar />;
//   if (roles.includes("SCHOOL_ADMIN")) return <SchoolAdminSidebar />;
//   if (roles.includes("TEACHER"))      return <TeacherSidebar />;
//   if (roles.includes("PARENT"))       return <ParentSidebar />;

//   // Fallback: derive from current URL prefix
//   const path = window.location.pathname;
//   if (path.startsWith("/super-admin"))  return <SuperAdminSidebar />;
//   if (path.startsWith("/teacher"))      return <TeacherSidebar />;
//   if (path.startsWith("/parent"))       return <ParentSidebar />;
//   return <SchoolAdminSidebar />;
// }

// const ProfilePage = () => {
//   const [profile, setProfile]       = useState(null);
//   const [isEditing, setIsEditing]   = useState(false);
//   const [editForm, setEditForm]     = useState({});
//   const [pwForm, setPwForm]         = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   const [showPwSection, setShowPwSection] = useState(false);
//   const [loading, setLoading]       = useState(true);
//   const [saving, setSaving]         = useState(false);
//   const [photoUploading, setPhotoUploading] = useState(false);
//   const [toast, setToast]           = useState(null); // { type: 'success'|'error', msg }
//   const fileInputRef                = useRef();

//   // ── Load profile on mount ──────────────────────────────────────
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const { data } = await profileService.getMyProfile();
//       setProfile(data);
//       setEditForm({
//         fullName:     data.fullName     || "",
//         phoneNumber:  data.phoneNumber  || "",
//         addressLine1: data.addressLine1 || "",
//         addressLine2: data.addressLine2 || "",
//         city:         data.city         || "",
//         state:        data.state        || "",
//         country:      data.country      || "",
//         pincode:      data.pincode      || "",
//       });
//     } catch (err) {
//       showToast("error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Save profile edits ─────────────────────────────────────────
//   const handleSaveProfile = async (e) => {
//     e.preventDefault();
//     if (!editForm.fullName.trim()) return showToast("error", "Full name is required");
//     setSaving(true);
//     try {
//       const { data } = await profileService.updateMyProfile(editForm);
//       setProfile(data);
//       setIsEditing(false);
//       showToast("success", "Profile updated successfully!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Failed to update profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Change password ────────────────────────────────────────────
//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (pwForm.newPassword !== pwForm.confirmPassword)
//       return showToast("error", "Passwords do not match");
//     if (pwForm.newPassword.length < 8)
//       return showToast("error", "Password must be at least 8 characters");
//     setSaving(true);
//     try {
//       await profileService.changePassword(pwForm);
//       setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       setShowPwSection(false);
//       showToast("success", "Password changed successfully!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Incorrect current password");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Photo upload ───────────────────────────────────────────────
//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setPhotoUploading(true);
//     try {
//       const { data } = await profileService.uploadMyPhoto(file);
//       setProfile((prev) => ({ ...prev, profilePhotoUrl: data.url }));
//       showToast("success", "Photo updated!");
//     } catch (err) {
//       showToast("error", err?.response?.data?.message || "Photo upload failed");
//     } finally {
//       setPhotoUploading(false);
//     }
//   };

//   const showToast = (type, msg) => {
//     setToast({ type, msg });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const cancelEdit = () => {
//     setIsEditing(false);
//     setEditForm({
//       fullName:     profile?.fullName     || "",
//       phoneNumber:  profile?.phoneNumber  || "",
//       addressLine1: profile?.addressLine1 || "",
//       addressLine2: profile?.addressLine2 || "",
//       city:         profile?.city         || "",
//       state:        profile?.state        || "",
//       country:      profile?.country      || "",
//       pincode:      profile?.pincode      || "",
//     });
//   };

//   const avatarUrl = profile?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=6366F1&color=fff&size=200`;
//   const initials  = profile?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
//         .profile-page { display: flex; font-family: 'DM Sans', sans-serif; background: #F8F9FC; min-height: 100vh; }
//         .profile-main { flex: 1; padding: 32px 28px; max-width: 960px; }
//         .profile-card { background: #fff; border-radius: 16px; border: 1.5px solid #E2E8F0; box-shadow: 0 1px 6px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
//         .profile-header-bg { height: 120px; background: linear-gradient(135deg, #4338CA 0%, #6366F1 60%, #818CF8 100%); position: relative; }
//         .profile-content { padding: 0 32px 32px; margin-top: -60px; }
//         .avatar-wrap { position: relative; display: inline-block; }
//         .profile-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); background: #E2E8F0; }
//         .camera-btn { position: absolute; bottom: 4px; right: 4px; background: #0F172A; color: #fff; border: none; padding: 7px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
//         .camera-btn:hover { transform: scale(1.1); }
//         .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #EEF2FF; color: #4338CA; margin: 2px; text-transform: uppercase; letter-spacing: 0.3px; }
//         .section-title { font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px solid #F1F5F9; }
//         .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
//         .field-group { display: flex; flex-direction: column; gap: 6px; }
//         .field-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.4px; }
//         .field-input { padding: 10px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; font-size: 14px; transition: all 0.2s; background: #F8F9FC; font-family: inherit; }
//         .field-input:focus { border-color: #6366F1; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
//         .field-input:disabled { background: #F1F5F9; color: #64748B; cursor: default; }
//         .field-value { padding: 10px 14px; font-size: 14px; color: #0F172A; background: #F8F9FC; border-radius: 8px; border: 1.5px solid transparent; min-height: 40px; display: flex; align-items: center; gap: 8px; }
//         .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
//         .btn-dark { background: #0F172A; color: #fff; }
//         .btn-dark:hover { background: #1E293B; }
//         .btn-green { background: #15803D; color: #fff; }
//         .btn-green:hover { background: #166534; }
//         .btn-outline { background: #fff; color: #64748B; border: 1.5px solid #E2E8F0; }
//         .btn-outline:hover { background: #F8F9FC; }
//         .btn-red { background: #DC2626; color: #fff; }
//         .btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .btn-row { display: flex; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1.5px solid #F1F5F9; }
//         .toast { position: fixed; top: 24px; right: 24px; padding: 14px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 9999; animation: slideIn 0.3s ease; }
//         .toast-success { background: #F0FDF4; color: #15803D; border: 1.5px solid #BBF7D0; }
//         .toast-error { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; }
//         @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
//         .info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; padding: 8px 0; }
//         .info-row svg { color: #94A3B8; flex-shrink: 0; }
//         @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .profile-main { padding: 16px; } }
//       `}</style>

//       {/* Toast */}
//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//           {toast.msg}
//         </div>
//       )}

//       <div className="profile-page">
//         <RoleSidebar />

//         <div className="profile-main">
//           {loading ? (
//             <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 32, color: "#64748B" }}>
//               <Loader size={20} className="spin" /> Loading profile...
//             </div>
//           ) : (
//             <>
//               {/* ── PROFILE CARD ── */}
//               <div className="profile-card">
//                 <div className="profile-header-bg" />
//                 <div className="profile-content">
//                   {/* Avatar */}
//                   <div className="avatar-wrap">
//                     {photoUploading
//                       ? <div className="profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#E2E8F0" }}><Loader size={28} /></div>
//                       : <img src={avatarUrl} alt={profile?.fullName} className="profile-avatar" />
//                     }
//                     <button className="camera-btn" onClick={() => fileInputRef.current.click()} title="Change Photo">
//                       <Camera size={16} />
//                     </button>
//                     <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
//                   </div>

//                   {/* Name & Roles */}
//                   <div style={{ marginTop: 16 }}>
//                     <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0 }}>{profile?.fullName}</h1>
//                     <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 8px" }}>{profile?.schoolName}</p>
//                     <div>{profile?.roles?.map(r => <span key={r} className="badge">{r.replace("_", " ")}</span>)}</div>
//                   </div>

//                   {/* Quick info */}
//                   <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
//                     <div className="info-row"><Mail size={14} /> {profile?.email}</div>
//                     {profile?.phoneNumber && <div className="info-row"><Phone size={14} /> {profile?.phoneNumber}</div>}
//                     {profile?.city && <div className="info-row"><MapPin size={14} /> {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</div>}
//                   </div>

//                   {/* Last login */}
//                   {profile?.lastLogin && (
//                     <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12 }}>
//                       Last login: {new Date(profile.lastLogin).toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* ── EDIT PROFILE CARD ── */}
//               <div className="profile-card">
//                 <div style={{ padding: "24px 32px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//                     <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Personal Information</p>
//                     {!isEditing && (
//                       <button className="btn btn-dark" onClick={() => setIsEditing(true)}>
//                         <Edit2 size={14} /> Edit Profile
//                       </button>
//                     )}
//                   </div>

//                   <form onSubmit={handleSaveProfile}>
//                     <div className="form-grid">
//                       <div className="field-group">
//                         <label className="field-label">Full Name</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required />
//                           : <div className="field-value"><User size={14} />{profile?.fullName || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">Email Address</label>
//                         <div className="field-value"><Mail size={14} />{profile?.email}</div>
//                         {isEditing && <span style={{ fontSize: 11, color: "#94A3B8" }}>Email cannot be changed</span>}
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">Phone Number</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 XXXXX XXXXX" />
//                           : <div className="field-value"><Phone size={14} />{profile?.phoneNumber || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group">
//                         <label className="field-label">City</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} placeholder="Mumbai" />
//                           : <div className="field-value">{profile?.city || "—"}</div>
//                         }
//                       </div>

//                       <div className="field-group" style={{ gridColumn: "span 2" }}>
//                         <label className="field-label">Address Line 1</label>
//                         {isEditing
//                           ? <input className="field-input" value={editForm.addressLine1} onChange={e => setEditForm({ ...editForm, addressLine1: e.target.value })} placeholder="Street, Building No." />
//                           : <div className="field-value"><MapPin size={14} />{profile?.addressLine1 || "—"}</div>
//                         }
//                       </div>

//                       {isEditing && (
//                         <>
//                           <div className="field-group" style={{ gridColumn: "span 2" }}>
//                             <label className="field-label">Address Line 2</label>
//                             <input className="field-input" value={editForm.addressLine2} onChange={e => setEditForm({ ...editForm, addressLine2: e.target.value })} placeholder="Area, Landmark (optional)" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">State</label>
//                             <input className="field-input" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} placeholder="Maharashtra" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">Pincode</label>
//                             <input className="field-input" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} placeholder="400001" />
//                           </div>
//                           <div className="field-group">
//                             <label className="field-label">Country</label>
//                             <input className="field-input" value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} placeholder="India" />
//                           </div>
//                         </>
//                       )}
//                     </div>

//                     {isEditing && (
//                       <div className="btn-row">
//                         <button type="submit" className="btn btn-green" disabled={saving}>
//                           {saving ? <Loader size={14} /> : <Save size={14} />} Save Changes
//                         </button>
//                         <button type="button" className="btn btn-outline" onClick={cancelEdit}>
//                           <X size={14} /> Cancel
//                         </button>
//                       </div>
//                     )}
//                   </form>
//                 </div>
//               </div>

//               {/* ── CHANGE PASSWORD CARD ── */}
//               <div className="profile-card">
//                 <div style={{ padding: "24px 32px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <p className="section-title" style={{ margin: 0, borderBottom: "none" }}>Security</p>
//                     <button className="btn btn-outline" onClick={() => setShowPwSection(v => !v)}>
//                       <Lock size={14} /> {showPwSection ? "Cancel" : "Change Password"}
//                     </button>
//                   </div>

//                   {showPwSection && (
//                     <form onSubmit={handleChangePassword} style={{ marginTop: 20 }}>
//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
//                         {[
//                           { key: "currentPassword", label: "Current Password" },
//                           { key: "newPassword",     label: "New Password" },
//                           { key: "confirmPassword", label: "Confirm New Password" },
//                         ].map(({ key, label }) => (
//                           <div key={key} className="field-group">
//                             <label className="field-label">{label}</label>
//                             <input
//                               type="password"
//                               className="field-input"
//                               value={pwForm[key]}
//                               onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
//                               required
//                               minLength={key !== "currentPassword" ? 8 : undefined}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                       <div className="btn-row">
//                         <button type="submit" className="btn btn-red" disabled={saving}>
//                           {saving ? <Loader size={14} /> : <Lock size={14} />} Update Password
//                         </button>
//                       </div>
//                     </form>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProfilePage;
