import { useState } from "react";
import API from "../services/api";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import logo from "../assets/armtronix-logo.png";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await API.post("/auth/login", { email, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow"></div>
      
      <div className="login-card">
        <img 
          src={logo} 
          alt="Armtronix Logo" 
          className="login-logo"
        />
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", marginBottom: "8px", color: "white" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Enter your credentials to access the portal
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              className="login-input"
              placeholder="name@armtronix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: "40px" }}>
          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={isLoading}
            />
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleLogin}
          style={{ width: "100%", height: "50px", fontSize: "16px" }}
          disabled={isLoading}
        >
          {isLoading ? (
            "Signing in..."
          ) : (
            <>
              <LogIn size={20} />
              <span>Login to Dashboard</span>
            </>
          )}
        </button>

        <p style={{ 
          textAlign: "center", 
          marginTop: "32px", 
          color: "var(--text-secondary)", 
          fontSize: "13px" 
        }}>
          &copy; 2026 Armtronix Data Driven Control. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;