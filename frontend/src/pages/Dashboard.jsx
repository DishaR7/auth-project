import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        if (response.data.role === "admin") {
          const summary = await api.get("/admin/summary", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUserCount(summary.data.total_users);
        }
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
        } else {
          alert("Unable to load your profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">Loading your account...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark">A</div>
          <span>AuthApp</span>
        </div>

        <button
          type="button"
          className="button-secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <section className="dashboard-content">
        <p className="dashboard-eyebrow">YOUR ACCOUNT</p>

        <h1>Welcome, {user.username}.</h1>

        <p className="dashboard-subtitle">
          Here's an overview of your account information.
        </p>

        <section className="dashboard-card">
          <div className="dashboard-card-heading">
            <div className="profile-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="dashboard-divider" />

          <div className="account-detail">
            <span>Account ID</span>
            <strong>{user.id}</strong>
          </div>

          <div className="account-detail">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>

          <div className="account-detail">
            <span>Email address</span>
            <strong>{user.email}</strong>
          </div>

          {user.role && (
            <div className="account-detail">
              <span>Account role</span>
              <strong className="role-label">{user.role}</strong>
            </div>
          )}
        </section>
        

        
        <div className="dashboard-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate("/edit-profile")}
          >
            Edit profile
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate("/change-password")}
          >
            Change password
          </button>
        </div>



        {/* Admin Overview — visible only to admins */}
        {user.role === "admin" && (
          <section className="admin-overview">
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h2>Admin Overview</h2>
            <p className="admin-overview-subtitle">
              Manage and review registered accounts.
            </p>

            <div className="admin-stats">
              <article className="admin-stat-card">
                <span>Total users</span>
                <strong>{userCount}</strong>
                <p>Registered accounts</p>
              </article>

              <article className="admin-stat-card">
                <span>Administrator</span>
                <strong>Admin</strong>
                <p>You have admin access</p>
              </article>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
            >
              Open User Management
            </button>
          </section>
        )}

        <div className="security-note">
          <span className="security-dot" />
          <p>Your account information is securely loaded.</p>
        </div>
      </section>

      <footer className="dashboard-footer">
        AuthApp <span>·</span> Account dashboard
      </footer>
    </main>
  );
}

export default Dashboard;