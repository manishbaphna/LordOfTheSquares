import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameResults } from "@/hooks/use-results";
import { Play, History, Trophy, Rocket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const { data: results, isLoading } = useGameResults();

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-primary">
            <Rocket className="w-4 h-4" />
            <span>Next-Gen Dots & Boxes</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 drop-shadow-2xl">
            NEON DOTS
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The classic strategy game reimagined for the space age. Connect dots, capture sectors, and dominate the grid against AI or friends.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/game">
              <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-background rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1 transition-all duration-300">
                <Play className="w-5 h-5 mr-2" /> Play Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" /> Leaderboard
            </Button>
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full max-w-4xl mt-24"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-primary" /> Recent Battles
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : results && results.length > 0 ? (
              results.slice(0, 6).map((game) => (
                <Card key={game.id} className="bg-black/40 border-white/5 hover:border-primary/30 transition-all duration-300 hover:bg-white/5 group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                          {game.winner === 'Draw' ? 'Draw' : `${game.winner} Won`}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground uppercase">
                          {game.gridSize}x{game.gridSize}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                         {game.createdAt ? formatDistanceToNow(new Date(game.createdAt), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-mono bg-black/20 px-3 py-2 rounded-lg">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-emerald-400 uppercase">P1</span>
                        <span className="font-bold">{game.player1Score}</span>
                      </div>
                      <span className="text-muted-foreground">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-blue-400 uppercase">{game.mode === 'pvc' ? 'BOT' : 'P2'}</span>
                        <span className="font-bold">{game.player2Score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                No battles recorded yet. Be the first to conquer the grid!
              </div>
            )}
          </div>
        </motion.div>
      </main>
      
      <footer className="py-6 text-center text-muted-foreground text-sm border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <p>© 2024 Neon Dots • Galactic Strategy Initiative</p>
      </footer>
    </div>
  );
}
