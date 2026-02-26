import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LandingPage() {
    const { user } = useAuth();

    // If user is already logged in, redirect to dashboard
    // if (user) {
    //     return <Navigate to="/dashboard" replace />;
    // }

    return (
        <div className="dashboard-layout"> {/* Reusing layout structure for consistency */}
            <nav className="dashboard-nav">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Logo />
                </Link>
                <div>
                    <Link to="/login" className="btn btn-secondary" style={{ marginRight: '10px' }}>Log In</Link>
                    <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </div>
            </nav>

            <header className="landing-hero">
                <h1 className="hero-title">
                    Real-time collaboration,<br />
                    simplified.
                </h1>
                <p className="hero-subtitle">
                    Create, edit, and share documents with your team in real-time.
                    Experience seamless synchronization and a distraction-free writing environment.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1.1rem', borderRadius: '2rem' }}>
                        Get Started for Free
                    </Link>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2.5rem', fontSize: '1.1rem', borderRadius: '2rem' }}>
                        Live Demo
                    </Link>
                </div>

                <div style={{ marginTop: '4rem', animation: 'float 3s ease-in-out infinite', opacity: 0.5 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>
            </header>

            <section className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3 className="feature-title">Lightning Fast</h3>
                    <p className="feature-text">
                        Powered by Redis and WebSockets, changes are synced instantly across all connected devices.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3 className="feature-title">Secure & Private</h3>
                    <p className="feature-text">
                        Your documents are safe with us. We use industry-standard encryption and secure authentication.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">✨</div>
                    <h3 className="feature-title">Modern Design</h3>
                    <p className="feature-text">
                        A clean, distraction-free interface that helps you focus on what maintains most: your content.
                    </p>
                </div>
            </section>

            <footer style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>© 2026 SyncSphereDocs. Built with React, Node, and Redis.</p>
            </footer>
        </div>
    );
}
