import { Link } from "react-router-dom";
import { ArrowRight, Rocket, TrendingUp } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
                Signature System
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4">
                Die Plattform + persönliches Sparring für echte Unternehmer
              </p>
              <p className="text-lg text-muted-foreground/80">
                Kein loses Coaching. Ein System, das mit dir wächst.
              </p>
            </div>
            
            {/* Selection cards */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <Link 
                to="/start"
                className="group relative p-8 bg-card rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Ich gründe gerade
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 flex-1">
                    Du willst deine erste Firma aufbauen und brauchst einen klaren Fahrplan? 
                    Signature Start gibt dir Struktur von Anfang an.
                  </p>
                  
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                    <span>Zum Signature Start</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/growth"
                className="group relative p-8 bg-card rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Ich wachse und stoße an Grenzen
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 flex-1">
                    Du hast Umsatz, aber Prozesse und Team ziehen nicht mit? 
                    Signature Growth bringt Ordnung ins Wachstum.
                  </p>
                  
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                    <span>Zum Signature Growth</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
