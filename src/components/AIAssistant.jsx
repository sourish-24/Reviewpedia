import React, { useState } from 'react';
import { Send, Sparkles, MessageSquare, X } from 'lucide-react';
import '../index.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I can analyze local reviews for you. Ask me anything like "Are there any complaints about local iPhone sellers nearby?"' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');

    // Simulate AI retrieval based on mock location context
    setTimeout(() => {
      setMessages([...newMsgs, { 
        role: 'ai', 
        text: 'Based on 53 recent reviews in your area, battery life is not a major issue reported (only 2 complaints in the last month). Local sellers like Reliance Digital have high trust scores (89% average), making them a safe choice.' 
      }]);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button 
        className="glass-panel" 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, 
          borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', zIndex: 1000
        }}
      >
        <Sparkles color="var(--primary-color)" size={28} />
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{
      position: 'absolute', bottom: 30, right: 30, width: 350, height: 450, zIndex: 1000,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1rem' }}><Sparkles size={18} color="var(--primary-color)"/> Reviewpedia AI</h3>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
      </div>
      
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.9)',
            color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
            padding: '10px 15px',
            borderRadius: '15px',
            borderBottomRightRadius: msg.role === 'user' ? 2 : 15,
            borderBottomLeftRadius: msg.role === 'ai' ? 2 : 15,
            maxWidth: '85%',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10 }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: '10px 15px', borderRadius: 20, border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: 20, border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={18} style={{ transform: 'translateX(-1px)' }}/>
        </button>
      </div>
    </div>
  );
}
