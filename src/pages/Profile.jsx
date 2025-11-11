import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = {
    name: "John Doe",
    id: "EMP12345",
    email: "johndoe@example.com",
    role: "Software Engineer",
    totalWorkingHours: "160 hrs",
    totalLeaveApplied: "3",
    absentDays: "1",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setShowPasswordForm(false);
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Employee Profile</h1>

        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Total Working Hours:</strong> {user.totalWorkingHours}</p>
          <p><strong>Total Leave Applied:</strong> {user.totalLeaveApplied}</p>
          <p><strong>Absent Days:</strong> {user.absentDays}</p>
        </div>

        {!showPasswordForm ? (
          <button
            className="theme-btn change-password-btn"
            onClick={() => setShowPasswordForm(true)}
          >
            Change Password
          </button>
        ) : (
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <div className="password-btns">
              <button type="submit" className="theme-btn save-btn">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <button className="theme-btn logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
