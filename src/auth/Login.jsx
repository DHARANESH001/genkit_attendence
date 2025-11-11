import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${formData.email}\nPassword: ${formData.password}`);
  };

  return (
    <div className="login-wrapper">
      <div className="left-panel">
        <img src="login.jpg" alt="login" />
      </div>
      <div className="right-panel">
        <h1 className="brand-top-right">
          GEN<span className="arrow">&gt;</span>IT
        </h1>
        <div className="welcome-section">
          <h2>Welcome Back!</h2>
          <p className="quotes">Consistency is the key to mastering any skill. By tracking your attendance, you turn dedication into measurable progress and stay on the path to success.</p>
        </div>
        <div className="login-card">
          <h3>Sign In</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
