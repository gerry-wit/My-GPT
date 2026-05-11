import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  ChevronRight,
  Plus,
  Folder,
  Cpu,
  BarChart2,
  Send,
  LogOut,
  Sparkles,
  Loader2,
  User,
  Bot,
  Settings,
  Wand2,
  Paperclip,
  Download,
  ImageIcon,
} from 'lucide-react';
import { chatCompletion, parseStream } from './services/openrouter';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { saveChat, loadChat, clearChat as clearFirestoreChat } from './services/firestore';
import FileTree from './components/FileTree';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import SettingsModal from './components/SettingsModal';
import ImageGenModal from './components/ImageGenModal';
import { exportAsTxt, exportAsCsv, exportAsExcel, exportAsPptx } from './utils/export';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your OpenRouter-powered AI. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('mygpt_api_key') || '';
    setApiKey(stored);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load persisted chat from Firestore
  useEffect(() => {
    if (user) {
      loadChat(user.uid).then((data) => {
        if (data && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          if (data.model) setSelectedModel(data.model);
        }
      });
    }
  }, [user]);

  // Debounced save to Firestore
  useEffect(() => {
    if (user) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveChat(user.uid, messages, selectedModel);
      }, 800);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [messages, selectedModel, user]);

  const handleLogout = () => signOut(auth);

  const handleNewChat = useCallback(async () => {
    const fresh = [
      {
        role: 'assistant',
        content: 'Hello! I am your OpenRouter-powered AI. How can I help you today?',
      },
    ];
    setMessages(fresh);
    setInput('');
    setTotalSpent(0);
    if (user) {
      await saveChat(user.uid, fresh, selectedModel);
    }
  }, [user, selectedModel]);

  const handleClearAll = useCallback(async () => {
    const fresh = [
      {
        role: 'assistant',
        content: 'Hello! I am your OpenRouter-powered AI. How can I help you today?',
      },
    ];
    setMessages(fresh);
    setTotalSpent(0);
    if (user) {
      await clearFirestoreChat(user.uid);
      await saveChat(user.uid, fresh, selectedModel);
    }
  }, [user, selectedModel]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await chatCompletion(newMessages, selectedModel);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = { role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        parseStream(chunk, (text) => {
          assistantMessage.content += text;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please check your API key.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['text/plain', 'text/csv', 'application/json', 'text/markdown', 'text/x-markdown'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.md')) {
      alert('Only .txt, .csv, .json, and .md files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const fileMsg = `[File: ${file.name}]\n\n${text}`;
      const userMessage = { role: 'user', content: fileMsg };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsTyping(true);

      chatCompletion(newMessages, selectedModel)
        .then((stream) => {
          const r = stream.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = { role: 'assistant', content: '' };
          setMessages((prev) => [...prev, assistantMessage]);

          function pump() {
            r.read().then(({ done, value }) => {
              if (done) {
                setIsTyping(false);
                return;
              }
              const chunk = decoder.decode(value);
              parseStream(chunk, (t) => {
                assistantMessage.content += t;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...assistantMessage };
                  return updated;
                });
              });
              pump();
            });
          }
          pump();
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please check your API key.',
            },
          ]);
          setIsTyping(false);
        });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const modelName = selectedModel.split('/').pop();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage onLogin={() => { }} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-inner">
          <div className="sidebar-top">
            <div className="brand">
              <div className="brand-icon">
                <Sparkles size={20} />
              </div>
              <span className="brand-name">My-GPT</span>
            </div>
            <button className="new-chat-btn" onClick={handleNewChat}>
              <Plus size={18} strokeWidth={2.5} />
              <span>New chat</span>
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <button
                className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Folder size={18} />
                <span>Files</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'usage' ? 'active' : ''}`}
                onClick={() => setActiveTab('usage')}
              >
                <BarChart2 size={18} />
                <span>Usage</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                <Wand2 size={18} />
                <span>Tools</span>
              </button>
            </div>

            {activeTab === 'files' && (
              <div className="nav-section fade-in">
                <span className="section-label">Project Files</span>
                <div className="file-panel">
                  <FileTree />
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="nav-section fade-in">
                <span className="section-label">Export & Tools</span>
                <div className="nav-group">
                  <button className="nav-item" onClick={() => exportAsTxt(messages)}>
                    <Download size={16} />
                    <span>Export as TXT</span>
                  </button>
                  <button className="nav-item" onClick={() => exportAsCsv(messages)}>
                    <Download size={16} />
                    <span>Export as CSV</span>
                  </button>
                  <button className="nav-item" onClick={() => exportAsExcel(messages)}>
                    <Download size={16} />
                    <span>Export as Excel</span>
                  </button>
                  <button className="nav-item" onClick={() => exportAsPptx(messages)}>
                    <Download size={16} />
                    <span>Export as PPT</span>
                  </button>
                  <button className="nav-item" onClick={() => setImageOpen(true)}>
                    <ImageIcon size={16} />
                    <span>Image Generator</span>
                  </button>
                </div>
              </div>
            )}

            <div className="nav-section">
              <span className="section-label">Model</span>
              <div className="model-select-wrapper">
                <Cpu size={16} />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="anthropic/claude-3.5-sonnet">
                    Claude 3.5 Sonnet
                  </option>
                  <option value="openai/gpt-4o">GPT-4o</option>
                  <option value="google/gemini-pro-1.5">
                    Gemini Pro 1.5
                  </option>
                  <option value="meta-llama/llama-3-70b-instruct">
                    Llama 3 70B
                  </option>
                </select>
              </div>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="user-avatar">
                {user?.displayName
                  ? user.displayName[0].toUpperCase()
                  : user.email[0].toUpperCase()}
              </div>
              <span className="user-email">{user.email.split('@')[0]}</span>
            </div>
            <button className="settings-btn" onClick={() => setSettingsOpen(true)} title="Settings">
              <Settings size={16} />
            </button>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <ChevronRight
          size={16}
          style={{
            transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </button>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <h1 className="session-title">Chat</h1>
            <span className="model-badge">{modelName}</span>
          </div>
          <div className="header-right">
            <button className="tool-btn" onClick={() => setImageOpen(true)} title="Generate Image">
              <ImageIcon size={16} />
            </button>
            <span className="usage-chip">
              <BarChart2 size={14} />
              ${totalSpent.toFixed(4)}
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="messages-container">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-row ${msg.role} fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="message-avatar">
                  {msg.role === 'user' ? <User size={17} /> : <Bot size={17} />}
                </div>
                <div className="message-body">
                  <div className="message-meta">
                    <span className="message-role">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <div className="message-text">
                    {msg.content || <span className="typing-cursor">|</span>}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && messages[messages.length - 1]?.role === 'user' && (
              <div className="message-row assistant fade-in">
                <div className="message-avatar">
                  <Bot size={17} />
                </div>
                <div className="message-body">
                  <div className="message-meta">
                    <span className="message-role">Assistant</span>
                  </div>
                  <div className="typing-indicator">
                    <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot" style={{ animationDelay: '180ms' }} />
                    <span className="typing-dot" style={{ animationDelay: '360ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".txt,.csv,.json,.md"
                onChange={handleFileUpload}
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
                disabled={isTyping}
              >
                <Paperclip size={18} />
              </button>
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
              </button>
            </div>
            <p className="input-footer">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearChat={handleClearAll}
        onApiKeyChange={(key) => setApiKey(key)}
      />
      <ImageGenModal isOpen={imageOpen} onClose={() => setImageOpen(false)} />
    </div>
  );
}

export default App;
