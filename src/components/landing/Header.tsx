import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              KRS Signature
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/start" 
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Für Gründer
            </Link>
            <Link 
              to="/growth" 
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Für Unternehmer
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
