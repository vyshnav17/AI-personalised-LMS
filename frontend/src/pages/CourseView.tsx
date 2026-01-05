import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { courses, attendance } from '../services/api';
import { ChevronDown, BookOpen, Clock, PlayCircle, Loader2 } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

const CourseView = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<any>(null);

    useEffect(() => {
        if (id) fetchCourse(id);
    }, [id]);

    // Polling for status
    useEffect(() => {
        let interval: any;
        if (course?.status === 'CREATING') {
            interval = setInterval(async () => {
                if (!id) return;
                try {
                    const res = await courses.getOne(id);
                    if (res.data.status === 'READY') {
                        setCourse(res.data);
                        if (res.data.modules?.[0]?.lessons?.[0]) {
                            setActiveLesson(res.data.modules[0].lessons[0]);
                        }
                    } else if (res.data.status === 'FAILED') {
                        setCourse(res.data);
                    }
                } catch (e) { console.error(e); }
            }, 5000); // Poll every 5s
        }
        return () => clearInterval(interval);
    }, [course?.status, id]);

    // Attendance Heartbeat
    useEffect(() => {
        if (!id) return;

        // Initial ping
        attendance.heartbeat(id).catch((err: any) => console.error("Heartbeat failed", err));

        const interval = setInterval(() => {
            attendance.heartbeat(id).catch((err: any) => console.error("Heartbeat failed", err));
        }, 60000); // Every 1 minute

        return () => clearInterval(interval);
    }, [id]);

    const fetchCourse = async (courseId: string) => {
        try {
            const res = await courses.getOne(courseId);
            setCourse(res.data);
            // Set first lesson as active by default if available
            if (res.data.modules?.[0]?.lessons?.[0]) {
                const firstLesson = res.data.modules[0].lessons[0];
                setActiveLesson(firstLesson);
                checkAndGenerateContent(courseId, firstLesson);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkAndGenerateContent = async (courseId: string, lesson: any) => {
        if (lesson.content && lesson.content.length < 500) {
            try {
                // Show temporary loading state or toast could be added here
                const res = await courses.generateLesson(courseId, lesson.id);
                // Update local state with new content
                setActiveLesson((prev: any) => ({ ...prev, content: res.data.content }));
                // Also update the course object to reflect the change globally in the view
                setCourse((prevCourse: any) => {
                    const newModules = prevCourse.modules.map((m: any) => ({
                        ...m,
                        lessons: m.lessons.map((l: any) => l.id === lesson.id ? { ...l, content: res.data.content } : l)
                    }));
                    return { ...prevCourse, modules: newModules };
                });
            } catch (err) {
                console.error("Failed to generate detailed content", err);
            }
        }
    };


    if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!course) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Course not found</div>;

    if (course.status === 'CREATING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-4 text-white">
                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/10 max-w-md w-full text-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Creating Your Course</h2>
                    <p className="text-slate-400 mb-6">
                        We are designing a detailed curriculum for "<strong>{course.title === 'Generating Course...' ? course.generatedBy : course.title}</strong>".
                        <br />This usually takes 2-5 minutes.
                    </p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-indigo-500 h-2 rounded-full animate-pulse w-2/3 mx-auto shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (course.status === 'FAILED') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Generation Failed</h1>
                    <p className="text-slate-400">{course.description}</p>
                    <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline mt-4 block">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500/30 flex">
            {/* Sidebar / Curriculum */}
            <div className="w-80 bg-slate-900/50 backdrop-blur-xl h-screen overflow-y-auto border-r border-white/10 fixed left-0 top-0 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="p-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                    <Link to="/dashboard" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-4 block uppercase tracking-wider">← Back to Dashboard</Link>
                    <h1 className="text-xl font-bold text-white leading-tight">{course.title}</h1>
                    <p className="text-xs text-slate-500 mt-2 font-mono">Generated by AI Tutor</p>
                </div>

                <div className="p-4 space-y-4">
                    <Link
                        to={`/course/${id}/exam`}
                        className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 mb-6"
                    >
                        Take Final Exam
                    </Link>
                    {course.modules?.map((module: any) => (
                        <div key={module.id} className="border border-white/5 rounded-xl overflow-hidden bg-white/5">
                            <div className="p-4 bg-white/5 font-bold text-sm flex justify-between items-center text-slate-300">
                                <span>{module.order}. {module.title}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="bg-transparent">
                                {module.lessons?.map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => {
                                            setActiveLesson(lesson);
                                            checkAndGenerateContent(id!, lesson);
                                        }}
                                        className={`p-3 pl-6 cursor-pointer border-t border-white/5 flex items-center gap-3 transition-colors ${activeLesson?.id === lesson.id
                                            ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-l-indigo-500'
                                            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        <PlayCircle className={`w-4 h-4 ${activeLesson?.id === lesson.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                                        <span className="text-sm font-medium line-clamp-1">{lesson.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="ml-80 flex-1 p-10 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 min-h-[600px] relative overflow-hidden">
                        {/* decorative glowing blob */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                        {activeLesson ? (
                            <>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 font-mono border-b border-white/5 pb-4">
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5"><BookOpen className="w-3 h-3" /> Lesson Content</span>
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5"><Clock className="w-3 h-3" /> 5 min read</span>
                                </div>

                                <h2 className="text-4xl font-extrabold mb-8 text-white tracking-tight leading-tight">{activeLesson.title}</h2>

                                <div className="prose prose-invert prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:text-white 
                                    prose-p:text-slate-300 prose-p:leading-8 
                                    prose-a:text-indigo-400 prose-a:font-bold prose-a:no-underline hover:prose-a:text-indigo-300 
                                    prose-strong:text-white prose-strong:font-bold
                                    prose-ul:list-disc prose-ul:text-slate-300 
                                    prose-ol:list-decimal prose-ol:text-slate-300
                                    prose-blockquote:border-l-indigo-500 prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-300
                                    prose-code:bg-slate-800 prose-code:text-indigo-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                                    prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
                                    <ReactMarkdown>{activeLesson.content || "Generating detailed lesson content..."}</ReactMarkdown>
                                </div>

                                <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <p className="flex items-center gap-3 text-indigo-300 italic">
                                        <ChatWidget context={activeLesson?.content || `The user is viewing the course: ${course.title}.`} />
                                        <span className="text-sm">Need help? Use the AI Assistant button to ask questions about this lesson.</span>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
                                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a lesson from the sidebar to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Tutor Chat Widget - Ensure it's positioned correctly */}
            <div className="fixed bottom-6 right-6 z-50">
                {/* This wrapper is just to ensure positioning if ChatWidget itself doesn't handle fixed positioning fully, though usually it does. The implementation below assumes ChatWidget is the button trigger. */}
                {/* Note: The ChatWidget component likely handles its own "open/close" state and fixed positioning button. If it doesn't, we might need to check standard practices. Assuming standard floating widget behavior. */}
            </div>
        </div>
    );
};

export default CourseView;
