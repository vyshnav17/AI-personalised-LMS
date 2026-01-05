import { useState, useEffect } from 'react';
import { community } from '../services/api';
import { MessageSquare, Heart, Send, Loader2, Plus, Users, Search, Hash, ChevronLeft, Trash, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const CommunityView = () => {
    // State
    const [view, setView] = useState<'hub' | 'community'>('hub');
    const [activeCommunity, setActiveCommunity] = useState<any>(null);
    const [communities, setCommunities] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Comment State
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [postComments, setPostComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Create Post State
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [creatingPost, setCreatingPost] = useState(false);

    // Create Community State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommName, setNewCommName] = useState('');
    const [newCommDesc, setNewCommDesc] = useState('');
    const [creatingComm, setCreatingComm] = useState(false);

    // User State
    const [userId, setUserId] = useState<string | null>(null);

    // Members State
    const [members, setMembers] = useState<any[]>([]);

    // Initial Fetch
    useEffect(() => {
        fetchCommunities();
        const user = localStorage.getItem('user');
        if (user) {
            try { setUserId(JSON.parse(user).id); } catch (e) { console.error(e); }
        }
    }, []);

    // Effect to fetch posts when active community changes
    useEffect(() => {
        if (activeCommunity) {
            fetchPosts(activeCommunity.id);
            fetchMembers(activeCommunity.id); // Fetch members
        }
    }, [activeCommunity]);

    const fetchMembers = async (communityId: string) => {
        try {
            const res = await community.getMembers(communityId);
            setMembers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setMembers([]);
        }
    };

    const fetchCommunities = async () => {
        try {
            const res = await community.getCommunities();
            setCommunities(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async (communityId: string) => {
        setLoading(true);
        try {
            const res = await community.getPosts(undefined, communityId);
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleJoin = async (comm: any) => {
        try {
            if (comm.isJoined) {
                await community.leaveCommunity(comm.id);
            } else {
                await community.joinCommunity(comm.id);
            }
            fetchCommunities(); // Refresh list to update UI
            if (activeCommunity?.id === comm.id) {
                setActiveCommunity({ ...activeCommunity, isJoined: !comm.isJoined });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCommunity = async () => {
        if (!activeCommunity || !confirm('Are you sure you want to delete this community? This cannot be undone.')) return;
        try {
            await community.deleteCommunity(activeCommunity.id);
            fetchCommunities();
            setActiveCommunity(null);
            setView('hub');
        } catch (err) {
            console.error(err);
            alert('Failed to delete community');
        }
    };

    const handleCreateCommunity = async () => {
        setCreatingComm(true);
        try {
            await community.createCommunity(newCommName, newCommDesc);
            setShowCreateModal(false);
            setNewCommName('');
            setNewCommDesc('');
            fetchCommunities();
        } catch (err) {
            alert('Failed to create community. Name might be taken.');
        } finally {
            setCreatingComm(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim() || !activeCommunity) return;
        setCreatingPost(true);
        try {
            const res = await community.createPost(newPostTitle, newPostContent, activeCommunity.id);
            setPosts([res.data, ...posts]);
            setNewPostTitle('');
            setNewPostContent('');
        } catch (err) {
            console.error(err);
            alert('Post failed. Profanity is not allowed.');
        } finally {
            setCreatingPost(false);
        }
    };

    const handleLike = async (postId: string) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                // Optimistic toggle
                const isLiked = p.likes.length > 0; // Simplified for MVP
                return {
                    ...p,
                    _count: { ...p._count, likes: isLiked ? p._count.likes - 1 : p._count.likes + 1 },
                    likes: isLiked ? [] : [{ userId: 'me' }]
                };
            }
            return p;
        }));
        try {
            await community.toggleLike(postId);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleComments = async (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
            return;
        }

        setExpandedPostId(postId);
        setLoadingComments(true);
        try {
            const res = await community.getPost(postId);
            setPostComments(res.data.comments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (postId: string) => {
        if (!newComment.trim()) return;
        try {
            await community.addComment(postId, newComment);
            setNewComment('');
            // Re-fetch comments
            const res = await community.getPost(postId);
            setPostComments(res.data.comments || []);

            // Update comment count in post list optimistically
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to add comment');
        }
    };

    // Render Components
    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <div className="pl-20 xl:grid xl:grid-cols-[1fr_350px] min-h-screen">

                {/* Main Content Area */}
                <main className="p-8 max-w-5xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {view === 'community' && (
                                <button
                                    onClick={() => { setView('hub'); setActiveCommunity(null); }}
                                    className="p-2 hover:bg-white/5 rounded-full transition"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    {view === 'hub' ? 'Community Hub' : activeCommunity?.name}
                                </h1>
                                <p className="text-slate-400">
                                    {view === 'hub' ? 'Discover and join topic-based groups.' : activeCommunity?.description}
                                </p>
                            </div>
                        </div>

                        {view === 'hub' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Create Community
                            </button>
                        )}
                        {view === 'community' && activeCommunity && (
                            <div className="flex gap-2">
                                {/* Delete Button for Creator */}
                                {activeCommunity.creatorId === userId && (
                                    <button
                                        onClick={handleDeleteCommunity}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2.5 rounded-xl transition-colors border border-red-500/20"
                                        title="Delete Community"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleJoin(activeCommunity)}
                                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeCommunity.isJoined
                                        ? 'bg-slate-800 text-slate-300 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
                                        }`}
                                >
                                    {activeCommunity.isJoined ? (
                                        <>
                                            <LogOut className="w-5 h-5" />
                                            Leave
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Join Group
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* View: Community Hub (List) */}
                    {view === 'hub' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? <Loader2 className="animate-spin text-indigo-500 mx-auto col-span-2" /> : communities.map(comm => (
                                <div
                                    key={comm.id}
                                    onClick={() => { setActiveCommunity(comm); setView('community'); }}
                                    className="group bg-slate-800/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <ChevronLeft className="w-5 h-5 rotate-180 text-indigo-400" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                                            {comm.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{comm.name}</h3>
                                            <p className="text-xs text-slate-400 font-mono">{comm.memberCount} members</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm line-clamp-2 mb-4">{comm.description}</p>
                                    <div className="flex items-center gap-2 mt-auto">
                                        {comm.isJoined ? (
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">Joined</span>
                                        ) : (
                                            <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md border border-indigo-400/20">View</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View: Community Feed */}
                    {view === 'community' && (
                        <div>
                            {/* Create Post Interface */}
                            {activeCommunity?.isJoined ? (
                                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-8 focus-within:ring-2 ring-indigo-500/50 transition-all">
                                    <input
                                        className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-500 mb-4 border-b border-white/10 pb-2 outline-none"
                                        placeholder="Give your topic a title..."
                                        value={newPostTitle}
                                        onChange={e => setNewPostTitle(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full bg-transparent text-slate-300 placeholder-slate-500 min-h-[100px] outline-none resize-none"
                                        placeholder={`Start a discussion in ${activeCommunity.name}...`}
                                        value={newPostContent}
                                        onChange={e => setNewPostContent(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                        <p className="text-xs text-slate-500">Profanity is filtered automatically.</p>
                                        <button
                                            onClick={handleCreatePost}
                                            disabled={creatingPost || !newPostTitle || !newPostContent}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            {creatingPost ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-800/30 border border-white/5 p-6 rounded-2xl mb-8 text-center">
                                    <p className="text-slate-400 mb-4">Join <strong>{activeCommunity.name}</strong> to start posting and commenting.</p>
                                    <button onClick={() => handleJoin(activeCommunity)} className="text-indigo-400 font-bold hover:underline">Join Now</button>
                                </div>
                            )}

                            {/* Feed */}
                            <div className="space-y-6">
                                {loading && posts.length === 0 ? (
                                    <div className="text-center py-20 opacity-50"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600"><MessageSquare className="w-8 h-8" /></div>
                                        <p className="text-slate-500">No discussions yet. Be the first!</p>
                                    </div>
                                ) : posts.map(post => (
                                    <div key={post.id} className="bg-slate-800/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                                                    {(post.user.name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg leading-tight">{post.title}</h4>
                                                    <p className="text-xs text-slate-400">
                                                        <span className="font-semibold text-emerald-400">{post.user.name || 'Anonymous'}</span> • {new Date(post.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                                        <div className="flex items-center gap-4 mb-4">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${post.likes.length > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${post.likes.length > 0 ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-bold">{post._count.likes}</span>
                                            </button>
                                            <button
                                                onClick={() => toggleComments(post.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${expandedPostId === post.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="text-sm font-bold">{post._count.comments}</span>
                                            </button>
                                        </div>

                                        {/* Comment Section */}
                                        {expandedPostId === post.id && (
                                            <div className="border-t border-white/5 pt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                                {loadingComments ? (
                                                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {postComments.map((comment: any) => (
                                                            <div key={comment.id} className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="font-bold text-emerald-400 text-sm">{comment.user.name}</span>
                                                                    <span className="text-xs text-slate-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
                                                            </div>
                                                        ))}
                                                        {postComments.length === 0 && <p className="text-slate-500 text-sm text-center italic">No comments yet.</p>}

                                                        <div className="flex gap-2 mt-4">
                                                            <input
                                                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                                                placeholder="Add a comment..."
                                                                value={newComment}
                                                                onChange={e => setNewComment(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                            />
                                                            <button
                                                                onClick={() => handleAddComment(post.id)}
                                                                disabled={!newComment.trim()}
                                                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Sidebar (Members) */}
                <aside className="hidden xl:block p-8 border-l border-white/5 bg-slate-900/30 sticky top-0 h-screen overflow-y-auto">
                    {view === 'community' && activeCommunity ? (
                        <div className="mt-20">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Members
                            </h3>
                            <div className="space-y-4">
                                {Array.isArray(members) && members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                                            {(member.name || member.email || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                {member.name || member.email?.split('@')[0] || 'Unknown User'}
                                                {member.id === activeCommunity.creatorId && (
                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono uppercase tracking-wide">
                                                        Admin
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 capitalize">{member.role?.toLowerCase() || 'member'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-20">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Hash className="w-5 h-5 text-indigo-400" />
                                Trending Topics
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-slate-800/50 h-16 rounded-xl w-full"></div>
                                ))}
                                <p className="text-xs text-slate-500 pt-4 text-center">Select a community to view members.</p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Create Community Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-white mb-6">Create Community</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Name</label>
                                <input
                                    className="w-full bg-slate-800 text-white p-3 rounded-xl border border-white/10 focus:border-indigo-500 outline-none transition-colors"
                                    placeholder="e.g. React Developers"
                                    value={newCommName}
                                    onChange={e => setNewCommName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                                <textarea
                                    className="w-full bg-slate-800 text-white p-3 rounded-xl border border-white/10 focus:border-indigo-500 outline-none transition-colors min-h-[100px]"
                                    placeholder="What is this community about?"
                                    value={newCommDesc}
                                    onChange={e => setNewCommDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 font-bold text-slate-300 hover:bg-white/5 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCommunity}
                                disabled={creatingComm || !newCommName}
                                className="flex-1 py-3 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
                            >
                                {creatingComm ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityView;
