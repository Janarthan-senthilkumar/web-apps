import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Topbar({ title }) {
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);

    const fetchNotifs = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnread(res.data.unreadCount || 0);
        } catch { }
    };

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 15000);
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        fetchNotifs();
    };

    const markAllRead = async () => {
        await api.put('/notifications/read-all');
        fetchNotifs();
    };

    return (
        <div className="topbar" style={{ justifyContent: 'space-between', gap: 16 }}>
            <div>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        style={{ position: 'relative', padding: 8, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', display: 'flex' }}
                    >
                        <Bell size={18} color="var(--text-light)" />
                        {unread > 0 && (
                            <span style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#ef4444', border: '2px solid white'
                            }} />
                        )}
                    </button>

                    {notifOpen && (
                        <div style={{
                            position: 'absolute', right: 0, top: '110%', width: 340,
                            background: 'white', borderRadius: 14, border: '1px solid var(--border)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications {unread > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '9999px', padding: '1px 7px', fontSize: '0.72rem' }}>{unread}</span>}</span>
                                {unread > 0 && <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                            </div>
                            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications</div>
                                ) : notifications.map(n => (
                                    <div
                                        key={n._id}
                                        onClick={() => markRead(n._id)}
                                        style={{
                                            padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                                            background: n.isRead ? 'white' : '#f0f0ff', transition: 'background 0.15s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.4 }}>{n.message}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User avatar */}
                <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
}
