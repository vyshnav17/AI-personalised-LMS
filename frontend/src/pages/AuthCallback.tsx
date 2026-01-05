import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // We might need to fetch user details here if not provided in token, 
            // but for now we trust the token and redirect.
            // Ideally we should decode the token or fetch /profile to get user info 
            // and store it in localStorage as 'user' to match existing logic.

            // For now, let's fetch profile or just decode if possible, 
            // but simpler: redirect to dashboard, dashboard usually fetches profile if missing?
            // Existing Login.tsx sets 'user' in localStorage. 
            // Let's try to decode or just fetch profile in a separate step?
            // Or just redirect and let Dashboard handle it?
            // Let's refactor Dashboard to fetch profile if user is missing but token exists?
            // Or better: fetch profile here.

            fetchUserProfile(token);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetch('http://localhost:3000/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
            <div className="text-white text-xl">Completing login...</div>
        </div>
    );
};

export default AuthCallback;
