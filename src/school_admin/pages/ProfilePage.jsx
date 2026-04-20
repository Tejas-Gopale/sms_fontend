import React, { useState } from 'react';
import SchoolAdminSidebar from "../components/SchoolAdminSidebar"; // Integrated with your sidebar
import { Camera, Mail, Briefcase, User, Save, X, Edit2 } from "lucide-react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Tejas Gopale",
    email: "tejas.gopale@schoolapp.com",
    role: "IT Executive / Full Stack Developer",
    bio: "Managing IT operations and developing core modules for the School Management SaaS.",
    avatar: "https://via.placeholder.com/150"
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Add your API call here: await API.put("/user/update-profile", profile);
    alert("Profile Updated Successfully! 🚀");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .profile-page {
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #F8F9FC;
          min-height: 100vh;
        }

        .profile-main {
          flex: 1;
          padding: 32px 28px;
        }

        .profile-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
          max-width: 900px;
          margin: 0 auto;
          overflow: hidden;
        }

        .profile-header-bg {
          height: 120px;
          background: linear-gradient(90deg, #4338CA 0%, #6366F1 100%);
        }

        .profile-content {
          padding: 0 32px 32px 32px;
          margin-top: -60px;
        }

        .avatar-container {
          position: relative;
          display: inline-block;
        }

        .profile-avatar {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-cover: cover;
          border: 5px solid #fff;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .upload-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: #0F172A;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .upload-btn:hover { transform: scale(1.1); }

        .profile-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .field-input {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          font-size: 14px;
          transition: all 0.2s;
          background: #F8F9FC;
        }

        .field-input:focus {
          border-color: #6366F1;
          background: #fff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .field-input:disabled {
          background: #F1F5F9;
          color: #64748B;
          cursor: not-allowed;
        }

        .btn-container {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          border-top: 1.5px solid #F1F5F9;
          padding-top: 24px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0F172A;
          color: white;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .btn-save { background: #15803D; }
        .btn-cancel { background: #fff; color: #64748B; border: 1.5px solid #E2E8F0; }

        @media (max-width: 768px) {
          .profile-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-page">
        <SchoolAdminSidebar />

        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-header-bg"></div>
            
            <div className="profile-content">
              <div className="avatar-container">
                <img src={profile.avatar} alt="User" className="profile-avatar" />
                <button className="upload-btn" title="Change Photo">
                  <Camera size={18} />
                </button>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A' }}>{profile.name}</h1>
                <p style={{ color: '#64748B', fontFamily: 'DM Mono', fontSize: '14px' }}>{profile.role}</p>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="profile-info-grid">
                  <div className="field-group">
                    <label className="field-label">Full Name</label>
                    <input 
                      className="field-input" 
                      value={profile.name} 
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Email Address (Primary)</label>
                    <input 
                      className="field-input" 
                      value={profile.email} 
                      disabled 
                    />
                  </div>

                  <div className="field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="field-label">Professional Bio</label>
                    <textarea 
                      className="field-input" 
                      rows="3"
                      value={profile.bio} 
                      disabled={!isEditing}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="btn-container">
                  {!isEditing ? (
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn-primary btn-save">
                        <Save size={16} /> Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="btn-primary btn-cancel" 
                        onClick={() => setIsEditing(false)}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;