import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

/* =====================================================
   ICONS
===================================================== */

const Icon = ({ children, size = 20 }) => (
  <span
    className="icon"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.85,
    }}
  >
    {children}
  </span>
);

/* =====================================================
   APP
===================================================== */

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common.Authorization;
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-shell">
        <Sidebar user={user} onLogout={handleLogout} />

        <div className="main-shell">
          <Topbar user={user} />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/followups" element={<FollowUps />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

/* =====================================================
   LOGIN
===================================================== */

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/auth/login"
        : "/auth/register";

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        formData
      );

      onLogin(
        response.data.token,
        response.data.user
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-shape shape-one"></div>
      <div className="login-background-shape shape-two"></div>

      <div className="login-wrapper">
        <div className="login-brand-panel">
          <div className="brand-logo-large">
            🏠
          </div>

          <div className="brand-title">
            Estate<span>Flow</span>
          </div>

          <p>
            Smart real estate management
            for modern property professionals.
          </p>

          <div className="login-feature-list">
            <div>
              <span>✓</span>
              Manage properties easily
            </div>

            <div>
              <span>✓</span>
              Track clients and leads
            </div>

            <div>
              <span>✓</span>
              Follow up with customers
            </div>

            <div>
              <span>✓</span>
              Grow your real estate business
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="mobile-brand">
            <div className="brand-logo">🏠</div>
            <strong>T3EstateFlow</strong>
          </div>

          <div className="login-heading">
            <h1>
              {isLogin
                ? "Welcome back"
                : "Create your account"}
            </h1>

            <p>
              {isLogin
                ? "Sign in to continue to your CRM"
                : "Start managing your real estate business"}
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Full Name</label>

                  <div className="input-wrapper">
                    <span>👤</span>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>

                  <div className="input-wrapper">
                    <span>📞</span>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="login-switch">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SIDEBAR
===================================================== */

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const links = [
    {
      path: "/",
      label: "Dashboard",
      icon: "▦",
    },
    {
      path: "/properties",
      label: "Properties",
      icon: "⌂",
    },
    {
      path: "/clients",
      label: "Clients",
      icon: "♙",
    },
    {
      path: "/leads",
      label: "Leads",
      icon: "◎",
    },
    {
      path: "/followups",
      label: "Follow-ups",
      icon: "⏰",
    },
    {
      path: "/reports",
      label: "Reports",
      icon: "📊",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          🏠
        </div>

        <div>
          <div className="sidebar-brand">
            Estate<span>Flow</span>
          </div>

          <small>REAL ESTATE CRM</small>
        </div>
      </div>

      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const active =
            link.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(
                  link.path
                );

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${
                active ? "active" : ""
              }`}
            >
              <span className="sidebar-link-icon">
                {link.icon}
              </span>

              <span>{link.label}</span>

              {active && (
                <span className="active-dot"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help">
          <div className="help-icon">?</div>

          <div>
            <strong>Need help?</strong>
            <span>Contact support</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {user?.role || "Agent"}
            </span>
          </div>

          <button
            className="logout-icon"
            onClick={onLogout}
            title="Logout"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   TOPBAR
===================================================== */

function Topbar({ user }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mobile-menu-icon">
          ☰
        </div>

        <div className="breadcrumb">
          <span>EstateFlow</span>
          <b>/</b>
          <strong>
            {window.location.pathname === "/"
              ? "Dashboard"
              : window.location.pathname
                  .replace("/", "")
                  .charAt(0)
                  .toUpperCase() +
                window.location.pathname
                  .replace("/", "")
                  .slice(1)}
          </strong>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-icon-button"
          title="Notifications"
        >
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        <div className="topbar-user">
          <div className="topbar-avatar">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>
              {user?.name || "User"}
            </strong>

            <small>
              {user?.role || "Agent"}
            </small>
          </div>

          <span className="chevron">⌄</span>
        </div>
      </div>
    </header>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const loadData = async () => {
      try {
        const [
          propertiesRes,
          clientsRes,
          leadsRes,
        ] = await Promise.all([
          axios.get(
            `${API_URL}/properties`,
            config
          ),
          axios.get(
            `${API_URL}/clients`,
            config
          ),
          axios.get(
            `${API_URL}/leads`,
            config
          ),
        ]);

        setProperties(
          propertiesRes.data.properties || []
        );

        setClients(
          clientsRes.data.clients || []
        );

        setLeads(
          leadsRes.data.leads || []
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const convertedLeads = leads.filter(
    (lead) =>
      lead.status === "converted"
  ).length;

  const hotLeads = leads.filter(
    (lead) =>
      lead.priority === "hot"
  ).length;

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow">
            REAL ESTATE CRM
          </div>

          <h1>
            Good afternoon 👋
          </h1>

          <p>
            Here's what's happening with your
            real estate business today.
          </p>
        </div>

        <Link
          to="/leads"
          className="primary-button"
        >
          <span>+</span>
          Create New Lead
        </Link>
      </div>

      <div className="stats-grid">
        <DashboardStat
          icon="⌂"
          label="Total Properties"
          value={properties.length}
          description="Properties in your portfolio"
          color="blue"
          link="/properties"
        />

        <DashboardStat
          icon="♙"
          label="Total Clients"
          value={clients.length}
          description="Active customers"
          color="purple"
          link="/clients"
        />

        <DashboardStat
          icon="◎"
          label="Total Leads"
          value={leads.length}
          description={`${hotLeads} hot leads`}
          color="orange"
          link="/leads"
        />

        <DashboardStat
          icon="✓"
          label="Converted Leads"
          value={convertedLeads}
          description="Successfully converted"
          color="green"
          link="/leads"
        />
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Leads</h2>
              <p>Your latest customer enquiries</p>
            </div>

            <Link to="/leads">
              View all →
            </Link>
          </div>

          {leads.length === 0 ? (
            <EmptyDashboard
              icon="◎"
              title="No leads yet"
              text="Create your first lead to get started."
              button="Create Lead"
              link="/leads"
            />
          ) : (
            <div className="recent-list">
              {leads
                .slice(0, 5)
                .map((lead) => (
                  <div
                    className="recent-item"
                    key={lead._id}
                  >
                    <div className="recent-avatar">
                      {(lead.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="recent-main">
                      <strong>
                        {lead.name}
                      </strong>

                      <span>
                        {lead.project ||
                          lead.propertyInterest ||
                          "Property enquiry"}
                      </span>
                    </div>

                    <div className="recent-right">
                      <StatusBadge
                        status={
                          lead.status
                        }
                      />

                      <small>
                        {lead.phone}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your CRM faster</p>
            </div>
          </div>

          <div className="quick-action-grid">
            <Link
              to="/properties"
              className="quick-action"
            >
              <div className="quick-icon blue">
                ⌂
              </div>

              <div>
                <strong>
                  Manage Properties
                </strong>
                <span>
                  Add or update listings
                </span>
              </div>

              <b>→</b>
            </Link>

            <Link
              to="/clients"
              className="quick-action"
            >
              <div className="quick-icon purple">
                ♙
              </div>

              <div>
                <strong>
                  Manage Clients
                </strong>
                <span>
                  View customer details
                </span>
              </div>

              <b>→</b>
            </Link>

            <Link
              to="/leads"
              className="quick-action"
            >
              <div className="quick-icon orange">
                ◎
              </div>

              <div>
                <strong>
                  Manage Leads
                </strong>
                <span>
                  Track enquiries
                </span>
              </div>

              <b>→</b>
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Property Overview</h2>
            <p>
              Current status of your properties
            </p>
          </div>

          <Link to="/properties">
            Manage properties →
          </Link>
        </div>

        <div className="property-overview">
          <OverviewItem
            label="Available"
            count={
              properties.filter(
                (p) =>
                  p.status ===
                  "available"
              ).length
            }
            className="available"
          />

          <OverviewItem
            label="Pending"
            count={
              properties.filter(
                (p) =>
                  p.status ===
                  "pending"
              ).length
            }
            className="pending"
          />

          <OverviewItem
            label="Sold"
            count={
              properties.filter(
                (p) =>
                  p.status ===
                  "sold"
              ).length
            }
            className="sold"
          />

          <OverviewItem
            label="Rented"
            count={
              properties.filter(
                (p) =>
                  p.status ===
                  "rented"
              ).length
            }
            className="rented"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardStat({
  icon,
  label,
  value,
  description,
  color,
  link,
}) {
  return (
    <Link
      to={link}
      className="stat-card-new"
    >
      <div
        className={`stat-icon-new ${color}`}
      >
        {icon}
      </div>

      <div className="stat-content">
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{description}</small>
      </div>

      <div className="stat-arrow">
        →
      </div>
    </Link>
  );
}

function OverviewItem({
  label,
  count,
  className,
}) {
  return (
    <div className="overview-item">
      <div
        className={`overview-dot ${className}`}
      ></div>

      <span>{label}</span>

      <strong>{count}</strong>
    </div>
  );
}

function EmptyDashboard({
  icon,
  title,
  text,
  button,
  link,
}) {
  return (
    <div className="dashboard-empty">
      <div>{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>

      <Link
        to={link}
        className="secondary-button"
      >
        {button}
      </Link>
    </div>
  );
}

/* =====================================================
   PROPERTIES
===================================================== */

function Properties() {
  const [properties, setProperties] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const emptyForm = {
    title: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    propertyType: "residential",
    status: "available",
    description: "",
    amenities: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // Images already saved on the property (when editing)
  const [existingImages, setExistingImages] =
    useState([]);

  // New image files picked in this session, not yet uploaded
  const [imageFiles, setImageFiles] =
    useState([]);

  const [uploading, setUploading] =
    useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProperties(
        response.data.properties || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load properties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setExistingImages([]);
    setImageFiles([]);
    setShowForm(true);
  };

  const handleEdit = (property) => {
    setEditingId(property._id);
    setExistingImages(property.images || []);
    setImageFiles([]);

    setFormData({
      title: property.title || "",
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      zipCode: property.zipCode || "",
      price: property.price || "",
      bedrooms: property.bedrooms || "",
      bathrooms: property.bathrooms || "",
      squareFeet: property.squareFeet || "",
      propertyType:
        property.propertyType ||
        "residential",
      status:
        property.status ||
        "available",
      description:
        property.description || "",
      amenities: property.amenities
        ? property.amenities.join(", ")
        : "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      let uploadedUrls = [];

      if (imageFiles.length > 0) {
        setUploading(true);

        const imageForm = new FormData();
        imageFiles.forEach((file) =>
          imageForm.append("images", file)
        );

        const uploadRes = await axios.post(
          `${API_URL}/properties/upload`,
          imageForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedUrls = uploadRes.data.urls || [];
        setUploading(false);
      }

      const propertyData = {
        ...formData,

        price: Number(formData.price),

        bedrooms: formData.bedrooms
          ? Number(formData.bedrooms)
          : undefined,

        bathrooms: formData.bathrooms
          ? Number(formData.bathrooms)
          : undefined,

        squareFeet:
          formData.squareFeet
            ? Number(formData.squareFeet)
            : undefined,

        amenities:
          formData.amenities
            ? formData.amenities
                .split(",")
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean)
            : [],

        images: [
          ...existingImages,
          ...uploadedUrls,
        ],
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/properties/${editingId}`,
          propertyData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/properties`,
          propertyData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      closeForm();
      fetchProperties();
    } catch (err) {
      console.error(err);
      setUploading(false);

      alert(
        err.response?.data?.message ||
          "Unable to save property"
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property?"
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/properties/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProperties();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete property"
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setExistingImages([]);
    setImageFiles([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const removeExistingImage = (url) => {
    setExistingImages(
      existingImages.filter((img) => img !== url)
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="PROPERTY MANAGEMENT"
        title="Properties"
        description="Manage and organize your property portfolio."
        button="+ Add Property"
        onClick={handleAdd}
      />

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {showForm && (
        <div className="modern-form-card">
          <div className="form-card-title">
            <div>
              <span className="eyebrow">
                PROPERTY
              </span>

              <h2>
                {editingId
                  ? "Edit Property"
                  : "Add New Property"}
              </h2>
            </div>

            <button
              className="close-button"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-grid">
                <ModernInput
                  label="Property Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Premium Villa"
                  required
                />

                <ModernInput
                  label="Price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="₹ 50,00,000"
                  required
                />

                <ModernInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Property address"
                  required
                />

                <ModernInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

                <ModernInput
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />

                <ModernInput
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="635109"
                />

                <ModernInput
                  label="Square Feet"
                  type="number"
                  name="squareFeet"
                  value={
                    formData.squareFeet
                  }
                  onChange={handleChange}
                  placeholder="1200"
                />

                <ModernInput
                  label="Bedrooms"
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="3"
                />

                <ModernInput
                  label="Bathrooms"
                  type="number"
                  name="bathrooms"
                  value={
                    formData.bathrooms
                  }
                  onChange={handleChange}
                  placeholder="2"
                />

                <ModernSelect
                  label="Property Type"
                  name="propertyType"
                  value={
                    formData.propertyType
                  }
                  onChange={handleChange}
                  options={[
                    ["residential", "Residential"],
                    ["commercial", "Commercial"],
                    ["land", "Land / Plot"],
                    ["condo", "Condo"],
                  ]}
                />

                <ModernSelect
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    ["available", "Available"],
                    ["pending", "Pending"],
                    ["sold", "Sold"],
                    ["rented", "Rented"],
                  ]}
                />

                <ModernInput
                  label="Amenities"
                  name="amenities"
                  value={
                    formData.amenities
                  }
                  onChange={handleChange}
                  placeholder="Road, Water, EB, Gated Community"
                />

                <ModernTextarea
                  label="Description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Describe the property..."
                />

                <div className="form-group-new full">
                  <label>Photos</label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                  />

                  {(existingImages.length > 0 ||
                    imageFiles.length > 0) && (
                    <div className="image-preview-row">
                      {existingImages.map((url) => (
                        <div
                          className="image-preview-thumb"
                          key={url}
                        >
                          <img
                            src={`${SERVER_URL}${url}`}
                            alt="Property"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(url)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {imageFiles.map((file, idx) => (
                        <div
                          className="image-preview-thumb"
                          key={`${file.name}-${idx}`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="New upload"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FormActions
              editing={editingId}
              onCancel={closeForm}
              saveText={
                uploading
                  ? "Uploading photos..."
                  : editingId
                  ? "Update Property"
                  : "Save Property"
              }
            />
          </form>
        </div>
      )}

      <div className="section-title-row">
        <div>
          <h2>
            All Properties
            <span>
              {properties.length}
            </span>
          </h2>

          <p>
            Your current property listings
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="⌂"
          title="No Properties Yet"
          text="Add your first property to start managing your listings."
          button="+ Add Property"
          onClick={handleAdd}
        />
      ) : (
        <div className="property-grid-new">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   PROPERTY CARD
===================================================== */

function PropertyCard({
  property,
  onEdit,
  onDelete,
}) {
  return (
    <div className="property-card-new">
      <div className="property-image-placeholder">
        {property.images && property.images[0] ? (
          <img
            src={`${SERVER_URL}${property.images[0]}`}
            alt={property.title}
            className="property-image-photo"
          />
        ) : (
          <div className="property-image-icon">
            ⌂
          </div>
        )}

        <span
          className={`status-pill ${property.status}`}
        >
          {property.status}
        </span>
      </div>

      <div className="property-card-body">
        <div className="property-title-row">
          <div>
            <h3>{property.title}</h3>

            <span className="property-type">
              {property.propertyType}
            </span>
          </div>
        </div>

        <div className="property-location">
          📍 {property.address},{" "}
          {property.city}
        </div>

        <div className="property-price">
          ₹
          {Number(
            property.price
          ).toLocaleString("en-IN")}
        </div>

        <div className="property-meta">
          {property.squareFeet && (
            <span>
              📐 {property.squareFeet} sq.ft
            </span>
          )}

          {property.bedrooms && (
            <span>
              🛏 {property.bedrooms} Beds
            </span>
          )}

          {property.bathrooms && (
            <span>
              🚿 {property.bathrooms} Baths
            </span>
          )}
        </div>

        {property.description && (
          <p className="property-description-new">
            {property.description}
          </p>
        )}

        <div className="card-actions">
          <button
            className="action-button edit"
            onClick={() =>
              onEdit(property)
            }
          >
            ✎ Edit
          </button>

          <button
            className="action-button delete"
            onClick={() =>
              onDelete(property._id)
            }
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   CLIENTS
===================================================== */

function Clients() {
  const [clients, setClients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [matchModal, setMatchModal] = useState({
    open: false,
    name: "",
    properties: [],
    loading: false,
  });

  const showMatches = async (client) => {
    setMatchModal({
      open: true,
      name: client.name,
      properties: [],
      loading: true,
    });

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/clients/${client._id}/matches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMatchModal((prev) => ({
        ...prev,
        properties: response.data.properties || [],
        loading: false,
      }));
    } catch (err) {
      setMatchModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeMatches = () =>
    setMatchModal({ open: false, name: "", properties: [], loading: false });

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    status: "active",
    clientType: "buyer",
    budgetMin: "",
    budgetMax: "",
    notes: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClients(
        response.data.clients || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingId(client._id);

    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      status:
        client.status || "active",
      clientType:
        client.clientType || "buyer",
      budgetMin:
        client.budget?.min || "",
      budgetMax:
        client.budget?.max || "",
      notes: client.notes || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address:
          formData.address.trim(),
        city: formData.city.trim(),
        status: formData.status,
        clientType:
          formData.clientType,

        budget: {
          min: formData.budgetMin
            ? Number(
                formData.budgetMin
              )
            : undefined,

          max: formData.budgetMax
            ? Number(
                formData.budgetMax
              )
            : undefined,
        },

        notes: formData.notes.trim(),
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/clients/${editingId}`,
          clientData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/clients`,
          clientData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      closeForm();
      fetchClients();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to save client"
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this client?"
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/clients/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchClients();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete client"
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="CUSTOMER MANAGEMENT"
        title="Clients"
        description="Manage your buyers, sellers and investors."
        button="+ Add Client"
        onClick={handleAdd}
      />

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {showForm && (
        <div className="modern-form-card">
          <div className="form-card-title">
            <div>
              <span className="eyebrow">
                CLIENT
              </span>

              <h2>
                {editingId
                  ? "Edit Client"
                  : "Add New Client"}
              </h2>
            </div>

            <button
              className="close-button"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Customer Information</h3>

              <div className="form-grid">
                <ModernInput
                  label="Client Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Customer name"
                  required
                />

                <ModernInput
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />

                <ModernInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@email.com"
                />

                <ModernInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />

                <ModernInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Customer address"
                />

                <ModernSelect
                  label="Client Type"
                  name="clientType"
                  value={
                    formData.clientType
                  }
                  onChange={handleChange}
                  options={[
                    ["buyer", "Buyer"],
                    ["seller", "Seller"],
                    ["investor", "Investor"],
                  ]}
                />

                <ModernSelect
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    ["active", "Active"],
                    ["inactive", "Inactive"],
                    ["converted", "Converted"],
                  ]}
                />

                <ModernInput
                  label="Minimum Budget"
                  type="number"
                  name="budgetMin"
                  value={
                    formData.budgetMin
                  }
                  onChange={handleChange}
                  placeholder="₹ 20,00,000"
                />

                <ModernInput
                  label="Maximum Budget"
                  type="number"
                  name="budgetMax"
                  value={
                    formData.budgetMax
                  }
                  onChange={handleChange}
                  placeholder="₹ 50,00,000"
                />

                <ModernTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Customer requirements..."
                />
              </div>
            </div>

            <FormActions
              editing={editingId}
              onCancel={closeForm}
              saveText={
                editingId
                  ? "Update Client"
                  : "Save Client"
              }
            />
          </form>
        </div>
      )}

      <div className="section-title-row">
        <div>
          <h2>
            All Clients
            <span>{clients.length}</span>
          </h2>

          <p>
            Your customer database
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : clients.length === 0 ? (
        <EmptyState
          icon="♙"
          title="No Clients Yet"
          text="Add your first client to start managing your customers."
          button="+ Add Client"
          onClick={handleAdd}
        />
      ) : (
        <div className="client-grid">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMatches={showMatches}
            />
          ))}
        </div>
      )}

      {matchModal.open && (
        <PropertyMatchesModal
          title={`Matches for ${matchModal.name}`}
          properties={matchModal.properties}
          loading={matchModal.loading}
          onClose={closeMatches}
        />
      )}
    </div>
  );
}

/* =====================================================
   CLIENT CARD
===================================================== */

function ClientCard({
  client,
  onEdit,
  onDelete,
  onMatches,
}) {
  const initials = (client.name || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="client-card">
      <div className="client-card-top">
        <div className="client-avatar-large">
          {initials}
        </div>

        <div className="client-main-info">
          <h3>{client.name}</h3>

          <span>
            {client.clientType}
          </span>
        </div>

        <StatusBadge
          status={client.status}
        />
      </div>

      <div className="client-info-list">
        <div>
          <span>📞</span>
          <strong>{client.phone}</strong>
        </div>

        {client.email && (
          <div>
            <span>✉</span>
            <p>{client.email}</p>
          </div>
        )}

        {client.city && (
          <div>
            <span>📍</span>
            <p>{client.city}</p>
          </div>
        )}

        {client.budget?.max && (
          <div>
            <span>₹</span>
            <p>
              Budget up to ₹
              {Number(
                client.budget.max
              ).toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {client.notes && (
        <div className="client-note">
          <strong>Note</strong>
          <p>{client.notes}</p>
        </div>
      )}

      <div className="card-actions">
        <a
          href={`tel:${client.phone}`}
          className="action-button call"
        >
          📞 Call
        </a>

        <button
          className="action-button match"
          onClick={() => onMatches(client)}
        >
          🔍 Matches
        </button>

        <button
          className="action-button edit"
          onClick={() =>
            onEdit(client)
          }
        >
          ✎ Edit
        </button>

        <button
          className="action-button delete"
          onClick={() =>
            onDelete(client._id)
          }
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   LEADS
===================================================== */

function Leads() {
  const [leads, setLeads] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [matchModal, setMatchModal] = useState({
    open: false,
    name: "",
    properties: [],
    loading: false,
  });

  const showMatches = async (lead) => {
    setMatchModal({
      open: true,
      name: lead.name,
      properties: [],
      loading: true,
    });

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/leads/${lead._id}/matches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMatchModal((prev) => ({
        ...prev,
        properties: response.data.properties || [],
        loading: false,
      }));
    } catch (err) {
      setMatchModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeMatches = () =>
    setMatchModal({ open: false, name: "", properties: [], loading: false });

  const emptyForm = {
    name: "",
    phone: "",
    email: "",
    project: "",
    plotNo: "",
    budgetMin: "",
    budgetMax: "",
    loanRequired: "No",
    downPayment: "",
    priority: "warm",
    siteVisit: "Not Completed",
    nextFollowUp: "",
    status: "new",
    source: "website",
    notes: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/leads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeads(
        response.data.leads || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leads"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const handleEdit = (lead) => {
    setEditingId(lead._id);

    setFormData({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      project:
        lead.project ||
        lead.propertyInterest ||
        "",
      plotNo: lead.plotNo || "",
      budgetMin:
        lead.budgetMin || "",
      budgetMax:
        lead.budgetMax || "",
      loanRequired:
        lead.loanRequired || "No",
      downPayment:
        lead.downPayment || "",
      priority:
        lead.priority || "warm",
      siteVisit:
        lead.siteVisit ||
        "Not Completed",
      nextFollowUp:
        lead.nextFollowUp
          ? new Date(
              lead.nextFollowUp
            )
              .toISOString()
              .split("T")[0]
          : "",
      status:
        lead.status || "new",
      source:
        lead.source || "website",
      notes: lead.notes || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const leadData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      project:
        formData.project.trim(),
        propertyInterest:
          formData.project.trim(),
        plotNo:
          formData.plotNo.trim(),

        budgetMin:
          formData.budgetMin
            ? Number(
                formData.budgetMin
              )
            : undefined,

        budgetMax:
          formData.budgetMax
            ? Number(
                formData.budgetMax
              )
            : undefined,

        loanRequired:
          formData.loanRequired,

        downPayment:
          formData.downPayment
            ? Number(
                formData.downPayment
              )
            : undefined,

        priority:
          formData.priority,

        siteVisit:
          formData.siteVisit,

        nextFollowUp:
          formData.nextFollowUp
            ? formData.nextFollowUp
            : undefined,

        status:
          formData.status,

        source:
          formData.source,

        notes:
          formData.notes.trim(),
      };

    try {
      const token =
        localStorage.getItem("token");

      if (editingId) {
        await axios.put(
          `${API_URL}/leads/${editingId}`,
          leadData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await createLead(leadData, token, false);
      }

      closeForm();
      fetchLeads();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.duplicate) {
        const existing = err.response.data.existingLead;

        const confirmCreate = window.confirm(
          `A lead named "${existing?.name}" already exists with this phone number. Create this lead anyway?`
        );

        if (confirmCreate) {
          try {
            const token = localStorage.getItem("token");
            await createLead(leadData, token, true);
            closeForm();
            fetchLeads();
          } catch (retryErr) {
            alert(
              retryErr.response?.data?.message ||
                "Unable to save lead"
            );
          }
        }

        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to save lead"
      );
    }
  };

  const createLead = (leadData, token, force) =>
    axios.post(
      `${API_URL}/leads${force ? "?force=true" : ""}`,
      leadData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this lead?"
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/leads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchLeads();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete lead"
      );
    }
  };

  const openWhatsApp = (phone) => {
    const cleanPhone =
      phone.replace(/\D/g, "");

    window.open(
      `https://wa.me/91${cleanPhone}`,
      "_blank"
    );
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const text =
        search.toLowerCase();

      const matchesSearch =
        !search ||
        (lead.name || "")
          .toLowerCase()
          .includes(text) ||
        (lead.phone || "")
          .toLowerCase()
          .includes(text) ||
        (
          lead.project ||
          lead.propertyInterest ||
          ""
        )
          .toLowerCase()
          .includes(text) ||
        (lead.plotNo || "")
          .toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "all" ||
        lead.status === statusFilter;

      const matchesSource =
        sourceFilter === "all" ||
        lead.source === sourceFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    sourceFilter,
  ]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="LEAD MANAGEMENT"
        title="Leads"
        description="Track enquiries, follow-ups and conversions."
        button="+ Create Lead"
        onClick={handleAdd}
      />

      <div className="lead-summary">
        <LeadSummary
          label="Total Leads"
          value={leads.length}
          icon="◎"
        />

        <LeadSummary
          label="Hot Leads"
          value={
            leads.filter(
              (l) => l.priority === "hot"
            ).length
          }
          icon="🔥"
        />

        <LeadSummary
          label="Site Visits"
          value={
            leads.filter(
              (l) =>
                l.siteVisit ===
                "Completed"
            ).length
          }
          icon="⌂"
        />

        <LeadSummary
          label="Converted"
          value={
            leads.filter(
              (l) =>
                l.status ===
                "converted"
            ).length
          }
          icon="✓"
        />
      </div>

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      <div className="filter-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search customer, phone, project or plot..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>
          <option value="new">New</option>
          <option value="contacted">
            Contacted
          </option>
          <option value="qualified">
            Qualified
          </option>
          <option value="negotiating">
            Negotiating
          </option>
          <option value="converted">
            Converted
          </option>
          <option value="lost">
            Lost
          </option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Sources
          </option>
          <option value="website">
            Website
          </option>
          <option value="referral">
            Referral
          </option>
          <option value="ad">
            Advertisement
          </option>
          <option value="walk-in">
            Walk-in
          </option>
          <option value="other">
            Other
          </option>
        </select>
      </div>

      {showForm && (
        <div className="modern-form-card">
          <div className="form-card-title">
            <div>
              <span className="eyebrow">
                LEAD
              </span>

              <h2>
                {editingId
                  ? "Edit Lead"
                  : "Create New Lead"}
              </h2>
            </div>

            <button
              className="close-button"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Customer Details</h3>

              <div className="form-grid">
                <ModernInput
                  label="Customer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ravi Kumar"
                  required
                />

                <ModernInput
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />

                <ModernInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@email.com"
                />

                <ModernInput
                  label="Project"
                  name="project"
                  value={
                    formData.project
                  }
                  onChange={handleChange}
                  placeholder="Jayalakshmi Layout"
                />

                <ModernInput
                  label="Plot No"
                  name="plotNo"
                  value={formData.plotNo}
                  onChange={handleChange}
                  placeholder="15"
                />

                <ModernInput
                  label="Minimum Budget"
                  type="number"
                  name="budgetMin"
                  value={
                    formData.budgetMin
                  }
                  onChange={handleChange}
                  placeholder="3000000"
                />

                <ModernInput
                  label="Maximum Budget"
                  type="number"
                  name="budgetMax"
                  value={
                    formData.budgetMax
                  }
                  onChange={handleChange}
                  placeholder="3500000"
                />

                <ModernSelect
                  label="Loan Required"
                  name="loanRequired"
                  value={
                    formData.loanRequired
                  }
                  onChange={handleChange}
                  options={[
                    ["No", "No"],
                    ["Yes", "Yes"],
                  ]}
                />

                <ModernInput
                  label="Down Payment"
                  type="number"
                  name="downPayment"
                  value={
                    formData.downPayment
                  }
                  onChange={handleChange}
                  placeholder="500000"
                />

                <ModernSelect
                  label="Priority"
                  name="priority"
                  value={
                    formData.priority
                  }
                  onChange={handleChange}
                  options={[
                    ["hot", "🔥 HOT"],
                    ["warm", "🟠 WARM"],
                    ["cold", "🔵 COLD"],
                  ]}
                />

                <ModernSelect
                  label="Site Visit"
                  name="siteVisit"
                  value={
                    formData.siteVisit
                  }
                  onChange={handleChange}
                  options={[
                    [
                      "Not Completed",
                      "Not Completed",
                    ],
                    [
                      "Scheduled",
                      "Scheduled",
                    ],
                    [
                      "Completed",
                      "Completed",
                    ],
                    [
                      "Cancelled",
                      "Cancelled",
                    ],
                  ]}
                />

                <ModernInput
                  label="Next Follow-up"
                  type="date"
                  name="nextFollowUp"
                  value={
                    formData.nextFollowUp
                  }
                  onChange={handleChange}
                />

                <ModernSelect
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    ["new", "New"],
                    [
                      "contacted",
                      "Contacted",
                    ],
                    [
                      "qualified",
                      "Qualified",
                    ],
                    [
                      "negotiating",
                      "Negotiating",
                    ],
                    [
                      "converted",
                      "Converted",
                    ],
                    ["lost", "Lost"],
                  ]}
                />

                <ModernSelect
                  label="Lead Source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  options={[
                    [
                      "website",
                      "Website",
                    ],
                    [
                      "referral",
                      "Referral",
                    ],
                    [
                      "ad",
                      "Advertisement",
                    ],
                    [
                      "walk-in",
                      "Walk-in",
                    ],
                    ["other", "Other"],
                  ]}
                />

                <ModernTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Customer requirements, discussion notes..."
                />
              </div>
            </div>

            <FormActions
              editing={editingId}
              onCancel={closeForm}
              saveText={
                editingId
                  ? "Update Lead"
                  : "Create Lead"
              }
            />
          </form>
        </div>
      )}

      <div className="section-title-row">
        <div>
          <h2>
            Lead Pipeline
            <span>
              {filteredLeads.length}
            </span>
          </h2>

          <p>
            Showing matching customer enquiries
          </p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No Leads Found"
          text="Create your first lead to start managing customer enquiries."
          button="+ Create Lead"
          onClick={handleAdd}
        />
      ) : (
        <div className="lead-grid">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onWhatsApp={
                openWhatsApp
              }
              onMatches={showMatches}
            />
          ))}
        </div>
      )}

      {matchModal.open && (
        <PropertyMatchesModal
          title={`Matches for ${matchModal.name}`}
          properties={matchModal.properties}
          loading={matchModal.loading}
          onClose={closeMatches}
        />
      )}
    </div>
  );
}

/* =====================================================
   LEAD COMPONENTS
===================================================== */

function LeadSummary({
  label,
  value,
  icon,
}) {
  return (
    <div className="lead-summary-card">
      <div className="lead-summary-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onEdit,
  onDelete,
  onWhatsApp,
  onMatches,
}) {
  return (
    <div className="lead-card-new">
      <div className="lead-card-header">
        <div className="lead-person">
          <div className="lead-avatar">
            {(lead.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>{lead.name}</h3>

            <span>
              {lead.source}
            </span>
          </div>
        </div>

        <StatusBadge
          status={lead.status}
        />
      </div>

      <div className="lead-priority-row">
        <span
          className={`priority-badge ${
            lead.priority
          }`}
        >
          {lead.priority === "hot"
            ? "🔥 HOT"
            : lead.priority === "cold"
            ? "🔵 COLD"
            : "🟠 WARM"}
        </span>

        {lead.siteVisit && (
          <span className="site-visit-badge">
            🏠 {lead.siteVisit}
          </span>
        )}
      </div>

      <div className="lead-info-grid">
        <div>
          <span>Phone</span>
          <strong>{lead.phone}</strong>
        </div>

        <div>
          <span>Project</span>
          <strong>
            {lead.project ||
              lead.propertyInterest ||
              "Not specified"}
          </strong>
        </div>

        {lead.plotNo && (
          <div>
            <span>Plot</span>
            <strong>
              #{lead.plotNo}
            </strong>
          </div>
        )}

        {(lead.budgetMin ||
          lead.budgetMax) && (
          <div>
            <span>Budget</span>
            <strong>
              ₹
              {Number(
                lead.budgetMax ||
                  lead.budgetMin ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        )}

        <div>
          <span>Loan</span>
          <strong>
            {lead.loanRequired ||
              "No"}
          </strong>
        </div>

        <div>
          <span>Follow-up</span>
          <strong>
            {lead.nextFollowUp
              ? new Date(
                  lead.nextFollowUp
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )
              : "Not set"}
          </strong>
        </div>
      </div>

      {lead.notes && (
        <div className="lead-note">
          <span>📝</span>
          <p>{lead.notes}</p>
        </div>
      )}

      <div className="lead-actions">
        <a
          href={`tel:${lead.phone}`}
          className="lead-action call"
        >
          📞
          <span>Call</span>
        </a>

        <button
          className="lead-action whatsapp"
          onClick={() =>
            onWhatsApp(lead.phone)
          }
        >
          💬
          <span>WhatsApp</span>
        </button>

        <button
          className="lead-action match"
          onClick={() => onMatches(lead)}
        >
          🔍
          <span>Matches</span>
        </button>

        <button
          className="lead-action edit"
          onClick={() =>
            onEdit(lead)
          }
        >
          ✎
          <span>Edit</span>
        </button>

        <button
          className="lead-action delete"
          onClick={() =>
            onDelete(lead._id)
          }
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   SHARED COMPONENTS
===================================================== */

function PageHeader({
  eyebrow,
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div className="page-header-new">
      <div>
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      <button
        className="primary-button"
        onClick={onClick}
      >
        <span>{button.split(" ")[0]}</span>
        {button.substring(
          button.indexOf(" ") + 1
        )}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const label =
    status || "new";

  return (
    <span
      className={`status-pill ${label}`}
    >
      {label}
    </span>
  );
}

function ModernInput({
  label,
  ...props
}) {
  return (
    <div className="form-group-new">
      <label>
        {label}
        {props.required && (
          <span>*</span>
        )}
      </label>

      <input {...props} />
    </div>
  );
}

function ModernSelect({
  label,
  options,
  ...props
}) {
  return (
    <div className="form-group-new">
      <label>{label}</label>

      <select {...props}>
        {options.map(
          ([value, text]) => (
            <option
              key={value}
              value={value}
            >
              {text}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function ModernTextarea({
  label,
  ...props
}) {
  return (
    <div className="form-group-new full">
      <label>{label}</label>

      <textarea
        rows="4"
        {...props}
      />
    </div>
  );
}

function FormActions({
  editing,
  onCancel,
  saveText,
}) {
  return (
    <div className="form-actions-new">
      <button
        type="button"
        className="secondary-button"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="primary-button"
      >
        ✓ {saveText}
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  button,
  onClick,
}) {
  return (
    <div className="empty-state-new">
      <div className="empty-state-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button
        className="primary-button"
        onClick={onClick}
      >
        {button}
      </button>
    </div>
  );
}

function Loading() {
  return (
    <div className="loading-new">
      <div className="spinner"></div>
      <span>Loading...</span>
    </div>
  );
}

/* =====================================================
   PROPERTY MATCHES MODAL
   Shared by Clients and Leads — shows properties that
   fit a client's or lead's budget / preferences.
===================================================== */

function PropertyMatchesModal({ title, properties, loading, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-card-title">
          <div>
            <span className="eyebrow">PROPERTY MATCHING</span>
            <h2>{title}</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : properties.length === 0 ? (
          <div className="dashboard-empty">
            <div>⌂</div>
            <strong>No matching properties</strong>
            <p>Try widening the budget range or check back once new listings are added.</p>
          </div>
        ) : (
          <div className="match-results-list">
            {properties.map((property) => (
              <div className="match-result-row" key={property._id}>
                <div className="match-result-thumb">
                  {property.images && property.images[0] ? (
                    <img
                      src={`${SERVER_URL}${property.images[0]}`}
                      alt={property.title}
                    />
                  ) : (
                    <span>⌂</span>
                  )}
                </div>

                <div className="match-result-main">
                  <strong>{property.title}</strong>
                  <span>
                    📍 {property.address}, {property.city}
                  </span>
                </div>

                <div className="match-result-price">
                  ₹{Number(property.price).toLocaleString("en-IN")}
                  <span className={`status-pill ${property.status}`}>
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   FOLLOW-UPS & REMINDERS
===================================================== */

function FollowUps() {
  const [range, setRange] = useState("overdue");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFollowUps = async (selectedRange) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/leads/followups?range=${selectedRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeads(response.data.leads || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load follow-ups"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const markContacted = async (lead) => {
    try {
      const token = localStorage.getItem("token");

      const nextDateStr = window.prompt(
        `Marked "${lead.name}" as contacted. Set the next follow-up date (YYYY-MM-DD), or leave blank to skip.`,
        ""
      );

      const payload = { status: "contacted" };
      if (nextDateStr) payload.nextFollowUp = nextDateStr;

      await axios.put(
        `${API_URL}/leads/${lead._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchFollowUps(range);
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to update lead"
      );
    }
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/91${cleanPhone}`, "_blank");
  };

  const tabs = [
    { key: "overdue", label: "Overdue" },
    { key: "today", label: "Due Today" },
    { key: "upcoming", label: "Upcoming" },
  ];

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="LEAD FOLLOW-UP"
        title="Follow-ups & Reminders"
        description="Never miss a scheduled customer touchpoint."
        button="+ Create Lead"
        onClick={() => {
          window.location.href = "/leads";
        }}
      />

      <div className="filter-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`secondary-button ${
              range === tab.key ? "active-tab" : ""
            }`}
            onClick={() => setRange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="error-message">⚠ {error}</div>}

      {loading ? (
        <Loading />
      ) : leads.length === 0 ? (
        <EmptyState
          icon="⏰"
          title="Nothing here"
          text="No leads have a follow-up in this window."
          button="Go to Leads"
          onClick={() => {
            window.location.href = "/leads";
          }}
        />
      ) : (
        <div className="lead-grid">
          {leads.map((lead) => (
            <div className="lead-card-new" key={lead._id}>
              <div className="lead-card-header">
                <div className="lead-person">
                  <div className="lead-avatar">
                    {(lead.name || "U").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{lead.name}</h3>
                    <span>{lead.agentId?.name || "Unassigned"}</span>
                  </div>
                </div>

                <StatusBadge status={lead.status} />
              </div>

              <div className="lead-info-grid">
                <div>
                  <span>Phone</span>
                  <strong>{lead.phone}</strong>
                </div>

                <div>
                  <span>Follow-up due</span>
                  <strong>
                    {new Date(lead.nextFollowUp).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  </strong>
                </div>

                <div>
                  <span>Project</span>
                  <strong>
                    {lead.propertyInterest || "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="lead-actions">
                <a href={`tel:${lead.phone}`} className="lead-action call">
                  📞<span>Call</span>
                </a>

                <button
                  className="lead-action whatsapp"
                  onClick={() => openWhatsApp(lead.phone)}
                >
                  💬<span>WhatsApp</span>
                </button>

                <button
                  className="lead-action edit"
                  onClick={() => markContacted(lead)}
                >
                  ✓<span>Mark Contacted</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   REPORTS
===================================================== */

const CHART_COLORS = [
  "#2563eb", "#7c3aed", "#16a34a", "#d97706",
  "#dc2626", "#0891b2", "#db2777", "#65a30d",
];

function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/dashboard/reports`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReports(response.data.reports);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load reports"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loading />
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div className="page-container">
        <div className="error-message">⚠ {error || "No data"}</div>
      </div>
    );
  }

  const fmt = (arr) =>
    (arr || []).map((item) => ({
      name: item._id || "Unspecified",
      value: item.count,
    }));

  const leadsByStatus = fmt(reports.leadsByStatus);
  const leadsBySource = fmt(reports.leadsBySource);
  const propertiesByStatus = fmt(reports.propertiesByStatus);
  const propertiesByType = fmt(reports.propertiesByType);

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="ANALYTICS"
        title="Reports"
        description="Pipeline health, conversion, and agent performance."
        button="↻ Refresh"
        onClick={() => window.location.reload()}
      />

      <div className="stats-grid">
        <DashboardStat
          icon="✓"
          label="Conversion Rate"
          value={`${reports.conversionRate}%`}
          description="Leads converted to sales"
          color="green"
          link="/leads"
        />
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Lead Pipeline by Status</h2>
              <p>Where leads currently sit in the funnel</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Leads by Source</h2>
              <p>Where your enquiries are coming from</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={leadsBySource}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {leadsBySource.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Monthly Lead Trend</h2>
            <p>New leads created over the last 6 months</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={reports.monthlyLeadsTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Properties by Status</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={propertiesByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Properties by Type</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={propertiesByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Agent Performance</h2>
            <p>Leads assigned and converted per agent</p>
          </div>
        </div>

        {reports.agentPerformance.length === 0 ? (
          <div className="dashboard-empty">
            <div>♙</div>
            <strong>No assigned leads yet</strong>
            <p>Agent performance shows up once leads are assigned.</p>
          </div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total Leads</th>
                <th>Hot Leads</th>
                <th>Converted</th>
                <th>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {reports.agentPerformance.map((agent) => (
                <tr key={agent.agentName}>
                  <td>{agent.agentName}</td>
                  <td>{agent.totalLeads}</td>
                  <td>{agent.hot}</td>
                  <td>{agent.converted}</td>
                  <td>
                    {agent.totalLeads > 0
                      ? `${(
                          (agent.converted / agent.totalLeads) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;