import { useEffect, useState } from "react";
import { attemptService } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";

const Analytics = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await attemptService.getStats();
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page-center">Loading Analytics...</div>;

  const weeklyData = stats?.weeklyData || [];
  const topicPerformance = stats?.topicPerformance || [];

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700 }}>
              <span className="text-gradient">Analytics</span> Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Track your learning progress and performance</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-4 animate-fadeInUp stagger-1" style={{ marginBottom: 32 }}>
            {[
              { label: "Total Quizzes", value: stats?.totalAttempts || 0, icon: "📝", trend: "Lifetime activity" },
              { label: "Avg Accuracy", value: `${stats?.averageScore || 0}%`, icon: "🎯", trend: `Top: ${stats?.highestScore}%` },
              { label: "Study Time", value: `${stats?.totalStudyTime || 0}h`, icon: "⏱️", trend: "Total hours focused" },
              { label: "Mastered Topics", value: stats?.masteredTopics || 0, icon: "🏆", trend: "Over 90% score" },
            ].map((stat) => (
              <Card key={stat.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{stat.label}</p>
                    <p style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 700, marginTop: 4 }}>{stat.value}</p>
                  </div>
                  <span style={{ fontSize: 28 }}>{stat.icon}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--success)", marginTop: 8 }}>{stat.trend}</p>
              </Card>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Weekly Performance Chart */}
            <Card className="animate-fadeInUp stagger-2">
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Weekly Performance</h2>
              <div className="bar-chart" style={{ height: 200 }}>
                {weeklyData.map((d: any) => (
                  <div key={d.day} className="bar" style={{ height: `${d.score}%` }}>
                    <span className="bar-label">{d.day}</span>
                  </div>
                ))}
                {weeklyData.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", width: "100%" }}>No data for this week</p>}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 32, fontSize: 13, color: "var(--text-muted)" }}>
                <span>📊 Avg Score: {stats?.averageScore || 0}%</span>
                <span>📝 Total: {stats?.totalAttempts || 0} quizzes</span>
              </div>
            </Card>

            {/* Topic Performance */}
            <Card className="animate-fadeInUp stagger-3">
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Topic Performance</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {topicPerformance.map((t: any) => (
                  <div key={t.topic}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{t.topic}</span>
                      <span style={{ fontSize: 13, color: t.score >= 80 ? "var(--success)" : t.score >= 60 ? "var(--warning)" : "var(--error)" }}>{t.score}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{
                        width: `${t.score}%`,
                        background: t.score >= 80 ? "var(--success)" : t.score >= 60 ? "var(--warning)" : "var(--error)",
                      }} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{t.total} quizzes taken</p>
                  </div>
                ))}
                {topicPerformance.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Start taking quizzes to see topic analytics</p>}
              </div>
            </Card>
          </div>

          {/* Accuracy Over Time (Last 12 quizzes trend) */}
          <Card className="animate-fadeInUp stagger-4" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Recent Accuracy Trend</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              {(stats?.weeklyData || []).map((v: any, i: number) => (
                <div key={i} style={{
                  flex: 1, height: `${Math.max(v.score, 5)}%`, background: `linear-gradient(to top, var(--primary), var(--primary-light))`,
                  borderRadius: "3px 3px 0 0", opacity: 0.7 + (i * 0.05), transition: "height 0.5s ease",
                }} />
              ))}
              {(!stats?.weeklyData || stats?.weeklyData.length === 0) && <div style={{ width: "100%", textAlign: "center", color: "var(--text-muted)" }}>Not enough data to show trend</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
              <span>Oldest</span><span>→</span><span>Latest</span>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;
