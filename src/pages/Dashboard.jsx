import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'
import "./Dashboard.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${BASE_URL}/api/v1`;

// ================= TOKEN HELPERS =================

async function getAccessToken() {
  let access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  if (!access || isExpired(access)) {
    if (!refresh) {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }

    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.access);
      access = data.access;
    } else {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }
  }

  return access;
}

function isExpired(token) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ================= ROLE HELPER (CASE NORMALIZED) =================

function getUserRoles() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return [];

    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));

    // Convert ALL roles to UPPERCASE
    if (Array.isArray(decoded.roles)) {
      return decoded.roles.map(r => r.toUpperCase());
    }

    if (decoded.role) {
      return [decoded.role.toUpperCase()];
    }

    return [];
  } catch {
    return [];
  }
}

// ================= COMPONENT =================

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [loggingTime, setLoggingTime] = useState(false)
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const savedStatus = localStorage.getItem("isCheckedIn");
    setIsCheckedIn(savedStatus === "true");
    setRoles(getUserRoles());
    const savedLoggingTime = localStorage.getItem('loggingTime');
    setLoggingTime(savedLoggingTime)
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  const attendanceStatus = async () => {
    const access = await getAccessToken();

    const res = await fetch(`${API_URL}/attendance/status/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch attendance status");
    }

    const data = await res.json();
    return data;

  }


  useEffect(() => {

    const loadStatus = async () => {
      const data = await attendanceStatus();
      setIsCheckedIn(data.is_checked_in);
      if(data.is_checked_in){
        setLoggingTime(data.checkin_time)
      }else{
        setLoggingTime(data.checkout_time)
      }
      
    }

    loadStatus();
  }, []);


  const authorizedPost = async (path) => {
    const access = await getAccessToken();

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: {},
    });

    if (!res.ok) {
      let msg = "Request failed.";
      try {
        const errData = await res.json();
        if (errData?.message) msg = errData.message;
      } catch { }

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate("/");
      }
      throw new Error(msg);
    }

    return res.json();
  };

  const formatTime = (isoDateTime) =>
    isoDateTime
      ? new Date(isoDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";


  const handleSingleButton = async () => {
    setError("");
    setApiMessage("");
    setLoading(true);

    try {
      if (!isCheckedIn) {
        const data = await authorizedPost("/attendance/checkin/");
        setIsCheckedIn(true);
        localStorage.setItem("isCheckedIn", "true");
        setApiMessage(data.message || "Check-in Successful");
        setLoggingTime(data.session.check_in)
        localStorage.setItem('loggingTime', data.session.check_in)
      } else {
        const data = await authorizedPost("/attendance/checkout/");
        setIsCheckedIn(false);
        localStorage.setItem("isCheckedIn", "false");
        setApiMessage(data.message || "Check-out Successful");
        setLoggingTime(data.session.check_out)
        localStorage.setItem('loggingTime', data.session.check_out)
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      if (err.message.toLowerCase().includes("session expired")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formatDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString("en-GB") : "—";


  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  useEffect(() => {
    if (!apiMessage) return;

    if (isCheckedIn) {
      toast.success(apiMessage);
    } else {
      toast.info(apiMessage);
    }
  }, [isCheckedIn, apiMessage]);


  return (
    <div className="dashboard-wrapper">
      <header className="navbar-container">
        <nav className="navbar">
          <div className="navbar-left">
            <img
              src="/lightGK-logo.jpeg"
              alt="App Logo"
              className="navbar-logo-img"
            />
            <div className="navbar-text-group">
              <span className="navbar-subtitle">Smart Attendance Tracker</span>
            </div>
          </div>

          <div className="navbar-right">
            <div className="nav-pill-group">
              <button
                className={`nav-pill ${window.location.pathname === "/dashboard" ? "active" : ""
                  }`}
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>

              <button
                className={`nav-pill ${window.location.pathname === "/attendance" ? "active" : ""
                  }`}
                onClick={() => navigate("/attendance")}
              >
                Attendance
              </button>

              <button
                className={`nav-pill ${window.location.pathname === "/profile" ? "active" : ""
                  }`}
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              {/* ✅ ADMIN BUTTON (LOWERCASE ROLE FIXED) */}
              {roles.includes("ADMIN") && (
                <button
                  className={`nav-pill ${window.location.pathname === "/admin" ? "active" : ""
                    }`}
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="dashboard-page">
        <div className="dashboard-content">
          <section className="card clock-card">
            <p className="greeting-text">Welcome back 👋</p>
            <h1 className="clock-time">{formattedTime}</h1>
            <p className="clock-date">{formattedDate}</p>
            <p className="helper-text">
              Keep your attendance up to date. Click the button below to check
              in or check out.
            </p>
          </section>

          <section className="card action-card">
            <h3 className="section-title">Today&apos;s Attendance</h3>
            <p className="section-subtitle">
              Tap the button based on your working status.
            </p>

            <div className="buttons-row">
              <button
                className={`primary-btn ${isCheckedIn ? "checkout" : "checkin"
                  }`}
                onClick={handleSingleButton}
                disabled={loading}
              >
                {loading
                  ? isCheckedIn
                    ? "Checking out..."
                    : "Checking in..."
                  : isCheckedIn
                    ? "Check Out"
                    : "Check In"}
              </button>
            </div>

            {
              /* {apiMessage && <p className="api-message">{apiMessage}</p>} */

            }
            {/* {
             isCheckedIn?  toast.success(apiMessage) :
             toast.error(apiMessage)} */}
            {error && <p className="api-error">{error}</p>}

            <div className="info-row">
              <div className="info-pill">
                <span className="pill-label">Status</span>
                <br />
                <span className="pill-value">
                  {isCheckedIn ? "Checked In" : "Not Checked In"}
                </span>
              </div>

              <div className="info-pill">
                <span className="pill-label">Today</span>
                <br />
                <span className="pill-value">
                  {time.toLocaleDateString("en-GB")}
                </span>
              </div>


              <div className="info-pill">
                <span className="pill-label">{isCheckedIn ? 'Checked In at' : 'Last Checked Out At'}</span>
                <br />
                <span className="pill-value">
                  
                    <p style={{ display: 'inline' }}>{formatDate(loggingTime)}   </p> 
                  {formatTime(loggingTime)}
                </span>
              </div> : ''

            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
