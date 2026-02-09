

# Step 01.2 - Mobile Hamburger-Menü für Landing Header

## Problem

Die aktuelle Header-Komponente versteckt die gesamte Navigation auf mobilen Geräten (`hidden md:flex`), aber es gibt keinen Ersatz in Form eines Hamburger-Menüs. Mobile Nutzer können:
- Nicht zur Branchenauswahl navigieren
- Nicht das Qualifizierungs-Formular erreichen
- Nur über die Startseite zurück navigieren (wenn sie wissen, dass das Logo ein Link ist)

---

## Lösung

Ein Sheet (Slide-In Panel) von rechts mit Hamburger-Icon als Trigger.

### Komponenten die verwendet werden:
- `Sheet`, `SheetTrigger`, `SheetContent` aus `@/components/ui/sheet`
- `useIsMobile()` Hook (optional, da wir auch CSS-basiert arbeiten können)
- `Menu` Icon aus `lucide-react`
- `Collapsible` für Branchen-Untermenü (optional)

---

## Implementierung

### Änderung in `src/components/landing/Header.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import logoSignature from "@/assets/logo-signature.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const branches = [
  { title: "Handwerk", path: "/handwerk" },
  { title: "Praxen", path: "/praxen" },
  { title: "Dienstleister", path: "/dienstleister" },
  { title: "Immobilien", path: "/immobilien" },
  { title: "Kurzzeitvermietung", path: "/kurzzeitvermietung" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [branchesOpen, setBranchesOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoSignature} 
              alt="KRS Signature Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-foreground">
              KRS Signature
            </span>
          </Link>
          
          {/* Desktop Navigation (md und größer) */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium">
                Branchen
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {branches.map((branch) => (
                  <DropdownMenuItem key={branch.path} asChild>
                    <Link to={branch.path} className="w-full cursor-pointer">
                      {branch.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/qualifizierung">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary"
              >
                Analysegespräch sichern
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation (unter md) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-4 mt-8">
                {/* Branchen Collapsible */}
                <Collapsible open={branchesOpen} onOpenChange={setBranchesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-lg font-medium">
                    Branchen
                    <ChevronDown className={`w-5 h-5 transition-transform ${branchesOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-2 mt-2">
                    {branches.map((branch) => (
                      <Link
                        key={branch.path}
                        to={branch.path}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {branch.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Qualifizierung Link */}
                <Link
                  to="/qualifizierung"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  Qualifizierung
                </Link>

                {/* CTA Button */}
                <Link 
                  to="/qualifizierung" 
                  onClick={() => setIsOpen(false)}
                  className="mt-4"
                >
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary"
                  >
                    Analysegespräch sichern
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
```

---

## Mobile Menu Features

| Feature | Beschreibung |
|---------|--------------|
| Hamburger Icon | Erscheint nur auf Mobile (unter 768px) |
| Slide-In Panel | Schiebt von rechts ein |
| Collapsible Branchen | Aufklappbare Liste aller 5 Branchen |
| Automatisches Schließen | Bei Navigation wird das Menü geschlossen |
| CTA Button | Prominent am Ende des Menüs |
| Accessibility | Screen-reader Labels, Fokus-Management durch Sheet |

---

## Dateien zu ändern

| Datei | Aktion |
|-------|--------|
| `src/components/landing/Header.tsx` | Mobile Sheet-Navigation hinzufügen |

---

## Validierung nach Implementierung

| Test | Erwartetes Ergebnis |
|------|---------------------|
| Mobile: Hamburger-Icon sichtbar | ✓ Erscheint auf Viewports unter 768px |
| Mobile: Menü öffnet sich | ✓ Sheet schiebt von rechts ein |
| Mobile: Branchen aufklappen | ✓ Collapsible zeigt alle 5 Branchen |
| Mobile: Navigation schließt | ✓ Nach Klick auf Link schließt das Menü |
| Desktop: Keine Änderung | ✓ Dropdown-Navigation bleibt wie bisher |
| Console: Keine Errors | ✓ Keine neuen Warnings |

