import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../services/api";
import Navbar from "../components/Navbar";
import Timer from "../components/Timer";
import MCQOption from "../components/MCQOption";
import Button from "../components/Button";
import Card from "../components/Card";

const optionLabels = ["A", "B", "C", "D"];
const optionVariants = ["variant-purple", "variant-blue", "variant-yellow", "variant-pink"];

// Demo quiz data for "Try Demo" button
const demoQuiz = {
  _id: "demo",
  title: "Demo Quiz",
  category: "General",
  difficulty: "medium",
  questions: [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      correctIndex: 2
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: "Mars",
      correctIndex: 1
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      correctIndex: 1
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: "William Shakespeare",
      correctIndex: 1
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctAnswer: "Pacific Ocean",
      correctIndex: 3
    }
  ]
};

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = new URLSearchParams(location.search).get("id");

  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const fetchQuiz = async () => {
      // If no quizId or it's a placeholder/demo, load demo quiz
      if (!quizId || quizId === "demo" || quizId === "undefined" || quizId === "null") {
        setQuiz(demoQuiz);
        setLoading(false);
        return;
      }
      try {
        const response = await quizService.getById(quizId);
        // Map backend correctAnswer string to index
        const quizData = response.data;
        
        if (quizData && quizData.questions) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quizData.questions = quizData.questions.map((q: any) => ({
            ...q,
            correctIndex: q.options ? q.options.indexOf(q.correctAnswer) : -1
          }));
          setQuiz(quizData);
          console.log("Quiz loaded successfully:", quizData);
        } else {
          throw new Error("Invalid quiz data received");
        }
      } catch (err) {
        console.error("Fetch quiz error:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  // Question Timer Effect
  useEffect(() => {
    if (loading || !quiz || answered) return;
    if (timer <= 0) {
      handleAnswer(null);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, loading, quiz, answered]);

  // Total Time Tracking Effect
  useEffect(() => {
    if (loading || !quiz || answered) return;
    const interval = setInterval(() => setTotalTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading, quiz, answered]);

  const handleAnswer = useCallback((idx: number | null) => {
    if (answered || !quiz || !quiz.questions) return;
    const q = quiz.questions[currentQ];
    if (!q) return;
    
    setSelected(idx);
    setAnswered(true);
    if (idx !== null && idx === q.correctIndex) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  }, [answered, quiz, currentQ]);

  const handleNext = () => {
    if (!quiz || !quiz.questions) return;
    const totalQ = quiz.questions.length;
    if (currentQ < totalQ - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
      setTimer(30);
    } else {
      navigate("/results", { 
        state: { 
          quizId,
          score, 
          total: totalQ, 
          questions: quiz.questions, 
          answers,
          timeTaken: totalTime
        } 
      });
    }
  };

  if (loading) return <div className="page-center">Loading Quiz...</div>;
  if (!quiz || !quiz.questions) return <div className="page-center">Quiz not found or invalid.</div>;

  const q = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;

  if (totalQ === 0) {
    return (
      <div className="page-center flex-col">
        <Navbar />
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ marginBottom: 16 }}>No Questions Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>The AI generated a quiz title but couldn't produce any questions. This can happen if the input topic is too vague or the file content is unreadable.</p>
          <Button onClick={() => navigate("/create")} variant="primary">Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="page-center flex-col">
        <p>Error: Could not load question {currentQ + 1}.</p>
        <button onClick={() => navigate("/dashboard")} className="btn btn-primary mt-24">Back to Dashboard</button>
      </div>
    );
  }

  const timerPercent = (timer / 30) * 100;
  const timerColor = timer > 10 ? "var(--primary)" : timer > 5 ? "var(--warning)" : "var(--error)";

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm">
          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Question {currentQ + 1} of {totalQ}</span>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Score: {score}/{totalQ}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} />
            </div>
          </div>

          {/* Timer */}
          <div className="card-glass" style={{ padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 20, color: timerColor, animation: timer <= 5 ? "pulse 1s infinite" : "none" }}>⏱️</span>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${timerPercent}%`, background: timerColor, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 700, minWidth: 44, textAlign: "right", color: timer <= 5 ? "var(--error)" : "var(--text)" }}>
              {timer}s
            </span>
          </div>

          {/* Question Card */}
          <div key={currentQ} className="card-glass animate-slideUp" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.4 }}>
              {q.question}
            </h2>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = i === selected;
              let className = `mcq-option ${optionVariants[i] || "variant-purple"} `;
              if (answered) {
                if (isCorrect) className = "mcq-option correct";
                else if (isSelected) className = "mcq-option wrong";
                else className = "mcq-option disabled";
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={className}>
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{opt}</span>
                  {answered && isCorrect && <span className="option-icon">✅</span>}
                  {answered && isSelected && !isCorrect && <span className="option-icon">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {answered && (
            <div className="animate-fadeInUp" style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selected === q.correctIndex ? (
                  <><span style={{ fontSize: 20 }}>✅</span><span style={{ fontWeight: 600, color: "var(--success)" }}>Correct!</span></>
                ) : (
                  <><span style={{ fontSize: 20 }}>❌</span><span style={{ fontWeight: 600, color: "var(--error)" }}>{selected === null ? "Time's up!" : "Incorrect!"}</span></>
                )}
              </div>
              <button onClick={handleNext} className="btn btn-primary">
                {currentQ < totalQ - 1 ? "Next Question →" : "View Results →"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
