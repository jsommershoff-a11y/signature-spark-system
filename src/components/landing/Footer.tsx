import { Link } from "react-router-dom";
import logoSignature from "@/assets/ki-automationen-logo.svg";

const branches = [
  { title: "Handwerk", path: "/handwerk" },
  { title: "Praxen", path: "/praxen" },
  { title: "Dienstleister", path: "/dienstleister" },
  { title: "Immobilien", path: "/immobilien" },
  { title: "Kurzzeitvermietung", path: "/kurzzeitvermietung" },
];

export const Footer = () => {
  return (
    <footer className="py-16 bg-gradient-to-b from-[#0F3E2E] to-[#0a2a20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-5">
              <img 
                src={logoSignature} 
                alt="KI Automationen Logo" 
                className="h-9 w-9"
              />
              <span className="text-white font-semibold text-base">KI Automationen</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Einfache Automatisierungen für Unternehmen – Struktur, Entlastung, Kontrolle.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Branchen</h3>
            <nav className="flex flex-col gap-3">
              {branches.map((branch) => (
                <Link 
                  key={branch.path}
                  to={branch.path} 
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  {branch.title}
                </Link>
              ))}
            </nav>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Rechtliches & mehr</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/qualifizierung" className="text-white/40 hover:text-white transition-colors text-sm">
                Potenzial-Analyse buchen
              </Link>
              <Link to="/community" className="text-white/40 hover:text-white transition-colors text-sm">
                KI-Community (Skool)
              </Link>
              <Link to="/agb" className="text-white/40 hover:text-white transition-colors text-sm">
                AGB
              </Link>
              <Link to="/widerruf" className="text-white/40 hover:text-white transition-colors text-sm">
                Widerrufsbelehrung
              </Link>
              <a href="https://krsimmobilien.de/impressum" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-sm">
                Impressum
              </a>
              <Link to="/datenschutz" className="text-white/40 hover:text-white transition-colors text-sm">
                Datenschutz
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/30 text-sm text-center">
            © {new Date().getFullYear()} KI Automationen. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};
