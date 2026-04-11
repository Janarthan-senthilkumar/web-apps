import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    HiOutlineExclamationCircle,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineCurrencyDollar,
    HiOutlineRefresh,
    HiOutlineTrendingUp,
} from 'react-icons/hi';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatINR } from '../utils/currency';

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e'];

function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics');
            setData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading analytics..." />;
    if (!data) return <div className="empty-state"><p>Failed to load analytics data.</p></div>;

    const pieData = [
        { name: 'Pending', value: data.statusDistribution.pending },
        { name: 'Approved', value: data.statusDistribution.approved },
        { name: 'Rejected', value: data.statusDistribution.rejected },
        { name: 'Replaced', value: data.statusDistribution.replaced },
    ].filter(d => d.value > 0);

    const categoryData = (data.damageByCategory || []).map(item => ({
        category: item.category || 'Unknown',
        count: parseInt(item.count),
    }));

    const trendData = (data.monthlyTrend || []).map(item => ({
        month: item.month,
        damages: parseInt(item.count),
    }));

    const costData = (data.monthlyCost || []).map(item => ({
        month: item.month,
        cost: parseFloat(item.total_cost),
        replacements: parseInt(item.count),
    }));

    const customTooltipStyle = {
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'var(--color-text-primary)',
        fontSize: '0.82rem',
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics Dashboard</h1>
                    <p className="page-subtitle">Comprehensive insights into damage and replacement trends</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <div className="stat-icon danger"><HiOutlineExclamationCircle /></div>
                    </div>
                    <div className="stat-value">{data.totalReports}</div>
                    <div className="stat-label">Total Damage Reports</div>
                </div>
                <div className="stat-card info">
                    <div className="stat-header">
                        <div className="stat-icon info"><HiOutlineCheckCircle /></div>
                    </div>
                    <div className="stat-value">{data.totalApproved}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: 'var(--color-danger)' }} />
                    <div className="stat-header">
                        <div className="stat-icon danger"><HiOutlineXCircle /></div>
                    </div>
                    <div className="stat-value">{data.totalRejected}</div>
                    <div className="stat-label">Rejected</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-header">
                        <div className="stat-icon success"><HiOutlineRefresh /></div>
                    </div>
                    <div className="stat-value">{data.totalReplacements}</div>
                    <div className="stat-label">Total Replacements</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-header">
                        <div className="stat-icon warning"><HiOutlineCurrencyDollar /></div>
                    </div>
                    <div className="stat-value">{formatINR(data.totalReplacementCost)}</div>
                    <div className="stat-label">Total Cost</div>
                </div>
                {data.mostDamagedItem && (
                    <div className="stat-card primary">
                        <div className="stat-header">
                            <div className="stat-icon primary"><HiOutlineTrendingUp /></div>
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{data.mostDamagedItem.name}</div>
                        <div className="stat-label">Most Damaged ({data.mostDamagedItem.count} reports)</div>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts-grid">
                {/* Bar Chart — Damage by Category */}
                <div className="section-card analytics-chart-card">
                    <div className="section-header">
                        <h2 className="section-title">Damage by Category</h2>
                    </div>
                    <div className="section-body" style={{ height: '320px' }}>
                        {categoryData.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '100px' }}>No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="category" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={customTooltipStyle} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Damages" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Pie Chart — Status Distribution */}
                <div className="section-card analytics-chart-card">
                    <div className="section-header">
                        <h2 className="section-title">Status Distribution</h2>
                    </div>
                    <div className="section-body" style={{ height: '320px' }}>
                        {pieData.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '100px' }}>No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={55}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={customTooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Line Chart — Monthly Damage Trend */}
                <div className="section-card analytics-chart-card">
                    <div className="section-header">
                        <h2 className="section-title">Monthly Damage Trend</h2>
                    </div>
                    <div className="section-body" style={{ height: '320px' }}>
                        {trendData.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '100px' }}>No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip contentStyle={customTooltipStyle} />
                                    <Line type="monotone" dataKey="damages" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Damages" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Line Chart — Cost Analysis per Month */}
                <div className="section-card analytics-chart-card">
                    <div className="section-header">
                        <h2 className="section-title">Monthly Cost Analysis</h2>
                    </div>
                    <div className="section-body" style={{ height: '320px' }}>
                        {costData.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '100px' }}>No data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={costData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                    <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [formatINR(value), 'Cost']} />
                                    <Line type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Cost (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
