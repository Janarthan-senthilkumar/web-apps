import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin", "manager", "executive"] },
  { to: "/leads", label: "Leads", roles: ["admin", "manager", "executive"] },
  { to: "/customers", label: "Customers", roles: ["admin", "manager", "executive"] },
  { to: "/followups", label: "Follow-Ups", roles: ["admin", "manager", "executive"] },
  { to: "/team", label: "Team", roles: ["admin", "manager"] }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>LeadFlow CRM</h1>
          <p>Sales Lead Tracking</p>
        </div>

        <nav className="menu">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="user-card">
          <p className="user-name">{user.name}</p>
          <p className="user-role">{user.role}</p>
          <button className="button secondary full" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
