//@ts-nocheck
import { useState, useEffect } from 'react';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import app from './firebaseConfig';
import { getDatabase, ref, onValue } from 'firebase/database';

const SlothLogo = () => (
  <svg viewBox="0 0 100 100" width="24" height="24">
    <defs>
      <linearGradient id="sidebarCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="50%" stopColor="#60d5d2" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path d="M75 65c8.3 0 15-6.7 15-15 0-7.5-5.5-13.7-12.7-14.8C76.5 26.5 68.5 20 59 20c-8.3 0-15.4 5.2-18.2 12.5C35.5 32.2 30 37.5 30 44c0 2.2.6 4.3 1.5 6.1C24.8 51.5 20 57.5 20 65c0 0 55 0 55 0z" fill="url(#sidebarCloudGrad)" opacity="0.9"/>
    <circle cx="55" cy="52" r="16" fill="#1a1a3e" stroke="#60d5d2" strokeWidth="2"/>
    <path d="M55 38L55 66M43 52L67 52" stroke="#60d5d2" strokeWidth="2"/>
    <polygon points="55,36 52,44 58,44" fill="#60d5d2"/>
    <polygon points="55,68 52,60 58,60" fill="#60d5d2"/>
    <polygon points="41,52 49,49 49,55" fill="#60d5d2"/>
    <polygon points="69,52 61,49 61,55" fill="#60d5d2"/>
  </svg>
);

const Sidebar = ({ darkMode, currentSessionId, onSessionSelect, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const database = getDatabase(app);

  useEffect(() => {
    const chatsRef = ref(database, 'chats');
    
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sessionIds = Object.keys(data);
        
        // Sort sessions by timestamp (descending) - extract timestamp from session_<timestamp>_<random>
        const sorted = sessionIds.sort((a, b) => {
          const timestampA = parseInt(a.split('_')[1]) || 0;
          const timestampB = parseInt(b.split('_')[1]) || 0;
          return timestampB - timestampA;
        });
        
        // Limit to top 10 chats
        setSessions(sorted.slice(0, 10));
      } else {
        setSessions([]);
      }
    });

    return () => unsubscribe();
  }, [database]);

  const styles = {
    sidebar: {
      width: 260,
      height: '100%',
      backgroundColor: darkMode ? '#111827' : '#fff',
      borderRight: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },
    content: {
      flex: 1,
      padding: '16px 12px',
      overflowY: 'auto'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 8,
      cursor: 'pointer',
      color: darkMode ? '#e5e7eb' : '#374151',
      fontSize: 14,
      fontWeight: 500,
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left'
    },
    menuItemHover: {
      backgroundColor: darkMode ? '#1f2937' : '#f3f4f6'
    },
    divider: {
      height: 1,
      backgroundColor: darkMode ? '#374151' : '#e5e7eb',
      margin: '12px 0'
    },
    historyHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      cursor: 'pointer',
      color: darkMode ? '#e5e7eb' : '#374151',
      fontSize: 14,
      fontWeight: 600
    },
    historyCount: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontWeight: 400
    },
    sessionItem: {
      padding: '10px 16px',
      borderRadius: 8,
      cursor: 'pointer',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginBottom: 4
    },
    sessionItemActive: {
      backgroundColor: darkMode ? '#1f2937' : '#eef2ff',
      color: darkMode ? '#a5b4fc' : '#4f46e5'
    },
    footer: {
      padding: '16px',
      borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    },
    footerText: {
      fontSize: 14,
      fontWeight: 600,
      color: darkMode ? '#e5e7eb' : '#374151'
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.content}>
        <button style={styles.menuItem} onClick={onNewChat}>
          <PlusCircle size={20} />
          <span>New Chat</span>
        </button>

        <div style={styles.divider} />

        <div 
          style={styles.historyHeader}
          onClick={() => setHistoryExpanded(!historyExpanded)}
        >
          <span>Chat History</span>
          <div style={styles.historyCount}>
            <span>{sessions.length} Total</span>
            {historyExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {historyExpanded && (
          <div>
            {sessions.map((sessionId) => (
              <div
                key={sessionId}
                style={{
                  ...styles.sessionItem,
                  ...(currentSessionId === sessionId ? styles.sessionItemActive : {})
                }}
                onClick={() => onSessionSelect(sessionId)}
              >
                {sessionId}
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ ...styles.sessionItem, cursor: 'default', fontStyle: 'italic' }}>
                No chat history yet
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <SlothLogo />
        <span style={styles.footerText}>Cloud Copilot</span>
      </div>
    </div>
  );
};

export default Sidebar;