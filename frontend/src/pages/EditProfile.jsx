import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function EditProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
          return;
        }

        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await api.put(
        "/profile",
        {
          username: username.trim(),
          email: email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsername(response.data.username);
      setEmail(response.data.email);
      setMessage("Profile updated successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-profile-page">
        <p className="edit-profile-loading">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <section className="edit-profile-card">
        <Link to="/dashboard" className="edit-profile-back">
          ← Back to dashboard
        </Link>

        <div className="edit-profile-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <p className="edit-profile-eyebrow">ACCOUNT SETTINGS</p>
        <h1>Edit profile</h1>
        <p className="edit-profile-subtitle">
          Update the information associated with your account.
        </p>

        {message && (
          <p className="edit-profile-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="edit-profile-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="edit-profile-field">
            <label htmlFor="edit-username">Username</label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={100}
              required
            />
          </div>

          <div className="edit-profile-field">
            <label htmlFor="edit-email">Email address</label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={255}
              required
            />
          </div>

          <div className="edit-profile-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>

            <Link to="/dashboard" className="edit-profile-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditProfile;