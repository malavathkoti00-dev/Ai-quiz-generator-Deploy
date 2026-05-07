import { useSocket } from "../hooks/useSocket";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";

const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { isHost?: boolean; topic?: string; code?: string } | null;
  const roomCode = state?.code ?? "";
  const topic = state?.topic ?? "Science";
  const isHost = state?.isHost ?? false;

  const { gameState, startGame, joinRoom, connected } = useSocket();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (roomCode) {
      joinRoom(roomCode, isHost);
    }
  }, [roomCode, joinRoom, isHost]);

  useEffect(() => {
    if (gameState.started) {
      navigate("/game/arena", { state: { quiz: gameState.quiz, roomCode } });
    }
  }, [gameState.started, navigate, gameState.quiz, roomCode]);

  const handleStart = async () => {
    if (!isHost) return;
    setGenerating(true);
    try {
      // Fetch a real quiz by topic
      const response = await quizService.generate({
        topic: topic,
        numQuestions: 10,
        difficulty: "Medium",
        category: topic
      });
      
      const quiz = response.data;
      if (quiz && quiz.questions) {
        startGame(quiz);
      } else {
        throw new Error("Failed to generate quiz for game");
      }
    } catch (err) {
      console.error("Game Start Error:", err);
      alert("Failed to start game: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  const players = gameState.players;
  // For demo/testing, allow 1 player if needed, but 2 is better
  const canStart = players.length >= 1; 

  if (!connected) return <div className="page-center">Connecting to battle server...</div>;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm text-center">
          <div className="animate-fadeInUp" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 16 }}>Waiting Room</h1>
            <div className="room-code">{roomCode}</div>
            <p style={{ marginTop: 12, color: "var(--text-secondary)" }}>Share this code with friends to join</p>
          </div>

          <Card className="animate-fadeInUp stagger-1" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Topic: <strong style={{ color: "var(--text)" }}>{topic}</strong></span>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Players: <strong style={{ color: "var(--text)" }}>{players.length}/8</strong></span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {players.map((player, i) => (
                <div key={i} className="player-card" style={{ 
                  animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)"
                }}>
                  <div className="avatar" style={{ background: "var(--primary-glow)", color: "var(--primary)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {player.username[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontWeight: 500, textAlign: "left" }}>{player.username}</span>
                  <div className="ready-dot active" />
                  <span style={{ fontSize: 13, color: "var(--success)" }}>
                    Ready
                  </span>
                </div>
              ))}
            </div>

            {!canStart && (
              <div style={{ marginTop: 24, color: "var(--text-muted)", fontSize: 14 }}>
                <span className="animate-pulse">Waiting for at least one more player...</span>
              </div>
            )}
          </Card>

          {isHost && (
            <Button
              onClick={handleStart}
              disabled={!canStart || generating}
              variant={canStart ? "accent" : "secondary"}
              size="lg"
              isBlock
              isLoading={generating}
            >
              {generating ? "Generating AI Quiz..." : canStart ? "🚀 Start Game!" : "⏳ Waiting for players..."}
            </Button>
          )}
          
          {!isHost && (
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>
              <span className="animate-pulse">Waiting for host to start the game...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WaitingRoom;
