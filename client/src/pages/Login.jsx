import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { user, login, register } = useAuth();
    const [error, setError] = useState('');

    if (user) return <Navigate to="/dashboard" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.username, formData.email, formData.password);
            }
        } catch (err) {
            console.error('Auth Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Authentication failed. Please check your connection.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-accent-blob"></div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <div className="bg-indigo-500/20 p-4 rounded-2xl">
                        <LogIn className="text-indigo-500" size={32} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-dim text-center mb-8">
                    {isLogin ? 'Enter your details to access your workspace' : 'Join us and start managing your projects'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    {error && <p className="text-danger text-sm">{error}</p>}
                    <button type="submit" className="premium-btn w-full flex items-center justify-center gap-2">
                        {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-dim">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline font-medium"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
