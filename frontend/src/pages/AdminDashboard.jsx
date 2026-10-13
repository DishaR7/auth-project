import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const [roleError, setRoleError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);

  const navigate = useNavigate();

  // Fetch all users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.status === 403
            ? "You do not have permission to view this page."
            : "Unable to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Change a user's role
  const handleRoleChange = async (userId, newRole) => {
    setRoleMessage("");
    setRoleError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingUserId(userId);

    try {
      await api.put(
        `/admin/users/${userId}/role`,
        null,
        {
          params: { role: newRole },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? { ...user, role: newRole }
            : user
        )
      );

      setRoleMessage("User role updated successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login", { replace: true });
        return;
      }

      setRoleError(
        err.response?.data?.detail ||
          "Unable to update user role. Please try again."
      );
    } finally {
      setSavingUserId(null);
    }
  };

  // Delete a user account
  const handleDeleteUser = async (userId, username) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${username}'s account?`
    );

    if (!confirmed) return;

    setRoleMessage("");
    setRoleError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId)
      );

      setRoleMessage(`${username}'s account was deleted successfully.`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login", { replace: true });
        return;
      }

      setRoleError(
        err.response?.data?.detail ||
          "Unable to delete user. Please try again."
      );
    }
  };

  // Log out the current admin
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  };

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const regularUserCount = users.length - adminCount;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-mark">A</div>
          <div>
            <strong>AuthApp</strong>
            <span>Administration</span>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <section className="admin-content">
        <p className="admin-eyebrow">ADMINISTRATION</p>

        <h1>Overview</h1>

        <p className="admin-subtitle">
          Manage and review registered accounts.
        </p>

        {loading ? (
          <p className="admin-message">Loading users...</p>
        ) : error ? (
          <div className="admin-error" role="alert">
            <h3>Access unavailable</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Return to dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="admin-stats">
              <article className="admin-stat-card">
                <span>Total users</span>
                <strong>{users.length}</strong>
                <p>Registered accounts</p>
              </article>

              <article className="admin-stat-card">
                <span>Administrators</span>
                <strong>{adminCount}</strong>
                <p>Accounts with admin access</p>
              </article>

              <article className="admin-stat-card">
                <span>Regular users</span>
                <strong>{regularUserCount}</strong>
                <p>Standard accounts</p>
              </article>
            </div>

            {/* User table */}
            <section className="admin-users-card">
              <div className="admin-users-heading">
                <div>
                  <h2>User accounts</h2>
                  <p>All registered users in your database.</p>
                </div>

                <span className="admin-count">
                  {users.length} accounts
                </span>
              </div>

              {/* Success and error messages */}
              {roleMessage && (
                <p className="role-success" role="status">
                  {roleMessage}
                </p>
              )}

              {roleError && (
                <p className="role-error" role="alert">
                  {roleError}
                </p>
              )}

              {users.length === 0 ? (
                <p className="admin-message">
                  No registered users yet.
                </p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>

                          <td className="admin-username">
                            {user.username}
                          </td>

                          <td>{user.email}</td>

                          <td>
                            <span
                              className={`admin-role ${
                                user.role === "admin"
                                  ? "admin-role-admin"
                                  : ""
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          <td>
                            <div className="admin-user-actions">
                              <select
                                className="admin-role-select"
                                value={user.role}
                                disabled={savingUserId === user.id}
                                aria-label={`Change role for ${user.username}`}
                                onChange={(e) =>
                                  handleRoleChange(
                                    user.id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>

                              <button
                                type="button"
                                className="admin-delete-button"
                                onClick={() =>
                                  handleDeleteUser(
                                    user.id,
                                    user.username
                                  )
                                }
                                disabled={
                                  user.role === "admin" ||
                                  savingUserId === user.id
                                }
                                title={
                                  user.role === "admin"
                                    ? "Admin accounts cannot be deleted here"
                                    : "Delete this user"
                                }
                              >
                                {user.role === "admin"
                                  ? "Admin"
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>

      <footer className="admin-footer">
        AuthApp · Admin Dashboard
      </footer>
    </main>
  );
}

export default AdminDashboard;