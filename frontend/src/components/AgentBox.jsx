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
          position: 'absolute', top: 30, right: 30, height: 48, padding: '0 20px', 
          borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', border: '1px solid var(--outline-variant)', zIndex: 1000,
          whiteSpace: 'nowrap', color: 'var(--on-surface)'
        }}
      >
        <Bot size={20} color="var(--on-surface)" />
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>Open Agent Window</span>
      </button>
    );
  }

  // Active Chat Window anchored to Bottom Left
  return (
    <div className="glass-panel" style={{
      position: 'absolute', top: 30, right: 30, width: 400, height: 550, zIndex: 1000,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 40px 60px rgba(0, 0, 0, 0.25)',
      border: '1px solid var(--outline-variant)'
    }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-lowest)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1rem', color: 'var(--on-surface)' }}>
             <Bot size={20} color="var(--primary)"/> AI Sales Orchestrator
        </h3>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} color="var(--on-surface-variant)" /></button>
      </div>
      
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--surface-highest)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? 'var(--primary)' : (msg.isSystem ? 'var(--surface-lowest)' : 'var(--surface-lowest)'),
            color: msg.role === 'user' ? 'var(--on-primary)' : 'var(--on-surface)',
            border: msg.isSystem ? 'none' : 'none',
            padding: '12px 16px',
            borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '0 12px 12px 12px',
            maxWidth: '90%',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-body)',
            boxShadow: msg.role === 'user' ? 'none' : '0 4px 10px rgba(0,0,0,0.02)'
          }}>
            {msg.text}
          </div>
        ))}
        {isDeploying && (
             <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 10, alignItems: 'center', padding: '10px', fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)' }}>
                 <Loader2 size={16} className="animate-spin" />
                 Executing LLM Functions...
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'var(--surface-lowest)' }}>
        <button 
           onClick={() => runAgent('prospecting')}
           disabled={isDeploying}
           className="btn-primary"
           style={{ 
               padding: '12px', opacity: isDeploying ? 0.5 : 1, borderRadius: '9999px',
               display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
           }}
        >
          <Sparkles size={16} /> Run Prospecting Agent
        </button>
        <button 
           onClick={() => runAgent('deal-intelligence')}
           disabled={isDeploying}
           className="btn-primary"
           style={{ 
               padding: '12px', opacity: isDeploying ? 0.5 : 1, borderRadius: '9999px',
               background: isDeploying ? 'var(--surface-high)' : 'var(--on-surface)', color: isDeploying ? 'var(--on-surface-variant)' : 'var(--surface-lowest)',
               display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
           }}
        >
          <Mail size={16} /> Run Deal Intel Agent
        </button>
      </div>
    </div>
  );
}
