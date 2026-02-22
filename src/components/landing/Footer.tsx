import { Link } from "react-router-dom";
import logoSignature from "@/assets/krs-logo.png";

const branches = [
  { title: "Handwerk", path: "/handwerk" },
  { title: "Praxen", path: "/praxen" },
  { title: "Dienstleister", path: "/dienstleister" },
  { title: "Immobilien", path: "/immobilien" },
  { title: "Kurzzeitvermietung", path: "/kurzzeitvermietung" },
];

export const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Info */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img 
                src={logoSignature} 
                alt="KRS Signature Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted text-sm">
              Ganzheitliche Unternehmensberatung – aus der Praxis, für die Praxis.
            </p>
          </div>
          
          {/* Branchen Links */}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">Branchen</h3>
            <nav className="flex flex-col gap-2">
              {branches.map((branch) => (
                <Link 
                  key={branch.path}
                  to={branch.path} 
                  className="text-muted hover:text-primary-foreground transition-colors text-sm"
                >
                  {branch.title}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">Rechtliches</h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/qualifizierung" 
                className="text-muted hover:text-primary-foreground transition-colors text-sm"
              >
                Potenzial-Analyse buchen
              </Link>
              <a 
                href="https://krsimmobilien.de/impressum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-primary-foreground transition-colors text-sm"
              >
                Impressum
              </a>
              <a 
                href="https://krsimmobilien.de/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-primary-foreground transition-colors text-sm"
              >
                Datenschutz
              </a>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-muted/20 pt-8">
          <p className="text-muted text-sm text-center">
            © {new Date().getFullYear()} KRS Signature. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};
