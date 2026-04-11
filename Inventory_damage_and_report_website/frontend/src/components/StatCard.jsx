import React from 'react';

/**
 * A reusable statistical card component for dashboards.
 */
export default function StatCard({ title, value, icon, colorClass }) {
    return (
        <div className={`stat-card ${colorClass || ''}`}>
            <div className="stat-header">
                <div className={`stat-icon ${colorClass || ''}`}>
                    {icon}
                </div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
        </div>
    );
}
