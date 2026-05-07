import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import CreateQuiz from "./pages/CreateQuiz";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import GameLobby from "./pages/GameLobby";
import WaitingRoom from "./pages/WaitingRoom";
import GameArena from "./pages/GameArena";
import GameResults from "./pages/GameResults";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        
        {/* Game Routes */}
        <Route path="/game" element={<ProtectedRoute><GameLobby /></ProtectedRoute>} />
        <Route path="/game/waiting" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/game/arena" element={<ProtectedRoute><GameArena /></ProtectedRoute>} />
        <Route path="/game/results" element={<ProtectedRoute><GameResults /></ProtectedRoute>} />
        
        {/* Quiz & Results (Protected) */}
        <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
