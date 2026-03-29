import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Play, Loader2, Mail, Bot, CheckCircle } from 'lucide-react';
import '../index.css';

export default function AgentBox({ demoEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
        role: 'ai', 
        text: `Welcome to the Agent Orchestrator. 
Demo Email is set to: [${demoEmail}]

Select an autonomous workflow below to trigger the LLM to search the database and draft personalized outreach.`,
        isSystem: true
    }
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const runAgent = async (type) => {
    setIsDeploying(true);
    setMessages(prev => [...prev, 
        { role: 'user', text: `Triggering ${type === 'prospecting' ? 'Prospecting' : 'Deal Intelligence'} Agent...` },
        { role: 'ai', text: `Initializing ${type} pipeline... Agent is analyzing MongoDB aggregations and executing functions.`, isSystem: true }
    ]);

    try {
      const endpoint = type === 'prospecting' ? '/api/agents/run-prospecting' : '/api/agents/run-deal-intelligence';
      const res = await fetch(`http://localhost:3001${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demoEmail })
      });
      const data = await res.json();
      
      if (data.success) {
          if (data.result.length === 0) {
              setMessages(prev => [...prev, { role: 'ai', text: "Data analysis complete. No targets currently met the exact backend trigger conditions.", isSystem: true}]);
          } else {
              data.result.forEach(r => {
                  setMessages(prev => [...prev, { 
                      role: 'ai', 
                      text: `🎯 Target Identified: ${r.brand || r.client}\n\nThe LLM generated the following outreach payload using real database context:\n\n${r.finalResponse}`
                  }]);
              });
              setMessages(prev => [...prev, { role: 'ai', text: `Workflow complete. If the Resend API Key is active, the email was securely verified and delivered to ${demoEmail}.`, isSystem: true}]);
          }
      } else {
          setMessages(prev => [...prev, { role: 'ai', text: `[ERROR] Agent failed: ${data.error}`, isError: true }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: `[ERROR] Failed to connect to server: ${e.message}`, isError: true }]);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="glass-panel" 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, 
          borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', zIndex: 1000,
          boxShadow: '0 10px 25px rgba(236,72,153,0.3)',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
        }}
      >
        <Bot color="#fff" size={28} />
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{
      position: 'absolute', bottom: 30, right: 30, width: 400, height: 550, zIndex: 1000,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1rem', background: '-webkit-linear-gradient(135deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
             <Bot size={20} color="#ec4899"/> AI Sales Orchestrator
        </h3>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
      </div>
      
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'rgba(255,255,255,0.3)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? '#8b5cf6' : (msg.isError ? '#fef2f2' : 'rgba(255,255,255,0.95)'),
            color: msg.role === 'user' ? '#fff' : (msg.isError ? '#ef4444' : 'var(--text-main)'),
            border: msg.isSystem ? '1px dashed #cbd5e1' : (msg.isError ? '1px solid #f87171' : '1px solid var(--glass-border)'),
            padding: '12px 16px',
            borderRadius: '15px',
            borderBottomRightRadius: msg.role === 'user' ? 2 : 15,
            borderBottomLeftRadius: msg.role === 'ai' ? 2 : 15,
            maxWidth: '90%',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            {msg.text}
          </div>
        ))}
        {isDeploying && (
             <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 10, alignItems: 'center', padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                 <Loader2 size={16} className="animate-spin" />
                 Executing LLM Functions...
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'rgba(255,255,255,0.6)' }}>
        <button 
           onClick={() => runAgent('prospecting')}
           disabled={isDeploying}
           style={{ 
               padding: '12px', borderRadius: 10, border: 'none', 
               backgroundColor: isDeploying ? '#e2e8f0' : '#8b5cf6', color: isDeploying ? '#94a3b8' : '#fff', 
               cursor: isDeploying ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
           }}
        >
          <Sparkles size={16} /> Run Prospecting Agent
        </button>
        <button 
           onClick={() => runAgent('deal-intelligence')}
           disabled={isDeploying}
           style={{ 
               padding: '12px', borderRadius: 10, border: 'none', 
               backgroundColor: isDeploying ? '#e2e8f0' : '#ec4899', color: isDeploying ? '#94a3b8' : '#fff', 
               cursor: isDeploying ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
           }}
        >
          <Mail size={16} /> Run Deal Intel Agent
        </button>
      </div>
    </div>
  );
}
