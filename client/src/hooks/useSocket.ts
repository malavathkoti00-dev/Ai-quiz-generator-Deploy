/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type SocketEvent =
  | "join_room"
  | "start_game"
  | "submit_answer"
  | "next_round"
  | "update_score"
  | "room_update"
  | "game_started"
  | "game_over"
  | "player_joined"
  | "player_left"
  | "answer_result";

interface Player {
  id: string;
  username: string;
  score: number;
  socketId: string;
  isReady?: boolean;
}

interface GameState {
  roomCode: string;
  players: Player[];
  quiz: any | null;
  started: boolean;
  currentRound?: number;
  totalRounds?: number;
  isHost?: boolean;
}

const SOCKET_URL = "http://localhost:5000";

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    roomCode: "",
    players: [],
    quiz: null,
    started: false,
    currentRound: 0,
    totalRounds: 0,
    isHost: false,
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [roundResults, setRoundResults] = useState<any>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("quizUserToken");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to Battle Server");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected from Battle Server");
    });

    socket.on("room_update", (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: data.players,
        quiz: data.quiz,
        started: data.started
      }));
    });

    socket.on("game_started", (data: any) => {
      setGameState(prev => ({
        ...prev,
        started: true,
        quiz: data.quiz,
        currentRound: 1,
        totalRounds: data.quiz?.questions?.length || 0,
      }));
      setCurrentQuestion(data.quiz?.questions?.[0] || null);
    });

    socket.on("next_round", (data: any) => {
      setGameState(prev => ({
        ...prev,
        currentRound: data.round,
      }));
      setCurrentQuestion(data.question);
      setRoundResults(null);
    });

    socket.on("update_score", (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId ? { ...p, score: data.score } : p
        ),
      }));
    });

    socket.on("answer_result", (data: any) => {
      setRoundResults(data);
    });

    socket.on("game_over", (data: any) => {
      setGameState(prev => ({
        ...prev,
        started: false,
      }));
    });

    socket.on("player_joined", (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, data.player],
      }));
    });

    socket.on("player_left", (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.playerId),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((roomId: string, isHost = false) => {
    if (socketRef.current) {
      socketRef.current.emit("join_room", { roomId, isHost });
      setGameState(prev => ({ ...prev, roomCode: roomId, isHost }));
    }
  }, []);

  const startGame = useCallback((quiz: any) => {
    if (socketRef.current && gameState.roomCode) {
      socketRef.current.emit("start_game", { roomId: gameState.roomCode, quiz });
    }
  }, [gameState.roomCode]);

  const submitAnswer = useCallback((answer: string, isCorrect: boolean, timeTaken: number) => {
    if (socketRef.current && gameState.roomCode) {
      socketRef.current.emit("submit_answer", { 
        roomId: gameState.roomCode, 
        answer,
        isCorrect,
        timeTaken,
        round: gameState.currentRound,
      });
    }
  }, [gameState.roomCode, gameState.currentRound]);

  const setReady = useCallback((isReady: boolean) => {
    if (socketRef.current && gameState.roomCode) {
      socketRef.current.emit("player_ready", { 
        roomId: gameState.roomCode, 
        isReady,
      });
    }
  }, [gameState.roomCode]);

  const leaveRoom = useCallback(() => {
    if (socketRef.current && gameState.roomCode) {
      socketRef.current.emit("leave_room", { roomId: gameState.roomCode });
      setGameState({
        roomCode: "",
        players: [],
        quiz: null,
        started: false,
        currentRound: 0,
        totalRounds: 0,
        isHost: false,
      });
    }
  }, [gameState.roomCode]);

  return {
    connected,
    gameState,
    currentQuestion,
    roundResults,
    joinRoom,
    startGame,
    submitAnswer,
    setReady,
    leaveRoom,
  };
}
