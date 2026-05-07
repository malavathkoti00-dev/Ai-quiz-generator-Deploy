import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields to log in.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      const { token, username } = response.data;
      login(token, username);
      setLoading(false);
      // Immediate redirect is now safe thanks to ProtectedRoute fallback
      navigate("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ background: "var(--bg)" }}>
      <Card className="animate-slideUp" style={{ width: "100%", maxWidth: 440, margin: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/home" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, textDecoration: "none" }}>
            <div style={{ fontSize: 32 }}>🧠</div>
            <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
              Quiz<span style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
            </span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Log in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {successMsg}
            </div>
          )}
          
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "70%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 20,
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isBlock
            isLoading={loading}
            style={{ marginBottom: 24 }}
          >
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
