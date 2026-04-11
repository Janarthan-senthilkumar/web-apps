import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

const createFormInitial = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  value: 0,
  stage: "Onboarding"
};

const interactionInitial = {
  customerId: "",
  interactionType: "NOTE",
  summary: ""
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [createForm, setCreateForm] = useState(createFormInitial);
  const [interactionForm, setInteractionForm] = useState(interactionInitial);
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    try {
      const response = await apiClient.get("/customers");
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await apiClient.post("/customers", {
        ...createForm,
        value: Number(createForm.value)
      });
      setCreateForm(createFormInitial);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    }
  };

  const handleStageChange = async (customerId, stage) => {
    try {
      await apiClient.put(`/customers/${customerId}`, { stage });
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer stage");
    }
  };

  const handleAddInteraction = async (event) => {
    event.preventDefault();

    if (!interactionForm.customerId || !interactionForm.summary) {
      setError("Select a customer and provide interaction summary.");
      return;
    }

    try {
      await apiClient.post(`/customers/${interactionForm.customerId}/interactions`, {
        interactionType: interactionForm.interactionType,
        summary: interactionForm.summary
      });
      setInteractionForm(interactionInitial);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add interaction");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>Customer Relationship Management</h2>
        <button className="button secondary" type="button" onClick={loadCustomers}>
          Refresh
        </button>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="two-col">
        <article className="card">
          <h3>Create Customer</h3>
          <form className="form-grid compact" onSubmit={handleCreate}>
            <label>
              Full Name
              <input value={createForm.fullName} onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
            </label>
            <label>
              Email
              <input type="email" value={createForm.email} onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))} />
            </label>
            <label>
              Phone
              <input value={createForm.phone} onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </label>
            <label>
              Company
              <input value={createForm.company} onChange={(e) => setCreateForm((prev) => ({ ...prev, company: e.target.value }))} />
            </label>
            <label>
              Value
              <input
                type="number"
                min="0"
                value={createForm.value}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, value: e.target.value }))}
              />
            </label>
            <label>
              Stage
              <select value={createForm.stage} onChange={(e) => setCreateForm((prev) => ({ ...prev, stage: e.target.value }))}>
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Expansion">Expansion</option>
                <option value="Churn Risk">Churn Risk</option>
              </select>
            </label>
            <button className="button primary" type="submit">
              Save Customer
            </button>
          </form>
        </article>

        <article className="card">
          <h3>Add Interaction</h3>
          <form className="form-grid compact" onSubmit={handleAddInteraction}>
            <label>
              Customer
              <select
                value={interactionForm.customerId}
                onChange={(e) => setInteractionForm((prev) => ({ ...prev, customerId: e.target.value }))}
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={interactionForm.interactionType}
                onChange={(e) => setInteractionForm((prev) => ({ ...prev, interactionType: e.target.value }))}
              >
                <option value="CALL">CALL</option>
                <option value="EMAIL">EMAIL</option>
                <option value="MEETING">MEETING</option>
                <option value="NOTE">NOTE</option>
              </select>
            </label>
            <label className="wide">
              Summary
              <textarea
                value={interactionForm.summary}
                onChange={(e) => setInteractionForm((prev) => ({ ...prev, summary: e.target.value }))}
                required
              />
            </label>
            <button className="button primary" type="submit">
              Add Interaction
            </button>
          </form>
        </article>
      </section>

      <section className="card">
        <h3>Customer List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Manager</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Interactions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={6}>No customers found.</td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.fullName}</td>
                <td>{customer.company || "-"}</td>
                <td>{customer.accountManager?.name || "-"}</td>
                <td>
                  <select value={customer.stage} onChange={(e) => handleStageChange(customer._id, e.target.value)}>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Active">Active</option>
                    <option value="Expansion">Expansion</option>
                    <option value="Churn Risk">Churn Risk</option>
                  </select>
                </td>
                <td>{"\u20B9"}{Number(customer.value || 0).toLocaleString("en-IN")}</td>
                <td>{customer.interactions?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default CustomersPage;


