//@ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Menu, Settings, ChevronLeft, ChevronRight, Volume2, Copy, RotateCcw, ThumbsDown, Sparkles, Send, ImagePlus } from 'lucide-react';
import app from './firebaseConfig';
import { getDatabase, ref, push, get, child } from 'firebase/database';
import Sidebar from './Sidebar';

const SlothLogo = () => (
  <svg viewBox="0 0 100 100" width="28" height="28">
    <defs>
      <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="50%" stopColor="#60d5d2" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path d="M75 65c8.3 0 15-6.7 15-15 0-7.5-5.5-13.7-12.7-14.8C76.5 26.5 68.5 20 59 20c-8.3 0-15.4 5.2-18.2 12.5C35.5 32.2 30 37.5 30 44c0 2.2.6 4.3 1.5 6.1C24.8 51.5 20 57.5 20 65c0 0 55 0 55 0z" fill="url(#cloudGrad)" opacity="0.9"/>
    <circle cx="55" cy="52" r="16" fill="#1a1a3e" stroke="#60d5d2" strokeWidth="2"/>
    <path d="M55 38L55 66M43 52L67 52" stroke="#60d5d2" strokeWidth="2"/>
    <polygon points="55,36 52,44 58,44" fill="#60d5d2"/>
    <polygon points="55,68 52,60 58,60" fill="#60d5d2"/>
    <polygon points="41,52 49,49 49,55" fill="#60d5d2"/>
    <polygon points="69,52 61,49 61,55" fill="#60d5d2"/>
  </svg>
);

export default function Home({ sessionId, onNewChat, onSessionSelect }) {
  const database = getDatabase(app);
  
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imgIndex, setImgIndex] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  const saveMessageToFirebase = async (messageData) => {
    const messageRef = ref(database, `chats/${sessionId}`);
    await push(messageRef, messageData);
    console.log(`Saving to Firebase: chats/${sessionId}`, messageData);
  };

  // Load messages from current session
  const loadSessionMessages = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `chats/${sessionId}`));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedMessages = Object.values(data).map((msg, index) => ({
          id: Date.now() + index,
          type: msg.sender,
          text: msg.content === 'image' ? '' : msg.content,
          time: `${(new Date(msg.timestamp).getMonth() + 1).toString().padStart(2, '0')}/${new Date(msg.timestamp).getDate().toString().padStart(2, '0')} ${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          hasImage: msg.content === 'image',
          imageUrl: msg.content === 'image' ? '' : null
        }));
        setMessages(loadedMessages);
        setHasStarted(loadedMessages.length > 0);
      } else {
        setMessages([]);
        setHasStarted(false);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSessionMessages();
      console.log('Current session:', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getFormattedTime = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${month}/${day} ${time}`;
  };

  const addMessage = (type, content, imageUrl = null) => {
    const timestamp = new Date().toISOString();
    const time = getFormattedTime();
    
    const messageData = {
      sender: type,
      timestamp: timestamp,
      content: imageUrl ? 'image' : content
    };

    // Save to Firebase (non-blocking)
    saveMessageToFirebase(messageData);

    // Add to local state for display
    const newMsg = {
      id: Date.now(),
      type,
      text: content,
      time,
      hasImage: !!imageUrl,
      imageUrl
    };

    setMessages(prev => [...prev, newMsg]);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!hasStarted) setHasStarted(true);
    
    const userMessage = input;
    setInput('');
    
    // Add user message
    addMessage('user', userMessage);

    // Simulate bot response
    setTimeout(() => {
      addMessage('bot', "That's an interesting question! Let me think about that...");
    }, 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (!hasStarted) setHasStarted(true);
      
      const imageUrl = URL.createObjectURL(file);
      
      // Add user image message
      addMessage('user', '', imageUrl);

      // Simulate bot response
      setTimeout(() => {
        addMessage('bot', "I've received your architecture diagram. Let me analyze it against well-architected framework best practices and provide recommendations...");
      }, 1000);
    }
    e.target.value = '';
  };

  const styles = {
    wrapper: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: darkMode ? '#1f2937' : '#fff', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, width: '100%', flexShrink: 0 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: darkMode ? '#fff' : '#1f2937' },
    headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 500 },
    mainArea: { flex: 1, display: 'flex', overflow: 'hidden' },
    sidebarContainer: { flexShrink: 0 },
    contentArea: { flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 0', backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', overflow: 'hidden' },
    container: { width: '80%', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#111827' : '#f9fafb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxHeight: '100%' },
    chatArea: { flex: 1, overflowY: 'auto', padding: 24, backgroundColor: darkMode ? '#111827' : '#f9fafb' },
    msgRow: { display: 'flex', gap: 12, marginBottom: 24 },
    userAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 500, flexShrink: 0 },
    botAvatar: { width: 40, height: 40, borderRadius: '50%', background: darkMode ? '#1e1b4b' : '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    msgContent: { flex: 1 },
    msgHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
    msgName: { fontWeight: 600, color: darkMode ? '#fff' : '#1f2937' },
    msgTime: { fontSize: 12, color: darkMode ? '#9ca3af' : '#6b7280' },
    userBubble: { backgroundColor: darkMode ? '#1f2937' : '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: darkMode ? '#fff' : '#1f2937' },
    botBubble: { backgroundColor: darkMode ? 'rgba(79,70,229,0.15)' : '#eef2ff', border: `1px solid ${darkMode ? '#4f46e5' : '#c7d2fe'}`, padding: 16, borderRadius: 12, color: darkMode ? '#fff' : '#1f2937' },
    list: { marginTop: 12, paddingLeft: 0, listStyle: 'none' },
    listItem: { display: 'flex', gap: 8, marginBottom: 8 },
    listNum: { fontWeight: 600, color: darkMode ? '#a5b4fc' : '#4f46e5' },
    imgContainer: { marginTop: 12, borderRadius: 8, overflow: 'hidden' },
    img: { width: '100%', height: 180, objectFit: 'cover' },
    imgControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: darkMode ? '#374151' : '#f3f4f6' },
    imgNav: { display: 'flex', alignItems: 'center', gap: 8 },
    imgActions: { display: 'flex', gap: 4 },
    inputArea: { padding: 16, backgroundColor: darkMode ? '#1f2937' : '#fff', borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, flexShrink: 0 },
    inputRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, borderRadius: 9999, backgroundColor: darkMode ? '#111827' : '#fff' },
    input: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: darkMode ? '#fff' : '#1f2937', fontSize: 14 },
    sendBtn: { width: 32, height: 32, borderRadius: '50%', backgroundColor: '#6366f1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
    footer: { textAlign: 'center', fontSize: 12, color: darkMode ? '#6b7280' : '#9ca3af', marginTop: 8 },
    welcome: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: darkMode ? '#fff' : '#1f2937' },
    welcomeText: { fontSize: 28, fontWeight: 600, marginBottom: 8 },
    welcomeSub: { fontSize: 16, color: darkMode ? '#9ca3af' : '#6b7280' }
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.iconBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          <span>Cloud Copilot</span>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button style={styles.iconBtn}><Settings size={20} /></button>
          <div style={styles.avatar}>U</div>
        </div>
      </header>

      <div style={styles.mainArea}>
        {sidebarOpen && (
          <div style={styles.sidebarContainer}>
            <Sidebar 
              darkMode={darkMode} 
              currentSessionId={sessionId} 
              onSessionSelect={onSessionSelect}
              onNewChat={onNewChat}
            />
          </div>
        )}
        
        <div style={styles.contentArea}>
          <div style={styles.container}>
            <div style={styles.chatArea}>
              {!hasStarted ? (
                <div style={styles.welcome}>
                  <div style={styles.welcomeText}>Hii, How can I help you today?</div>
                  <div style={styles.welcomeSub}>Send a message or upload your architecture diagram for review.</div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} style={styles.msgRow}>
                      {msg.type === 'user' ? (
                        <div style={styles.userAvatar}>U</div>
                      ) : (
                        <div style={styles.botAvatar}><SlothLogo /></div>
                      )}
                      <div style={styles.msgContent}>
                        <div style={styles.msgHeader}>
                          <span style={styles.msgName}>{msg.type === 'user' ? 'You' : 'Cloud Copilot'}</span>
                          <span style={styles.msgTime}>{msg.time}</span>
                        </div>
                        <div style={msg.type === 'user' ? styles.userBubble : styles.botBubble}>
                          {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
                          {msg.list && (
                            <ol style={styles.list}>
                              {msg.list.map((item, i) => (
                                <li key={i} style={styles.listItem}>
                                  <span style={styles.listNum}>{i + 1}.</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                          {msg.hasImage && (
                            <div style={styles.imgContainer}>
                              <img src={msg.imageUrl} alt="Response" style={styles.img} />
                              {msg.type === 'bot' && (
                                <div style={styles.imgControls}>
                                  <div style={styles.imgNav}>
                                    <button style={styles.iconBtn}><ChevronLeft size={16} /></button>
                                    <span style={{ fontSize: 12, color: darkMode ? '#9ca3af' : '#6b7280' }}>{imgIndex}/8</span>
                                    <button style={styles.iconBtn}><ChevronRight size={16} /></button>
                                  </div>
                                  <div style={styles.imgActions}>
                                    <button style={styles.iconBtn}><Volume2 size={16} /></button>
                                    <button style={styles.iconBtn}><Copy size={16} /></button>
                                    <button style={styles.iconBtn}><RotateCcw size={16} /></button>
                                    <button style={styles.iconBtn}><ThumbsDown size={16} /></button>
                                    <button style={styles.iconBtn}><Sparkles size={16} /></button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </>
              )}
            </div>

            <div style={styles.inputArea}>
              <div style={styles.inputRow}>
                <button style={styles.iconBtn}><Sparkles size={20} /></button>
                <input
                  style={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Message Cloud Copilot..."
                />
                <button style={styles.iconBtn} onClick={() => fileInputRef.current?.click()}><ImagePlus size={20} /></button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button style={styles.sendBtn} onClick={sendMessage}><Send size={16} /></button>
              </div>
              <p style={styles.footer}>Cloud Copilot provides the first level of Cloud Architecture Review. Please double check responses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}