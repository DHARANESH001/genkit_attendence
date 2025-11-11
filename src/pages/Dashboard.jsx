import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    alert("✅ You have checked in successfully!");
  };

  const handleCheckOut = () => {
    alert("👋 You have checked out. Have a great day!");
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <img src=".jpg" alt="Logo" className="navbar-logo" />
          <h2 className="navbar-title">GENKIT</h2>
        </div>

        <div className="navbar-right">
          <button
            className="profile-btn"
            onClick={() => navigate("/attendance")}
          >
            Attendance
          </button>
          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </div>
      </nav>
      <div className="clock-section">
        <div className="digital-clock">
          {time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="date">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
      <div className="buttons">
        <button className="checkin-btn" onClick={handleCheckIn}>
          Check In
        </button>
        <button className="checkout-btn" onClick={handleCheckOut}>
          Check Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
