import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

const demoCredentials = [
  { role: "Admin", email: "admin@demo.crm", password: "Demo@123" },
  { role: "Manager", email: "manager@demo.crm", password: "Demo@123" },
  { role: "Executive", email: "executive@demo.crm", password: "Demo@123" }
];

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const { login, register, bootstrapAdmin, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await apiClient.get("/health");
        setApiError("");
      } catch (error) {
        setApiError(`Backend is unreachable at ${apiClient.defaults.baseURL}. Start the server and refresh this page.`);
      }
    };

    checkApi();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fillDemoCredentials = (credential) => {
    setMode("login");
    setMessage("");
    setForm({
      name: "",
      email: credential.email,
      password: credential.password
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      email: form.email,
      password: form.password,
      ...(mode !== "login" ? { name: form.name } : {})
    };

    let result;
    if (mode === "login") {
      result = await login(payload);
    } else if (mode === "register") {
      result = await register(payload);
    } else {
      result = await bootstrapAdmin(payload);
    }

    if (!result.ok) {
      setMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>LeadFlow CRM</h1>
        <p>Manage leads, customers, and follow-ups in real time.</p>

        <div className="auth-tabs">
          <button type="button" className={`button tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={`button tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>
            Register
          </button>
          <button type="button" className={`button tab ${mode === "bootstrap" ? "active" : ""}`} onClick={() => setMode("bootstrap")}>
            First Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {mode !== "login" && (
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          )}

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>

          <button type="submit" className="button primary" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : mode === "register" ? "Create Executive Account" : "Create First Admin"}
          </button>
        </form>

        {message && <p className="error-text">{message}</p>}
        {apiError && <p className="error-text">{apiError}</p>}

        <div className="hint-text">
          <p>Register creates an executive account.</p>
          <p>First Admin works only when no users exist yet.</p>
          <p>Demo login credentials:</p>
          {demoCredentials.map((credential) => (
            <p key={credential.email}>
              {credential.role}: {credential.email} / {credential.password}
            </p>
          ))}
          <div className="auth-tabs">
            {demoCredentials.map((credential) => (
              <button
                key={`fill-${credential.email}`}
                type="button"
                className="button tab"
                onClick={() => fillDemoCredentials(credential)}
              >
                Use {credential.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
