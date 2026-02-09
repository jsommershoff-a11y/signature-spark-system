import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logoSignature from "@/assets/logo-signature.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const branches = [
  { title: "Handwerk", path: "/handwerk" },
  { title: "Praxen", path: "/praxen" },
  { title: "Dienstleister", path: "/dienstleister" },
  { title: "Immobilien", path: "/immobilien" },
  { title: "Kurzzeitvermietung", path: "/kurzzeitvermietung" },
];

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
        </div>
      </div>
    </header>
  );
};
