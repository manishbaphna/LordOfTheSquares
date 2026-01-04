import { useState } from "react";
import { Link } from "wouter";
import { GameBoard, type Player } from "@/components/GameBoard";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useCreateGameResult } from "@/hooks/use-results";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Home, User, Bot, RefreshCcw, Settings2 } from "lucide-react";

type GameMode = "pvp" | "pvc";
type Theme = "mars" | "moon" | "deep-space";

export default function Game() {
  const [gridSize, setGridSize] = useState(4);
  const [mode, setMode] = useState<GameMode>("pvc");
  const [theme, setTheme] = useState<Theme>("deep-space");
  const [currentPlayer, setCurrentPlayer] = useState<Player>("P1");
  const [gameState, setGameState] = useState<"setup" | "playing" | "finished">("setup");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [finalScores, setFinalScores] = useState({ p1: 0, p2: 0 });

  const { mutate: saveResult, isPending: isSaving } = useCreateGameResult();
  const { toast } = useToast();

  const startGame = () => {
    setGameState("playing");
    setCurrentPlayer("P1");
    setWinner(null);
  };

  const handleGameOver = (result: Player | "Draw", s1: number, s2: number) => {
    setWinner(result);
    setFinalScores({ p1: s1, p2: s2 });
    setGameState("finished");

    // Save result to DB
    saveResult({
      mode,
      gridSize,
      player1Score: s1,
      player2Score: s2,
      winner: result === "Draw" ? "Draw" : result === "P1" ? "Player 1" : (mode === "pvc" ? "Computer" : "Player 2")
    }, {
      onSuccess: () => {
        toast({
          title: "Game Recorded!",
          description: "Your match has been saved to history.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not save game result.",
          variant: "destructive",
        });
      }
    });
  };

  const resetGame = () => {
    setGameState("setup");
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between backdrop-blur-md bg-background/30 border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
            <Button variant="ghost" size="icon">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Lord of the Squares
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {gameState === "playing" && (
            <div className="hidden md:flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Turn:</span>
              <Badge variant="outline" className={currentPlayer === "P1" ? "border-primary text-primary" : "border-blue-400 text-blue-400"}>
                {currentPlayer === "P1" ? "Player 1" : (mode === "pvc" ? "Computer" : "Player 2")}
              </Badge>
            </div>
          )}
          
          <ThemeSelector current={theme} onChange={setTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        
        {gameState === "setup" ? (
          <Card className="w-full max-w-md p-8 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">New Game</h2>
              <p className="text-muted-foreground">Configure your battleground</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Grid Size: {gridSize}x{gridSize}</label>
                <Slider 
                  value={[gridSize]} 
                  onValueChange={(v) => setGridSize(v[0])} 
                  min={3} 
                  max={12} 
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>3x3 (Quick)</span>
                  <span>12x12 (Epic)</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Game Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("pvp")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      mode === "pvp" 
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                        : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    <User className="w-8 h-8" />
                    <span className="font-bold">Vs Player</span>
                  </button>
                  <button
                    onClick={() => setMode("pvc")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      mode === "pvc" 
                        ? "border-secondary bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(192,132,252,0.2)]" 
                        : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    <Bot className="w-8 h-8" />
                    <span className="font-bold">Vs Computer</span>
                  </button>
                </div>
              </div>

              <Button 
                onClick={startGame} 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-black shadow-lg shadow-primary/20"
              >
                Start Mission
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full">
             <div className="flex justify-between w-full max-w-2xl px-4">
                <Card className="p-4 bg-emerald-900/20 border-emerald-500/30 backdrop-blur-md min-w-[120px] text-center">
                  <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-1">Player 1</div>
                  <div className="text-4xl font-mono text-emerald-400 text-glow">{finalScores.p1 || (gameState === "playing" ? "0" : "0")}</div>
                </Card>

                <div className="flex flex-col items-center justify-center">
                  <Button variant="ghost" size="icon" onClick={() => setGameState("setup")} className="text-muted-foreground hover:text-white">
                    <Settings2 className="w-6 h-6" />
                  </Button>
                </div>
                
                <Card className="p-4 bg-blue-900/20 border-blue-500/30 backdrop-blur-md min-w-[120px] text-center">
                  <div className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-1">
                    {mode === "pvc" ? "Computer" : "Player 2"}
                  </div>
                  <div className="text-4xl font-mono text-blue-400 text-glow">{finalScores.p2 || (gameState === "playing" ? "0" : "0")}</div>
                </Card>
             </div>

             <div className="max-w-[95vw] max-h-[75vh] overflow-auto p-1">
                <GameBoard 
                  gridSize={gridSize} 
                  theme={theme} 
                  mode={mode} 
                  currentPlayer={currentPlayer}
                  onTurnChange={setCurrentPlayer}
                  onGameOver={handleGameOver}
                />
             </div>
          </div>
        )}
      </main>

      {/* Game Over Dialog */}
      <Dialog open={gameState === "finished"} onOpenChange={(open) => !open && resetGame()}>
        <DialogContent className="bg-background/90 backdrop-blur-xl border-white/10 sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display text-center flex flex-col items-center gap-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">
                {winner === "Draw" ? "It's a Draw!" : `${winner === "P1" ? "Player 1" : (mode === "pvc" ? "Computer" : "Player 2")} Wins!`}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-8">
            <div className="flex justify-center items-end gap-8 font-mono text-xl">
               <div className="flex flex-col gap-2">
                 <span className="text-sm text-emerald-400">Player 1</span>
                 <span className="text-4xl font-bold">{finalScores.p1}</span>
               </div>
               <span className="text-muted-foreground pb-2">-</span>
               <div className="flex flex-col gap-2">
                 <span className="text-sm text-blue-400">{mode === "pvc" ? "Bot" : "Player 2"}</span>
                 <span className="text-4xl font-bold">{finalScores.p2}</span>
               </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={resetGame} variant="outline" className="w-full border-white/10 hover:bg-white/5">
              <Home className="w-4 h-4 mr-2" /> Back to Menu
            </Button>
            <Button onClick={startGame} className="w-full bg-primary text-black hover:bg-primary/90">
              <RefreshCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
