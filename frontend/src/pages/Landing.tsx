
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <h1 className="text-5xl font-bold mb-6">AI Personalized LMS</h1>
            <p className="text-xl mb-8">Learn anything from scratch with your AI Tutor.</p>
            <div className="space-x-4">
                <Link to="/login" className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Login
                </Link>
                <Link to="/register" className="px-6 py-3 bg-transparent border border-white rounded-lg font-semibold hover:bg-white/10 transition">
                    Get Started
                </Link>
            </div>
        </div>
    );
};

export default Landing;
