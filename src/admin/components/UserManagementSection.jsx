import React from "react";
import { useNavigate } from "react-router-dom";
const DEPT_MAP = {
  technology: "tec",
  developer: "dev",
  "ai engineer": "aie",
  "graphic designing": "grd",
};
const reverseDeptMap = Object.fromEntries(
  Object.entries(DEPT_MAP).map(([label, code]) => [code, label])
);

const UserManagementSection = ({
  users,
  selectedUserId,
  setSelectedUserId,
  selectedUserDetails,
  userDetailsLoading,
  userAdminPassword,
  setUserAdminPassword,
  editableUser,
  setEditableUser,
  handleLoadUserDetails,
  handleUpdateUser,
  handleDeleteUser,
}) => {
  const navigate = useNavigate();

  return (
    <section className="card admin-card admin-side-card">
      <h2 className="side-title">User Management</h2>
      <p className="side-subtitle">
        Inspect, update, or view a user's account.
      </p>

      {/* SELECT USER */}
      <div className="side-block">
        <label className="side-label">Select User</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Choose a user</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.user_id} - {u.full_name} ({u.status})
            </option>
          ))}
        </select>

        <button
          type="button"
          className="primary-filter-btn full-width-btn"
          onClick={handleLoadUserDetails}
          disabled={!selectedUserId || userDetailsLoading}
        >
          {userDetailsLoading ? "Loading..." : "Load Details"}
        </button>
      </div>

      {/* USER DETAILS */}
      {selectedUserDetails && (
        <>
          <div className="side-block details-block">
            <h3 className="details-title">
              {selectedUserDetails.full_name}
            </h3>

            <p className="details-line">
              <strong>ID:</strong> {selectedUserDetails.user_id}
            </p>
            <p className="details-line">
              <strong>Role:</strong> {selectedUserDetails.role}
            </p>
            <p className="details-line">
              <strong>Email:</strong> {selectedUserDetails.email}
            </p>
            <p className="details-line">
              <strong>Designation:</strong>{" "}
              {selectedUserDetails.designation}
            </p>
            <p className="details-line">
              <strong>Department:</strong>{" "}
              {reverseDeptMap[selectedUserDetails.department] ||
                selectedUserDetails.department}
            </p>

            <p className="details-line">
              <strong>Status:</strong> {selectedUserDetails.status}
            </p>
            <p className="details-line">
              <strong>Joined:</strong>{" "}
              {selectedUserDetails.date_of_joining}
            </p>

            {/* ✅ USER VIEW BUTTON */}
            <button
              type="button"
              className="secondary-btn full-width-btn"
              onClick={() => navigate("/dashboard")}
            >
              View User Dashboard
            </button>
          </div>

          {/* UPDATE USER */}
          <div className="side-block">
            <h4 className="side-section-heading">Update User Details</h4>

            <div className="form-field">
              <label>Full Name</label>
              <input
                value={editableUser.full_name}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, full_name: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={editableUser.email}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, email: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Role</label>
              <select
                value={editableUser.role}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, role: e.target.value })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            {/* DEPARTMENT */}
            <div className="form-field">
              <label>Department</label>
              <select
                value={editableUser.department}
                onChange={(e) =>
                  setEditableUser({
                    ...editableUser,
                    department: e.target.value,
                  })
                }
              >
                <option value="">Select department</option>
                {Object.entries(DEPT_MAP).map(([label, code]) => (
                  <option key={code} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>


            <div className="form-field">
              <label>Status</label>
              <select
                value={editableUser.status}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, status: e.target.value })
                }
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="terminated">terminated</option>
              </select>
            </div>

            <div className="form-field">
              <label>Date of Joining</label>
              <input
                type="date"
                value={editableUser.date_of_joining}
                onChange={(e) =>
                  setEditableUser({
                    ...editableUser,
                    date_of_joining: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-field">
              <label>Admin Password</label>
              <input
                type="password"
                value={userAdminPassword}
                onChange={(e) => setUserAdminPassword(e.target.value)}
              />
            </div>

            <button
              className="primary-filter-btn full-width-btn"
              onClick={handleUpdateUser}
            >
              Update User
            </button>

          </div>
        </>
      )}
    </section>
  );
};

export default UserManagementSection;
