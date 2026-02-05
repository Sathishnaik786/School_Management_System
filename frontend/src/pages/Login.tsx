import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Home, Sparkles } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/public-constants';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/app/dashboard';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // AuthProvider will pick up the session change and fetch profile
            navigate(redirect);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Left Panel - Decorative */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-hero-gradient lg:h-screen lg:sticky lg:top-0 overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-hero-pattern opacity-20" />

                {/* Animated Floating Shapes */}
                <div className="absolute top-20 right-20 w-72 h-72 lg:w-60 lg:h-60 xl:w-72 xl:h-72 bg-gold/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-20 left-20 w-96 h-96 lg:w-72 lg:h-72 xl:w-96 xl:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 lg:w-48 lg:h-48 xl:w-64 xl:h-64 bg-gold/10 rounded-full blur-2xl animate-pulse"
                    style={{ animationDuration: '5s', animationDelay: '2s' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white h-full">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-center"
                    >
                        {/* Logo/Icon */}
                        <div className="mb-8 relative">
                            <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <GraduationCap className="w-16 h-16 text-gold" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold rounded-full animate-ping" />
                            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/40 rounded-full" />
                        </div>

                        {/* Text Content */}
                        <h1 className="font-display text-4xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                            Excellence in<br />
                            <span className="text-gold">Education</span>
                        </h1>
                        <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
                            Empowering 5000+ students to reach their full potential.
                        </p>

                        {/* Features */}
                        <div className="space-y-4 max-w-sm mx-auto">
                            {[
                                'Real-time Academic Tracking',
                                'Secure Fee Payments',
                                'Instant Notifications'
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-center gap-3 text-white/90"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-gold" />
                                    </div>
                                    <span className="text-left font-medium text-sm lg:text-base">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 relative min-h-screen">
                {/* Back to Home Button */}
                <Link
                    to="/"
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-10 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors group z-50"
                >
                    <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Back to Home</span>
                </Link>

                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md lg:max-w-md xl:max-w-md mx-auto relative z-10"
                >
                    {/* Glass Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 lg:p-8 xl:p-10">
                        {/* Header */}
                        <div className="text-center mb-8 lg:mb-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-block mb-4 lg:mb-2 lg:hidden xl:inline-block"
                            >
                                <div className="w-16 h-16 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Lock className="w-8 h-8 lg:w-6 lg:h-6 text-gold" />
                                </div>
                            </motion.div>
                            <h2 className="font-display text-3xl lg:text-2xl xl:text-3xl font-bold text-primary mb-2">
                                Sign In
                            </h2>
                            <p className="text-slate-600 lg:text-sm xl:text-base">
                                Access your school management dashboard
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 lg:mb-4 rounded-xl border border-red-200 bg-red-50 p-4 lg:p-3 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6 lg:space-y-3 xl:space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 lg:mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 lg:w-4 lg:h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 lg:py-2.5 xl:py-3.5 rounded-xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all placeholder:text-slate-400 text-slate-900 lg:text-sm xl:text-base"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 lg:mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 lg:w-4 lg:h-4 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 lg:py-2.5 xl:py-3.5 rounded-xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all placeholder:text-slate-400 text-slate-900 lg:text-sm xl:text-base"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-gold focus:ring-2"
                                    />
                                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <a href="#" className="text-primary hover:text-gold transition-colors font-medium">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="w-full bg-gradient-to-r from-primary to-primary/90 text-white font-semibold py-4 lg:py-3 xl:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <span className="relative">
                                    {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                                </span>
                                {!loading && (
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                                )}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 lg:mt-5 xl:mt-8 pt-6 lg:pt-4 xl:pt-6 border-t border-slate-200">
                            <p className="text-center text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/admissions" className="text-primary hover:text-gold font-semibold transition-colors">
                                    Apply for Admission
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Note */}
                    <p className="text-center text-xs text-slate-500 mt-6 lg:mt-4">
                        Protected by enterprise-grade security
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
