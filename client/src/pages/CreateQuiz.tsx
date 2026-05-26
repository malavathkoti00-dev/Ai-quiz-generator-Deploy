import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizService } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

type InputMode = "topic" | "text" | "pdf";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>("topic");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [timePerQ, setTimePerQ] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(100);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    try {
      let response;
      if (mode === "topic") {
        console.log("Generating from topic:", topic);
        response = await quizService.generate({
          topic,
          difficulty,
          numQuestions,
          timePerQ,
          category: "General"
        });
      } else if (mode === "pdf") {
        // PDF upload mode
        console.log("PDF mode - file:", file, "fileName:", fileName);
        if (!file) {
          throw new Error("Please upload a PDF file");
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("difficulty", difficulty);
        formData.append("numQuestions", numQuestions.toString());
        formData.append("timePerQ", timePerQ.toString());
        formData.append("category", "General");
        
        console.log("Sending FormData with file:", file.name, file.type, file.size);
        response = await quizService.generateFromFile(formData);
        console.log("Response received:", response.data);
      } else {
        // Text paste mode
        console.log("Text mode - text length:", text.length);
        if (!text.trim()) {
          throw new Error("Please paste some text");
        }
        const formData = new FormData();
        const textFile = new File([text], "notes.txt", { type: "text/plain" });
        formData.append("file", textFile);
        formData.append("difficulty", difficulty);
        formData.append("numQuestions", numQuestions.toString());
        formData.append("timePerQ", timePerQ.toString());
        formData.append("category", "General");
        
        response = await quizService.generateFromFile(formData);
      }

      if (response.data && response.data._id) {
        navigate(`/quiz?id=${response.data._id}`);
      } else {
        throw new Error("Quiz was generated but no ID was returned from server.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Generate error:", err);
      console.error("Error response:", err.response);
      const errorMsg =
        err.response?.status === 401
          ? "Your session has expired or your login is invalid. Please log in again."
          : err.response?.data?.message || err.message || "Failed to generate quiz. Please try again.";
      setError(errorMsg);
      setGenerating(false);
    }
  };

  const modes = [
    { key: "topic" as InputMode, label: "Enter Topic", icon: "✏️" },
    { key: "text" as InputMode, label: "Paste Notes", icon: "📄" },
    { key: "pdf" as InputMode, label: "Upload PDF", icon: "📤" },
  ];

  const canGenerate =
    (mode === "topic" && topic.trim()) ||
    (mode === "text" && text.trim()) ||
    (mode === "pdf" && fileName);

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="container-sm">
          <div className="text-center animate-fadeInUp" style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700 }}>
              Create a New <span className="text-gradient">Quiz</span>
            </h1>
            <p style={{ marginTop: 12, color: "var(--text-secondary)" }}>
              Choose your input method and configure quiz settings.
            </p>
          </div>

          {/* Input Mode Selector */}
          <Card className="animate-fadeInUp stagger-1" style={{ marginBottom: 24 }}>
            <label className="label" style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
              Input Method
            </label>
            <div className="grid grid-3" style={{ gap: 12 }}>
              {modes.map((m) => (
                <Card
                  key={m.key}
                  isInteractive
                  onClick={() => setMode(m.key)}
                  className="text-center"
                  style={{
                    borderColor: mode === m.key ? "var(--primary)" : undefined,
                    background: mode === m.key ? "var(--primary-glow)" : undefined,
                    color: mode === m.key ? "var(--primary)" : "var(--text-secondary)",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</span>
                </Card>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              {mode === "topic" && (
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, World War II, React Hooks..."
                  className="input-lg"
                />
              )}
              {mode === "text" && (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your study notes, lecture content, or any text here..."
                  className="textarea"
                  rows={6}
                  style={{ marginTop: 0 }}
                />
              )}
              {mode === "pdf" && (
                <label className="upload-zone" style={{ marginTop: 0 }}>
                  <span className="upload-icon">📁</span>
                  {fileName ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>📄</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{fileName}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); setFile(null); setFileName(""); setUploadProgress(0); }}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--error)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>Drag & drop a PDF or click to browse</p>
                      <p className="upload-hint">Supports PDF up to 10MB</p>
                    </>
                  )}
                  <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
                  {fileName && uploadProgress < 100 && (
                    <div className="progress-bar" style={{ width: "60%", marginTop: 8 }}>
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </label>
              )}
            </div>
          </Card>

          {/* Quiz Settings */}
          <Card className="animate-fadeInUp stagger-2" style={{ marginBottom: 32 }}>
            <label className="label" style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              ⚙️ Quiz Settings
            </label>
            <div className="grid grid-3">
              <div>
                <label className="label"># Questions</label>
                <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="select">
                  {[5, 10, 15, 20, 25, 30].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">🧠 Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select">
                  {["easy", "medium", "hard", "mixed"].map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">⏱️ Time / Question</label>
                <select value={timePerQ} onChange={(e) => setTimePerQ(Number(e.target.value))} className="select">
                  {[15, 20, 30, 45, 60].map((t) => (
                    <option key={t} value={t}>{t} seconds</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {error && (
            <div className="animate-fadeInUp" style={{ padding: '12px 16px', background: 'var(--error-glow)', color: 'var(--error)', borderRadius: 8, marginBottom: 24, border: '1px solid var(--error-glow)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}
          <div className="animate-fadeInUp stagger-3">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              variant={canGenerate && !generating ? "accent" : "secondary"}
              size="lg"
              isBlock
              isLoading={generating}
              leftIcon={generating ? undefined : "✨"}
            >
              {generating ? "AI is Generating Your Quiz..." : "Generate Quiz with AI"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateQuiz;
