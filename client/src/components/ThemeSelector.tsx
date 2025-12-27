import { cn } from "@/lib/utils";
import { Moon, Rocket, Sun } from "lucide-react";

type Theme = "mars" | "moon" | "deep-space";

interface ThemeSelectorProps {
  current: Theme;
  onChange: (t: Theme) => void;
}

export function ThemeSelector({ current, onChange }: ThemeSelectorProps) {
  const themes: { id: Theme; name: string; icon: React.ReactNode; color: string }[] = [
    { id: "mars", name: "Mars Colony", icon: <Rocket className="w-4 h-4" />, color: "bg-orange-600" },
    { id: "moon", name: "Lunar Base", icon: <Moon className="w-4 h-4" />, color: "bg-slate-500" },
    { id: "deep-space", name: "Deep Space", icon: <Sun className="w-4 h-4" />, color: "bg-purple-900" },
  ];

  return (
    <div className="flex space-x-2 bg-background/50 p-1 rounded-xl backdrop-blur-sm border border-white/10">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            current === t.id
              ? `${t.color} text-white shadow-lg`
              : "text-muted-foreground hover:bg-white/10 hover:text-white"
          )}
        >
          {t.icon}
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}
