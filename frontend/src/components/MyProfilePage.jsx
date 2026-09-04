import React, { useState, useEffect } from 'react';
import { Camera, ArrowLeft, Mail, User as UserIcon, Save, AlertCircle, CheckCircle, Edit2, X, Users, UserX, Crop } from 'lucide-react';
import AvatarCropModal from './AvatarCropModal';

export default function MyProfilePage({ user, onBack, onUserUpdate, onDeleteAccount }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || '');
  const [pendingCropFile, setPendingCropFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'https://reviewpedia.onrender.com';

  const handleDeleteAccountConfirm = async () => {
    if (confirmEmailInput.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      setDeleteError('Email address does not match.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmEmailInput.trim() }),
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setShowDeleteModal(false);
        if (onDeleteAccount) onDeleteAccount();
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) {
      setPendingCropFile(file);
      setShowCropModal(true);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedFile) => {
    setProfilePicFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setShowCropModal(false);
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
        setPendingCropFile(null);
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
    setPendingCropFile(null);
    setShowCropModal(false);
    setPreviewUrl(user?.profilePic || '');
    setMessage({ type: '', text: '' });
  };

  const isFormChanged = username !== user?.username || email !== user?.email || profilePicFile !== null;

  return (
    <div 
      className="landing-dark"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#F8F4F0',
        zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-body)', color: '#0f172a', overflowY: 'auto', padding: '24px', boxSizing: 'border-box'
      }}
      onMouseMove={(e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY}px`);
      }}
    >
      <div className="landing-grid-bg" />
      <div className="landing-grid-glow" />

      {/* Top Floating Notification */}
      {message.text && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 24px', borderRadius: '9999px',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(14, 165, 233, 0.95)',
          backdropFilter: 'blur(12px)', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top Header Row with Friends (left), Blocked (middle), and Edit Profile (right) */}
      {!isEditing && (
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                    onClick={() => alert("Friends list opening soon!")} 
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, height: '40px', padding: '0 20px',
                      borderRadius: '9999px', background: '#28303E', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.color = '#ffffff'; }}
                >
                    <Users size={16} /> Friends
                </button>
                <button 
                    onClick={() => alert("Blocked list opening soon!")} 
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, height: '40px', padding: '0 20px',
                      borderRadius: '9999px', background: '#28303E', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.color = '#ffffff'; }}
                >
                    <UserX size={16} /> Blocked
                </button>
            </div>
            <button 
                onClick={() => setIsEditing(true)} 
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, height: '40px', padding: '0 20px',
                  borderRadius: '9999px', background: '#0ea5e9', border: 'none', color: '#ffffff',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
            >
                <Edit2 size={16} /> Edit Profile
            </button>
        </div>
      )}

      {/* Main Glass Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '520px', padding: '36px 36px 20px 36px',
        background: '#161E2E', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0, textAlign: 'center', color: '#ffffff', fontWeight: 600, letterSpacing: '-0.03em' }}>
            Account Settings
          </h1>
          
          {/* Profile Photo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ position: 'relative', cursor: isEditing ? 'pointer' : 'default', display: 'inline-block' }}>
                  {previewUrl ? (
                      <img src={previewUrl} alt="Profile" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid #0ea5e9', boxSizing: 'border-box', boxShadow: 'none' }} />
                  ) : (
                      <div style={{ 
                          width: '110px', height: '110px', borderRadius: '50%', 
                          backgroundColor: '#0ea5e9', color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '600', fontSize: '3rem', fontFamily: 'var(--font-display)',
                          border: '3px solid #0ea5e9', boxSizing: 'border-box',
                          boxShadow: 'none'
                      }}>
                          {username ? username.charAt(0).toUpperCase() : '?'}
                      </div>
                  )}
                  {isEditing && (
                      <>
                          <div style={{
                              position: 'absolute', bottom: 0, right: 0, width: '36px', height: '36px',
                              backgroundColor: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '3px solid #161E2E', color: '#ffffff', cursor: 'pointer'
                          }}>
                              <Camera size={18} />
                          </div>
                          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      </>
                  )}
              </label>
              {isEditing && <p style={{ marginTop: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>Click photo to change avatar</p>}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <div style={{ 
                      display: 'flex', alignItems: 'center', 
                      background: isEditing ? '#28303E' : 'transparent', 
                      border: isEditing ? '1px solid #0ea5e9' : '1px solid transparent', 
                      borderRadius: isEditing ? '9999px' : '0', 
                      padding: isEditing ? '0 18px' : '0', 
                      transition: 'all 0.2s' 
                  }}>
                      <UserIcon size={18} color={isEditing ? "#0ea5e9" : "#94a3b8"} />
                      <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          readOnly={!isEditing}
                          style={{ flex: 1, background: 'transparent', border: 'none', padding: isEditing ? '12px 14px' : '8px 10px', color: '#ffffff', outline: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}
                      />
                  </div>
              </div>

              <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                  <div style={{ 
                      display: 'flex', alignItems: 'center', 
                      background: isEditing ? '#28303E' : 'transparent', 
                      border: isEditing ? '1px solid #0ea5e9' : '1px solid transparent', 
                      borderRadius: isEditing ? '9999px' : '0', 
                      padding: isEditing ? '0 18px' : '0', 
                      transition: 'all 0.2s' 
                  }}>
                      <Mail size={18} color={isEditing ? "#0ea5e9" : "#94a3b8"} />
                      <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          readOnly={!isEditing}
                          style={{ flex: 1, background: 'transparent', border: 'none', padding: isEditing ? '12px 14px' : '8px 10px', color: '#ffffff', outline: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}
                      />
                  </div>
              </div>

              {isEditing && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                      <button 
                          onClick={handleCancel}
                          disabled={saving}
                          style={{
                            flex: 1, height: '42px', borderRadius: '9999px', background: 'none',
                            border: 'none', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'color 0.2s'
                          }}
                          onMouseOver={(e) => { if(!saving) e.currentTarget.style.color = '#0ea5e9'; }}
                          onMouseOut={(e) => { if(!saving) e.currentTarget.style.color = '#ffffff'; }}
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSave}
                          disabled={saving || (!username || !email) || !isFormChanged}
                          style={{
                            flex: 1, height: '42px', borderRadius: '9999px', background: '#0ea5e9',
                            border: 'none', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600,
                            cursor: (saving || (!username || !email) || !isFormChanged) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            opacity: (saving || (!username || !email) || !isFormChanged) ? 0.5 : 1,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => { if(!saving && username && email && isFormChanged) e.currentTarget.style.backgroundColor = '#0284c7'; }}
                          onMouseOut={(e) => { if(!saving && username && email && isFormChanged) e.currentTarget.style.backgroundColor = '#0ea5e9'; }}
                      >
                          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                      </button>
                  </div>
              )}

              {/* Danger Zone: Delete Account Option */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'center' }}>
                  <button
                      type="button"
                      onClick={() => { setShowDeleteModal(true); setConfirmEmailInput(''); setDeleteError(''); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                      <UserX size={16} /> Delete Account
                  </button>
              </div>
          </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%', maxWidth: '440px', background: '#161E2E',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
            padding: '28px', color: '#ffffff', display: 'flex', flexDirection: 'column',
            gap: '16px', boxSizing: 'border-box'
          }}>
            {/* Badge Icon & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserX size={22} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-display)' }}>Delete Account</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              To confirm deletion of your account and all associated reviews, please re-type your email address below:
            </p>

            {/* Input field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input 
                type="email"
                placeholder="Re-type your email address"
                value={confirmEmailInput}
                onChange={(e) => { setConfirmEmailInput(e.target.value); setDeleteError(''); }}
                style={{
                  width: '100%', padding: '12px 16px', background: '#1f293d',
                  border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px',
                  color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
              />
              {deleteError && (
                <p style={{ margin: 0, color: '#ef4444', fontSize: '0.8rem', fontWeight: 500 }}>{deleteError}</p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setConfirmEmailInput(''); setDeleteError(''); }}
                disabled={deleting}
                style={{
                  flex: 1, height: '42px', borderRadius: '9999px', background: '#161E2E',
                  border: 'none', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => { if (!deleting) e.currentTarget.style.color = '#0ea5e9'; }}
                onMouseOut={(e) => { if (!deleting) e.currentTarget.style.color = '#ffffff'; }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                disabled={deleting || confirmEmailInput.trim().toLowerCase() !== user?.email?.toLowerCase()}
                style={{
                  flex: 1, height: '42px', borderRadius: '9999px', background: '#ef4444',
                  border: 'none', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600,
                  cursor: (deleting || confirmEmailInput.trim().toLowerCase() !== user?.email?.toLowerCase()) ? 'not-allowed' : 'pointer',
                  opacity: (deleting || confirmEmailInput.trim().toLowerCase() !== user?.email?.toLowerCase()) ? 0.4 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!deleting && confirmEmailInput.trim().toLowerCase() === user?.email?.toLowerCase()) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseOut={(e) => {
                  if (!deleting && confirmEmailInput.trim().toLowerCase() === user?.email?.toLowerCase()) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Crop & Position Modal */}
      {showCropModal && pendingCropFile && (
        <AvatarCropModal
          imageFile={pendingCropFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setPendingCropFile(null);
          }}
        />
      )}
    </div>
  );
}
