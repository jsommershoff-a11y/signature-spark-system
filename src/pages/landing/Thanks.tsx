import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

const Thanks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Vielen Dank für deine Anfrage!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-4">
                Wir haben deine Nachricht erhalten und melden uns innerhalb von 24 Stunden bei dir.
              </p>
              
              <p className="text-muted-foreground mb-10">
                In der Zwischenzeit: Schau dich gerne um und erfahre mehr über das Signature System.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zur Startseite
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Thanks;
