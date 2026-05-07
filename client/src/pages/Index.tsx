import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImg from "../assets/hero-illustration.jpg";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "📤", title: "Upload Anything", desc: "PDF, notes, or just type a topic — our AI handles the rest.", color: "var(--primary)" },
  { icon: "🧠", title: "AI-Powered Questions", desc: "Intelligent question generation using advanced NLP models.", color: "var(--accent)" },
  { icon: "🏆", title: "Instant Results", desc: "Get scores, feedback, and detailed breakdowns in real-time.", color: "var(--quiz-purple)" },
  { icon: "🎮", title: "Live Quiz Games", desc: "Host real-time multiplayer quizzes with Socket.io.", color: "var(--quiz-blue)" },
  { icon: "🎯", title: "Smart Analytics", desc: "Track student performance and identify knowledge gaps.", color: "var(--quiz-yellow)" },
  { icon: "📚", title: "Topic Mastery", desc: "Adaptive quizzes that focus on areas needing improvement.", color: "var(--quiz-pink)" },
];

const steps = [
  { num: "01", title: "Upload Content", desc: "Upload your notes, PDF, or enter a topic name.", icon: "📄" },
  { num: "02", title: "AI Generates Quiz", desc: "Our AI reads, understands, and creates questions.", icon: "✨" },
  { num: "03", title: "Take the Quiz", desc: "Answer questions with a timer and track progress.", icon: "⏱️" },
  { num: "04", title: "View Results", desc: "Get your score with detailed answer breakdowns.", icon: "🏆" },
];

const stats = [
  { value: "10K+", label: "Questions Generated" },
  { value: "500+", label: "Active Users" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "50+", label: "Topics Covered" },
];

const Index = () => {
  const { isLoggedIn } = useAuth();

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page">
      <Navbar />

      {/* Hero */}
      <section className="hero" style={{ paddingTop: 120 }}>
        <div className="hero-bg-blob" style={{ top: 40, left: "20%", width: 300, height: 300, background: "var(--primary-glow)" }} />
        <div className="hero-bg-blob" style={{ bottom: 0, right: "20%", width: 400, height: 400, background: "var(--accent-glow)" }} />

        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div className="animate-fadeInUp" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <span className="badge badge-primary animate-fadeInUp stagger-1">✨ AI-Powered Quiz Generation</span>

              <h1 className="hero-title animate-fadeInUp stagger-2">
                Transform Notes into{" "}
                <span className="text-gradient">Smart Quizzes</span>{" "}
                Instantly
              </h1>

              <p className="hero-subtitle animate-fadeInUp stagger-3">
                Upload your study material, and let AI generate perfectly crafted quiz questions. Perfect for teachers, students, and lifelong learners.
              </p>

              <div className="animate-fadeInUp stagger-4" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link to="/create" className="btn btn-primary btn-lg">
                  Create a Quiz →
                </Link>
                <Link to="/quiz" className="btn btn-secondary btn-lg">
                  Try Demo Quiz
                </Link>
              </div>

              <div className="animate-fadeInUp stagger-5" style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
                <div className="avatar-group">
                  {[..."ABCD"].map((l) => (
                    <div key={l} className="avatar avatar-sm">{l}</div>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text)" }}>500+</strong> educators already using QuizAI
                </p>
              </div>
            </div>

            <div className="animate-scaleIn" style={{ position: "relative" }}>
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={heroImg} alt="AI Quiz Generator" style={{ width: "100%", height: "auto" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 40%)" }} />
              </div>
              <div className="card-glass animate-float" style={{ position: "absolute", bottom: -16, left: -24, padding: 16, borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Quiz Ready!</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>15 questions generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "48px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="grid grid-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center animate-fadeInUp stagger-${i + 1}`}>
                <p className="text-gradient" style={{ fontSize: 30, fontFamily: "var(--font-display)", fontWeight: 700 }}>{stat.value}</p>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="text-center animate-fadeInUp" style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>
              Everything You Need to{" "}
              <span className="text-gradient-accent">Create Quizzes</span>
            </h2>
            <p style={{ marginTop: 16, color: "var(--text-secondary)", maxWidth: 520, margin: "16px auto 0" }}>
              Powerful features designed for teachers, students, and anyone who wants smarter assessments.
            </p>
          </div>

          <div className="grid grid-3">
            {features.map((f, i) => (
              <div key={f.title} className={`card card-body animate-fadeInUp stagger-${Math.min(i + 1, 5)}`} style={{ cursor: "default" }}>
                <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: `color-mix(in srgb, ${f.color} 15%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 0", background: "rgba(17, 24, 39, 0.3)" }}>
        <div className="container">
          <div className="text-center animate-fadeInUp" style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>
              How It <span className="text-gradient">Works</span>
            </h2>
            <p style={{ marginTop: 16, color: "var(--text-secondary)", maxWidth: 520, margin: "16px auto 0" }}>
              From study material to quiz in just 4 simple steps.
            </p>
          </div>

          <div className="grid grid-4">
            {steps.map((step, i) => (
              <div key={step.num} className={`card card-body text-center animate-fadeInUp stagger-${i + 1}`}>
                <span style={{ fontSize: 48, fontFamily: "var(--font-display)", fontWeight: 700, color: "rgba(20, 184, 166, 0.1)" }}>{step.num}</span>
                <div style={{ margin: "8px auto", width: 48, height: 48, borderRadius: "var(--radius-lg)", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {step.icon}
                </div>
                <h3 style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>{step.title}</h3>
                <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="card-glass animate-scaleIn" style={{ padding: 64, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--primary-glow), transparent, var(--accent-glow))" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: 36, fontWeight: 700 }}>Ready to Create Your First Quiz?</h2>
              <p style={{ marginTop: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "16px auto 0" }}>
                Join hundreds of teachers and students using AI to make learning more effective and engaging.
              </p>
              <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <Link to="/create" className="btn btn-accent btn-lg">Start Creating →</Link>
                <Link to="/quiz" className="btn btn-secondary btn-lg">Try Demo</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
