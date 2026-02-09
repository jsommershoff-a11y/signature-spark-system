import { Link } from "react-router-dom";

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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">K</span>
              </div>
              <span className="text-primary-foreground font-semibold">
                KRS Signature
              </span>
            </div>
            <p className="text-muted text-sm">
              Die Plattform + persönliches Sparring für echte Unternehmer.
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
                Analysegespräch sichern
              </Link>
              <span className="text-muted text-sm">Impressum (folgt)</span>
              <span className="text-muted text-sm">Datenschutz (folgt)</span>
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
