import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="auth-header">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h1>Reset Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">Send Reset Link</button>
        </form>

        <div className="auth-footer">
          Remember your password? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
