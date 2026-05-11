import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings, 
  ChevronRight, 
  Plus, 
  Folder, 
  FileText, 
  Cpu,
  BarChart2,
  User,
  Send
} from 'lucide-react';
import { chatCompletion, parseStream } from './services/openrouter';
import FileTree from './components/FileTree';
import './App.css';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div 
    className={`sidebar-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your OpenRouter-powered AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

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
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        parseStream(chunk, (text) => {
          assistantMessage.content += text;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API key.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">GPT</div>
            <h1>My-GPT</h1>
          </div>
          <button className="new-chat-btn">
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="section-label">Navigation</p>
            <SidebarItem 
              icon={MessageSquare} 
              label="Chat" 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
            />
            <SidebarItem 
              icon={Folder} 
              label="Files" 
              active={activeTab === 'files'} 
              onClick={() => setActiveTab('files')} 
            />
            <SidebarItem 
              icon={BarChart2} 
              label="Usage" 
              active={activeTab === 'usage'} 
              onClick={() => setActiveTab('usage')} 
            />
          </div>

          {activeTab === 'files' && (
            <div className="nav-section fade-in">
              <p className="section-label">Project Files</p>
              <div className="file-tree-container glass">
                <FileTree />
              </div>
            </div>
          )}

          <div className="nav-section">
            <p className="section-label">Models</p>
            <div className="model-selector glass">
              <Cpu size={16} />
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
              </select>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <User size={18} />
            <span>Gerry Wit</span>
          </div>
          <Settings size={18} className="settings-icon" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header glass">
          <div className="header-info">
            <h2>Current Session</h2>
            <p>Model: {selectedModel.split('/').pop()}</p>
          </div>
          <div className="usage-badge">
            <BarChart2 size={14} />
            <span>${totalSpent.toFixed(4)} used</span>
          </div>
        </header>

        <div className="chat-area">
          <div className="messages-container">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.role}`}>
                <div className="message-content glass">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="input-container glass">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
