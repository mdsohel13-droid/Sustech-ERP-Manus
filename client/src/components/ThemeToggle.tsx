import { Moon, Sun, Leaf, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/contexts/ThemeContext";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Ash Grove Dark", icon: <Moon className="h-4 w-4" /> },
  { value: "light", label: "Classic Light", icon: <Sun className="h-4 w-4" /> },
  { value: "fresh-mint", label: "Fresh Mint", icon: <Leaf className="h-4 w-4" /> },
  { value: "boreal", label: "Boreal Professional", icon: <Compass className="h-4 w-4" /> },
];

function getCurrentIcon(theme: Theme) {
  switch (theme) {
    case "dark": return <Moon className="h-4 w-4" />;
    case "light": return <Sun className="h-4 w-4" />;
    case "fresh-mint": return <Leaf className="h-4 w-4" />;
    case "boreal": return <Compass className="h-4 w-4" />;
  }
}

export function ThemeToggle() {
  const { theme, setTheme, switchable } = useTheme();

  if (!switchable) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 px-0"
          title="Switch theme"
        >
          {getCurrentIcon(theme)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {THEME_OPTIONS.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={theme === opt.value ? "bg-accent font-semibold" : ""}
          >
            <span className="mr-2">{opt.icon}</span>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
