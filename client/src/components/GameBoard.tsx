import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Types
export type Player = "P1" | "P2";
type Theme = "mars" | "moon" | "deep-space";

interface Line {
  r: number;
  c: number;
  direction: "h" | "v";
  owner: Player | null;
}

interface Box {
  r: number;
  c: number;
  owner: Player | null;
}

interface GameBoardProps {
  gridSize: number;
  theme: Theme;
  mode: "pvp" | "pvc";
  onGameOver: (winner: Player | "Draw", p1Score: number, p2Score: number) => void;
  onTurnChange: (player: Player) => void;
  currentPlayer: Player;
}

export function GameBoard({ 
  gridSize, 
  theme, 
  mode, 
  onGameOver, 
  onTurnChange,
  currentPlayer 
}: GameBoardProps) {
  // Game State
  const [hLines, setHLines] = useState<Player[][]>([]);
  const [vLines, setVLines] = useState<Player[][]>([]);
  const [boxes, setBoxes] = useState<Player[][]>([]);
  const [scores, setScores] = useState({ P1: 0, P2: 0 });
  const [gameOver, setGameOver] = useState(false);
  
  // Theme Styles
  const themeStyles = {
    mars: {
      bg: "bg-gradient-to-br from-orange-900 via-red-900 to-orange-950",
      dot: "bg-orange-200 shadow-[0_0_8px_rgba(253,186,116,0.8)]",
      lineP1: "bg-emerald-600",
      lineP2: "bg-blue-600",
      boxP1: "bg-emerald-500/30",
      boxP2: "bg-blue-500/30",
    },
    moon: {
      bg: "bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500", // Lighter grey for moon surface
      dot: "bg-slate-900 shadow-[0_0_4px_rgba(15,23,42,0.8)]", // Dark dots for contrast
      lineP1: "bg-emerald-700", // Darker green for contrast
      lineP2: "bg-blue-800", // Darker blue for contrast
      boxP1: "bg-emerald-600/40",
      boxP2: "bg-blue-600/40",
    },
    "deep-space": {
      bg: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black",
      dot: "bg-white shadow-[0_0_10px_white]",
      lineP1: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]", // Neon green
      lineP2: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]", // Neon cyan
      boxP1: "bg-green-500/20",
      boxP2: "bg-cyan-500/20",
    },
  };

  const currentTheme = themeStyles[theme];

  // Initialization
  useEffect(() => {
    // Reset game state when gridSize changes
    setHLines(Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(null)));
    setVLines(Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(null)));
    setBoxes(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    setScores({ P1: 0, P2: 0 });
    setGameOver(false);
  }, [gridSize]);

  // Check Game Over
  useEffect(() => {
    const totalBoxes = gridSize * gridSize;
    const filledBoxes = scores.P1 + scores.P2;
    
    if (filledBoxes === totalBoxes && filledBoxes > 0 && !gameOver) {
      setGameOver(true);
      let winner: Player | "Draw" = "Draw";
      if (scores.P1 > scores.P2) winner = "P1";
      if (scores.P2 > scores.P1) winner = "P2";
      
      onGameOver(winner, scores.P1, scores.P2);
      
      if (winner === "P1" || (mode === "pvp" && winner === "P2")) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#ec4899']
        });
      }
    }
  }, [scores, gridSize, onGameOver, gameOver, mode]);

  // Computer Move Logic
  useEffect(() => {
    if (mode === "pvc" && currentPlayer === "P2" && !gameOver) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mode, gameOver, hLines, vLines]); // Re-run when state changes

  const makeComputerMove = () => {
    // 1. Try to find a move that completes a box
    let move = findScoringMove();
    
    // 2. If no scoring move, try to find a safe move (doesn't give points to opponent)
    if (!move) {
      move = findSafeMove();
    }
    
    // 3. Fallback to random move
    if (!move) {
      move = findRandomMove();
    }
    
    if (move) {
      handleLineClick(move.r, move.c, move.direction, "P2");
    }
  };

  const findScoringMove = () => {
    // Check horizontal lines
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!hLines[r][c] && completesSquare(r, c, 'h')) return { r, c, direction: 'h' as const };
      }
    }
    // Check vertical lines
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        if (!vLines[r][c] && completesSquare(r, c, 'v')) return { r, c, direction: 'v' as const };
      }
    }
    return null;
  };

  const findSafeMove = () => {
    // Simple heuristic: don't put the 3rd line on any box
    const possibleMoves = [];
    
    // Horizontal candidates
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!hLines[r][c] && !givesSquare(r, c, 'h')) {
          possibleMoves.push({ r, c, direction: 'h' as const });
        }
      }
    }
    // Vertical candidates
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        if (!vLines[r][c] && !givesSquare(r, c, 'v')) {
          possibleMoves.push({ r, c, direction: 'v' as const });
        }
      }
    }
    
    if (possibleMoves.length > 0) {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    return null;
  };

  const findRandomMove = () => {
    const moves = [];
    // Collect all empty lines
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!hLines[r][c]) moves.push({ r, c, direction: 'h' as const });
      }
    }
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        if (!vLines[r][c]) moves.push({ r, c, direction: 'v' as const });
      }
    }
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  };

  // Helper to check if a move would complete a square (for the current mover)
  const completesSquare = (r: number, c: number, dir: 'h' | 'v'): boolean => {
    let completes = false;
    if (dir === 'h') {
      // Check box above: needs top(h), left(v), right(v) existing
      if (r > 0 && hLines[r-1][c] && vLines[r-1][c] && vLines[r-1][c+1]) completes = true;
      // Check box below: needs bottom(h), left(v), right(v) existing
      if (r < gridSize && hLines[r+1][c] && vLines[r][c] && vLines[r][c+1]) completes = true;
    } else {
      // Check box left: needs top(h), bottom(h), left(v) existing
      if (c > 0 && vLines[r][c-1] && hLines[r][c-1] && hLines[r+1][c-1]) completes = true;
      // Check box right: needs top(h), bottom(h), right(v) existing
      if (c < gridSize && vLines[r][c+1] && hLines[r][c] && hLines[r+1][c]) completes = true;
    }
    return completes;
  };

  // Helper to check if a move would give a square to the opponent (leaves 3 sides filled)
  const givesSquare = (r: number, c: number, dir: 'h' | 'v'): boolean => {
    // This is complex, simplified version: does it result in any box having 3 sides?
    // If we add this line, check adjacent boxes. If any box has 2 lines already, adding this 3rd one is bad.
    let gives = false;
    if (dir === 'h') {
      if (r > 0) { // Box above
        let count = 0;
        if (hLines[r-1][c]) count++;
        if (vLines[r-1][c]) count++;
        if (vLines[r-1][c+1]) count++;
        if (count === 2) gives = true;
      }
      if (r < gridSize) { // Box below
        let count = 0;
        if (hLines[r+1][c]) count++;
        if (vLines[r][c]) count++;
        if (vLines[r][c+1]) count++;
        if (count === 2) gives = true;
      }
    } else {
      if (c > 0) { // Box left
        let count = 0;
        if (vLines[r][c-1]) count++;
        if (hLines[r][c-1]) count++;
        if (hLines[r+1][c-1]) count++;
        if (count === 2) gives = true;
      }
      if (c < gridSize) { // Box right
        let count = 0;
        if (vLines[r][c+1]) count++;
        if (hLines[r][c]) count++;
        if (hLines[r+1][c]) count++;
        if (count === 2) gives = true;
      }
    }
    return gives;
  };

  const handleLineClick = (r: number, c: number, dir: "h" | "v", player: Player) => {
    if (gameOver) return;
    if (dir === "h" && hLines[r][c]) return; // Already taken
    if (dir === "v" && vLines[r][c]) return; // Already taken

    // Update lines
    if (dir === "h") {
      const newLines = [...hLines];
      newLines[r] = [...newLines[r]];
      newLines[r][c] = player;
      setHLines(newLines);
    } else {
      const newLines = [...vLines];
      newLines[r] = [...newLines[r]];
      newLines[r][c] = player;
      setVLines(newLines);
    }

    // Check for completed boxes
    let scored = false;
    const newBoxes = boxes.map(row => [...row]);
    
    // Logic to check adjacent boxes based on line placement
    // Horizontal line at r, c affects box (r-1, c) and (r, c)
    if (dir === "h") {
      // Check box above
      if (r > 0) {
        // Box is at r-1, c
        // Needs top: hLines[r-1][c], bottom: THIS LINE, left: vLines[r-1][c], right: vLines[r-1][c+1]
        // BUT wait, we haven't updated state yet in the closure. Use current state for others.
        if (hLines[r-1][c] && vLines[r-1][c] && vLines[r-1][c+1]) {
           newBoxes[r-1][c] = player;
           scored = true;
        }
      }
      // Check box below
      if (r < gridSize) {
        // Box is at r, c
        // Needs bottom: hLines[r+1][c], top: THIS LINE, left: vLines[r][c], right: vLines[r][c+1]
        if (hLines[r+1][c] && vLines[r][c] && vLines[r][c+1]) {
           newBoxes[r][c] = player;
           scored = true;
        }
      }
    } else { // Vertical line at r, c
      // Check box left
      if (c > 0) {
        // Box is at r, c-1
        // Needs right: THIS LINE, left: vLines[r][c-1], top: hLines[r][c-1], bottom: hLines[r+1][c-1]
        if (vLines[r][c-1] && hLines[r][c-1] && hLines[r+1][c-1]) {
           newBoxes[r][c-1] = player;
           scored = true;
        }
      }
      // Check box right
      if (c < gridSize) {
        // Box is at r, c
        // Needs left: THIS LINE, right: vLines[r][c+1], top: hLines[r][c], bottom: hLines[r+1][c]
        if (vLines[r][c+1] && hLines[r][c] && hLines[r+1][c]) {
           newBoxes[r][c] = player;
           scored = true;
        }
      }
    }

    if (scored) {
      setBoxes(newBoxes);
      // Calculate score increment
      let points = 0;
      for(let i=0; i<gridSize; i++) {
        for(let j=0; j<gridSize; j++) {
           if (newBoxes[i][j] === player && boxes[i][j] === null) points++;
        }
      }
      setScores(prev => ({ ...prev, [player]: prev[player] + points }));
      // Player goes again!
    } else {
      // Switch turn
      onTurnChange(player === "P1" ? "P2" : "P1");
    }
  };

  // Rendering
  // We render a grid. 
  // For gridSize N, we have N+1 rows of dots, N+1 cols of dots.
  // Between dots are lines. inside dots are boxes.
  
  // Calculate dynamic sizing based on viewport
  // We want the grid to fit in the screen.
  // max-w-[90vw] max-h-[70vh]
  
  return (
    <div className={cn(
      "relative p-8 rounded-2xl shadow-2xl transition-colors duration-500 overflow-auto",
      currentTheme.bg
    )}>
      <div 
        className="flex flex-col items-center select-none mx-auto"
        style={{ 
          // Custom property trick for grid sizing if needed, but flex/grid works too.
        }}
      >
        {Array.from({ length: gridSize + 1 }).map((_, r) => (
          <div key={`row-${r}`} className="flex">
            {Array.from({ length: gridSize + 1 }).map((_, c) => (
              <div key={`cell-${r}-${c}`} className="flex flex-row items-start">
                
                {/* Node + Horizontal Line Container */}
                <div className="flex flex-col">
                   <div className="flex">
                      {/* THE DOT */}
                      <div className={cn(
                        "w-4 h-4 rounded-full z-20 transition-all duration-300",
                        currentTheme.dot
                      )} />
                      
                      {/* Horizontal Line (Right of dot) */}
                      {c < gridSize && (
                        <div 
                          onClick={() => currentPlayer === "P1" || mode === "pvp" ? handleLineClick(r, c, "h", currentPlayer) : null}
                          className={cn(
                            "w-12 h-4 -ml-1 -mr-1 z-10 cursor-pointer flex items-center justify-center transition-all duration-200",
                            "hover:opacity-80 active:scale-95"
                          )}
                        >
                          <div className={cn(
                            "w-full h-2 rounded-full transition-all duration-300",
                            hLines[r] && hLines[r][c] 
                              ? (hLines[r][c] === "P1" ? currentTheme.lineP1 : currentTheme.lineP2)
                              : "bg-white/10 hover:bg-white/30"
                          )} />
                        </div>
                      )}
                   </div>
                   
                   {/* Vertical Line + Box Container (Below dot) */}
                   {r < gridSize && (
                     <div className="flex h-12">
                       {/* Vertical Line (Below dot) */}
                       <div 
                          onClick={() => currentPlayer === "P1" || mode === "pvp" ? handleLineClick(r, c, "v", currentPlayer) : null}
                          className={cn(
                            "w-4 h-full -mt-1 -mb-1 z-10 cursor-pointer flex justify-center items-center transition-all duration-200",
                            "hover:opacity-80 active:scale-95"
                          )}
                       >
                          <div className={cn(
                             "h-full w-2 rounded-full transition-all duration-300",
                             vLines[r] && vLines[r][c]
                               ? (vLines[r][c] === "P1" ? currentTheme.lineP1 : currentTheme.lineP2)
                               : "bg-white/10 hover:bg-white/30"
                          )} />
                       </div>
                       
                       {/* THE BOX ITSELF */}
                       {c < gridSize && (
                         <div className="w-12 h-12 flex items-center justify-center">
                            <AnimatePresence>
                              {boxes[r][c] && (
                                <motion.div 
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className={cn(
                                    "w-10 h-10 rounded-md shadow-inner flex items-center justify-center font-bold text-lg",
                                    boxes[r][c] === "P1" ? currentTheme.boxP1 : currentTheme.boxP2
                                  )}
                                >
                                  {boxes[r][c]}
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
