import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:3000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
};

export const courses = {
    generate: (prompt: string) => api.post('/courses/generate', { prompt }),
    getAll: () => api.get('/courses'),
    getOne: (id: string) => api.get(`/courses/${id}`),
    delete: (id: string) => api.delete(`/courses/${id}`),
    generateLesson: (courseId: string, lessonId: string) => api.post(`/courses/${courseId}/lessons/${lessonId}/generate`),
};

export const tutor = {
    chat: (message: string, context: string) => api.post('/tutor/chat', { message, context }),
};

export const exams = {
    submit: (courseId: string, answers: Record<string, string>, questions: any[]) => api.post('/exams/submit', { courseId, answers, questions }),
    generate: (courseId: string) => api.post('/exams/generate', { courseId }),
    get: (id: string) => api.get(`/exams/${id}`),
};

export const certificates = {
    generate: (data: { courseId: string; userId: string; userName: string; courseTitle: string }) =>
        api.post('/certificates/generate', data, { responseType: 'blob' }),
};

export const community = {
    createPost: (title: string, content: string, communityId?: string, courseId?: string) => api.post('/community/posts', { title, content, communityId, courseId }),
    getPosts: (courseId?: string, communityId?: string) => api.get('/community/posts', { params: { courseId, communityId } }),
    getPost: (id: string) => api.get(`/community/posts/${id}`),
    addComment: (postId: string, content: string) => api.post(`/community/posts/${postId}/comments`, { content }),
    toggleLike: (postId: string) => api.post(`/community/posts/${postId}/like`),

    // New Endpoints
    createCommunity: (name: string, description: string) => api.post('/community', { name, description }),
    getCommunities: () => api.get('/community'), // Returns list of communities with isJoined flag
    joinCommunity: (id: string) => api.post(`/community/${id}/join`),
    leaveCommunity: (id: string) => api.delete(`/community/${id}/leave`),
    deleteCommunity: (id: string) => api.delete(`/community/${id}`),
    getMembers: (id: string) => api.get(`/community/${id}/members`),
};

export const profile = {
    get: () => api.get('/profile'),
    update: (data: { difficulty?: string; pacing?: string; interests?: string[] }) => api.put('/profile', data),
};

export const attendance = {
    heartbeat: (courseId: string) => api.post('/attendance/heartbeat', { courseId }),
    getStats: () => api.get('/attendance/stats'),
};

export const gamification = {
    getStats: () => api.get('/gamification/stats'),
    getLeaderboard: () => api.get('/gamification/leaderboard'),
};

export default api;
