import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScoreBoard from "../components/ScoreBoard";
import Button from "../components/Button";
import Card from "../components/Card";

const defaultScores = [
  { name: "Alice", score: 850, color: "var(--quiz-purple)" },
  { name: "You", score: 720, color: "var(--primary)" },
  { name: "Bob", score: 580, color: "var(--quiz-blue)" },
  { name: "Charlie", score: 340, color: "var(--quiz-pink)" },
];

const GameResults = () => {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = location.state as { scores?: any[] } | null;
  const scores = state?.scores || [];
  const winner = scores[0] || { username: "Player", score: 0 };
  const maxScore = Math.max(...scores.map((s) => s.score), 1);

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm text-center">
          {/* Winner */}
          <div className="animate-fadeInUp" style={{ marginBottom: 40 }}>
            <div className="animate-bounceIn" style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
              <span className="text-gradient">{winner.username}</span> Wins!
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>{winner.score} points</p>
          </div>

          {/* Podium */}
          <Card className="animate-fadeInUp stagger-1" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Final Standings</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {scores.map((player, i) => (
                <div key={player.id || i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: 16,
                  borderRadius: "var(--radius-lg)",
                  background: i === 0 ? "rgba(234, 179, 8, 0.1)" : "var(--bg-secondary)",
                  border: i === 0 ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid var(--border)",
                  animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
                }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-muted)", width: 32 }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div className="avatar" style={{ background: "var(--primary-glow)", color: "var(--primary)", border: "2px solid var(--primary)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {player.username[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, textAlign: "left" }}>{player.username}</span>
                  {/* Score bar */}
                  <div style={{ width: 160, display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                      <div className="progress-fill" style={{
                        width: `${(player.score / maxScore) * 100}%`,
                        background: "var(--primary)",
                      }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)", minWidth: 50, textAlign: "right" }}>
                      {player.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="animate-fadeInUp stagger-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/game" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="lg">🔄 Play Again</Button>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg">📊 Dashboard</Button>
            </Link>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="lg">🏠 Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameResults;
