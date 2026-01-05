import { useState, useEffect } from 'react';
import { profile } from '../services/api';
import { Settings, Save, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const SettingsView = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [difficulty, setDifficulty] = useState('BEGINNER');
    const [pacing, setPacing] = useState('MODERATE');
    const [interests, setInterests] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profile.get();
                if (res.data) {
                    setDifficulty(res.data.difficulty || 'BEGINNER');
                    setPacing(res.data.pacing || 'MODERATE');
                    // Parse if string, otherwise empty
                    let interestsStr = '';
                    try {
                        const parsed = JSON.parse(res.data.interests); // It is stored as JSON string in DB
                        if (Array.isArray(parsed)) interestsStr = parsed.join(', ');
                    } catch (e) { }
                    setInterests(interestsStr);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const interestsArray = interests.split(',').map(s => s.trim()).filter(s => s.length > 0);
            await profile.update({ difficulty, pacing, interests: interestsArray });
            alert('Settings saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <div className="pl-20 p-8 min-h-screen flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    {loading ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin text-indigo-500 mx-auto w-10 h-10" /></div>
                    ) : (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                    <Settings className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Learning Preferences</h1>
                                    <p className="text-slate-400 text-sm">Customize your AI tutor's teaching style.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Difficulty Level</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full bg-slate-800 text-white p-3 rounded-xl border border-white/10 focus:border-indigo-500 outline-none transition-colors appearance-none cursor-pointer hover:bg-slate-700/50"
                                    >
                                        <option value="BEGINNER">Beginner (Simple explanations, analogies)</option>
                                        <option value="INTERMEDIATE">Intermediate (Standard technical depth)</option>
                                        <option value="ADVANCED">Advanced (Deep dive, optimization, edge cases)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pacing Preference</label>
                                    <select
                                        value={pacing}
                                        onChange={(e) => setPacing(e.target.value)}
                                        className="w-full bg-slate-800 text-white p-3 rounded-xl border border-white/10 focus:border-indigo-500 outline-none transition-colors appearance-none cursor-pointer hover:bg-slate-700/50"
                                    >
                                        <option value="SLOW">Slow (More examples, repetition)</option>
                                        <option value="MODERATE">Moderate (Standard curriculum)</option>
                                        <option value="FAST">Fast (Concise, rapid progression)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Interests / Focus Areas (comma separated)</label>
                                    <textarea
                                        value={interests}
                                        onChange={(e) => setInterests(e.target.value)}
                                        placeholder="e.g. Web Development, Data Science, Cyber Security"
                                        className="w-full bg-slate-800 text-white p-3 rounded-xl border border-white/10 focus:border-indigo-500 outline-none transition-colors min-h-[100px] placeholder-slate-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">These topics will help the AI tailor real-world examples to your field of interest.</p>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
