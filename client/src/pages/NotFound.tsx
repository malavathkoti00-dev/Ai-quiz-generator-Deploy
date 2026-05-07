import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="auth-page">
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 64, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--primary)" }}>404</h1>
      <p style={{ fontSize: 18, color: "var(--text-secondary)", marginTop: 8, marginBottom: 32 }}>Oops! Page not found</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Home →</Link>
    </div>
  </div>
);

export default NotFound;
