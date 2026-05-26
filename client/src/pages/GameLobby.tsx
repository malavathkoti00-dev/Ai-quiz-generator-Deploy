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
  const [difficulty, setDifficulty] = useState("Medium");
  const [timeLimit, setTimeLimit] = useState(30);
  const [inputMethod, setInputMethod] = useState<"topic" | "file" | "text">("topic");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = () => {
    const newCode = Array.from({ length: 6 }, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
    navigate("/game/waiting", { 
      state: { 
        isHost: true, 
        code: newCode,
        settings: {
          topic: selectedTopic || "General Knowledge",
          numQuestions,
          difficulty,
          timeLimit,
          inputMethod,
          content,
          file: file ? { name: file.name, type: file.type } : null // Simple file metadata
        },
        file: file // Actual file object for processing
      } 
    });
  };

  const handleJoin = () => {
    navigate("/game/waiting", { state: { isHost: false, code: roomCode.trim() } });
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
          <div className="tabs animate-fadeInUp stagger-1" style={{ justifyContent: "center", marginBottom: 30 }}>
            <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>Create Room</button>
            <button className={`tab ${tab === "join" ? "active" : ""}`} onClick={() => setTab("join")}>Join Room</button>
          </div>

          {tab === "create" ? (
            <Card className="animate-fadeInUp stagger-2">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>🛠️ Game Settings</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Questions</label>
                    <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="input">
                      {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Qs</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Time Limit</label>
                    <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="input">
                      {[15, 30, 45, 60].map(n => <option key={n} value={n}>{n}s / Question</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label className="label">Difficulty</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Easy", "Medium", "Hard"].map(d => (
                      <button 
                        key={d} 
                        onClick={() => setDifficulty(d)}
                        className={`chip ${difficulty === d ? "active" : ""}`}
                        style={{ flex: 1 }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>📝 Quiz Content</h2>
                <div className="tabs-mini" style={{ marginBottom: 16 }}>
                  <button className={`tab-mini ${inputMethod === "topic" ? "active" : ""}`} onClick={() => setInputMethod("topic")}>Topic</button>
                  <button className={`tab-mini ${inputMethod === "file" ? "active" : ""}`} onClick={() => setInputMethod("file")}>PDF File</button>
                  <button className={`tab-mini ${inputMethod === "text" ? "active" : ""}`} onClick={() => setInputMethod("text")}>Paste Text</button>
                </div>

                {inputMethod === "topic" && (
                  <Input 
                    placeholder="Enter a topic (e.g. World War II)" 
                    value={selectedTopic} 
                    onChange={(e) => setSelectedTopic(e.target.value)} 
                  />
                )}

                {inputMethod === "file" && (
                  <div className="file-upload">
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} id="game-file" hidden />
                    <label htmlFor="game-file" className="file-label">
                      {file ? `📄 ${file.name}` : "📁 Click to upload PDF"}
                    </label>
                  </div>
                )}

                {inputMethod === "text" && (
                  <textarea 
                    className="input" 
                    placeholder="Paste your content here..." 
                    rows={4} 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    style={{ resize: "none" }}
                  />
                )}
              </div>

              <Button
                onClick={handleCreate}
                disabled={inputMethod === "topic" ? !selectedTopic : inputMethod === "file" ? !file : !content}
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
                placeholder="ENTER CODE"
                style={{
                  textAlign: "center",
                  letterSpacing: 8,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 32,
                  marginBottom: 24,
                }}
                maxLength={6}
              />
              <Button
                onClick={handleJoin}
                disabled={roomCode.trim().length < 4}
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
