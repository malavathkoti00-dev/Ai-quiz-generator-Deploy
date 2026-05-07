import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { attemptService } from "../services/api";
import { Award, Trophy, Medal, Star, Search } from "lucide-react";

const Leaderboard = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await attemptService.getLeaderboard();
        setLeaders(response.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaders = leaders.filter(l => 
    l.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="text-accent" size={24} />;
      case 1: return <Medal style={{ color: "#94a3b8" }} size={24} />;
      case 2: return <Medal style={{ color: "#b45309" }} size={24} />;
      default: return <span style={{ fontWeight: 700, color: "var(--text-muted)", width: 24, textAlign: "center" }}>{index + 1}</span>;
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div className="text-center animate-fadeInUp" style={{ marginBottom: 48 }}>
            <Award size={48} className="text-primary animate-float" style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: 36, fontWeight: 700 }}>Global <span className="text-gradient">Leaderboard</span></h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 12 }}>Top performing students and quiz masters</p>
          </div>

          <div className="animate-fadeInUp stagger-1" style={{ maxWidth: 800, margin: "0 auto 32px" }}>
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search players..."
                className="input input-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-32">Loading rankings...</div>
          ) : (
            <div className="card animate-fadeInUp stagger-2" style={{ maxWidth: 800, margin: "0 auto" }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>Rank</th>
                      <th>Player</th>
                      <th>Quiz</th>
                      <th style={{ textAlign: "right" }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaders.map((entry, i) => (
                      <tr key={entry._id} className={i < 3 ? "highlight-row" : ""}>
                        <td>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            {getRankIcon(i)}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="avatar avatar-sm">
                              {entry.user?.username[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{entry.user?.username}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>{entry.quiz?.title || "AI Quiz"}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className="badge badge-primary">
                            <Star size={12} fill="currentColor" /> {Math.round((entry.score / entry.totalQuestions) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeaders.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                  No players found.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
