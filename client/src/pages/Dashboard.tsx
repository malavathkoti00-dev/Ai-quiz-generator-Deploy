import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { attemptService } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";

const quickActions = [
  { icon: "✨", label: "Create Quiz", desc: "Generate a new AI quiz", to: "/create" },
  { icon: "🎮", label: "Start Game", desc: "Host a live quiz game", to: "/game" },
  { icon: "📊", label: "Analytics", desc: "View your performance", to: "/analytics" },
  { icon: "📜", label: "History", desc: "Past quizzes & scores", to: "/history" },
];

const Dashboard = () => {
  const { isLoggedIn, user } = useAuth();
  const username = user?.username || "Student";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          attemptService.getStats(),
          attemptService.getHistory()
        ]);
        setStats(statsRes.data);
        setRecentQuizzes(historyRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  if (loading) return <div className="page-center">Loading Dashboard...</div>;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container">
          {/* Welcome */}
          <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700 }}>Welcome back, <span className="text-gradient">{username}</span> 👋</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Here's your learning overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-4 animate-fadeInUp stagger-1" style={{ marginBottom: 32 }}>
            {[
              { icon: "📝", label: "Quizzes Taken", value: stats?.totalAttempts || 0, color: "var(--primary)" },
              { icon: "✅", label: "Avg Score", value: `${Math.round(stats?.averageScore || 0)}%`, color: "var(--success)" },
              { icon: "🔥", label: "Categories", value: stats?.categoryStats?.length || 0, color: "var(--accent)" },
              { icon: "⭐", label: "High Score", value: `${stats?.highestScore || 0}%`, color: "var(--quiz-yellow)" },
            ].map((stat) => (
              <div key={stat.label} className="card card-body" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <p style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            {/* Recent Quizzes */}
            <div className="card animate-fadeInUp stagger-2">
              <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Quizzes</h2>
                <Link to="/history" style={{ fontSize: 13, color: "var(--primary)" }}>View All →</Link>
              </div>
              <div className="card-body" style={{ padding: "0 24px 24px" }}>
                {recentQuizzes.map((attempt) => (
                  <div key={attempt._id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <div>
                      <p style={{ fontWeight: 500 }}>{attempt.quiz?.title || "Deleted Quiz"}</p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{attempt.score} correct · {new Date(attempt.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{
                      padding: "4px 14px", borderRadius: "var(--radius-full)", fontWeight: 600, fontSize: 13,
                      background: (attempt.percentage || 0) >= 80 ? "var(--success-bg)" : "var(--warning-bg)",
                      color: (attempt.percentage || 0) >= 80 ? "var(--success)" : "var(--warning)",
                    }}>
                      {Math.round(attempt.percentage || 0)}%
                    </div>
                  </div>
                ))}
                {recentQuizzes.length === 0 && <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No quizzes taken yet.</p>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-fadeInUp stagger-3">
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.to} style={{ textDecoration: "none" }}>
                    <Card isInteractive style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
                      <div style={{ fontSize: 24 }}>{action.icon}</div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14, color: "var(--text)" }}>{action.label}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{action.desc}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Preview */}
          <Card className="animate-fadeInUp stagger-4" style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Performance Overview</h2>
              <Link to="/analytics" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>Detailed Analytics →</Link>
            </div>
            <div className="bar-chart" style={{ height: 180 }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const heights = [60, 80, 45, 90, 70, 55, 85];
                return (
                  <div key={day} className="bar" style={{ height: `${heights[i]}%`, animationDelay: `${i * 0.1}s` }}>
                    <span className="bar-label">{day}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
