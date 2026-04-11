import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [report, setReport] = useState({ monthlyConversions: [], executivePerformance: [] });
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const [summaryRes, reportRes] = await Promise.all([
        apiClient.get("/dashboard/summary"),
        apiClient.get("/dashboard/conversion-report")
      ]);

      setSummary(summaryRes.data.summary);
      setActivities(summaryRes.data.latestActivities || []);
      setReport(reportRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>Sales Dashboard</h2>
        <button className="button secondary" type="button" onClick={loadDashboard}>
          Refresh
        </button>
      </section>

      {error && <p className="error-text">{error}</p>}

      {summary && (
        <section className="metric-grid">
          <article className="card metric">
            <h3>Total Leads</h3>
            <p>{summary.totalLeads}</p>
          </article>
          <article className="card metric">
            <h3>Won Leads</h3>
            <p>{summary.wonLeads}</p>
          </article>
          <article className="card metric">
            <h3>Customers</h3>
            <p>{summary.customers}</p>
          </article>
          <article className="card metric">
            <h3>Conversion Rate</h3>
            <p>{summary.conversionRate}%</p>
          </article>
          <article className="card metric">
            <h3>Upcoming Follow-Ups</h3>
            <p>{summary.upcomingFollowUps}</p>
          </article>
          <article className="card metric">
            <h3>Pipeline Value</h3>
            <p>{formatCurrency(summary.totalPipelineValue)}</p>
          </article>
        </section>
      )}

      <section className="two-col">
        <article className="card">
          <h3>Lead Status Breakdown</h3>
          {summary ? (
            <ul className="stack-list">
              {Object.entries(summary.statusBreakdown || {}).map(([status, count]) => (
                <li key={status}>
                  <span>{status}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </article>

        <article className="card">
          <h3>Recent Activity</h3>
          {activities.length === 0 && <p>No activity yet.</p>}
          <ul className="stack-list">
            {activities.map((activity) => (
              <li key={activity._id}>
                <span>
                  {activity.action} by {activity.actor?.name || "System"}
                </span>
                <small>{new Date(activity.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h3>Monthly Lead Conversions</h3>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Converted</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {report.monthlyConversions.length === 0 && (
              <tr>
                <td colSpan={4}>No conversion data available.</td>
              </tr>
            )}
            {report.monthlyConversions.map((row) => (
              <tr key={`${row._id.year}-${row._id.month}`}>
                <td>{row._id.year}</td>
                <td>{row._id.month}</td>
                <td>{row.totalConverted}</td>
                <td>{formatCurrency(row.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Executive Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Leads</th>
              <th>Won Leads</th>
              <th>Conversion Rate</th>
              <th>Pipeline Value</th>
            </tr>
          </thead>
          <tbody>
            {report.executivePerformance.length === 0 && (
              <tr>
                <td colSpan={6}>No performance data available.</td>
              </tr>
            )}
            {report.executivePerformance.map((row, index) => (
              <tr key={row.userId || row.email || `row-${index}`}>
                <td>{row.name || "Unassigned"}</td>
                <td>{row.email || "-"}</td>
                <td>{row.totalLeads}</td>
                <td>{row.wonLeads}</td>
                <td>{Number(row.conversionRate || 0).toFixed(2)}%</td>
                <td>{formatCurrency(row.pipelineValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DashboardPage;


