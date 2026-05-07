import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

const topics = ["Science", "History", "Mathematics", "Technology", "Literature", "Geography"];

const GameLobby = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [numQuestions, setNumQuestions] = useState(10);

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    navigate("/game/waiting", { state: { isHost: true, topic: selectedTopic, code: newCode } });
  };

  const handleJoin = () => {
    navigate("/game/waiting", { state: { isHost: false, code: roomCode } });
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm">
          <div className="text-center animate-fadeInUp" style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎮</div>
            <h1 style={{ fontSize: 36, fontWeight: 700 }}>
              <span className="text-gradient">Game Mode</span> 
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 12 }}>
              Challenge your friends in real-time multiplayer quizzes
            </p>
          </div>

          {/* Tabs */}
          <div className="tabs animate-fadeInUp stagger-1" style={{ justifyContent: "center" }}>
            <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>Create Room</button>
            <button className={`tab ${tab === "join" ? "active" : ""}`} onClick={() => setTab("join")}>Join Room</button>
          </div>

          {tab === "create" ? (
            <Card className="animate-fadeInUp stagger-2">
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>🎯 Select Topic</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border)",
                      background: selectedTopic === t ? "var(--primary)" : "var(--bg-secondary)",
                      color: selectedTopic === t ? "white" : "var(--text)",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Number of Questions</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                >
                  {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!selectedTopic}
                variant="primary"
                size="lg"
                isBlock
              >
                🚀 Create Game Room
              </Button>
            </Card>
          ) : (
            <Card className="animate-fadeInUp stagger-2">
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>🔑 Enter Room Code</h2>
              <Input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g., XK7M2"
                style={{
                  textAlign: "center",
                  letterSpacing: 4,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 24,
                  marginBottom: 24,
                }}
                maxLength={5}
              />
              <Button
                onClick={handleJoin}
                disabled={roomCode.length < 4}
                variant="primary"
                size="lg"
                isBlock
              >
                🎮 Join Game
              </Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameLobby;
