import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import logoSignature from "@/assets/ki-automationen-logo.svg";
import { Button } from "@/components/ui/button";

export const StickyConversionHeader = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-deep via-primary to-primary-light shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSignature} alt="KI Automationen" className="h-9 w-9" />
            <span className="text-primary-foreground font-semibold text-base hidden sm:inline">KI Automationen</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/20">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
            <Button
              onClick={onCtaClick}
              size="sm"
              className="bg-white text-primary-deep hover:bg-white/90 font-semibold shadow-md"
            >
              Jetzt Potenzial aufdecken!
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
