import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import ExamView from './pages/ExamView';
import CommunityView from './pages/CommunityView';
import SettingsView from './pages/SettingsView';
import LeaderboardView from './pages/LeaderboardView';

import MyCourses from './pages/MyCourses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
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
