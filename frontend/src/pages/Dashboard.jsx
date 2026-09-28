import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
  };

  useEffect(() => {
    loadProfile();
  }, []);

 return (
  <div className="container">
    <h2>Welcome, {user?.username}</h2>

    {user ? (
      <div className="profile-card">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    ) : (
      <p>Loading profile...</p>
    )}

    <div className="button-group">
      <button onClick={handleLogout}>
        Logout
      </button>

      <button onClick={() => navigate("/ai-chat")}>
        AI Interview Prep
      </button>
    </div>
  </div>
);
}

export default Dashboard;