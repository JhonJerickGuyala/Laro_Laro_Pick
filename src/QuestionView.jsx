import React, { useState, useEffect } from "react";
// Import ang custom sound file
import maliSoundSrc from "./music/mali.mp3"; 

// ─── Constants for Title Animation ──────────────────────────────────────────
const DISC_COLORS_IDLE = ["#bb0000", "#008800", "#0033cc", "#bb7700"];
const DISC_COLORS_SETS = [
  ["#ff0033", "#00ee55", "#0077ff", "#ffcc00"],
  ["#ff33ff", "#00ffee", "#ff7700", "#33ff33"],
  ["#ff1100", "#ffee00", "#00bbff", "#bb00ff"],
  ["#ff6600", "#00ff44", "#0044ff", "#ff0088"],
];
const TRAPEZOID = "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)";

// ─── Shared DiscBackground Component (Original Size) ────────────────────────
function DiscBackground({ running }) {
  const [colorSet, setColorSet] = useState(0);
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setColorSet((s) => (s + 1) % DISC_COLORS_SETS.length);
      }, 350);
      return () => clearInterval(interval);
    } else {
      setColorSet(0);
    }
  }, [running]);

  const colors = running ? DISC_COLORS_SETS[colorSet] : DISC_COLORS_IDLE;
  
  const discs = [
    { cx: -108, cy: 8, rotate: -32, w: 62, h: 52 },
    { cx: -42, cy: -20, rotate: -10, w: 60, h: 50 },
    { cx: 42, cy: -20, rotate: 10, w: 60, h: 50 },
    { cx: 108, cy: 8, rotate: 32, w: 62, h: 52 },
  ];

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 0, width: 0, height: 0 }}>
      {discs.map((d, i) => (
        <div key={i} style={{ position: "absolute", width: d.w, height: d.h, background: `linear-gradient(170deg, ${colors[i]}ff 0%, ${colors[i]}cc 100%)`, clipPath: TRAPEZOID, left: d.cx - d.w / 2, top: d.cy - d.h / 2, transform: `rotate(${d.rotate}deg)`, transition: "background 0.15s", opacity: 0.95 }} />
      ))}
    </div>
  );
}

// ─── Main QuestionView Component ───────────────────────────────────────────
export default function QuestionView({ questions, onBack, solvedIndices, setSolvedIndices }) {
  const [selectedNum, setSelectedNum] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("");

  // Inalis ang randomization logic. Gagamit na lang ng original order.
  const q = selectedNum !== null ? questions[selectedNum] : null;
  const isCurrentlySolved = selectedNum !== null && solvedIndices.has(selectedNum);

  const playSound = (type) => {
    if (type === "correct") {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "wrong") {
      const audio = new Audio(maliSoundSrc);
      audio.volume = 0.4; 
      audio.play().catch(err => console.log("Audio playback failed:", err));
    }
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    if (isCurrentlySolved) return;

    if (userInput.toUpperCase().trim() === q.a.toUpperCase()) {
      setStatus("correct");
      playSound("correct");
      setSolvedIndices((prev) => new Set(prev).add(selectedNum));
    } else {
      setStatus("wrong");
      playSound("wrong");
      setTimeout(() => setStatus(""), 500);
    }
  };

  useEffect(() => {
    setUserInput("");
    setStatus("");
  }, [selectedNum]);

  const containerStyle = {
    minHeight: "100vh", 
    width: "100vw", 
    background: "#0a0015", 
    color: "#fff",
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    padding: "2rem 1rem", 
    position: "fixed", 
    top: 0, 
    left: 0,
    fontFamily: "'Orbitron', sans-serif", 
    overflowY: "auto",
    boxSizing: "border-box"
  };

  return (
    <div style={containerStyle}>
      <style>{`
        body, html { margin: 0; padding: 0; background: #0a0015; }
        .neon-card {
          position: relative;
          width: 100%;
          max-width: 650px;
          background: #000;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem;
          overflow: hidden;
          z-index: 1;
          box-sizing: border-box;
        }
        .neon-card::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, #00e5ff, transparent 30%, transparent 50%, #ff00cc, transparent 80%);
          animation: rotateBorder 3s linear infinite;
          z-index: -2;
        }
        .neon-card::after {
          content: '';
          position: absolute;
          inset: 2.5px; 
          background: linear-gradient(135deg, #0a0015 0%, #1a0033 100%);
          border-radius: 22px;
          z-index: -1;
        }
        @keyframes rotateBorder { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .num-btn:hover { transform: scale(1.05); }
      `}</style>

      <div className="header-title" style={{ textAlign: "center", marginBottom: "2rem", zIndex: 1, flexShrink: 0 }}>
        <div style={{ position: "relative", display: "inline-block", paddingTop: "1.2rem" }}>
          <DiscBackground running={true} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", textShadow: "0 0 20px #ff00cc" }}>LARO-LARO</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00e5ff", textShadow: "0 0 20px #00e5ff", lineHeight: 0.9 }}>PiCK</div>
          </div>
        </div>
      </div>

      {selectedNum === null ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, width: "100%" }}>
          <h2 style={{ color: "#ff00cc", textShadow: "0 0 15px #ff00cc", marginBottom: "1.5rem", fontSize: "1.2rem" }}>PICK A NUMBER</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))", gap: "15px", maxWidth: "500px", width: "100%" }}>
            {questions.map((_, i) => {
              const isSolved = solvedIndices.has(i);
              return (
                <button 
                  key={i} 
                  className="num-btn" 
                  onClick={() => setSelectedNum(i)}
                  style={{
                    aspectRatio: "1/1", 
                    background: isSolved ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    border: isSolved ? "2px solid #00ff88" : "2px solid #00e5ff44", 
                    borderRadius: "12px", 
                    color: isSolved ? "#00ff88" : "#00e5ff",
                    boxShadow: isSolved ? "0 0 15px #00ff8833" : "none",
                    fontSize: "1.5rem", fontWeight: "900", cursor: "pointer",
                    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button onClick={onBack} style={{ marginTop: "2.5rem", padding: "12px 40px", borderRadius: "50px", border: "none", background: "#222", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: "bold", fontFamily: "Orbitron" }}>EXIT TO GAME</button>
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, paddingBottom: "2rem" }}>
          <div 
            className="neon-card" 
            style={{ 
              boxShadow: isCurrentlySolved || status === "correct" ? "0 0 60px #00ff8844" : "0 20px 80px rgba(0,0,0,0.8)",
              animation: status === "wrong" ? "shake 0.4s" : "none",
              marginBottom: "1.5rem" 
            }}
          >
            <h2 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "1.5rem", lineHeight: 1.7, zIndex: 2, textAlign: "justify", width: "100%", fontWeight: 400 }}>{q.q}</h2>
            <div style={{ letterSpacing: "0.4em", fontSize: "1.4rem", color: "#ffd700", marginBottom: "2rem", fontWeight: 900, zIndex: 2, textAlign: "center", width: "100%" }}>{q.hint}</div>
            
            {!isCurrentlySolved ? (
                <form onSubmit={checkAnswer} style={{ width: "100%", zIndex: 2 }}>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="TYPE ANSWER..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    style={{ width: "100%", background: "rgba(0,0,0,0.8)", border: "1px solid #00e5ff44", borderRadius: "12px", padding: "15px", color: "#fff", fontSize: "1.1rem", textAlign: "center", outline: "none", marginBottom: "1rem", fontFamily: "Orbitron", boxSizing: "border-box" }}
                  />
                  <button type="submit" style={{ width: "100%", background: "linear-gradient(90deg, #00e5ff, #ff00cc)", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "900", cursor: "pointer", color: "#fff", fontFamily: "Orbitron" }}>CHECK ANSWER</button>
                </form>
            ) : (
                <div style={{ zIndex: 2, width: "100%" }}>
                    <div style={{ background: "rgba(0,255,136,0.1)", border: "2px solid #00ff88", borderRadius: "12px", padding: "15px", color: "#00ff88", fontSize: "1.2rem", textAlign: "center", fontFamily: "Orbitron" }}>
                        ANSWERED: {q.a}
                    </div>
                </div>
            )}
            
            {(isCurrentlySolved || status === "correct") && <div style={{ color: "#00ff88", marginTop: "1.5rem", fontSize: "0.9rem", fontWeight: 900, zIndex: 2, textAlign: "center" }}>✓ CORRECT!</div>}
          </div>

          <button 
            onClick={() => setSelectedNum(null)} 
            style={{ padding: "14px 50px", borderRadius: "50px", border: "none", background: "linear-gradient(135deg, #ff00cc, #7700ff)", color: "#fff", cursor: "pointer", fontWeight: "bold", fontFamily: "Orbitron", boxShadow: "0 0 25px #ff00cc44", flexShrink: 0 }}
          >
            BACK TO NUMBERS
          </button>
        </div>
      )}
    </div>
  );
}