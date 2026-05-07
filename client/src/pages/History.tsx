import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { attemptService } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const quizHistory = [
  { id: 1, title: "Photosynthesis", topic: "Science", score: 80, total: 10, date: "2026-04-05", duration: "4:32" },
  { id: 2, title: "World War II", topic: "History", score: 95, total: 15, date: "2026-04-04", duration: "8:15" },
  { id: 3, title: "React Hooks", topic: "Technology", score: 70, total: 20, date: "2026-04-03", duration: "12:05" },
  { id: 4, title: "Calculus Basics", topic: "Mathematics", score: 85, total: 10, date: "2026-04-02", duration: "5:45" },
  { id: 5, title: "Shakespeare Plays", topic: "Literature", score: 60, total: 15, date: "2026-04-01", duration: "7:30" },
  { id: 6, title: "Cell Biology", topic: "Science", score: 90, total: 10, date: "2026-03-31", duration: "3:55" },
  { id: 7, title: "French Revolution", topic: "History", score: 75, total: 20, date: "2026-03-30", duration: "10:20" },
  { id: 8, title: "Node.js Basics", topic: "Technology", score: 88, total: 15, date: "2026-03-29", duration: "6:40" },
];

const History = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await attemptService.getHistory();
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const topics = ["all", ...Array.from(new Set(history.map((q) => q.quiz?.category || "General")))];

  const filtered = history.filter((q) => {
    const title = q.quiz?.title || "";
    const category = q.quiz?.category || "General";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || category === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="page-center">Loading History...</div>;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700 }}>Quiz <span className="text-gradient">History</span></h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Review your past quizzes and performance</p>
          </div>

          {/* Filters */}
          <div className="animate-fadeInUp stagger-1" style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="input"
                placeholder="Search quizzes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`chip ${filter === t ? "active" : ""}`}
                >
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap animate-fadeInUp stagger-2">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const pct = Math.round(q.percentage || 0);
                  return (
                    <tr key={q._id}>
                      <td style={{ fontWeight: 500 }}>{q.quiz?.title || "Deleted Quiz"}</td>
                      <td><span className="badge badge-primary">{q.quiz?.category || "General"}</span></td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--error)",
                        }}>
                          {q.score}/{q.totalQuestions} ({pct}%)
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{q.timeTaken}s</td>
                      <td style={{ color: "var(--text-secondary)" }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/quiz?id=${q.quiz?._id}`} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Retake →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                No quizzes found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default History;
