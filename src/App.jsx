import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AttendanceLog from "./pages/AttendanceLog";
import AdminDashboard from "./admin/AdminDashboard";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/attendance" element={<AttendanceLog />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
