import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <span className="text-primary-foreground font-semibold">
              KRS Signature
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/start" 
              className="text-muted hover:text-primary-foreground transition-colors text-sm"
            >
              Start
            </Link>
            <Link 
              to="/growth" 
              className="text-muted hover:text-primary-foreground transition-colors text-sm"
            >
              Growth
            </Link>
          </nav>
          
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} KRS Signature. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};
