import React, { useState } from 'react';
import { Camera, ArrowLeft, Mail, User as UserIcon, Save, AlertCircle, CheckCircle, Edit2, X } from 'lucide-react';

export default function MyProfilePage({ user, onBack, onUserUpdate }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleFileChange = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'PUT',
          body: formData,
          credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        onUserUpdate(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setProfilePicFile(null);
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setProfilePicFile(null);
    setPreviewUrl(user?.profilePic || '');
    setMessage({ type: '', text: '' });
  };

  const isFormChanged = username !== user?.username || email !== user?.email || profilePicFile !== null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
      backgroundColor: '#030303', zIndex: 9999, display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-body)', color: '#ffffff', overflowY: 'auto', overflowX: 'hidden'
    }}>
      {/* Glow Effect */}
      <div className="landing-dark-glow-bg"></div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: 'var(--surface-lowest)', position: 'relative', zIndex: 2 }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: '2rem', position: 'relative' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, textAlign: 'center', color: '#ffffff' }}>Account Settings</h1>
                  {!isEditing && (
                      <button 
                          onClick={() => setIsEditing(true)} 
                          style={{ position: 'absolute', right: 0, background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--on-surface-variant)'}
                          title="Edit Profile"
                      >
                          <Edit2 size={20} />
                      </button>
                  )}
              </div>
              
              {/* Profile Photo */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                  <label style={{ position: 'relative', cursor: isEditing ? 'pointer' : 'default' }} className="profile-photo-container">
                      {previewUrl ? (
                          <img src={previewUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 20px rgba(81, 56, 214, 0.4)' }} />
                      ) : (
                          <div style={{ 
                              width: '100px', height: '100px', borderRadius: '50%', 
                              backgroundColor: 'var(--primary)', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 'bold', fontSize: '3rem', fontFamily: 'var(--font-display)',
                              boxShadow: '0 4px 20px rgba(81, 56, 214, 0.4)'
                          }}>
                              {username ? username.charAt(0).toUpperCase() : '?'}
                          </div>
                      )}
                      {isEditing && (
                          <>
                              <div style={{
                                  position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px',
                                  backgroundColor: 'var(--surface-high)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '2px solid var(--surface-lowest)', color: '#ffffff'
                              }}>
                                  <Camera size={16} />
                              </div>
                              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </>
                      )}
                  </label>
                  {isEditing && <p style={{ marginTop: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Click to change photo</p>}
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a1a1aa', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: isEditing ? 'rgba(255, 255, 255, 0.05)' : 'transparent', border: isEditing ? '1px solid var(--outline-variant)' : '1px solid transparent', borderRadius: '8px', padding: '0 12px', transition: 'all 0.2s' }}>
                          <UserIcon size={18} color="var(--on-surface-variant)" />
                          <input 
                              type="text" 
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              readOnly={!isEditing}
                              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#ffffff', outline: 'none', fontSize: '1rem' }}
                          />
                      </div>
                  </div>

                  <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a1a1aa', fontSize: '0.85rem', fontWeight: 500 }}>Email Address</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: isEditing ? 'rgba(255, 255, 255, 0.05)' : 'transparent', border: isEditing ? '1px solid var(--outline-variant)' : '1px solid transparent', borderRadius: '8px', padding: '0 12px', transition: 'all 0.2s' }}>
                          <Mail size={18} color="var(--on-surface-variant)" />
                          <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              readOnly={!isEditing}
                              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#ffffff', outline: 'none', fontSize: '1rem' }}
                          />
                      </div>
                  </div>

                  {message.text && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', borderRadius: '8px', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: message.type === 'error' ? '#ef4444' : '#22c55e', fontSize: '0.9rem' }}>
                          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                          {message.text}
                      </div>
                  )}

                  {isEditing && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button 
                              onClick={handleCancel}
                              disabled={saving}
                              className="landing-btn-outline"
                              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSave}
                              disabled={saving || (!username || !email) || !isFormChanged}
                              className="landing-btn-primary"
                              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '12px', opacity: (saving || (!username || !email) || !isFormChanged) ? 0.5 : 1 }}
                          >
                              {saving ? 'Saving...' : <><Save size={18} /> Save</>}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
