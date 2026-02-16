import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import logoSignature from "@/assets/logo-krs-signature.png";
import { Button } from "@/components/ui/button";

export const StickyConversionHeader = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <img src={logoSignature} alt="KRS Signature" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
            <Button
              onClick={onCtaClick}
              size="sm"
              className="bg-primary hover:bg-primary-deep text-primary-foreground font-semibold shadow-md"
            >
              Jetzt Potenzial aufdecken!
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
