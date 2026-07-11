import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import EmployeePage from "./pages/EmployeePage";
import ManagerPage from "./pages/ManagerPage";
import LoginPage from "./pages/LoginPage";
import toast from "react-hot-toast";

import logo from "./assets/armtronix-logo.png";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleLogin = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
    navigate("/");
  };

  return (
    <div>
      {user && (
        <nav className="navbar">
          <div className="nav-brand">
            <img src={logo} alt="Armtronix" className="nav-logo" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontWeight: 500 }}>
              <span style={{ color: "var(--text-secondary)", marginRight: "8px" }}>Logged in as</span>
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ padding: "6px 14px" }}
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      <div style={user ? { padding: "32px", maxWidth: "1600px", margin: "0 auto" } : {}}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                user.role === "manager" ? <ManagerPage /> : <EmployeePage user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;