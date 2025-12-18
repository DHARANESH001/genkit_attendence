// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import AttendanceSection from "./components/AttendanceSection";
import UserManagementSection from "./components/UserManagementSection";
import AdminMiscSection from "./components/AdminMiscSection";

const BASE_URL = "/api/v1";

const DEPT_MAP = {
  technology: "technology",
  developer: "developer",
  "ai engineer": "ai engineer",
  "graphic designing": "graphic designing",
};

const reverseDeptMap = Object.fromEntries(
  Object.entries(DEPT_MAP).map(([label, code]) => [code, label])
);

function isExpired(token) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

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

    if (!res.ok) {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }

    const data = await res.json();
    localStorage.setItem("accessToken", data.access);
    access = data.access;
  }

  return access;
}

// ---------- COMPONENT ----------
const AdminDashboard = () => {
  const navigate = useNavigate();

  // Attendance + filters
  const [sessions, setSessions] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUserFilter, setSelectedUserFilter] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // User management
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userAdminPassword, setUserAdminPassword] = useState("");
  const [editableUser, setEditableUser] = useState({
    full_name: "",
    email: "",
    role: "",
    designation: "",
    department: "",
    status: "",
    date_of_joining: "",
  });

  // Attendance correction
  const [correctionSessionId, setCorrectionSessionId] = useState(null);
  const [correctionCheckout, setCorrectionCheckout] = useState("");
  const [correctionAdminPassword, setCorrectionAdminPassword] = useState("");
  const [correctionLoading, setCorrectionLoading] = useState(false);

  // System stats (4.5)
  const [systemStats, setSystemStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Create user (4.6)
  const [newUserForm, setNewUserForm] = useState({
    full_name: "",
    department: "",
    designation: "",
    role: "user",
    password: "",
    email: "",
    date_of_joining: "",
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserMessage, setCreateUserMessage] = useState("");

  // Test API (4.7)
  const [testApiResult, setTestApiResult] = useState("");
  const [testApiLoading, setTestApiLoading] = useState(false);

  // Check role & load initial data
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } catch {
      navigate("/");
      return;
    }

    fetchUsers();
    fetchAttendance({ resetPage: true });
    fetchSystemStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ---------- API: USERS ----------
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load users.");
      }

      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // ---------- API: ATTENDANCE (4.1) ----------
  const buildAttendanceQuery = (pageOverride) => {
    const params = new URLSearchParams();

    if (selectedUserFilter) params.append("user", selectedUserFilter);

    if (todayOnly) {
      params.append("today", "true");
    } else if (dateFilter) {
      params.append("date", dateFilter);
    } else {
      if (startFilter) params.append("start", startFilter);
      if (endFilter) params.append("end", endFilter);
    }

    const pageToUse = pageOverride || page;
    if (pageToUse > 1) params.append("page", String(pageToUse));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const fetchAttendance = async ({ resetPage = false, pageOverride } = {}) => {
    if (resetPage) setPage(1);
    const targetPage = resetPage ? 1 : pageOverride || page;

    setAttendanceLoading(true);
    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const access = await getAccessToken();
      const query = buildAttendanceQuery(targetPage);

      const url = `${BASE_URL}/admin/attendance-logs${query}`;
      console.log("🔍 Calling:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!res.ok) {
        let msg = `Failed to load attendance (status ${res.status})`;
        try {
          const errData = await res.json();
          msg =
            errData?.message ||
            errData?.detail ||
            msg + `: ${JSON.stringify(errData)}`;
        } catch (_) { }
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          throw new Error("Session expired or not authorized as admin.");
        }
        throw new Error(msg);
      }

      const data = await res.json();
      console.log("✅ Attendance response:", data);

      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);

      const list = data.results?.session || [];
      setSessions(list);
      setPage(targetPage);
    } catch (err) {
      console.error(err);
      setAttendanceError(err.message || "Something went wrong.");
      if (err.message.toLowerCase().includes("session expired")) {
        navigate("/");
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchAttendance({ resetPage: true });
  };

  const handleClearFilters = () => {
    setSelectedUserFilter("");
    setTodayOnly(false);
    setDateFilter("");
    setStartFilter("");
    setEndFilter("");
    setPage(1);
    fetchAttendance({ resetPage: true });
  };

  const handleNextPage = () => {
    if (!hasNext) return;
    const newPage = page + 1;
    fetchAttendance({ pageOverride: newPage });
  };

  const handlePrevPage = () => {
    if (!hasPrev || page <= 1) return;
    const newPage = page - 1;
    fetchAttendance({ pageOverride: newPage });
  };

  // ---------- EXPORT ----------
  const exportToCSV = () => {
    if (!sessions.length) return;

    const header = ["Session ID", "User ID", "Date", "Check In", "Check Out", "Duration"];
    const rows = sessions.map((s) => [
      s.id,
      s.user_id,
      s.date,
      s.check_in,
      s.check_out || "",
      s.duration || "",
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (!sessions.length) return;
    const header = ["Session ID", "User ID", "Date", "Check In", "Check Out", "Duration"];
    const rows = sessions.map((s) => [
      s.id,
      s.user_id,
      s.date,
      s.check_in,
      s.check_out || "",
      s.duration || "",
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_attendance.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadUserDetails = async () => {
    if (!selectedUserId) return;
    setUserDetailsLoading(true);
    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/admin/user/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!res.ok) throw new Error("Failed to load user details");

      const data = await res.json();
      setSelectedUserDetails(data);

      setEditableUser({
        full_name: data.full_name || "",
        email: data.email || "",
        role: data.role || "user",
        designation: data.designation || "",
        department: reverseDeptMap[data.department] || "",
        status: data.status || "active",
        date_of_joining: data.date_of_joining || "",
      });
    } catch (err) {
      setAttendanceError(err.message);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUserId || !userAdminPassword) {
      setAttendanceError("Admin password is required.");
      return;
    }

    setAttendanceError("");
    setAttendanceMessage("");

    // ✅ BUILD CLEAN PAYLOAD FIRST
    const payload = {};

    Object.entries(editableUser).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        payload[key] = value;
      }
    });

    // ✅ Convert department label → code
    if (payload.department) {
      payload.department =
        DEPT_MAP[payload.department] || payload.department;
    }

    // ✅ Attach admin password
    payload.admin_password = userAdminPassword;

    // ✅ Prevent empty update
    if (Object.keys(payload).length <= 1) {
      setAttendanceError("No changes to update.");
      return;
    }

    try {
      const access = await getAccessToken();
      const res = await fetch(
        `${BASE_URL}/admin/user/${selectedUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update user");
      }

      const data = await res.json();
      setSelectedUserDetails(data.data);
      setAttendanceMessage(data.message);
      setUserAdminPassword("");
    } catch (err) {
      setAttendanceError(err.message || "Failed to update user");
    }
  };


  const toUTCISOString = (localDateTime) => {
    if (!localDateTime) return null;
    return new Date(localDateTime).toISOString();
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId || !userAdminPassword) {
      setAttendanceError("Enter admin password to delete user.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/admin/user/${selectedUserId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          admin_password: userAdminPassword,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to delete user.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json();
      setAttendanceMessage(data.message || "User deleted successfully.");
      setSelectedUserDetails(null);
      setUserAdminPassword("");
      fetchUsers();
    } catch (err) {
      setAttendanceError(err.message || "Something went wrong.");
    }
  };

  // ---------- ATTENDANCE CORRECTION (4.4) ----------
  const handleStartCorrection = (sessionId) => {
    setCorrectionSessionId(sessionId);
    setCorrectionCheckout("");
    setCorrectionAdminPassword("");
  };


  const handleSubmitCorrection = async (e) => {
    e.preventDefault();

    if (!correctionSessionId || !correctionCheckout || !correctionAdminPassword) {
      setAttendanceError("Fill checkout time and admin password.");
      return;
    }

    setCorrectionLoading(true);
    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const access = await getAccessToken();
      const checkoutUTC = toUTCISOString(correctionCheckout);
      const res = await fetch(
        `${BASE_URL}/admin/attendance/correction/${correctionSessionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            check_out: checkoutUTC,
            admin_password: correctionAdminPassword,
          }),
        }
      );

      if (!res.ok) {
        let msg = "Failed to correct attendance.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      setAttendanceMessage("Attendance corrected successfully.");
      setCorrectionSessionId(null);
      setCorrectionCheckout("");
      setCorrectionAdminPassword("");

      fetchAttendance(); // refresh table
    } catch (err) {
      setAttendanceError(err.message || "Something went wrong.");
    } finally {
      setCorrectionLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const pwd = window.prompt("Enter admin password to delete this session:");
    if (!pwd) return;

    try {
      const access = await getAccessToken();
      const res = await fetch(
        `${BASE_URL}/admin/attendance/correction/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ admin_password: pwd }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete attendance session");

      setAttendanceMessage("Attendance session deleted successfully.");
      fetchAttendance();
    } catch (err) {
      setAttendanceError(err.message || "Something went wrong.");
    }
  };


  // ---------- SYSTEM STATS (4.5) ----------
  const fetchSystemStats = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/admin/system-stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!res.ok) {
        let msg = "Failed to fetch system stats.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json();
      setSystemStats(data.data || data);
    } catch (err) {
      setStatsError(err.message || "Something went wrong.");
    } finally {
      setStatsLoading(false);
    }
  };

  // ---------- CREATE USER (4.6) ----------
  const handleCreateUserChange = (field, value) => {
    setNewUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserLoading(true);
    setCreateUserError("");
    setCreateUserMessage("");

    try {
      const access = await getAccessToken();
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`, // protected by admin
        },
        body: JSON.stringify(newUserForm),
      });

      if (!res.ok) {
        let msg = "Failed to create user.";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json();
      setCreateUserMessage(data.message || "User registered successfully!");
      setNewUserForm({
        full_name: "",
        department: "",
        designation: "",
        role: "user",
        password: "",
        email: "",
        date_of_joining: "",
      });
      fetchUsers();
      fetchSystemStats();
    } catch (err) {
      setCreateUserError(err.message || "Something went wrong.");
    } finally {
      setCreateUserLoading(false);
    }
  };

  // ---------- TEST API (4.7) ----------
  const handleTestApi = async () => {
    setTestApiLoading(true);
    setTestApiResult("");

    try {
      // IMPORTANT: NO Authorization header for /test
      const res = await fetch(`${BASE_URL}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // empty body
      });

      if (!res.ok) {
        let msg = "Test API failed.";
        try {
          const errData = await res.json();
          if (typeof errData === "string") msg = errData;
          else if (errData?.message) msg = errData.message;
        } catch (_) { }
        throw new Error(msg);
      }

      const data = await res.json().catch(() => null);
      // backend example says: "API IS WORKING, GOOD TO GO!"
      setTestApiResult(data || "API IS WORKING, GOOD TO GO!");
    } catch (err) {
      setTestApiResult(err.message || "Test API failed.");
    } finally {
      setTestApiLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      {/* NAVBAR */}
      <header className="navbar-container">
        <nav className="navbar">
          <div className="navbar-left">
            <img
              src="/lightGK-logo.jpeg"
              alt="App Logo"
              className="navbar-logo-img"
            />
            {/* <span className="navbar-subtitle">Admin Panel</span> */}
          </div>

          <div className="navbar-right">
            <div className="nav-pill-group">

              {/* ✅ USER DASHBOARD (Admin also has USER role) */}
              <button
                className="nav-pill"
                onClick={() => navigate("/dashboard")}
              >
                User Dashboard
              </button>

              {/* ✅ ADMIN DASHBOARD */}
              <button className="nav-pill active">
                Admin Dashboard
              </button>

              {/* LOGOUT */}
              <button
                className="nav-pill logout-pill"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <main className="admin-page">
        <div className="admin-content admin-linear-layout">
          <AttendanceSection
            sessions={sessions}
            users={users}
            attendanceLoading={attendanceLoading}
            attendanceError={attendanceError}
            attendanceMessage={attendanceMessage}
            totalCount={totalCount}
            page={page}
            hasNext={hasNext}
            hasPrev={hasPrev}
            selectedUserFilter={selectedUserFilter}
            setSelectedUserFilter={setSelectedUserFilter}
            todayOnly={todayOnly}
            setTodayOnly={setTodayOnly}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            startFilter={startFilter}
            setStartFilter={setStartFilter}
            endFilter={endFilter}
            setEndFilter={setEndFilter}
            handleApplyFilters={handleApplyFilters}
            handleClearFilters={handleClearFilters}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
            exportToCSV={exportToCSV}
            exportToExcel={exportToExcel}
            correctionSessionId={correctionSessionId}
            correctionCheckout={correctionCheckout}
            setCorrectionCheckout={setCorrectionCheckout}
            correctionAdminPassword={correctionAdminPassword}
            setCorrectionAdminPassword={setCorrectionAdminPassword}
            correctionLoading={correctionLoading}
            handleStartCorrection={handleStartCorrection}
            handleSubmitCorrection={handleSubmitCorrection}
            handleDeleteSession={handleDeleteSession}
          />

          <UserManagementSection
            users={users}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            selectedUserDetails={selectedUserDetails}
            userDetailsLoading={userDetailsLoading}
            userAdminPassword={userAdminPassword}
            setUserAdminPassword={setUserAdminPassword}
            editableUser={editableUser}
            setEditableUser={setEditableUser}
            handleLoadUserDetails={handleLoadUserDetails}
            handleUpdateUser={handleUpdateUser}
            handleDeleteUser={handleDeleteUser}
          />


          <AdminMiscSection
            systemStats={systemStats}
            statsLoading={statsLoading}
            statsError={statsError}
            onRefreshStats={fetchSystemStats}
            newUserForm={newUserForm}
            onCreateUserChange={handleCreateUserChange}
            onCreateUser={handleCreateUser}
            createUserLoading={createUserLoading}
            createUserError={createUserError}
            createUserMessage={createUserMessage}
            testApiResult={testApiResult}
            testApiLoading={testApiLoading}
            onTestApi={handleTestApi}
          />
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
