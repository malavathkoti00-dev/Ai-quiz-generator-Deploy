import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { attemptService } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ScoreBoard from "../components/ScoreBoard";
import Card from "../components/Card";
import "../celebration.css";
import { CheckCircle2, XCircle, Target, RotateCcw, PlusCircle, LayoutDashboard, Sparkles, Trophy } from "lucide-react";

const Confetti = () => (
  <div className="confetti-container">
    {[...Array(50)].map((_, i) => (
      <div key={i} className="confetti" style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--fall-duration' as any]: `${2 + Math.random() * 3}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
      }} />
    ))}
  </div>
);

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    quizId: string;
    score: number; total: number;
    questions: { question: string; options: string[]; correctIndex: number }[];
    answers: (number | null)[];
    timeTaken: number;
  } | null;

  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    const submitScore = async () => {
      if (!state || !state.quizId || state.quizId === "demo") {
        setSubmitting(false);
        return;
      }
      try {
        const processedAnswers = state.questions.map((q, i) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          questionId: (q as any)._id,
          selectedOption: state.answers[i] !== null ? q.options[state.answers[i]!] : null,
        }));

        await attemptService.submit({
          quizId: state.quizId,
          answers: processedAnswers,
          timeTaken: state.timeTaken
        });
      } catch (err) {
        console.error("Failed to save result:", err);
      } finally {
        setSubmitting(false);
      }
    };
    submitScore();
  }, [state]);

  if (!state) {
    return (
      <div className="page-center">
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ marginBottom: "20px" }}>No results found.</p>
          <Button variant="primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { score, total, questions, answers, quizId } = state;
  const percentage = Math.round((score / total) * 100);

  const grade = percentage >= 90
    ? { label: "Excellent!", color: "var(--success)", emoji: <Trophy size={48} className="text-accent animate-bounceIn" /> }
    : percentage >= 70
    ? { label: "Great Job!", color: "var(--primary)", emoji: <Sparkles size={48} className="text-primary animate-bounceIn" /> }
    : percentage >= 50
    ? { label: "Good Effort!", color: "var(--warning)", emoji: <Target size={48} className="text-warning animate-bounceIn" /> }
    : { label: "Keep Practicing!", color: "var(--accent)", emoji: <RotateCcw size={48} className="text-accent animate-bounceIn" /> };

  const dashOffset = 264 - (264 * percentage) / 100;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm">
          {percentage >= 80 && <Confetti />}
          {/* Score Card */}
          <Card className="animate-scaleIn" style={{ marginBottom: 32 }}>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>{grade.emoji}</div>
              <h1 style={{ fontSize: 36, fontWeight: 700, color: grade.color, marginBottom: 24 }}>{grade.label}</h1>
              
              <ScoreBoard 
                score={score * 10} 
                totalQuestions={total} 
                correctAnswers={score}
                size="lg"
              />
              
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span>⏱️ Time: {Math.floor(state.timeTaken / 60)}m {state.timeTaken % 60}s</span>
              </div>
            </div>
          </Card>

          {/* Answer Breakdown */}
          {questions.length > 0 && (
            <div className="card card-body animate-fadeInUp stagger-2" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Answer Breakdown</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {questions.map((q, i) => {
                  const userAnswer = answers[i];
                  const isCorrect = userAnswer === q.correctIndex;
                  return (
                    <div key={i} style={{
                      padding: 16, borderRadius: "var(--radius-lg)",
                      border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      background: isCorrect ? "var(--success-bg)" : "var(--error-bg)",
                    }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ flexShrink: 0, marginTop: 2 }}>
                          {isCorrect ? <CheckCircle2 size={18} className="text-success" /> : <XCircle size={18} className="text-error" />}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Q{i + 1}. {q.question}</p>
                          <p style={{ fontSize: 13, color: "var(--success)" }}>✓ {q.options[q.correctIndex]}</p>
                          {!isCorrect && userAnswer !== null && (
                            <p style={{ fontSize: 13, color: "var(--error)" }}>✗ Your answer: {q.options[userAnswer]}</p>
                          )}
                          {userAnswer === null && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>⏱ Not answered</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="animate-fadeInUp stagger-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/create" className="btn btn-accent"><PlusCircle size={18} /> New Quiz</Link>
            <Link to={`/quiz?id=${quizId}`} className="btn btn-primary"><RotateCcw size={18} /> Retake</Link>
            <Link to="/dashboard" className="btn btn-secondary"><LayoutDashboard size={18} /> Dashboard</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResultsPage;
