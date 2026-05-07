import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import Navbar from "../components/Navbar";
import Timer from "../components/Timer";
import MCQOption from "../components/MCQOption";

const GameArena = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameState, currentQuestion, submitAnswer } = useSocket();
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(15);
  const [phase, setPhase] = useState<"answering" | "feedback">("answering");

  const q = currentQuestion;
  const players = gameState.players || [];
  const roomCode = location.state?.roomCode || gameState.roomCode;

  useEffect(() => {
    if (phase !== "answering") return;
    if (timer <= 0) { 
      if (selected === null) handleSelect(null); 
      return; 
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, phase, selected]);

  // Reset for next round
  useEffect(() => {
    if (q) {
      setPhase("answering");
      setSelected(null);
      setTimer(15);
    }
  }, [q]);

  // Navigate to results if game ended
  useEffect(() => {
    if (!gameState.started && gameState.quiz && currentQuestion === null) {
      navigate("/game/results", { state: { scores: gameState.players.sort((a, b) => b.score - a.score) } });
    }
  }, [gameState.started, gameState.quiz, currentQuestion, gameState.players, navigate]);

  const handleSelect = (idx: number | null) => {
    if (phase !== "answering") return;
    setSelected(idx);
    setPhase("feedback");
    
    const isCorrect = idx !== null && q.options[idx] === q.correctAnswer;
    submitAnswer(idx !== null ? q.options[idx] : "None", isCorrect, 15 - timer);
  };

  if (!q) return <div className="page-center">Waiting for next round...</div>;

  const totalQ = gameState.quiz?.questions?.length || 0;
  const currentQ = gameState.currentRound || 1;

  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      {/* Top Scoreboard */}
      <div style={{ padding: "12px 24px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "center", gap: 24, overflowX: "auto" }}>
        {players.sort((a, b) => b.score - a.score).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, opacity: p.socketId ? 1 : 0.5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>#{i + 1}</span>
            <div className="avatar avatar-sm" style={{ 
                background: "var(--primary-glow)", 
                color: "var(--primary)", 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: 12, 
                fontWeight: 700,
                border: "2px solid var(--primary)"
            }}>
              {p.username[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{p.username}</p>
              <p style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>{p.score} pts</p>
            </div>
          </div>
        ))}
      </div>

      <main style={{ padding: "40px 0", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 32, maxWidth: 700, width: "100%", padding: "0 24px" }}>
          {/* Main Content */}
          <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
              <span>Round {currentQ} of {totalQ}</span>
              <span>Room: {roomCode}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 24 }}>
              <div className="progress-fill" style={{ width: `${(currentQ / totalQ) * 100}%` }} />
            </div>

            {/* Question */}
            <div key={currentQ} className="card-glass animate-slideUp" style={{ padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.4 }}>
                {q.question}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {q.options.map((opt: string, i: number) => {
                const isCorrect = opt === q.correctAnswer;
                const isSelected = i === selected;
                let status: "default" | "correct" | "wrong" = "default";
                if (phase === "feedback") {
                  if (isCorrect) status = "correct";
                  else if (isSelected) status = "wrong";
                }

                return (
                  <MCQOption
                    key={i}
                    label={["A", "B", "C", "D"][i]}
                    text={opt}
                    state={status}
                    isDisabled={phase !== "answering"}
                    onClick={() => handleSelect(i)}
                  />
                );
              })}
            </div>

            {phase === "feedback" && (
              <div className="animate-fadeInUp" style={{ marginTop: 24, textAlign: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 18, color: selected !== null && q.options[selected] === q.correctAnswer ? "var(--success)" : "var(--error)" }}>
                  {selected !== null && q.options[selected] === q.correctAnswer ? "✅ Correct! Waiting for others..." : selected === null ? "⏱ Time's up! Waiting..." : "❌ Wrong answer! Waiting..."}
                </span>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>Next round starts automatically</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60 }}>
            <Timer duration={timer} onTimeUp={() => {}} size="md" />
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>seconds</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameArena;
