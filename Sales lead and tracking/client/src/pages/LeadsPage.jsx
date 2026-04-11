import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  source: "Manual",
  estimatedValue: 0,
  notes: ""
};

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const canAssign = useMemo(() => ["admin", "manager"].includes(user.role), [user.role]);

  const loadLeads = async () => {
    try {
      const params = {};
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiClient.get("/leads", { params });
      setLeads(response.data.leads || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    }
  };

  const loadUsers = async () => {
    if (!canAssign) {
      return;
    }

    try {
      const response = await apiClient.get("/auth/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load team");
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filters.status]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateLead = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await apiClient.post("/leads", {
        ...form,
        estimatedValue: Number(form.estimatedValue)
      });
      setForm(initialForm);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lead");
    }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      await apiClient.patch(`/leads/${leadId}/status`, { status });
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead status");
    }
  };

  const handleAssign = async (leadId, assignedTo) => {
    try {
      await apiClient.patch(`/leads/${leadId}/assign`, { assignedTo });
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign lead");
    }
  };

  const handleConvert = async (leadId) => {
    try {
      await apiClient.post(`/leads/${leadId}/convert`);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to convert lead");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>Leads Management</h2>
        <button className="button secondary" onClick={loadLeads} type="button">
          Refresh
        </button>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="card">
        <h3>Capture New Lead</h3>
        <form className="form-grid compact" onSubmit={handleCreateLead}>
          <label>
            Full Name
            <input required value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </label>
          <label>
            Company
            <input value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
          </label>
          <label>
            Source
            <input value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))} />
          </label>
          <label>
            Estimated Value
            <input
              type="number"
              min="0"
              value={form.estimatedValue}
              onChange={(e) => setForm((prev) => ({ ...prev, estimatedValue: e.target.value }))}
            />
          </label>
          <label className="wide">
            Notes
            <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </label>

          <button className="button primary" type="submit">
            Create Lead
          </button>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <input
            placeholder="Search by name, email, company"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="button secondary" onClick={loadLeads} type="button">
            Apply Filters
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Company</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={7}>No leads found.</td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.fullName}</td>
                <td>
                  <div>{lead.email || "-"}</div>
                  <small>{lead.phone || "-"}</small>
                </td>
                <td>{lead.company || "-"}</td>
                <td>
                  <select value={lead.status} onChange={(event) => handleStatusChange(lead._id, event.target.value)}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {canAssign ? (
                    <select
                      value={lead.assignedTo?._id || ""}
                      onChange={(event) => handleAssign(lead._id, event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map((teamUser) => (
                        <option key={teamUser._id} value={teamUser._id}>
                          {teamUser.name} ({teamUser.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{lead.assignedTo?.name || "Unassigned"}</span>
                  )}
                </td>
                <td>{"\u20B9"}{Number(lead.estimatedValue || 0).toLocaleString("en-IN")}</td>
                <td>
                  <button className="button tiny" type="button" onClick={() => handleConvert(lead._id)}>
                    Convert
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LeadsPage;


