import React from 'react';

const Logo = ({ size = 32, showText = true, className = "" }) => {
    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700', fontSize: '1.25rem' }}>
            <img
                src="/syncsphere.svg"
                alt="SyncSphereDocs Logo"
                style={{ width: size, height: size, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
            {showText && <span style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SyncSphereDocs</span>}
        </div>
    );
};

export default Logo;
