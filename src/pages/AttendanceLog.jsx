import React from "react";
import { useNavigate } from "react-router-dom";
import "./AttendanceLog.css";

const AttendanceLog = () => {
  const navigate = useNavigate();
  const attendanceData = [
    {
      date: "Nov 1, 2025",
      checkIn: "09:15 AM",
      checkOut: "06:00 PM",
      totalHours: "8h 45m",
      status: "Present",
    },
    {
      date: "Oct 31, 2025",
      checkIn: "09:25 AM",
      checkOut: "06:10 PM",
      totalHours: "8h 45m",
      status: "Present",
    },
    {
      date: "Oct 30, 2025",
      checkIn: "—",
      checkOut: "—",
      totalHours: "—",
      status: "Absent",
    },
  ];

  return (
    <div className="attendance-container">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="logo.jpg" alt="Logo" className="navbar-logo" />
          <h2 className="navbar-title">GENKIT</h2>
        </div>
        <div className="navbar-right">
          <button className="profile-btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </nav>
      <h1 className="attendance-title">Attendance Log</h1>
      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td>{row.checkIn}</td>
                <td>{row.checkOut}</td>
                <td>{row.totalHours}</td>
                <td
                  className={
                    row.status === "Present"
                      ? "status-present"
                      : "status-absent"
                  }
                >
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceLog;
