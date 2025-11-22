//@ts-nocheck
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Home from './Home';

// Generate a new session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Wrapper component that provides sessionId from URL params
const ChatSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const handleNewChat = () => {
    const newSessionId = generateSessionId();
    navigate(`/${newSessionId}`);
  };

  const handleSessionSelect = (selectedSessionId) => {
    navigate(`/${selectedSessionId}`);
  };

  return (
    <Home 
      sessionId={sessionId} 
      onNewChat={handleNewChat}
      onSessionSelect={handleSessionSelect}
    />
  );
};

// Main Router component
const AppRouter = () => {
  const newSessionId = generateSessionId();

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect base URL to a new session */}
        <Route path="/" element={<Navigate to={`/${newSessionId}`} replace />} />
        
        {/* Chat session route */}
        <Route path="/:sessionId" element={<ChatSession />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;