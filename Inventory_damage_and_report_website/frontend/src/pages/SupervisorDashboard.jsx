import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineCube,
    HiOutlineExclamationCircle,
    HiOutlineRefresh,
    HiOutlineCurrencyDollar,
    HiOutlineChartBar,
    HiOutlineClipboardCheck,
} from 'react-icons/hi';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatINR } from '../utils/currency';
import ImageWithFallback from '../components/ImageWithFallback';
import { generateDynamicDescription } from '../utils/descriptionGenerator';

function SupervisorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading dashboard..." />;
    if (!stats) return <div className="empty-state"><p>Failed to load dashboard data.</p></div>;

    const maxStatus = Math.max(
        stats.statusDistribution.pending,
        stats.statusDistribution.approved,
        stats.statusDistribution.rejected || 0,
        stats.statusDistribution.replaced,
        1
    );

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name || 'Supervisor'}</h1>
                    <p className="page-subtitle">Supervisor Dashboard — Manage and oversee operations</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <Link to="/damages" className="quick-action-card">
                    <div className="quick-action-icon warning"><HiOutlineClipboardCheck /></div>
                    <div className="quick-action-text">
                        <strong>Review Queue</strong>
                        <span>{stats.statusDistribution.pending} pending reports</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
                <Link to="/analytics" className="quick-action-card">
                    <div className="quick-action-icon primary"><HiOutlineChartBar /></div>
                    <div className="quick-action-text">
                        <strong>Analytics</strong>
                        <span>View reports & insights</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
                <Link to="/replacements" className="quick-action-card">
                    <div className="quick-action-icon success"><HiOutlineRefresh /></div>
                    <div className="quick-action-text">
                        <strong>Replacements</strong>
                        <span>{stats.totalReplacements} total records</span>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-header">
                        <div className="stat-icon primary"><HiOutlineCube /></div>
                    </div>
                    <div className="stat-value">{stats.totalInventory}</div>
                    <div className="stat-label">Total Inventory Items</div>
                </div>

                <div className="stat-card danger">
                    <div className="stat-header">
                        <div className="stat-icon danger"><HiOutlineExclamationCircle /></div>
                    </div>
                    <div className="stat-value">{stats.totalDamaged}</div>
                    <div className="stat-label">Damage Reports</div>
                </div>

                <div className="stat-card success">
                    <div className="stat-header">
                        <div className="stat-icon success"><HiOutlineRefresh /></div>
                    </div>
                    <div className="stat-value">{stats.totalReplacements}</div>
                    <div className="stat-label">Replacements Made</div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-header">
                        <div className="stat-icon warning"><HiOutlineCurrencyDollar /></div>
                    </div>
                    <div className="stat-value">{formatINR(stats.totalReplacementCost)}</div>
                    <div className="stat-label">Total Replacement Cost</div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Status Distribution */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">Status Distribution</h2>
                    </div>
                    <div className="section-body">
                        <div className="status-bars">
                            <div className="status-bar-item">
                                <span className="status-bar-label" style={{ color: 'var(--color-pending)' }}>Pending</span>
                                <div className="status-bar-track">
                                    <div className="status-bar-fill pending" style={{ width: `${(stats.statusDistribution.pending / maxStatus) * 100}%` }} />
                                </div>
                                <span className="status-bar-count">{stats.statusDistribution.pending}</span>
                            </div>
                            <div className="status-bar-item">
                                <span className="status-bar-label" style={{ color: 'var(--color-approved)' }}>Approved</span>
                                <div className="status-bar-track">
                                    <div className="status-bar-fill approved" style={{ width: `${(stats.statusDistribution.approved / maxStatus) * 100}%` }} />
                                </div>
                                <span className="status-bar-count">{stats.statusDistribution.approved}</span>
                            </div>
                            <div className="status-bar-item">
                                <span className="status-bar-label" style={{ color: 'var(--color-danger)' }}>Rejected</span>
                                <div className="status-bar-track">
                                    <div className="status-bar-fill rejected" style={{ width: `${((stats.statusDistribution.rejected || 0) / maxStatus) * 100}%` }} />
                                </div>
                                <span className="status-bar-count">{stats.statusDistribution.rejected || 0}</span>
                            </div>
                            <div className="status-bar-item">
                                <span className="status-bar-label" style={{ color: 'var(--color-replaced)' }}>Replaced</span>
                                <div className="status-bar-track">
                                    <div className="status-bar-fill replaced" style={{ width: `${(stats.statusDistribution.replaced / maxStatus) * 100}%` }} />
                                </div>
                                <span className="status-bar-count">{stats.statusDistribution.replaced}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Damage Reports */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">Recent Damage Reports</h2>
                        <Link to="/damages" className="btn btn-ghost btn-sm">
                            View All <HiOutlineArrowRight />
                        </Link>
                    </div>
                    <div className="section-body">
                        {stats.recentDamageReports.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>No damage reports yet.</p>
                        ) : (
                            stats.recentDamageReports.map((report) => (
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
        </div>
    );
}

export default SupervisorDashboard;
