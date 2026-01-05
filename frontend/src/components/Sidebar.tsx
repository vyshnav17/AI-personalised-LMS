import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Settings, LogOut, Home, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch (e) { console.error(e); }
        }
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/courses' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="w-20 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 h-screen fixed left-0 top-0 z-50">
            {/* Logo Placeholder */}
            <div className="mb-12 cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowProfile(true)}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden">
                    {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white font-bold text-xl">{user?.name?.[0] || 'A'}</span>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-[100] flex items-start pl-24 pt-8 bg-transparent" onClick={() => setShowProfile(false)}>
                    <div
                        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-80 shadow-2xl relative animate-in slide-in-from-left-4 fade-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4 text-4xl font-bold text-white overflow-hidden">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-4xl">{user?.name?.[0] || 'A'}</span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-medium uppercase tracking-wide border border-indigo-500/30">
                                {user?.role || 'Student'}
                            </span>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-4 space-y-4 border border-white/5">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Email</label>
                                <p className="text-slate-200 font-mono text-sm truncate">{user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">User ID</label>
                                <p className="text-slate-400 font-mono text-xs truncate opacity-50">{user?.id || '...'}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                            <p className="text-xs text-slate-500">Member since {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 space-y-8">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="relative group flex items-center justify-center"
                        title={item.label}
                    >
                        {isActive(item.path) && (
                            <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        )}
                        <item.icon
                            className={`w-6 h-6 transition-all duration-300 ${isActive(item.path)
                                ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                                : 'text-slate-400 group-hover:text-slate-200'
                                }`}
                        />

                        {/* Tooltip */}
                        <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                            {item.label}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }}
                className="text-slate-500 hover:text-red-400 transition-colors p-3"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Sidebar;
