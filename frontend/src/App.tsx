
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import ExamView from './pages/ExamView';
import CommunityView from './pages/CommunityView';
import SettingsView from './pages/SettingsView';
import LeaderboardView from './pages/LeaderboardView';
import MyCourses from './pages/MyCourses';
import { chat } from './services/api';

function App() {
  const lastCheckRef = useRef(Date.now());

  // Global Chat Polling
  useEffect(() => {
    const pollMessages = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return;

      const user = JSON.parse(userStr);
      try {
        const { data: conversations } = await chat.getConversations();

        // Check for new messages in recent conversations
        conversations.forEach((conv: any) => {
          const lastMsg = conv.messages?.[0];
          if (lastMsg) {
            const msgTime = new Date(lastMsg.createdAt).getTime();
            if (msgTime > lastCheckRef.current && lastMsg.senderId !== user.id) {
              // Found a new message!
              const senderName = conv.participants.find((p: any) => p.user.id === lastMsg.senderId)?.user.name || 'Someone';
              toast.success(`New message from ${senderName}`, {
                style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
                icon: '💬',
                duration: 4000
              });
            }
          }
        });

        lastCheckRef.current = Date.now();
      } catch (err) {
        // Silent fail for polling
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/community" element={<CommunityView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/leaderboard" element={<LeaderboardView />} />
        <Route path="/course/:id" element={<CourseView />} />
        <Route path="/course/:courseId/exam" element={<ExamView />} />
      </Routes>
    </Router>
  );
}

export default App;
