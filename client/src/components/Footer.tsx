import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon" style={{ width: 32, height: 32, fontSize: 14 }}>🧠</div>
          <span className="navbar-brand-text">
            <span className="text-gradient"> QUIZ AI</span>
          </span>
        </Link>
        <p className="footer-copy">© 2026 QuizAI. Built with AI-powered intelligence.</p>
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/create" className="footer-link">Create</Link>
          <Link to="/game" className="footer-link">Game</Link>
          <Link to="/dashboard" className="footer-link">Dashboard</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
