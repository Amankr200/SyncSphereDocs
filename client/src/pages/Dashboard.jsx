import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await api.get('/documents');
                setDocuments(res.data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchDocs();
    }, []);

    const createNewDocument = async () => {
        try {
            const res = await api.post('/documents', { title: 'Untitled Document' });
            navigate(`/documents/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create document", err);
        }
    };

    const deleteDocument = async (e, id) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(doc => doc._id !== id));
        } catch (err) {
            console.error("Failed to delete document", err);
            alert("Failed to delete document");
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <span>📄</span> SyncSphereDocs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.name}</span>
                    <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Logout</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2 className="section-title">My Documents</h2>
                    <button onClick={createNewDocument} className="btn btn-primary">
                        + New Document
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <p>No documents yet.</p>
                        <button onClick={createNewDocument} className="btn btn-primary" style={{ marginTop: '1rem' }}>Create your first doc</button>
                    </div>
                ) : (
                    <div className="documents-grid">
                        {documents.map(doc => (
                            <Link key={doc._id} to={`/documents/${doc._id}`} className="doc-card">
                                <div className="doc-preview">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                                    </svg>
                                </div>
                                <div className="doc-info" style={{ width: '100%', position: 'relative' }}>
                                    <h4>{doc.title || 'Untitled Document'}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <p>Last edited: {new Date(doc.updatedAt).toLocaleDateString()}</p>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => deleteDocument(e, doc._id)}
                                            title="Delete Document"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
