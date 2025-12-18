import React from "react";

/* ---------- FORMAT HELPERS ---------- */
const formatTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB"); // DD-MM-YYYY
};

const formatDuration = (value) => {
  if (!value) return "—";
  return value.split(".")[0]; // HH:MM:SS
};
/* ----------------------------------- */

const AttendanceSection = ({
  sessions,
  attendanceLoading,
  attendanceError,
  attendanceMessage,
  page,
  hasNext,
  hasPrev,

  /* pagination */
  handleNextPage,
  handlePrevPage,

  /* correction */
  correctionSessionId,
  correctionCheckout,
  setCorrectionCheckout,
  correctionAdminPassword,
  setCorrectionAdminPassword,
  correctionLoading,
  handleStartCorrection,
  handleSubmitCorrection,
  handleDeleteSession,
}) => {
  return (
    <section className="card admin-card admin-main-card">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Attendance Overview</h1>
          <p className="admin-subtitle">
            Attendance logs of all users (paginated).
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {attendanceLoading ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  Loading attendance logs...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.user_id}</td>
                  <td>{formatDate(s.date)}</td>
                  <td>{formatTime(s.check_in)}</td>
                  <td>{formatTime(s.check_out)}</td>
                  <td>{formatDuration(s.duration)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="action-chip"
                        onClick={() => handleStartCorrection(s.id)}
                      >
                        Correct
                      </button>

                      <button
                        type="button"
                        className="action-chip danger"
                        onClick={() => handleDeleteSession(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CORRECTION PANEL */}
      {correctionSessionId && (
        <div className="correction-panel">
          <h3>Correct Attendance</h3>
          <p className="correction-hint">
            Update checkout time for session ID #{correctionSessionId}
          </p>

          <div className="correction-grid">
            <div className="form-field">
              <label>New Check-out Time</label>
              <input
                type="datetime-local"
                value={correctionCheckout}
                onChange={(e) => setCorrectionCheckout(e.target.value)}
              />

            </div>

            <div className="form-field">
              <label>Admin Password</label>
              <input
                type="password"
                value={correctionAdminPassword}
                onChange={(e) =>
                  setCorrectionAdminPassword(e.target.value)
                }
              />
            </div>
          </div>

          <div className="correction-actions">
            <button
              className="primary-filter-btn"
              onClick={handleSubmitCorrection}
              disabled={correctionLoading}
            >
              {correctionLoading ? "Saving..." : "Submit Correction"}
            </button>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="pagination-row">
        <button
          className="page-btn"
          onClick={handlePrevPage}
          disabled={!hasPrev}
        >
          Previous
        </button>

        <span className="page-indicator">Page {page}</span>

        <button
          className="page-btn"
          onClick={handleNextPage}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>

      {/* MESSAGES */}
      {attendanceError && (
        <p className="admin-error">{attendanceError}</p>
      )}
      {attendanceMessage && (
        <p className="admin-message success">{attendanceMessage}</p>
      )}
    </section>
  );
};

export default AttendanceSection;
