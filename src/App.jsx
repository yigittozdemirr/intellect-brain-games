import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import WelcomeScene from "./scene/WelcomeScene";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import GamesScreen from "./screens/GamesScreen";
import HomeScreen from "./screens/HomeScreen";
import GameShell from "./components/game/GameShell";
import { getGameById } from "./games/registry";
import { recordGame } from "./lib/progress";

/*
  Screen state machine:
  "welcome" | "login" | "register" | "games" | "home" | "play"

  Welcome scene is a sliding overlay on top. Other screens render beneath it.
  When navigating away from welcome, the scene slides UP.
  When going back, the scene slides DOWN.
*/

const WELCOME_SLIDE_DURATION = 0.6;

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState(null); // null until auth check done
  const [showWelcome, setShowWelcome] = useState(true);
  const [prevScreen, setPrevScreen] = useState(null);
  const [playingGameId, setPlayingGameId] = useState(null);
  const [loginIntent, setLoginIntent] = useState(null); // "games" if user came from locked card
  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  // On mount / auth change: determine initial screen
  useEffect(() => {
    if (loading) return;
    if (user) {
      // If there's a login intent, go there instead of home
      if (loginIntent) {
        setScreen(loginIntent);
        setLoginIntent(null);
      } else if (screen === null || screen === "home" || screen === "login" || screen === "register") {
        setScreen("home");
      }
      setShowWelcome(false);
    } else if (screen === null || screen === "home") {
      setScreen("welcome");
      setShowWelcome(true);
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback(
    (target, opts = {}) => {
      setPrevScreen(screen);

      // Track login intent
      if (opts.intent) {
        setLoginIntent(opts.intent);
      }

      if (target === "welcome") {
        // Slide welcome back down
        setShowWelcome(true);
        setScreen("welcome");
        setPlayingGameId(null);
      } else if (target === "play" && opts.gameId) {
        setPlayingGameId(opts.gameId);
        setScreen("play");
      } else if (screen === "welcome") {
        // Leaving welcome: slide up to reveal target
        setScreen(target);
        // Delay hiding welcome so the animation plays
        setTimeout(() => {
          if (mountedRef.current) setShowWelcome(false);
        }, WELCOME_SLIDE_DURATION * 1000 + 50);
      } else {
        setScreen(target);
        setPlayingGameId(null);
      }
    },
    [screen]
  );

  const handleAuthSuccess = useCallback(() => {
    setShowWelcome(false);
    if (loginIntent) {
      setScreen(loginIntent);
      setLoginIntent(null);
    } else {
      setScreen("home");
    }
  }, [loginIntent]);

  const handleRecordResult = useCallback((gameState) => {
    if (!user || !playingGameId) return {};
    const game = getGameById(playingGameId);
    if (!game) return {};
    return recordGame(user.email, {
      gameId: playingGameId,
      category: game.category,
      score: gameState.score,
      combo: gameState.bestCombo,
      correctCount: gameState.correctCount,
      wrongCount: gameState.wrongCount,
    });
  }, [user, playingGameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pixel-dark flex items-center justify-center">
        <p className="font-pixel-label text-sm text-pixel-magenta animate-pulse">
          LOADING...
        </p>
      </div>
    );
  }

  // Active game (full-screen overlay)
  if (screen === "play" && playingGameId) {
    const game = getGameById(playingGameId);
    if (game) {
      return (
        <GameShell
          game={game}
          onBack={() => navigate("games")}
          onRecordResult={handleRecordResult}
        />
      );
    }
  }

  return (
    <div className="relative min-h-screen bg-pixel-dark overflow-hidden">
      {/* Background scene (always rendered when welcome is near) */}
      {(showWelcome || screen === "welcome") && <WelcomeScene />}

      {/* Welcome overlay (slides up/down) */}
      <AnimatePresence>
        {screen === "welcome" && showWelcome && (
          <motion.div
            key="welcome-overlay"
            className="absolute inset-0 z-30"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: WELCOME_SLIDE_DURATION, ease: [0.4, 0, 0.2, 1] }}
          >
            <WelcomeScreen onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome sliding back down */}
      <AnimatePresence>
        {screen === "welcome" && !showWelcome && (
          <motion.div
            key="welcome-return"
            className="absolute inset-0 z-30"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            transition={{ duration: WELCOME_SLIDE_DURATION, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => setShowWelcome(true)}
          >
            <WelcomeScene />
            <WelcomeScreen onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content screens */}
      <AnimatePresence mode="wait">
        {screen === "login" && (
          <LoginScreen
            key="login"
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
          />
        )}
        {screen === "register" && (
          <RegisterScreen
            key="register"
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
          />
        )}
        {screen === "games" && (
          <GamesScreen key="games" onNavigate={navigate} />
        )}
        {screen === "home" && (
          <HomeScreen key="home" onNavigate={navigate} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
