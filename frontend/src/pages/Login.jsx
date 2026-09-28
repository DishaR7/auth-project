import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post(
        "/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      console.log("Access Token:", response.data.access_token);
      console.log(
        "Stored:",
        localStorage.getItem("access_token")
      );

      localStorage.setItem(
        "refresh_token",
        response.data.refresh_token
      );

      navigate("/dashboard");

      alert("Login successful!");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
  <div className="container">
    <h2>Login</h2>

    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">
        Login
      </button>
    </form>
  </div>

  );
}

export default Login;