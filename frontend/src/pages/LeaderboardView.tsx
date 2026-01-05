import { useState, useEffect } from 'react';
import { gamification } from '../services/api';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const LeaderboardView = () => {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await gamification.getLeaderboard();
                setLeaderboard(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-6 h-6 text-yellow-400 fill-current drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
        if (index === 1) return <Medal className="w-6 h-6 text-slate-300 fill-current" />;
        if (index === 2) return <Medal className="w-6 h-6 text-orange-400 fill-current" />;
        return <span className="font-bold text-slate-500 w-6 text-center font-mono">{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <div className="pl-20 p-8 min-h-screen">
                <div className="max-w-4xl mx-auto mt-10">
                    <div className="text-center mb-12 animate-in slide-in-from-top-4 fade-in duration-700">
                        <div className="inline-block p-4 bg-indigo-500/20 rounded-full mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <Trophy className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Wall of Fame
                        </h1>
                        <p className="text-slate-400 text-lg">Celebrating our top achievers and learners.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin text-indigo-500 mx-auto w-10 h-10" /></div>
                    ) : (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-4">
                            {leaderboard.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] ${index === 0
                                        ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                                        : index < 3
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-8 flex justify-center">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg border border-white/10">
                                                {(user.name || user.email || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {user.name || user.email?.split('@')[0] || 'Anonymous Learner'}
                                                </h3>
                                                <span className="text-xs px-2 py-0.5 bg-white/5 text-slate-400 rounded-full border border-white/5 uppercase tracking-wide">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold text-xl ${index === 0 ? 'text-yellow-400' : 'text-indigo-400'}`}>
                                            {user.xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 italic">Be the first to claim a spot!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
