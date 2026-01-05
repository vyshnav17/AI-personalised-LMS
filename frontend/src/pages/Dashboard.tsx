import { useState, useEffect } from 'react';
import { courses, gamification } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Brain } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CalendarStreak from '../components/CalendarStreak';
import CourseCard from '../components/CourseCard';
import ChatWidget from '../components/ChatWidget';

interface Course {
    id: string;
    title: string;
    description: string;
    modules: any[];
    status?: string;
}

const Dashboard = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [topUser, setTopUser] = useState<any>(null);
    const [xp, setXp] = useState(0);
    const navigate = useNavigate();

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    // Get user name
    const [userName, setUserName] = useState('Alex');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.name) setUserName(user.name.split(' ')[0]); // Use first name
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, statsRes, leaderboardRes] = await Promise.all([
                courses.getAll(),
                gamification.getStats(),
                gamification.getLeaderboard()
            ]);
            setMyCourses(coursesRes.data);
            setXp(statsRes.data.xp || 0);
            if (leaderboardRes.data.length > 0) {
                setTopUser(leaderboardRes.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await courses.generate(prompt);
            navigate(`/course/${res.data.id}`);
        } catch (err: any) {
            console.error(err);
            alert('Failed to generate course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* 1. Left Sidebar */}
            <Sidebar />

            <div className="pl-24 pr-8 py-8 min-h-screen grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 max-w-[1600px] mx-auto">
                {/* 2. Main Content */}
                <div className="space-y-10">
                    {/* Header */}
                    <header>
                        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                            {greeting}, {userName}. <span className="text-slate-400 font-normal">Ready to learn?</span>
                        </h1>
                        <p className="text-slate-400">You're 2 days away from hitting your weekly goal.</p>
                    </header>

                    {/* AI Search / Creator */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative bg-slate-900 rounded-xl p-1">
                            <form onSubmit={handleGenerate} className="flex items-center bg-slate-800/50 rounded-lg overflow-hidden border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                                <input
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="What do you want to learn today? Ask AI anything..."
                                    className="w-full bg-transparent px-6 py-4 text-white placeholder-slate-500 outline-none text-lg"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="p-4 hover:text-indigo-400 text-slate-400 transition-colors"
                                >
                                    {loading ? <Sparkles className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                                </button>
                            </form>
                        </div>

                        {/* Suggestion Chips */}
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {['Master Python', 'Quantum Physics', 'Creative Writing', 'Data Science'].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setPrompt(topic)}
                                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all whitespace-nowrap backdrop-blur-sm"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* My Courses Grid */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-white">My Courses</h2>
                            <Link to="/courses" className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors">View All</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myCourses.length === 0 ? (
                                <div className="col-span-full py-12 border border-dashed border-slate-700 rounded-2xl text-center text-slate-500 bg-white/5">
                                    <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    No courses yet. Try asking the AI above!
                                </div>
                            ) : (
                                myCourses.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* 3. Right Sidebar */}
                <div className="space-y-8">
                    {/* Calendar Widget */}
                    <CalendarStreak totalXp={xp} />

                    {/* Leaderboard Teaser */}
                    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold">Leaderboard</h3>
                            <Link to="/leaderboard" className="text-xs text-indigo-400 cursor-pointer hover:underline">View All</Link>
                        </div>
                        {topUser ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                    1
                                </div>
                                <div>
                                    <h4 className="text-slate-200 font-bold text-sm">{topUser.name || 'Anonymous'}</h4>
                                    <p className="text-yellow-500/80 text-xs font-mono">{topUser.xp} XP</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-500 text-xs text-center py-2">No data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Ask AI Button */}
            <div className="fixed bottom-8 right-8 z-50">
                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="group relative flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30 hover:scale-110 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-75"></div>
                        <Brain className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors relative z-10" />
                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Ask AI
                        </span>
                    </button>
                )}

                <ChatWidget
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    context="User is on the Dashboard. They might ask where to find courses, how to check XP, or general questions."
                />
            </div>
        </div>
    );
};

export default Dashboard;
