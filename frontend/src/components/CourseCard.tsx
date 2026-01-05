import { Link } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        modules: any[];
        status?: string;
    };
}

const CourseCard = ({ course }: CourseCardProps) => {
    // Mock progress for now, random between 20-90 if not creating
    const percentage = course.status === 'CREATING' ? 0 : Math.floor(Math.random() * 70) + 20;

    return (
        <Link to={`/course/${course.id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden group hover:border-indigo-500/50 transition-colors"
                style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
                }}
            >
                {/* Tech Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 L100 100 M20 0 L100 80 M0 20 L80 100" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
                        <circle cx="80" cy="20" r="10" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" fill="none" />
                        <circle cx="20" cy="80" r="5" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" fill="none" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1">{course.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="text-xs text-slate-500 font-mono">
                            {course.status === 'CREATING' ? 'AI Generating...' : 'Fundamentals'}
                        </div>

                        <div className="w-12 h-12">
                            <CircularProgressbar
                                value={percentage}
                                text={`${percentage}%`}
                                styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: '#6366f1', // Indigo 500
                                    textColor: '#e2e8f0', // Slate 200
                                    trailColor: 'rgba(255,255,255,0.1)',
                                    backgroundColor: '#3e98c7',
                                })}
                            />
                        </div>
                    </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all" />
            </motion.div>
        </Link>
    );
};

export default CourseCard;
