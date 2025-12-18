import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AttendanceLog.css";

const BASE_URL = "/api/v1";

// ---------- TOKEN HELPERS ----------
async function getAccessToken() {
  let access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  if (!access || isExpired(access)) {
    if (!refresh) {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }

    const res = await fetch(`${BASE_URL}/token/refresh/`, {
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

// ---------- COMPONENT ----------
const AttendanceLog = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [totalWorkingHours, setTotalWorkingHours] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPage("/attendance/history/"); // ❗ backend controls page size (2)
  }, []);

  const fetchPage = async (endpoint) => {
    setLoading(true);
    setError("");

    try {
      const access = await getAccessToken();

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!res.ok) {
        let msg = "Failed to load attendance history.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch { }
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const results = data.results || {};

      setSessions(results.sessions || []);
      setTotalWorkingHours(results.total_working_hours || "");
      setNextPage(extractEndpoint(data.next));
      setPrevPage(extractEndpoint(data.previous));
    } catch (err) {
      setError(err.message || "Something went wrong.");
      if (err.message.toLowerCase().includes("session expired")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const extractEndpoint = (url) => {
    if (!url) return null;
    if (!url.startsWith("http")) return url.replace("/api/v1", "");
    try {
      const u = new URL(url);
      return `${u.pathname.replace("/api/v1", "")}${u.search}`;
    } catch {
      return null;
    }
  };

  const formatDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString("en-GB") : "—";

  const formatTime = (isoDateTime) =>
    isoDateTime
      ? new Date(isoDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

  // Backend sends: HH:MM:SS.microseconds
  const formatDuration = (duration) => {
    if (!duration) return "—";
    const [timePart] = duration.split(".");
    const [hh, mm, ss] = timePart.split(":");
    return `${hh}.${mm}.${ss}`;
  };

  const computeStatus = (s) => {
    if (s.check_in && s.check_out) return "Present";
    if (s.check_in && !s.check_out) return "In Progress";
    return "Absent";
  };

  return (
    <div className="attendance-wrapper">
      <header className="navbar-container">
        <nav className="navbar">
          <div className="navbar-left">
            <img
              src="/lightGK-logo.jpeg"
              alt="App Logo"
              className="navbar-logo-img"
            />
            <div className="navbar-text-group">
              <span className="navbar-subtitle">
                Smart Attendance Tracker
              </span>
            </div>
          </div>

          <div className="navbar-right">
            <div className="nav-pill-group">
              <button
                className="nav-pill"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
              <button className="nav-pill active">Attendance</button>
              <button
                className="nav-pill"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="attendance-page">
        <div className="attendance-content">
          <section className="card attendance-card">
            <div className="attendance-header">
              <div>
                <h1 className="attendance-title">Attendance Log</h1>
                {/* <p className="attendance-subtitle">
                  Paginated attendance history (2 records per page)
                </p> */}
              </div>

              {totalWorkingHours && (
                <div className="total-hours-pill">
                  <span className="total-label">Total Working Hours</span>
                  <span className="total-value">
                    {totalWorkingHours}
                  </span>
                </div>
              )}
            </div>

            {loading && <p className="history-message">Loading...</p>}
            {error && <p className="history-error">{error}</p>}

            {!loading && !error && (
              <>
                <div className="table-container">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Total Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-row">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        sessions.map((row) => (
                          <tr key={row.id}>
                            <td>{formatDate(row.date)}</td>
                            <td>{formatTime(row.check_in)}</td>
                            <td>{formatTime(row.check_out)}</td>
                            <td>{formatDuration(row.duration)}</td>
                            <td
                              className={`status-pill ${computeStatus(row) === "Present"
                                  ? "status-present"
                                  : computeStatus(row) === "In Progress"
                                    ? "status-progress"
                                    : "status-absent"
                                }`}
                            >
                              {computeStatus(row)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={!prevPage}
                    onClick={() => fetchPage(prevPage)}
                  >
                    ◀ Previous
                  </button>

                  <button
                    className="page-btn"
                    disabled={!nextPage}
                    onClick={() => fetchPage(nextPage)}
                  >
                    Next ▶
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AttendanceLog;
