import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BorderGlow from '../components/BorderGlow';
import './Auth.css';

export default function Auth() {
    const [[isLogin, direction], setPage] = useState([true, 1]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const cardRef = useRef(null);
    const containerRef = useRef(null);
    const shineRef = useRef(null);
    const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, shineX: 50, shineY: 50 });
    const rafRef = useRef(null);
    const { login, signup, loginWithGoogle, isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from || '/menu';

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTo]);

    // Smooth 60fps tilt animation loop
    const animateTilt = useCallback(() => {
        const t = tiltRef.current;
        const lerp = 0.08;
        t.x += (t.targetX - t.x) * lerp;
        t.y += (t.targetY - t.y) * lerp;

        if (cardRef.current) {
            cardRef.current.style.transform =
                `perspective(1000px) rotateX(${t.y}deg) rotateY(${t.x}deg) scale3d(1.01, 1.01, 1.01)`;
        }
        if (shineRef.current) {
            const sx = t.shineX;
            const sy = t.shineY;
            shineRef.current.style.background =
                `radial-gradient(circle at ${sx}% ${sy}%, rgba(232,101,43,0.18), transparent 60%)`;
        }

        rafRef.current = requestAnimationFrame(animateTilt);
    }, []);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(animateTilt);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [animateTilt]);

    // 3D tilt effect on mouse move
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        tiltRef.current.targetX = x * 6;
        tiltRef.current.targetY = y * -6;
        tiltRef.current.shineX = ((e.clientX - rect.left) / rect.width) * 100;
        tiltRef.current.shineY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const handleMouseLeave = () => {
        tiltRef.current.targetX = 0;
        tiltRef.current.targetY = 0;
        tiltRef.current.shineX = 50;
        tiltRef.current.shineY = 50;
    };

    const handleToggle = () => {
        setPage([!isLogin, isLogin ? -1 : 1]);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const formVariants = {
        hidden: (direction) => ({
            opacity: 0,
            x: direction > 0 ? -50 : 50,
            filter: 'blur(10px)',
            scale: 0.95
        }),
        visible: {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: { type: 'spring', stiffness: 350, damping: 30 }
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? 50 : -50,
            filter: 'blur(10px)',
            scale: 0.95,
            transition: { duration: 0.2, ease: 'easeIn' }
        })
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const result = login(email, password);
        if (result.success) {
            addToast('Welcome back! 👋', 'success');
            navigate(redirectTo, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleSignup = (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = signup(name, email, password);
        if (result.success) {
            addToast('Account created successfully! 🎉', 'success');
            navigate(redirectTo, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const handleGoogleSignIn = () => {
        // Simulated Google sign-in
        const mockGoogleUser = {
            name: 'Student User',
            email: 'student@university.edu',
        };
        const result = loginWithGoogle(mockGoogleUser);
        if (result.success) {
            addToast('Signed in with Google! 🚀', 'success');
            navigate(redirectTo, { replace: true });
        }
    };

    return (
        <div className="auth-page page-enter">
            {/* Floating Particles */}
            <div className="auth-particles">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="auth-particle"
                        style={{
                            '--delay': `${Math.random() * 5}s`,
                            '--duration': `${8 + Math.random() * 12}s`,
                            '--x-start': `${Math.random() * 100}%`,
                            '--y-start': `${Math.random() * 100}%`,
                            '--size': `${3 + Math.random() * 6}px`,
                            '--opacity': `${0.1 + Math.random() * 0.3}`,
                        }}
                    />
                ))}
            </div>

            {/* Glowing Orbs */}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />

            <div
                className="auth-container"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* 3D Card */}
                <motion.div
                    className="auth-card-3d"
                    ref={cardRef}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.8 }}
                >
                    {/* Card Shine Effect — follows cursor */}
                    <div className="card-shine" ref={shineRef} />

                    <BorderGlow
                        className="auth-border-glow"
                        glowColor="20 85 55"
                        backgroundColor="rgba(30, 25, 21, 0.92)"
                        borderRadius={20}
                        glowRadius={35}
                        glowIntensity={1.2}
                        coneSpread={30}
                        edgeSensitivity={25}
                        colors={['#e8652b', '#f5a623', '#c4481a']}
                        fillOpacity={0.4}
                    >
                    <motion.div className="auth-card-inner" layout>
                        {/* Header */}
                        <div className="auth-card-header">
                            <motion.div
                                className="auth-logo"
                                animate={{ rotateY: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
                            >
                                ☕
                            </motion.div>
                            <h1 className="auth-title">
                                <span className="auth-chai">चाय</span> ADDA
                            </h1>
                            <p className="auth-subtitle">
                                {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
                            </p>
                        </div>

                        {/* Form */}
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.form
                                key={isLogin ? 'login' : 'signup'}
                                custom={direction}
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="auth-form"
                                layout
                                onSubmit={isLogin ? handleLogin : handleSignup}
                            >
                                {!isLogin && (
                                    <div className="auth-field">
                                        <label htmlFor="auth-name">Full Name</label>
                                        <div className="auth-input-wrap">
                                            <span className="auth-input-icon">👤</span>
                                            <input
                                                id="auth-name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                autoComplete="name"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="auth-field">
                                    <label htmlFor="auth-email">University Email</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon">📧</span>
                                        <input
                                            id="auth-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="yourname@university.edu"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="auth-password">Password</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon">🔒</span>
                                        <input
                                            id="auth-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
                                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                                        />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div className="auth-field">
                                        <label htmlFor="auth-confirm-password">Confirm Password</label>
                                        <div className="auth-input-wrap">
                                            <span className="auth-input-icon">🔐</span>
                                            <input
                                                id="auth-confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            className="auth-error"
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                        >
                                            <span>⚠️</span> {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    className="auth-submit-btn cursor-target"
                                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(232, 101, 43, 0.5)' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLogin ? 'Sign In →' : 'Create Account →'}
                                </motion.button>

                                {/* Divider */}
                                <div className="auth-divider">
                                    <span>or continue with</span>
                                </div>

                                {/* Google */}
                                <motion.button
                                    type="button"
                                    className="auth-google-btn cursor-target"
                                    onClick={handleGoogleSignIn}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Google (University Account)</span>
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>

                        {/* Toggle */}
                        <div className="auth-toggle">
                            <span>
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            </span>
                            <button
                                type="button"
                                className="auth-toggle-btn cursor-target"
                                onClick={handleToggle}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </motion.div>
                    </BorderGlow>
                </motion.div>
            </div>
        </div>
    );
}
