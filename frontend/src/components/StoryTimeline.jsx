import React, { useState } from 'react';

// --- Authentic Vector Logos ---

export function AmazonLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 8, background: '#131921', color: '#ffffff', margin: '0 4px', verticalAlign: 'middle' }}>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Amazon</span>
    </span>
  );
}

export function FlipkartLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 8, background: '#2874F0', color: '#ffffff', margin: '0 4px', verticalAlign: 'middle' }}>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.01em', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Flipkart</span>
    </span>
  );
}

export function YouTubeLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', margin: '0 4px', verticalAlign: 'middle' }}>
      <svg width="24" height="17" viewBox="0 0 24 17" fill="none">
        <path d="M23.498 2.686A3.016 3.016 0 0 0 21.376.55C19.505.045 12 .045 12 .045S4.495.045 2.623.55A3.017 3.017 0 0 0 .502 2.686C0 4.57 0 8.5 0 8.5s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 12.43 24 8.5 24 8.5s0-3.93-.502-5.814z" fill="#FF0000"/>
        <path d="M9.545 12.068V4.932L15.818 8.5l-6.273 3.568z" fill="#FFFFFF"/>
      </svg>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>YouTube</span>
    </span>
  );
}

export function InstagramLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', margin: '0 4px', verticalAlign: 'middle' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-grad-story" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="25%" stopColor="#e6683c"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="75%" stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#ig-grad-story)"/>
        <rect x="5" y="5" width="14" height="14" rx="4" stroke="#ffffff" strokeWidth="1.8" fill="none"/>
        <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.8" fill="none"/>
        <circle cx="15.8" cy="8.2" r="1" fill="#ffffff"/>
      </svg>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Instagram</span>
    </span>
  );
}

export function RedditLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', margin: '0 4px', verticalAlign: 'middle' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#FF4500"/>
        <path d="M19.5 12c0-.79-.64-1.43-1.43-1.43-.39 0-.74.15-1 .41-1.28-.9-3.03-1.48-4.97-1.53l.85-3.99 2.76.59c.03.68.59 1.23 1.28 1.23.71 0 1.29-.58 1.29-1.29s-.58-1.29-1.29-1.29c-.52 0-.96.31-1.17.75l-3.08-.66a.35.35 0 0 0-.41.27l-.95 4.49c-1.98.04-3.76.62-5.06 1.54-.26-.27-.63-.43-1.04-.43-.79 0-1.43.64-1.43 1.43 0 .54.3.99.74 1.23-.03.21-.05.42-.05.64 0 2.87 3.01 5.2 6.72 5.2s6.72-2.33 6.72-5.2c0-.22-.02-.43-.05-.63.45-.24.76-.7.76-1.25zM8.5 13.5c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25zm6.98 2.88c-.8.8-2.07.86-3.48.86-1.41 0-2.69-.06-3.49-.86-.14-.14-.14-.36 0-.5.14-.14.36-.14.5 0 .61.61 1.7.67 2.99.67 1.29 0 2.37-.06 2.98-.67.14-.14.36-.14.5 0 .14.14.14.37 0 .5zm-.23-1.63c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25-1.25z" fill="#FFFFFF"/>
      </svg>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>reddit</span>
    </span>
  );
}

export function QuoraLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: '#B92B27', color: '#ffffff', margin: '0 4px', verticalAlign: 'middle' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12.9 16.8c-.8.3-1.6.4-2.5.4-3.5 0-5.8-2.6-5.8-6.4 0-3.8 2.4-6.4 6-6.4 3.6 0 5.9 2.6 5.9 6.4 0 1.6-.4 3-1.2 4.1l1.5 1.7c.3.3.1.8-.3.8h-1.6c-.3 0-.6-.1-.8-.4l-1.2-1.4v.8zm-.8-2c2.1 0 3.5-1.8 3.5-4.4 0-2.6-1.3-4.4-3.5-4.4-2.1 0-3.5 1.8-3.5 4.4 0 2.6 1.4 4.4 3.5 4.4z" fill="#FFFFFF"/>
      </svg>
      <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'Georgia, serif' }}>Quora</span>
    </span>
  );
}

export function TajMahalLogo() {
  return (
    <svg 
      width="24" 
      height="18" 
      viewBox="0 0 122.88 77.75" 
      fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: '-3px', margin: '0 4px', flexShrink: 0 }}
      aria-label="Taj Mahal icon"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M0,67.98h3.27l0.6-9.43H3.83c-0.19,0-0.36-0.09-0.48-0.22c-0.12-0.14-0.2-0.32-0.2-0.53 c0-0.21,0.08-0.4,0.2-0.53c0.04-0.05,0.09-0.09,0.14-0.12h-0.5c-0.2,0-0.38-0.09-0.51-0.23c-0.13-0.14-0.21-0.34-0.21-0.56 c0-0.22,0.08-0.42,0.21-0.56c0.13-0.14,0.31-0.23,0.51-0.23H3.6l0.7-12.03H4.2c-0.18,0-0.34-0.08-0.46-0.21 c-0.12-0.13-0.19-0.31-0.19-0.51s0.07-0.38,0.19-0.51c0.04-0.04,0.09-0.08,0.14-0.12H3.42c-0.18,0-0.34-0.08-0.46-0.21 c-0.12-0.13-0.19-0.31-0.19-0.51s0.07-0.38,0.19-0.51c0.12-0.13,0.28-0.21,0.46-0.21h1.04l0.53-14.19H4.93 c-0.17,0-0.32-0.07-0.43-0.19c-0.11-0.12-0.18-0.28-0.18-0.46c0-0.15,0.05-0.29,0.13-0.4l0.05-0.06H4.14 c-0.18,0-0.34-0.08-0.46-0.21c-0.12-0.13-0.19-0.3-0.19-0.49c0-0.19,0.07-0.37,0.19-0.49c0.12-0.13,0.28-0.21,0.46-0.21h1.11 l0.16-3.84H4.95c-0.32,0-0.57-0.26-0.57-0.57v0c0-0.31,0.26-0.57,0.57-0.57h0.63v-1.02c0-1.11,0.78-2.05,1.82-2.3V13.7 c0-0.25,0.21-0.46,0.46-0.46l0,0c0.25,0,0.46,0.21,0.46,0.46v1.98c1.11,0.19,1.97,1.16,1.97,2.33v1.02h0.63 c0.32,0,0.57,0.26,0.57,0.57v0c0,0.31-0.26,0.57-0.57,0.57h-0.47l0.16,3.84h1.11c0.18,0,0.34,0.08,0.46,0.21 c0.12,0.13,0.19,0.3,0.19,0.49c0,0.19-0.07,0.37-0.19,0.49c-0.12,0.13-0.28,0.21-0.46,0.21h-0.36l0.05,0.06 c0.08,0.11,0.13,0.25,0.13,0.4c0,0.18-0.07,0.34-0.18,0.46c-0.11,0.12-0.26,0.19-0.43,0.19h-0.16l0.63,14.19h1.04 c0.18,0,0.34,0.08,0.46,0.21c0.12,0.13,0.19,0.31,0.19,0.51c0,0.2-0.07,0.38-0.19,0.51c-0.12,0.13-0.28,0.21-0.46,0.21H12 c0.05,0.03,0.1,0.07,0.14,0.12c0.12,0.13,0.19,0.31,0.19,0.51c0,0.2-0.07,0.38-0.19,0.51c-0.09,0.1-0.2,0.17-0.32,0.2l0.46,12.05 h0.61c0.2,0,0.38,0.09,0.51,0.23c0.13,0.14,0.21,0.34,0.21,0.56c0,0.22-0.08,0.42-0.21,0.56c-0.13,0.14-0.31,0.23-0.51,0.23h-0.07 c0.05,0.03,0.1,0.07,0.14,0.12c0.12,0.14,0.2,0.32,0.2,0.53c0,0.21-0.08,0.4-0.2,0.53c-0.12,0.14-0.29,0.22-0.48,0.22h-0.06 l0.68,9.43h4.61l0.44-7h-0.03c-0.15,0-0.28-0.07-0.37-0.17c-0.1-0.11-0.16-0.25-0.16-0.42c0-0.16,0.06-0.31,0.16-0.42 c0.03-0.04,0.07-0.07,0.11-0.09h-0.39c-0.15,0-0.29-0.07-0.4-0.18c-0.1-0.11-0.16-0.27-0.16-0.44c0-0.17,0.06-0.32,0.16-0.44 c0.1-0.11,0.24-0.18,0.4-0.18h0.48l0.55-9.41h-0.08c-0.14,0-0.27-0.06-0.36-0.17c-0.09-0.1-0.15-0.24-0.15-0.4 c0-0.16,0.06-0.3,0.15-0.4l0.01-0.01c0.03-0.03,0.07-0.06,0.1-0.09H17.8c-0.14,0-0.27-0.06-0.36-0.17c-0.09-0.1-0.15-0.24-0.15-0.4 s0.06-0.3,0.15-0.4l0.01-0.01c0.09-0.1,0.22-0.16,0.35-0.16h0.81l0.42-11.09h-0.05c-0.13,0-0.25-0.06-0.34-0.15 c-0.09-0.09-0.14-0.22-0.14-0.36c0-0.12,0.04-0.23,0.1-0.32l0.04-0.05h-0.28c-0.14,0-0.27-0.06-0.36-0.16 c-0.09-0.1-0.15-0.24-0.15-0.39s0.06-0.29,0.15-0.39c0.09-0.1,0.22-0.16,0.36-0.16h0.87l0.13-3H19c-0.25,0-0.45-0.2-0.45-0.45l0,0 c0-0.25,0.2-0.45,0.45-0.45h0.49v-0.8c0-0.87,0.61-1.61,1.42-1.8v-1.57c0-0.2,0.16-0.36,0.36-0.36l0,0c0.2,0,0.36,0.16,0.36,0.36 v1.55c0.87,0.15,1.54,0.91,1.54,1.82v0.8h0.5c0.25,0,0.45,0.2,0.45,0.45l0,0c0,0.25-0.2,0.45-0.45,0.45h-0.37l0.13,3h0.87 c0.14,0,0.27,0.06,0.36,0.16c0.09,0.1,0.15,0.24,0.15,0.39s-0.06,0.29-0.15,0.39c-0.09,0.1-0.22,0.16-0.36,0.16h-0.28l0.04,0.05 c0.06,0.09,0.1,0.2,0.1,0.32c0,0.14-0.05,0.27-0.14,0.36c-0.09,0.09-0.21,0.15-0.34,0.15h-0.12l0.49,11.09h0.81 c0.14,0,0.27,0.06,0.36,0.17c0.09,0.1,0.15,0.24,0.15,0.4c0,0.16-0.06,0.3-0.15,0.4c-0.09,0.1-0.22,0.17-0.36,0.17h-0.36 c0.04,0.02,0.08,0.06,0.11,0.09c0.09,0.1,0.15,0.24,0.15,0.4c0,0.16-0.06,0.3-0.15,0.4c-0.07,0.08-0.15,0.13-0.25,0.15l0.36,9.42 h0.48c0.15,0,0.29,0.07,0.4,0.18c0.1,0.11,0.17,0.27,0.17,0.44c0,0.17-0.06,0.33-0.16,0.44c-0.1,0.11-0.24,0.18-0.4,0.18h-0.05 c0.04,0.03,0.08,0.06,0.11,0.09c0.09,0.11,0.16,0.25,0.16,0.42c0,0.16-0.06,0.31-0.16,0.42c-0.1,0.11-0.23,0.17-0.38,0.17h-0.04 l0.5,7h5.44V39.95c0-0.58,0.24-1.11,0.62-1.49c0.38-0.38,0.91-0.62,1.49-0.62h0.86v-4.87h0.36c-3.47-3.92,1.34-7.08,4.05-9.24 v-3.27c0-0.2,0.16-0.35,0.35-0.35c0.2,0,0.35,0.16,0.35,0.35v3.28c2.79,2.16,7.62,5.14,3.92,9.23h0.49v4.87h4.04v-5.15 c0-0.4,0.32-0.72,0.72-0.72h0.22c-1.22-1.25-1.84-3.06-1.97-5.08c-0.55-8.51,3.72-11.78,8.14-15.11h13.81 c4.46,3.49,8.87,7,8.32,15.32c-0.06,0.93-0.23,1.84-0.52,2.68c-0.2,0.58-0.45,1.14-0.77,1.65c-0.11,0.18-0.23,0.36-0.36,0.54h0.44 c0.4,0,0.72,0.32,0.72,0.72v5.15h2.58v-4.87h0.36c-3.47-3.92,1.34-7.08,4.05-9.24v-3.27c0-0.2,0.16-0.35,0.35-0.35 c0.2,0,0.35,0.16,0.35,0.35v3.28c2.79,2.16,7.62,5.14,3.92,9.23h0.49v4.87h1.68c0.58,0,1.11,0.24,1.49,0.62l0.05,0.05 c0.35,0.38,0.57,0.89,0.57,1.44v28.03h5.54l0.5-7h-0.04c-0.14,0-0.28-0.07-0.37-0.17c-0.1-0.11-0.16-0.25-0.16-0.42 c0-0.16,0.06-0.31,0.16-0.42c0.03-0.04,0.07-0.07,0.11-0.09h-0.05c-0.15,0-0.29-0.07-0.4-0.18c-0.1-0.11-0.16-0.27-0.16-0.44 c0-0.17,0.06-0.32,0.16-0.44c0.1-0.11,0.24-0.18,0.4-0.18h0.48l0.36-9.42c-0.1-0.02-0.18-0.08-0.25-0.15 c-0.09-0.1-0.15-0.24-0.15-0.4c0-0.16,0.06-0.3,0.15-0.4c0.03-0.04,0.07-0.07,0.11-0.09h-0.36c-0.14,0-0.27-0.06-0.36-0.17 c-0.09-0.1-0.15-0.24-0.15-0.4c0-0.16,0.06-0.3,0.15-0.4c0.09-0.1,0.22-0.17,0.36-0.17h0.81l0.49-11.09h-0.12 c-0.13,0-0.25-0.06-0.34-0.15c-0.09-0.09-0.14-0.22-0.14-0.36c0-0.12,0.04-0.23,0.1-0.32l0.04-0.05h-0.28 c-0.14,0-0.27-0.06-0.36-0.16c-0.09-0.1-0.15-0.24-0.15-0.39s0.06-0.29,0.15-0.39c0.09-0.1,0.22-0.16,0.36-0.16h0.87l0.13-3H99.2 c-0.25,0-0.45-0.2-0.45-0.45l0,0c0-0.25,0.2-0.45,0.45-0.45h0.5v-0.8c0-0.91,0.67-1.67,1.54-1.82v-1.55c0-0.2,0.16-0.36,0.36-0.36 l0,0c0.2,0,0.36,0.16,0.36,0.36v1.57c0.81,0.19,1.42,0.93,1.42,1.8v0.8h0.49c0.25,0,0.45,0.2,0.45,0.45l0,0 c0,0.25-0.2,0.45-0.45,0.45h-0.37l0.13,3h0.87c0.14,0,0.27,0.06,0.36,0.16c0.09,0.1,0.15,0.24,0.15,0.39s-0.06,0.29-0.15,0.39 c-0.09,0.1-0.22,0.16-0.36,0.16h-0.28l0.04,0.05c0.06,0.09,0.1,0.2,0.1,0.32c0,0.14-0.05,0.27-0.14,0.36 c-0.09,0.09-0.21,0.15-0.34,0.15h-0.05l0.42,11.09h0.81c0.14,0,0.26,0.06,0.35,0.16l0.01,0.01c0.09,0.1,0.15,0.24,0.15,0.4 s-0.06,0.3-0.15,0.4c-0.09,0.1-0.22,0.17-0.36,0.17h-0.36c0.04,0.02,0.07,0.05,0.1,0.09l0.01,0.01c0.09,0.1,0.15,0.24,0.15,0.4 c0,0.16-0.06,0.3-0.15,0.4c-0.09,0.1-0.22,0.17-0.36,0.17h-0.08l0.55,9.41h0.48c0.15,0,0.29,0.07,0.4,0.18 c0.1,0.11,0.16,0.27,0.16,0.44c0,0.17-0.06,0.33-0.16,0.44c-0.1,0.11-0.24,0.18-0.4,0.18h-0.39c0.04,0.03,0.08,0.06,0.11,0.09 c0.1,0.11,0.16,0.25,0.16,0.42c0,0.16-0.06,0.31-0.16,0.42c-0.09,0.11-0.23,0.17-0.37,0.17h-0.03l0.44,7h4.61l0.68-9.43h-0.06 c-0.19,0-0.36-0.09-0.48-0.22c-0.12-0.14-0.2-0.32-0.2-0.53c0-0.21,0.08-0.4,0.2-0.53c0.04-0.05,0.09-0.09,0.14-0.12h-0.07 c-0.2,0-0.38-0.09-0.51-0.23c-0.13-0.14-0.21-0.34-0.21-0.56c0-0.22,0.08-0.42,0.21-0.56c0.13-0.14,0.31-0.23,0.51-0.23h0.61 l0.46-12.05c-0.12-0.03-0.23-0.1-0.32-0.2c-0.12-0.13-0.19-0.31-0.19-0.51c0-0.2,0.07-0.38,0.19-0.51 c0.04-0.04,0.09-0.08,0.14-0.12h-0.46c-0.18,0-0.34-0.08-0.46-0.21c-0.12-0.13-0.19-0.31-0.19-0.51c0-0.2,0.07-0.38,0.19-0.51 c0.12-0.13,0.28-0.21,0.46-0.21h1.04l0.63-14.19h-0.16c-0.17,0-0.32-0.07-0.43-0.19c-0.11-0.12-0.18-0.28-0.18-0.46 c0-0.15,0.05-0.29,0.13-0.4l0.05-0.06h-0.36c-0.18,0-0.34-0.08-0.46-0.21c-0.12-0.13-0.19-0.3-0.19-0.49 c0-0.19,0.07-0.37,0.19-0.49c0.12-0.13,0.28-0.21,0.46-0.21h1.11l0.16-3.84h-0.47c-0.32,0-0.57-0.26-0.57-0.57v0 c0-0.31,0.26-0.57,0.57-0.57h0.63v-1.02c0-1.17,0.86-2.14,1.97-2.33V13.7c0-0.25,0.21-0.46,0.46-0.46l0,0 c0.25,0,0.46,0.21,0.46,0.46v2.01c1.04,0.24,1.82,1.18,1.82,2.3v1.02h0.63c0.32,0,0.57,0.26,0.57,0.57v0 c0,0.31-0.26,0.57-0.57,0.57h-0.47l0.16,3.84h1.11c0.18,0,0.34,0.08,0.46,0.21c0.12,0.13,0.19,0.3,0.19,0.49 c0,0.19-0.07,0.37-0.19,0.49c-0.12,0.13-0.28,0.21-0.46,0.21h-0.36l0.05,0.06c0.08,0.11,0.13,0.25,0.13,0.4 c0,0.18-0.07,0.34-0.18,0.46c-0.11,0.12-0.26,0.19-0.43,0.19h-0.06l0.53,14.19h1.04c0.18,0,0.34,0.08,0.46,0.21 c0.12,0.13,0.19,0.31,0.19,0.51s-0.07,0.38-0.19,0.51c-0.12,0.13-0.28,0.21-0.46,0.21h-0.46c0.05,0.03,0.1,0.07,0.14,0.12 c0.12,0.13,0.19,0.31,0.19,0.51s-0.07,0.38-0.19,0.51c-0.12,0.13-0.28,0.21-0.46,0.21h-0.1l0.7,12.03h0.62 c0.2,0,0.38,0.09,0.51,0.23c0.13,0.14,0.21,0.34,0.21,0.56c0,0.22-0.08,0.42-0.21,0.56c-0.13,0.14-0.31,0.23-0.51,0.23h-0.5 c0.05,0.03,0.1,0.07,0.14,0.12c0.12,0.14,0.2,0.32,0.2,0.53c0,0.21-0.08,0.4-0.2,0.53c-0.12,0.14-0.29,0.22-0.48,0.22h-0.05 l0.6,9.43h3.27v9.77H0V67.98L0,67.98z M83.78,44.09c2.25,1.06,2.98,1.8,2.98,4.12v4.08H80.9v-4.08C80.9,46,81.64,45.02,83.78,44.09 L83.78,44.09z M83.78,57.94c2.25,1.06,2.98,1.8,2.98,4.12v4.08H80.9v-4.08C80.9,59.84,81.64,58.86,83.78,57.94L83.78,57.94z M39.44,57.94c2.25,1.06,2.98,1.8,2.98,4.12v4.08h-5.86v-4.08C36.56,59.84,37.3,58.86,39.44,57.94L39.44,57.94z M39.44,44.09 c2.25,1.06,2.98,1.8,2.98,4.12v4.08h-5.86v-4.08C36.56,46,37.3,45.02,39.44,44.09L39.44,44.09z M53.32,71.46V54.18 c0.58-3.9,3.26-6.57,8.33-7.86c4.53,1.48,7.85,3.76,8.45,7.86v17.28H53.32L53.32,71.46z M61.15,5.28v-5c0-0.16,0.13-0.29,0.29-0.29 c0.16,0,0.29,0.13,0.29,0.29v5.07c1.27,2.01,2.98,3.58,4.79,5.05H56.25C58.09,8.97,59.83,7.39,61.15,5.28L61.15,5.28z M100.42,31.16L100.42,31.16c-0.14,0-0.26,0.11-0.26,0.25v2.06c0,0.13,0.12,0.25,0.26,0.25l0,0c0.14,0,0.26-0.11,0.26-0.25v-2.06 C100.68,31.27,100.57,31.16,100.42,31.16L100.42,31.16z M102.66,31.16L102.66,31.16c-0.14,0-0.26,0.11-0.26,0.25v2.06 c0,0.13,0.12,0.25,0.26,0.25l0,0c0.14,0,0.26-0.11,0.26-0.25v-2.06C102.92,31.27,102.81,31.16,102.66,31.16L102.66,31.16z M101.54,31.16L101.54,31.16c-0.2,0-0.36,0.16-0.36,0.35v1.95c0,0.19,0.16,0.34,0.36,0.34l0,0c0.2,0,0.36-0.16,0.36-0.34v-1.95 C101.91,31.32,101.74,31.16,101.54,31.16L101.54,31.16z M113.51,20.41L113.51,20.41c-0.18,0-0.33,0.14-0.33,0.31v2.63 c0,0.17,0.15,0.31,0.33,0.31l0,0c0.18,0,0.33-0.14,0.33-0.31v-2.63C113.84,20.55,113.69,20.41,113.51,20.41L113.51,20.41z M116.37,20.41L116.37,20.41c-0.18,0-0.33,0.14-0.33,0.31v2.63c0,0.17,0.15,0.31,0.33,0.31l0,0c0.18,0,0.33-0.14,0.33-0.31v-2.63 C116.71,20.55,116.56,20.41,116.37,20.41L116.37,20.41z M114.94,20.41L114.94,20.41c-0.26,0-0.47,0.2-0.47,0.44v2.5 c0,0.24,0.21,0.44,0.47,0.44l0,0c0.26,0,0.47-0.2,0.47-0.44v-2.5C115.41,20.6,115.2,20.41,114.94,20.41L114.94,20.41z M22.46,31.16 L22.46,31.16c0.14,0,0.26,0.11,0.26,0.25v2.06c0,0.13,0.12,0.25,0.26,0.25l0,0c-0.14,0-0.26-0.11-0.26-0.25v-2.06 C22.2,31.27,22.31,31.16,22.46,31.16L22.46,31.16z M20.22,31.16L20.22,31.16c0.14,0,0.26,0.11,0.26,0.25v2.06 c0,0.13,0.12,0.25,0.26,0.25l0,0c-0.14,0-0.26-0.11-0.26-0.25v-2.06C19.96,31.27,20.07,31.16,20.22,31.16L20.22,31.16z M21.34,31.16L21.34,31.16c0.2,0,0.36,0.16,0.36,0.35v1.95c0,0.19,0.16,0.34,0.36,0.34l0,0c-0.2,0-0.36-0.16-0.36-0.34v-1.95 C20.97,31.32,21.14,31.16,21.34,31.16L21.34,31.16z M9.37,20.41L9.37,20.41c0.18,0,0.33,0.14,0.33,0.31v2.63 c0,0.17,0.15,0.31,0.33,0.31l0,0c-0.18,0-0.33-0.14-0.33-0.31v-2.63C9.04,20.55,9.19,20.41,9.37,20.41L9.37,20.41z M6.51,20.41 L6.51,20.41c0.18,0,0.33,0.14,0.33,0.31v2.63c0,0.17,0.15,0.31,0.33,0.31l0,0c-0.18,0-0.33-0.14-0.33-0.31v-2.63 C6.17,20.55,6.32,20.41,6.51,20.41L6.51,20.41z M7.94,20.41L7.94,20.41c0.26,0,0.47,0.2,0.47,0.44v2.5c0,0.24,0.21,0.44,0.47,0.44 l0,0c-0.26,0-0.47-0.2-0.47-0.44v-2.5C7.47,20.6,7.68,20.41,7.94,20.41L7.94,20.41z"/>
    </svg>
  );
}

export function CharminarLogo() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 48 48" 
      fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: '-3px', margin: '0 4px', flexShrink: 0 }}
      aria-label="Charminar icon"
    >
      <rect x="3" y="44" width="42" height="3" rx="0.5"/>
      <path d="M5 44 h8 V10 C13 7 11.5 5 9 5 C6.5 5 5 7 5 10 Z"/>
      <line x1="9" y1="5" x2="9" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="4" y="32" width="10" height="2" rx="0.5"/>
      <rect x="4" y="21" width="10" height="2" rx="0.5"/>
      <rect x="4" y="10" width="10" height="2" rx="0.5"/>
      <path d="M35 44 h8 V10 C43 7 41.5 5 39 5 C36.5 5 35 7 35 10 Z"/>
      <line x1="39" y1="5" x2="39" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="34" y="32" width="10" height="2" rx="0.5"/>
      <rect x="34" y="21" width="10" height="2" rx="0.5"/>
      <rect x="34" y="10" width="10" height="2" rx="0.5"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13 16 H35 V44 H13 Z M18 44 V33 C18 26 24 24 24 24 C24 24 30 26 30 33 V44 Z M16 21 V18 C16 16.5 17.5 16.5 17.5 16.5 C17.5 16.5 19 16.5 19 18 V21 Z M21 21 V18 C21 16.5 22.5 16.5 22.5 16.5 C22.5 16.5 24 16.5 24 18 V21 Z M25 21 V18 C25 16.5 26.5 16.5 26.5 16.5 C26.5 16.5 28 16.5 28 18 V21 Z M30 21 V18 C30 16.5 31.5 16.5 31.5 16.5 C31.5 16.5 33 16.5 33 18 V21 Z M14 24 H34 V25 H14 Z"/>
      <path d="M14 16 L14 13 Q24 10 34 13 L34 16 Z"/>
      <line x1="24" y1="11" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function StoryStepImage({ stepNumber }) {
  const [hasError, setHasError] = useState(false);
  const [attemptIndex, setAttemptIndex] = useState(0);

  const fallbackSources = [
    `/story/step-${stepNumber}.png`,
    `/story/step${stepNumber}.png`,
    `/story/step-${stepNumber}.jpg`,
    `/story/step${stepNumber}.jpg`,
    `/story/step-${stepNumber}.jpeg`,
    `/story/step${stepNumber}.jpeg`,
    `/story/step-${stepNumber}.webp`,
    `/story/step${stepNumber}.webp`
  ];

  if (hasError) return null;

  return (
    <div style={{ width: '100%', marginTop: 18, overflow: 'hidden', borderRadius: 12 }}>
      <img
        src={fallbackSources[attemptIndex]}
        alt=""
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: 280,
          objectFit: 'contain',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          display: 'block',
          backgroundColor: '#ffffff'
        }}
        onError={() => {
          if (attemptIndex + 1 < fallbackSources.length) {
            setAttemptIndex(attemptIndex + 1);
          } else {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}

export default function StoryTimeline({ onGetStarted }) {
  return (
    <section 
      id="problem" 
      style={{ 
        position: 'relative', 
        zIndex: 2, 
        padding: '240px 2rem', 
        maxWidth: 1320, 
        margin: '0 auto'
      }}
    >
      {/* Narrative Section Header */}
      <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 60px auto' }}>
        <h2 style={{ 
          fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', 
          fontWeight: 800, 
          letterSpacing: '-0.04em', 
          color: '#161E2E', 
          lineHeight: 1.25, 
          margin: 0, 
          fontFamily: 'var(--font-display)' 
        }}>
          You want to buy something online and want to check genuine reviews.
        </h2>
      </div>

      {/* 4 Standalone Cards Grid */}
      <div className="story-cards-grid">
        {/* Card 1: Amazon & Flipkart */}
        <div className="story-card">
          <div className="story-card-header">
            <span>You visit</span>
            <AmazonLogo />
            <span>or</span>
            <FlipkartLogo />
            <span>to look for reviews</span>
          </div>
          <p className="story-card-body">
            ...but the review section is rigged. Sellers buy their own products through shadow accounts, ship empty boxes to dummy addresses, and give themselves glowing 5-star ratings to trick search algorithms.
          </p>
          <StoryStepImage stepNumber={1} />
        </div>

        {/* Card 2: YouTube & Instagram */}
        <div className="story-card">
          <div className="story-card-header">
            <span>You message influencers on</span>
            <YouTubeLogo />
            <span>and</span>
            <InstagramLogo />
          </div>
          <p className="story-card-body">
            ...but creators get paid heavy sponsorships and free PR packages to praise products. When you DM them or leave comments asking specific, critical pre-purchase questions, they rarely reply.
          </p>
          <StoryStepImage stepNumber={2} />
        </div>

        {/* Card 3: Reddit & Quora */}
        <div className="story-card">
          <div className="story-card-header">
            <span>You visit</span>
            <RedditLogo />
            <span>or</span>
            <QuoraLogo />
            <span>to find opinions</span>
          </div>
          <p className="story-card-body">
            ...but anyone can post without ever purchasing the product. Disgruntled competitors, anonymous trolls, and armchair experts post harsh or exaggerated feedback pretending to be real buyers—with zero purchase verification or location checks.
          </p>
          <StoryStepImage stepNumber={3} />
        </div>

        {/* Card 4: Delhi vs Hyderabad */}
        <div className="story-card">
          <div className="story-card-header">
            <span>You buy something in</span>
            <TajMahalLogo />
            <span>Delhi after seeing a good review from</span>
            <CharminarLogo />
            <span>Hyderabad</span>
          </div>
          <p className="story-card-body">
            ...but the item you receive is defective or poor quality. Why? The review was from a buyer in <strong>Hyderabad</strong>, who received their unit from a completely different regional manufacturer and seller. Quality varies across cities, making generic national ratings deceptive.
          </p>
          <StoryStepImage stepNumber={4} />
        </div>
      </div>
    </section>
  );
}
