import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const FollowUpsPage = () => {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    leadId: "",
    dueDate: "",
    type: "CALL",
    notes: ""
  });
  const [error, setError] = useState("");

  const loadFollowUps = async () => {
    try {
      const response = await apiClient.get("/followups");
      setFollowUps(response.data.followUps || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load follow-ups");
    }
  };

  const loadLeads = async () => {
    try {
      const response = await apiClient.get("/leads", { params: { limit: 100 } });
      setLeads(response.data.leads || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    }
  };

  useEffect(() => {
    loadFollowUps();
    loadLeads();
  }, []);

  const handleSchedule = async (event) => {
    event.preventDefault();

    if (!form.leadId || !form.dueDate) {
      setError("Lead and due date are required.");
      return;
    }

    try {
      await apiClient.post("/followups", {
        leadId: form.leadId,
        dueDate: form.dueDate,
        type: form.type,
        notes: form.notes
      });
      setForm({ leadId: "", dueDate: "", type: "CALL", notes: "" });
      loadFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule follow-up");
    }
  };

  const markCompleted = async (id) => {
    try {
      await apiClient.patch(`/followups/${id}/complete`, { outcome: "Completed successfully" });
      loadFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete follow-up");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>Follow-Up Scheduler</h2>
        <button className="button secondary" type="button" onClick={loadFollowUps}>
          Refresh
        </button>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="card">
        <h3>Schedule Follow-Up</h3>
        <form className="form-grid compact" onSubmit={handleSchedule}>
          <label>
            Lead
            <select value={form.leadId} onChange={(e) => setForm((prev) => ({ ...prev, leadId: e.target.value }))} required>
              <option value="">Select lead</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.fullName} ({lead.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Due Date
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
              <option value="CALL">CALL</option>
              <option value="EMAIL">EMAIL</option>
              <option value="MEETING">MEETING</option>
              <option value="DEMO">DEMO</option>
            </select>
          </label>
          <label className="wide">
            Notes
            <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </label>
          <button type="submit" className="button primary">
            Create Follow-Up
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Follow-Up Queue</h3>
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Assignee</th>
              <th>Type</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {followUps.length === 0 && (
              <tr>
                <td colSpan={6}>No follow-ups found.</td>
              </tr>
            )}
            {followUps.map((item) => (
              <tr key={item._id}>
                <td>{item.lead?.fullName || "-"}</td>
                <td>{item.assignedTo?.name || "-"}</td>
                <td>{item.type}</td>
                <td>{new Date(item.dueDate).toLocaleString()}</td>
                <td>{item.status}</td>
                <td>
                  {item.status !== "COMPLETED" ? (
                    <button className="button tiny" type="button" onClick={() => markCompleted(item._id)}>
                      Mark Done
                    </button>
                  ) : (
                    <span>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default FollowUpsPage;
