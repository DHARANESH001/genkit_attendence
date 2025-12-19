// src/admin/components/AdminMiscSection.jsx
import React from "react";

const AdminMiscSection = ({
  systemStats,
  statsLoading,
  statsError,
  onRefreshStats,
  newUserForm,
  onCreateUserChange,
  onCreateUser,
  createUserLoading,
  createUserError,
  createUserMessage,
  testApiResult,
  testApiLoading,
  onTestApi,
}) => {

  const formatTime = (isoDateTime) =>
    isoDateTime
      ? new Date(isoDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";


  const formatDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString("en-GB") : "—";

  return (
    <section className="card admin-card admin-side-card">
      {/* SYSTEM STATS */}
      <h2 className="side-title">System Statistics</h2>
      <p className="side-subtitle">
        Quick overview of users, admins and system status.
      </p>

      <div className="side-block">
        {statsError && <p className="admin-error">{statsError}</p>}
        {systemStats && (
          <div className="details-block" style={{ marginTop: 8 }}>
            <p className="details-line">
              <strong>Total users:</strong> {systemStats.total_users}
            </p>
            <p className="details-line">
              <strong>Active users:</strong> {systemStats.total_active_users}
            </p>
            <p className="details-line">
              <strong>Admins:</strong> {systemStats.total_admins}
            </p>
            <p className="details-line">
              <strong>Suspended:</strong> {systemStats.total_suspended}
            </p>
            <p className="details-line">
              <strong>Terminated:</strong> {systemStats.total_terminated}
            </p>
            <p className="details-line">
              <strong>Last updated:</strong>{" "}
              {formatTime(systemStats.last_updated_at)}&nbsp;
              {formatDate(systemStats.last_updated_at)}
            </p>
          </div>
        )}
        <div className="results-summary" style={{ margin: 0 }}>
          <button
            type="button"
            className="secondary-filter-btn"
            onClick={onRefreshStats}
            disabled={statsLoading}
          >
            {statsLoading ? "Refreshing..." : "Refresh Stats"}
          </button>
        </div>
      </div>

      {/* CREATE USER */}
      <div className="side-block">
        <h3 className="side-section-heading">Create New User</h3>
        <form onSubmit={onCreateUser} className="create-user-form">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              value={newUserForm.full_name}
              onChange={(e) =>
                onCreateUserChange("full_name", e.target.value)
              }
              required
            />
          </div>
          <div className="form-field">
            <label>Department</label>
            <input
              type="text"
              value={newUserForm.department}
              onChange={(e) =>
                onCreateUserChange("department", e.target.value)
              }
              required
            />
          </div>
          <div className="form-field">
            <label>Designation</label>
            <input
              type="text"
              value={newUserForm.designation}
              onChange={(e) =>
                onCreateUserChange("designation", e.target.value)
              }
              required
            />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select
              value={newUserForm.role}
              onChange={(e) =>
                onCreateUserChange("role", e.target.value)
              }
              required
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={newUserForm.email}
              onChange={(e) =>
                onCreateUserChange("email", e.target.value)
              }
              required
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={newUserForm.password}
              onChange={(e) =>
                onCreateUserChange("password", e.target.value)
              }
              required
            />
          </div>
          <div className="form-field">
            <label>Date of Joining</label>
            <input
              type="date"
              value={newUserForm.date_of_joining}
              onChange={(e) =>
                onCreateUserChange("date_of_joining", e.target.value)
              }
              required
            />
          </div>

          {createUserError && (
            <p className="admin-error">{createUserError}</p>
          )}
          {createUserMessage && (
            <p className="admin-message success">{createUserMessage}</p>
          )}

          <button
            type="submit"
            className="secondary-btn full-width-btn"
            disabled={createUserLoading}
          >
            {createUserLoading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

      {/* TEST API
      <div className="side-block">
        <h3 className="side-section-heading">Test API /test</h3>
        <p className="side-subtitle" style={{ marginBottom: 6 }}>
          Backend connectivity check (no token required).
        </p>
        <button
          type="button"
          className="secondary-filter-btn full-width-btn"
          onClick={onTestApi}
          disabled={testApiLoading}
        >
          {testApiLoading ? "Testing..." : "Run Test"}
        </button>
        {testApiResult && (
          <p
            className={
              testApiResult.toLowerCase().includes("failed")
                ? "admin-error"
                : "admin-message success"
            }
            style={{ marginTop: 6 }}
          >
            {typeof testApiResult === "string"
              ? testApiResult
              : JSON.stringify(testApiResult)}
          </p>
        )}
      </div> */}
    </section>
  );
};

export default AdminMiscSection;
