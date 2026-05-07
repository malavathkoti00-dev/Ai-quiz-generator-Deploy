import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields to create an account.");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const username = `${firstName} ${lastName}`;
      await authService.register({ username, email, password, role });
      
      setLoading(false);
      // Redirect to login page instead of auto-logging in
      navigate("/login", { state: { message: "Account created successfully! Please log in." } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Signup error details:", err);
      const serverMsg = err.response?.data?.message;
      const serverError = err.response?.data?.error;
      const errorMsg = serverError ? `${serverMsg}: ${serverError}` : (serverMsg || err.message || "Registration failed. Please try again.");
      setError(errorMsg);
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Create Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Join thousands of learners and educators</p>
        </div>

        <form onSubmit={handleSignup}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}
          
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <Input
              label="First Name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ position: "relative", marginBottom: 24 }}>
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
          
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              color: "var(--text)",
              fontSize: 14,
              marginBottom: 24,
              paddingRight: 36,
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher / Educator</option>
            <option value="other">Other</option>
          </select>
          
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isBlock
            isLoading={loading}
            style={{ marginBottom: 24 }}
          >
            Create Account
          </Button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
