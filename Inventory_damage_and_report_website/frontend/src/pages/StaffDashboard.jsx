import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineExclamationCircle, HiOutlinePlusCircle, HiOutlineClipboardList } from 'react-icons/hi';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import ImageWithFallback from '../components/ImageWithFallback';
import { generateDynamicDescription } from '../utils/descriptionGenerator';

function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [myReports, setMyReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, reportsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/damages', { params: { limit: 5 } }),
            ]);
            setStats(statsRes.data.data);
            setMyReports(reportsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name || 'Staff'}</h1>
                    <p className="page-subtitle">Staff Dashboard — Report and track damaged inventory</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <Link to="/damages/add" className="quick-action-card">
                    <div className="quick-action-icon primary"><HiOutlinePlusCircle /></div>
                    <div className="quick-action-text">
                        <strong>Report Damage</strong>
                        <span>Submit a new damage report</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
                <Link to="/inventory" className="quick-action-card">
                    <div className="quick-action-icon success"><HiOutlineCube /></div>
                    <div className="quick-action-text">
                        <strong>View Inventory</strong>
                        <span>Browse all inventory items</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
                <Link to="/damages" className="quick-action-card">
                    <div className="quick-action-icon warning"><HiOutlineClipboardList /></div>
                    <div className="quick-action-text">
                        <strong>My Reports</strong>
                        <span>View your damage reports</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="stat-card primary">
                        <div className="stat-header">
                            <div className="stat-icon primary"><HiOutlineCube /></div>
                        </div>
                        <div className="stat-value">{stats.totalInventory}</div>
                        <div className="stat-label">Inventory Items</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-header">
                            <div className="stat-icon warning"><HiOutlineExclamationCircle /></div>
                        </div>
                        <div className="stat-value">{stats.statusDistribution?.pending || 0}</div>
                        <div className="stat-label">Pending Reports</div>
                    </div>
                </div>
            )}

            {/* My Recent Reports */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">My Recent Reports</h2>
                    <Link to="/damages" className="btn btn-ghost btn-sm">
                        View All <HiOutlineArrowRight />
                    </Link>
                </div>
                <div className="section-body">
                    {myReports.length === 0 ? (
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                            No reports yet. <Link to="/damages/add">Submit your first report</Link>
                        </p>
                    ) : (
                        myReports.map((report) => (
                            <div key={report.id} className="recent-item">
                                {report.inventory?.image_path ? (
                                    <ImageWithFallback src={report.inventory.image_path} alt="" className="recent-item-img" keyword={`${report.inventory.name} damaged`} />
                                ) : (
                                    <div className="recent-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
                                        <HiOutlineCube />
                                    </div>
                                )}
                                <div className="recent-item-info">
                                    <div className="recent-item-name">{report.inventory?.name || 'Unknown Item'}</div>
                                    <div className="recent-item-desc" title={generateDynamicDescription(report.inventory?.name, report.damage_description)}>
                                        {generateDynamicDescription(report.inventory?.name, report.damage_description)}
                                    </div>
                                </div>
                                <StatusBadge status={report.status} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaffDashboard;
