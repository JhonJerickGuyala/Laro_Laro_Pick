import { useState, useEffect, useRef, useCallback } from "react";
import bgMusicSrc from "./music/bg_sound.mp3"; 

// Top of LaroLaroPick.jsx
import QUESTIONS_DATA from "./QuestionData";
import QuestionView from "./QuestionView";

// ─── Audio Helpers ───────────────────────────────────────────────────────────
function createAudioCtx() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function formatTime(ms) {
  const totalCs = Math.max(0, Math.ceil(ms / 10));
  const secs = Math.floor(totalCs / 100);
  const cs = totalCs % 100;
  return `${String(secs).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

const DISC_COLORS_IDLE = ["#bb0000", "#008800", "#0033cc", "#bb7700"];
const DISC_COLORS_SETS = [
  ["#ff0033", "#00ee55", "#0077ff", "#ffcc00"],
  ["#ff33ff", "#00ffee", "#ff7700", "#33ff33"],
  ["#ff1100", "#ffee00", "#00bbff", "#bb00ff"],
  ["#ff6600", "#00ff44", "#0044ff", "#ff0088"],
];

const TRAPEZOID = "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)";

function DiscBackground({ running }) {
  const [colorSet, setColorSet] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setColorSet((s) => (s + 1) % DISC_COLORS_SETS.length);
      }, 350);
    } else {
      clearInterval(intervalRef.current);
      setColorSet(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const colors = running ? DISC_COLORS_SETS[colorSet] : DISC_COLORS_IDLE;
  const discs = [
    { cx: -108, cy:  8, rotate: -32, w: 62, h: 52 },
    { cx:  -42, cy: -20, rotate: -10, w: 60, h: 50 },
    { cx:   42, cy: -20, rotate:  10, w: 60, h: 50 },
    { cx:  108, cy:  8, rotate:  32, w: 62, h: 52 },
  ];

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 0, width: 0, height: 0 }}>
      {discs.map((d, i) => (
        <div key={i} style={{ position: "absolute", width: d.w, height: d.h, background: `linear-gradient(170deg, ${colors[i]}ff 0%, ${colors[i]}cc 100%)`, clipPath: TRAPEZOID, left: d.cx - d.w / 2, top: d.cy - d.h / 2, transform: `rotate(${d.rotate}deg)`, transition: running ? "background 0.15s, box-shadow 0.15s" : "background 0.5s, box-shadow 0.5s", opacity: 0.95 }} />
      ))}
    </div>
  );
}

function ChairIcon({ lit, winner, num, excluded, onToggleExclude, gameRunning }) {
  const border = winner ? "2px solid #ffd700" : excluded ? "1.5px solid rgba(255,60,60,0.5)" : lit ? "2px solid #ff00cc" : "1.5px solid rgba(255,255,255,0.12)";
  const bg = winner ? "rgba(255,215,0,0.2)" : excluded ? "rgba(80,0,0,0.4)" : lit ? "rgba(255,0,204,0.18)" : "rgba(255,255,255,0.06)";
  const shadow = winner ? "0 0 18px #ffd700, inset 0 0 10px #ffd70040" : excluded ? "none" : lit ? "0 0 14px #ff00cc, inset 0 0 8px #ff00cc30" : "none";
  const backBg = winner ? "rgba(255,215,0,0.35)" : excluded ? "rgba(120,0,0,0.4)" : lit ? "rgba(255,0,204,0.3)" : "rgba(255,255,255,0.1)";
  const seatBg = winner ? "rgba(255,215,0,0.4)" : excluded ? "rgba(100,0,0,0.4)" : lit ? "rgba(255,0,204,0.35)" : "rgba(255,255,255,0.12)";
  const legColor = winner ? "#ffd70077" : excluded ? "rgba(180,0,0,0.3)" : lit ? "#ff00cc77" : "rgba(255,255,255,0.12)";
  const numColor = winner ? "#ffd700" : excluded ? "rgba(255,80,80,0.7)" : "rgba(255,255,255,0.35)";

  return (
    <div
      onClick={() => { if (!gameRunning && !winner) onToggleExclude(num); }}
      style={{ width: "100%", height: "100%", borderRadius: 4, position: "relative", border, background: bg, boxShadow: shadow, transition: "all 0.15s ease", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4, animation: winner ? "winnerPulse 0.7s infinite alternate" : "none", cursor: gameRunning || winner ? "default" : "pointer", opacity: excluded && !winner ? 0.6 : 1 }}
    >
      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: "65%", height: "40%", background: backBg, borderRadius: "2px 2px 1px 1px", border: `1px solid ${backBg}` }} />
      <div style={{ position: "absolute", bottom: "24%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "22%", background: seatBg, borderRadius: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "75%", height: "20%", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {[0, 1].map((i) => <div key={i} style={{ width: 4, height: "100%", background: legColor, borderRadius: 1.5 }} />)}
      </div>
      <div style={{ position: "absolute", top: 2, right: 3, fontSize: "clamp(8px, 0.9vw, 11px)", fontWeight: 800, color: numColor, fontFamily: "'Orbitron', sans-serif" }}>{num}</div>
      {excluded && !winner && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, background: "rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ff3333", textShadow: "0 0 10px #ff0000", lineHeight: 1, fontFamily: "sans-serif" }}>✕</div>
        </div>
      )}
    </div>
  );
}

function ChairGrid({ side, litChairs, winners, excludedChairs, onToggleExclude, gameRunning }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,0,204,0.85)", textTransform: "uppercase", marginBottom: 5, fontFamily: "'Exo 2', sans-serif" }}>
        {side} side
      </div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(5, 1fr)", 
        gridTemplateRows: "repeat(6, 1fr)", 
        gap: "4px", 
        flex: 1,
        minHeight: 0 
      }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
          <ChairIcon
            key={n}
            num={n}
            lit={litChairs.has(n) && !excludedChairs[side]?.has(n)}
            winner={winners.some((w) => w.side === side && w.num === n)}
            excluded={excludedChairs[side]?.has(n)}
            onToggleExclude={(num) => onToggleExclude(side, num)}
            gameRunning={gameRunning}
          />
        ))}
      </div>
      {/* Persistent label to avoid layout shift */}
      <div style={{ marginTop: 8, textAlign: "center", fontSize: "0.65rem", color: gameRunning ? "#ff00cc" : "rgba(255,255,255,0.4)", fontFamily: "'Exo 2', sans-serif", fontStyle: "italic", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "4px" }}>
        {gameRunning ? "PICKING..." : "Click a chair to include/exclude"}
      </div>
    </div>
  );
}

function WinnerPanel({ winners, visible, winnersLimit }) {
  return (
    <div style={{ width: 180, flexShrink: 0, opacity: visible ? 1 : 0, maxHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 14, padding: "1rem 0.8rem", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", overflow: "hidden", height: "100%" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 800, color: "#ffd700", textAlign: "center", borderBottom: "1px solid rgba(255,215,0,0.2)", paddingBottom: "0.4rem", flexShrink: 0 }}>
          🏆 Winners
        </div>
        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingRight: "4px" }} className="custom-scrollbar">
          {Array.from({ length: winnersLimit }, (_, i) => {
            const w = winners[i];
            return (
              <div key={i} style={{ background: w ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${w ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "0.5rem 0.7rem", display: "flex", alignItems: "center", gap: 10, animation: w ? "winnerPulse 0.9s infinite alternate" : "none", flexShrink: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: w ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.06)", border: `1px solid ${w ? "#ffd700" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: w ? "#ffd700" : "rgba(255,255,255,0.2)", fontFamily: "'Orbitron', sans-serif" }}>
                  {i + 1}
                </div>
                <div>
                  {w ? (
                    <>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,215,0,0.7)", textTransform: "uppercase" }}>{w.side}</div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 900, color: "#ffd700", textShadow: "0 0 10px #ffd700" }}>#{w.num}</div>
                    </>
                  ) : <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.15)" }}>Waiting...</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CustomFunctionPanel({ config, setConfig, disabled }) {
  const handleChange = (field, val) => {
    const sanitized = val.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    setConfig(prev => ({ ...prev, [field]: sanitized }));
  };

  const labelStyle = { 
    display: "block", 
    color: "#00e5ff", 
    fontSize: "0.6rem", 
    fontWeight: 800, 
    marginBottom: 4, 
    fontFamily: "'Orbitron', sans-serif", 
    letterSpacing: "0.05em" 
  };
  
  const inputStyle = { 
    width: "100%", 
    background: "rgba(0,0,0,0.5)", 
    border: "1px solid #00e5ff44", 
    color: "#fff", 
    borderRadius: 8, 
    padding: "8px", 
    marginBottom: 10, 
    outline: "none", 
    fontSize: "0.85rem", 
    textAlign: "center", 
    appearance: "none"
  };

  return (
    <div style={{ 
      width: 170, position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", 
      background: "rgba(10, 0, 30, 0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,229,255,0.3)", 
      borderRadius: 16, padding: "20px 16px", zIndex: 10, opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto",
      boxShadow: "0 0 30px rgba(0,0,0,0.6)"
    }}>
      <div style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 900, marginBottom: 18, textAlign: "center", borderBottom: "1px solid #00e5ff44", paddingBottom: 10, fontFamily: "'Orbitron', sans-serif" }}>
        SETTINGS
      </div>
      
      <label style={labelStyle}>WINNERS</label>
      <input 
        type="text" 
        value={config.winnersCount} 
        onChange={(e) => handleChange("winnersCount", e.target.value)} 
        style={inputStyle} 
        placeholder="0"
      />
    </div>
  );
}

export default function LaroLaroPick() {
  const [config, setConfig] = useState({ leftChairs: 30, rightChairs: 30, winnersCount: 3 });
  const [gameState, setGameState] = useState("idle");
  
  // Default timer set to 20.50 seconds
  const DEFAULT_DURATION_MS = 20500;
  const [timeLeftMs, setTimeLeftMs] = useState(DEFAULT_DURATION_MS);
  
  const [litLeft, setLitLeft] = useState(new Set());
  const [litRight, setLitRight] = useState(new Set());
  const [winners, setWinners] = useState([]);
  const [excludedChairs, setExcludedChairs] = useState({ left: new Set(), right: new Set() });

  const [view, setView] = useState("game");

  // NILIPAT DITO ANG SOLVED INDICES PARA MAGING GLOBAL PROGRESS
  const [solvedIndices, setSolvedIndices] = useState(new Set());

  const litLeftRef = useRef(new Set());
  const litRightRef = useRef(new Set());
  const gameStateRef = useRef("idle");
  const bgAudioRef = useRef(null);
  const excludedRef = useRef({ left: new Set(), right: new Set() });
  const bgUrlRef = useRef(bgMusicSrc);

  useEffect(() => {
    if (gameState === "idle") setTimeLeftMs(DEFAULT_DURATION_MS);
  }, [gameState]);

  const startBgMusic = () => {
    if (!bgUrlRef.current) return;
    
    if (bgAudioRef.current) {
        bgAudioRef.current.currentTime = 0;
    } else {
        const audio = new Audio(bgUrlRef.current);
        audio.loop = false; 
        audio.volume = 0.7;
        bgAudioRef.current = audio;
    }
    bgAudioRef.current.play().catch(() => {});
  };

  const handleToggleExclude = useCallback((side, num) => {
    setExcludedChairs((prev) => {
      const updated = { left: new Set(prev.left), right: new Set(prev.right) };
      if (updated[side].has(num)) { updated[side].delete(num); } else { updated[side].add(num); }
      excludedRef.current = updated;
      return updated;
    });
  }, []);

  const applyLights = useCallback(() => {
    const randomLit = (side) => {
      const excluded = excludedRef.current[side];
      const avail = Array.from({ length: 30 }, (_, i) => i + 1).filter(n => !excluded.has(n));
      if (!avail.length) return new Set();
      return new Set(avail.sort(() => Math.random() - 0.5).slice(0, 3));
    };
    const newLeft = randomLit("left");
    const newRight = randomLit("right");
    litLeftRef.current = newLeft; litRightRef.current = newRight;
    setLitLeft(new Set(newLeft)); setLitRight(new Set(newRight));
  }, []);

  const pickWinners = useCallback(() => {
    const pool = [];
    litLeftRef.current.forEach((n) => pool.push({ side: "left", num: n }));
    litRightRef.current.forEach((n) => pool.push({ side: "right", num: n }));
    pool.sort(() => Math.random() - 0.5);
    let ws = pool.slice(0, Math.min(parseInt(config.winnersCount), pool.length));
    
    if (ws.length < parseInt(config.winnersCount)) {
      const extras = [];
      ["left", "right"].forEach((side) => {
        const excl = excludedRef.current[side];
        for (let i = 1; i <= 30; i++) { if (!excl.has(i)) extras.push({ side, num: i }); }
      });
      extras.sort(() => Math.random() - 0.5);
      while (ws.length < parseInt(config.winnersCount) && extras.length) {
        const p = extras.pop();
        if (!ws.some(existing => existing.side === p.side && existing.num === p.num)) {
          ws.push(p);
        }
      }
    }
    return ws;
  }, [config.winnersCount]);

  const startGame = () => {
    if (gameStateRef.current === "running") return;
    gameStateRef.current = "running";
    setGameState("running");
    setWinners([]);
    startBgMusic();

    const duration = DEFAULT_DURATION_MS;
    const startTs = Date.now();

    const tick = setInterval(() => {
      if (gameStateRef.current !== "running") return;
      const elapsed = Date.now() - startTs;
      const remain = Math.max(0, duration - elapsed);
      setTimeLeftMs(remain);
      
      if (Math.floor(elapsed / 250) !== Math.floor((elapsed - 34) / 250)) {
        applyLights();
      }

      if (remain <= 0) {
        clearInterval(tick);
        gameStateRef.current = "result";
        setGameState("result");
        const ws = pickWinners();
        setWinners(ws);
        setLitLeft(new Set()); setLitRight(new Set());
        
        setTimeout(() => {
          setExcludedChairs((prev) => {
            const updated = { left: new Set(prev.left), right: new Set(prev.right) };
            ws.forEach(({ side, num }) => updated[side].add(num));
            excludedRef.current = updated;
            return updated;
          });
        }, 800);
      }
    }, 34);
  };

  const isDanger = timeLeftMs <= 5000 && gameState === "running";
  const isRunning = gameState === "running";

  // IPASA ANG SOLVED INDICES SA VIEW
  if (view === "questions") {
    return (
      <QuestionView 
        questions={QUESTIONS_DATA} 
        onBack={() => setView("game")} 
        solvedIndices={solvedIndices}
        setSolvedIndices={setSolvedIndices}
      />
    );
  }

  return (
    <div style={{ height: "100vh", background: "#0a0015", fontFamily: "'Exo 2', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@900&family=Orbitron:wght@900&display=swap');
        @keyframes winnerPulse { from { box-shadow: 0 0 5px #ffd700; } to { box-shadow: 0 0 25px #ffd700, 0 0 50px #ffd70066; } }
        @keyframes dangerPulse { from { box-shadow: none; } to { box-shadow: 0 0 15px #ff4444aa; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffd70055; border-radius: 10px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
      `}</style>

      <CustomFunctionPanel config={config} setConfig={setConfig} disabled={isRunning} />

      <div style={{ textAlign: "center", marginBottom: "0.5rem", zIndex: 1, flexShrink: 0 }}>
        <div style={{ position: "relative", display: "inline-block", paddingTop: "1.2rem" }}>
          <DiscBackground running={isRunning} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "#fff", textShadow: "0 0 20px #ff00cc" }}>LARO-LARO</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2.5rem", fontWeight: 900, color: "#00e5ff", textShadow: "0 0 20px #00e5ff", lineHeight: 0.9 }}>PiCK</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", zIndex: 1, flexShrink: 0 }}>
        <div style={{ background: isDanger ? "rgba(255,68,68,0.15)" : "rgba(0,229,255,0.1)", border: `2px solid ${isDanger ? "#ff4445aa" : "#00e5ff66"}`, borderRadius: 10, padding: "0.4rem 1.2rem", fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: "1.8rem", color: isDanger ? "#ff4444" : "#00e5ff", animation: isDanger ? "dangerPulse 0.5s infinite alternate" : "none", minWidth: 120, textAlign: "center" }}>
          {formatTime(timeLeftMs)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", gap: "1.2rem", zIndex: 1, width: "100%", maxWidth: 1200, flex: 1, minHeight: 0, paddingBottom: "1rem" }}>
        <WinnerPanel winners={winners} visible={gameState === "result" || winners.length > 0} winnersLimit={parseInt(config.winnersCount) || 3} />

        <div style={{ display: "flex", alignItems: "stretch", gap: "1.5rem", flex: 1, maxWidth: "900px", minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChairGrid side="left" litChairs={litLeft} winners={winners} excludedChairs={excludedChairs} onToggleExclude={handleToggleExclude} gameRunning={isRunning} />
          </div>
          <div style={{ width: 2, background: "linear-gradient(180deg, transparent, #ff00cc, #00e5ff, transparent)", borderRadius: 2, opacity: 0.4 }} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChairGrid side="right" litChairs={litRight} winners={winners} excludedChairs={excludedChairs} onToggleExclude={handleToggleExclude} gameRunning={isRunning} />
          </div>
        </div>
        <div style={{ width: 180, flexShrink: 0 }} />
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <button onClick={startGame} disabled={isRunning} style={{ marginBottom: "0.5rem", background: isRunning ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #ff00cc, #7700ff)", border: "none", borderRadius: 50, padding: "1rem 4rem", fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff", cursor: isRunning ? "not-allowed" : "pointer", boxShadow: isRunning ? "none" : "0 0 30px #ff00cc66", flexShrink: 0 }}>
          {gameState === "result" ? "RESET & PLAY" : "START GAME"}
        </button>

        {gameState === "result" && (
          <button 
            onClick={() => setView("questions")} 
            style={{ marginBottom: "0.5rem", background: "linear-gradient(135deg, #00e5ff, #0044ff)", border: "none", borderRadius: 50, padding: "1rem 3rem", fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff", cursor: "pointer", boxShadow: "0 0 30px #00e5ff66", flexShrink: 0 }}
          >
            PROCEED TO QUESTIONS
          </button>
        )}
      </div>
    </div>
  );
}