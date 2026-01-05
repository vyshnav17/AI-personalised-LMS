import { useState, useEffect } from 'react';
import { courses } from '../services/api';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCourses = () => {
    const [myCourses, setMyCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await courses.getAll();
            setMyCourses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <div className="pl-24 pr-8 py-8 min-h-screen max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Courses</h1>
                        <p className="text-slate-400">Manage and continue your learning journeys.</p>
                    </div>
                    <Link
                        to="/dashboard"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        New Course
                    </Link>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    </div>
                ) : myCourses.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-white/5">
                        <div className="mb-4 text-6xl">📚</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Courses Yet</h2>
                        <p className="text-slate-400 mb-6">Start your first AI-generated course now.</p>
                        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline">Go to Dashboard</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
