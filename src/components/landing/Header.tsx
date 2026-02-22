import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogIn, Menu } from "lucide-react";
import logoSignature from "@/assets/krs-logo.png";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-deep via-primary to-primary-light shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoSignature} 
              alt="KRS Signature Logo" 
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation (md und größer) */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-primary-foreground hover:text-primary-foreground/80 transition-colors font-medium">
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
                className="bg-white text-primary-deep hover:bg-white/90 font-semibold shadow-md"
              >
                Analysegespräch sichern
              </Button>
            </Link>

            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/20">
                <LogIn className="w-4 h-4" />
                Anmelden
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation (unter md) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
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

                {/* Anmelden Link */}
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Anmelden
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
