import { Link } from "react-router-dom";

const APP_VERSION = "1.0.0";
const SUPPORT_EMAIL = "info@krs-signature.de";

/**
 * Globaler Footer für alle /app-Seiten.
 * Schmaler, ruhiger Footer mit Legal-Links, Version und Support-Kontakt.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/60 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/agb" className="hover:text-foreground transition-colors">
              AGB
            </Link>
            <Link to="/widerruf" className="hover:text-foreground transition-colors">
              Widerruf
            </Link>
            <a
              href="https://www.krs-signature.de/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Datenschutz
            </a>
            <a
              href="https://www.krs-signature.de/impressum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Impressum
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} KI Automationen</span>
            <span aria-hidden="true">·</span>
            <span>v{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
