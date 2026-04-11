import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const TeamPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "executive"
  });

  const canCreate = user.role === "admin";

  const loadUsers = async () => {
    try {
      const response = await apiClient.get("/auth/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    try {
      await apiClient.post("/auth/users", form);
      setForm({ name: "", email: "", password: "", role: "executive" });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>Team & Role Management</h2>
        <button className="button secondary" type="button" onClick={loadUsers}>
          Refresh
        </button>
      </section>

      {error && <p className="error-text">{error}</p>}

      {canCreate && (
        <section className="card">
          <h3>Create Team Member</h3>
          <form className="form-grid compact" onSubmit={createUser}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                <option value="executive">executive</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <button className="button primary" type="submit">
              Create User
            </button>
          </form>
        </section>
      )}

      <section className="card">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5}>No users found.</td>
              </tr>
            )}
            {users.map((teamUser) => (
              <tr key={teamUser._id}>
                <td>{teamUser.name}</td>
                <td>{teamUser.email}</td>
                <td>{teamUser.role}</td>
                <td>{teamUser.isActive ? "Active" : "Disabled"}</td>
                <td>{new Date(teamUser.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TeamPage;
