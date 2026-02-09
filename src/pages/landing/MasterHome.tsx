import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Stethoscope, Briefcase, Home, Key } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CTAButton } from "@/components/landing/CTAButton";

const branches = [
  { 
    title: "Handwerk", 
    path: "/handwerk", 
    icon: Hammer,
    description: "Für Handwerksbetriebe: Mehr Aufträge, bessere Prozesse, weniger Büro-Chaos."
  },
  { 
    title: "Praxen", 
    path: "/praxen", 
    icon: Stethoscope,
    description: "Für Ärzte, Zahnärzte & Therapeuten: Mehr Zeit für Patienten, weniger Verwaltung."
  },
  { 
    title: "Dienstleister", 
    path: "/dienstleister", 
    icon: Briefcase,
    description: "Für Agenturen & Berater: Skalierbare Prozesse, bessere Kundengewinnung."
  },
  { 
    title: "Immobilien", 
    path: "/immobilien", 
    icon: Home,
    description: "Für Makler & Verwalter: Mehr Abschlüsse, professionelle Lead-Pipeline."
  },
  { 
    title: "Kurzzeitvermietung", 
    path: "/kurzzeitvermietung", 
    icon: Key,
    description: "Für Airbnb & Ferienwohnungen: Automatisierung, bessere Auslastung."
  },
];

const MasterHome = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
                Signature System
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4">
                Die Plattform + persönliches Sparring für echte Unternehmer
              </p>
              <p className="text-lg text-muted-foreground/80 mb-10">
                Kein loses Coaching. Ein System, das mit dir wächst.
              </p>
              
              <p className="text-xl font-medium text-foreground">
                Wähle deine Branche:
              </p>
            </div>
          </div>
        </section>
        
        {/* Branch Selection */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => {
                const IconComponent = branch.icon;
                return (
                  <Link 
                    key={branch.path}
                    to={branch.path}
                    className="group relative p-8 bg-card rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      
                      <h2 className="text-xl font-bold text-foreground mb-3">
                        {branch.title}
                      </h2>
                      
                      <p className="text-muted-foreground mb-5 flex-1 text-sm">
                        {branch.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all text-sm">
                        <span>Mehr erfahren</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* CTA */}
            <div className="text-center mt-16">
              <p className="text-lg text-muted-foreground mb-6">
                Nicht sicher, welche Branche passt? Kein Problem.
              </p>
              <Link to="/qualifizierung">
                <CTAButton>
                  Kostenloses Analysegespräch sichern
                </CTAButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default MasterHome;
