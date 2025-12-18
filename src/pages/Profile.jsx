import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const BASE_URL = "/api/v1";

async function getAccessToken() {
  let access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  if (!access || isExpired(access)) {
    if (!refresh) {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }

    const res = await fetch(`${BASE_URL}/token/refresh`, {
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

const Profile = () => {
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false); // ⬅ hidden by default
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    setError("");
    setMessage("");

    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!res.ok) {
        let msg = "Failed to load profile.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) {}
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(msg);
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      if (err.message.toLowerCase().includes("session expired")) {
        navigate("/");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoadingPassword(true);

    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          old_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          confirm_password: passwords.confirmPassword,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to update password.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) {}
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(msg);
      }

      const data = await res.json();
      setMessage(data.message || "Password Updated Successfully");
      setShowPasswordForm(false); // ⬅ hide form after success
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
      if (err.message.toLowerCase().includes("session expired")) {
        navigate("/");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const formattedJoinDate = profile?.date_of_joining
    ? new Date(profile.date_of_joining).toLocaleDateString("en-GB")
    : "—";

  return (
    <div className="profile-wrapper">
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
                className="nav-pill"
                onClick={() => navigate("/dashboard")}
              >
                Dashborad
              </button>
              <button
                className="nav-pill"
                onClick={() => navigate("/attendance")}
              >
                Attendance
              </button>

              <button className="nav-pill active">Profile</button>
              
            </div><br/>
            <button className="nav-pill logout-pill" onClick={handleLogout}>
                Logout
              </button>
          </div>
        </nav>
      </header>

      <main className="profile-page">
        <div className="profile-content">
          <section className="card profile-card">
            {loadingProfile && (
              <p className="profile-message">Loading profile...</p>
            )}
            {error && <p className="profile-error">{error}</p>}

            {profile && (
              <>
                {/* HEADER */}
                <div className="profile-header">
                  <div className="avatar-circle">
                    <span className="avatar-initial">
                      {profile.full_name?.charAt(0) || "U"}
                    </span>
                  </div>

                  <div className="profile-header-text">
                    <h1 className="profile-title">Employee Profile</h1>
                    <p className="profile-subtitle">
                      View your personal information and update settings.
                    </p>
                  </div>
                </div>

                {/* MAIN GRID */}
                <div className="profile-main-grid">
                  <div className="profile-info-card">
                    <h2 className="section-title">Personal Details</h2>
                    <div className="profile-info">
                      <p>
                        <strong>Name:</strong> {profile.full_name}
                      </p>
                      <p>
                        <strong>ID:</strong> {profile.user_id}
                      </p>
                      <p>
                        <strong>Email:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>Designation:</strong> {profile.designation}
                      </p>
                      <p>
                        <strong>Department:</strong> {profile.department}
                      </p>
                      <p>
                        <strong>Date of Joining:</strong> {formattedJoinDate}
                      </p>
                    </div>
                  </div>

                  <div className="profile-metrics-card">
                    <h2 className="section-title">Summary</h2>

                    <div className="profile-metrics">
                      <div className="metric-pill">
                        <span className="metric-label">Working Hours</span>
                        <span className="metric-value">—</span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Leave Applied</span>
                        <span className="metric-value">—</span>
                      </div>
                      <div className="metric-pill">
                        <span className="metric-label">Absent Days</span>
                        <span className="metric-value">—</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* PASSWORD SECTION */}
                <div className="password-section">
                  <div className="password-header">
                    <h2 className="section-title">Security &amp; Password</h2>
                    <p className="section-subtitle">
                      Update your password regularly to keep your account safe.
                    </p>
                  </div>

                  {message && (
                    <p className="profile-message profile-message-inline">
                      {message}
                    </p>
                  )}

                  {!showPasswordForm && (
                    <button
                      className="theme-btn change-password-btn"
                      onClick={() => {
                        setShowPasswordForm(true);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Change Password
                    </button>
                  )}

                  {showPasswordForm && (
                    <form
                      className="password-form"
                      onSubmit={handlePasswordSubmit}
                    >
                      <div className="password-grid">
                        <div className="form-field">
                          <label>Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            placeholder="Enter current password"
                            value={passwords.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            placeholder="Enter new password"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-enter new password"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="profile-error profile-error-inline">
                          {error}
                        </p>
                      )}

                      <div className="password-btns">
                        <button
                          type="submit"
                          className="theme-btn save-btn"
                          disabled={loadingPassword}
                        >
                          {loadingPassword ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswords({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setError("");
                            setMessage("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
