import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const BASE_URL = "/api/v1"; // goes through Vite proxy

const Login = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier, // email or ID (24gkt.tec001)
          password: formData.password,
        }),
      });

      if (!res.ok) {
        let msg = "Login failed. Please check your credentials.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json();

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-fullscreen">
      {/* LEFT IMAGE PANEL (hidden on mobile via CSS) */}
      <div className="left-panel">
        <video
          className="left-video"
          src="login.mp4"   // put video inside /public or /assets
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="video-overlay"></div>
      </div>
      <div className="right-panel">
        <header className="brand">
          <img
            src="/lightGK-logo.jpeg"
            alt="GENKIT logo"
            className="brand-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </header>

        <div className="right-content-center">
          {/* TEXT */}
          <div className="welcome">
            <h2>Welcome Back 👋</h2>
            <p className="quote">
              Consistency is the key to mastering any skill. Track your
              attendance and turn dedication into measurable progress.
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="login-card">
            <h3>Sign In</h3>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="identifier"
                placeholder="Email or Employee ID"
                value={formData.identifier}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
