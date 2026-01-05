
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await auth.register(formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            const errorMessage = (err as any).response?.data?.message || 'Registration failed. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-5 fade-in duration-500">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">A</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Join Antigravity</h2>
                    <p className="text-slate-400 mt-2 text-sm">Create your AI-powered learning account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all placeholder-slate-500"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all placeholder-slate-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all placeholder-slate-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
