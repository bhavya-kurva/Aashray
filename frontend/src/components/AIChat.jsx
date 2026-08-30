import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Sparkles, Phone, ShieldAlert, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIChat = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am Aashray AI, your 24/7 Emergency Response Assistant. How can I assist you during this disaster situation?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: 'Find Nearby Shelters', type: 'shelter' },
        { label: 'Emergency Helplines', type: 'helpline' },
        { label: 'Flood Safety Guide', type: 'flood_guide' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI response logic with emergency knowledge base
    setTimeout(() => {
      let aiResponseText = '';
      let actions = null;
      const lower = query.toLowerCase();

      if (lower.includes('shelter') || lower.includes('safe place') || lower.includes('refuge')) {
        aiResponseText = 'The closest active relief center is **Aashray Relief Center** (Capacity: 420/500 occupied). It is equipped with clean drinking water, food packs, and first aid.';
        actions = [{ label: 'Open Shelter Map & Routes', route: '/shelters' }];
      } else if (lower.includes('helpline') || lower.includes('contact') || lower.includes('phone') || lower.includes('call')) {
        aiResponseText = 'Emergency Contact Numbers:\n• National Disaster Helpline: **1078**\n• State Control Room (Odisha): **1070**\n• Aashray IVR Voice Line: **+91 99999 99999**\n• SMS Hotline: Text **HELP** to **+91 99999 99999**';
      } else if (lower.includes('flood') || lower.includes('water')) {
        aiResponseText = 'Flood Safety Protocol:\n1. Move to higher ground immediately.\n2. Do NOT walk or drive through flowing water.\n3. Disconnect electrical appliances.\n4. Keep emergency kits and essential medicines ready.';
      } else if (lower.includes('cyclone') || lower.includes('storm')) {
        aiResponseText = 'Cyclone Safety Advisory:\n1. Stay indoors away from windows.\n2. Keep battery radios tuned to coastal weather alerts.\n3. Store drinking water and non-perishable foods.';
      } else {
        aiResponseText = `I have logged your query regarding "${query}". For immediate emergency dispatch or rescue, please use our Incident Report tool or call National Emergency Hotline 112.`;
        actions = [{ label: 'Report Emergency Now', route: '/citizen' }];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions,
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Aashray AI Guidance</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online • 24/7 Response Active
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs text-slate-200">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 h-fit shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none font-medium'
                : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-line leading-relaxed font-normal">{msg.text}</p>
              
              {msg.actions && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-col gap-1.5">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (act.route) {
                          navigate(act.route);
                          onClose();
                        } else if (act.type) {
                          handleSend(act.label);
                        }
                      }}
                      className="w-full text-left py-1.5 px-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 font-bold text-[11px] flex items-center justify-between transition-all"
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}

              <span className={`block text-[9px] mt-1.5 font-mono ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 items-center text-slate-400 text-xs italic bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 w-fit">
            <Bot className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Aashray AI is analyzing guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for guidance, shelters, contacts..."
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
