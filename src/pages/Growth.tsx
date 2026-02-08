import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SystemSection } from "@/components/landing/SystemSection";
import { PlatformProof } from "@/components/landing/PlatformProof";
import { PersonalSupport } from "@/components/landing/PersonalSupport";
import { OutcomeSection } from "@/components/landing/OutcomeSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { ContactModal } from "@/components/landing/ContactModal";

const Growth = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero
          headline="Signature System Growth – Struktur für Unternehmer, die wachsen und an Grenzen stoßen."
          subline="Du hast Umsatz, Kunden und Verantwortung – aber Prozesse, Team und Organisation ziehen nicht mit. Wir bauen Ordnung ins System, damit Wachstum wieder kontrollierbar wird."
          ctaText="Strategiegespräch sichern"
          onCtaClick={openModal}
        />
        
        <ProblemSection
          intro="Das ist kein Scheitern – das ist der normale Engpass beim Wachstum:"
          problems={[
            "Alles hängt an dir",
            "Prozesse fehlen",
            "Team braucht Führung",
            "Wachstum fühlt sich chaotisch an",
          ]}
          outro="Jetzt brauchst du keine Motivation. Du brauchst Struktur."
        />
        
        <SystemSection
          headline="Das Signature Skalierungs-System in 6 Bereichen"
          modules={[
            { title: "Struktur & Verantwortlichkeiten", icon: "grid" },
            { title: "Vertrieb & Pipeline-Stabilität", icon: "trending" },
            { title: "Fulfillment ohne Overload", icon: "package" },
            { title: "Teamaufbau & Führung", icon: "usercheck" },
            { title: "KPIs, Cashflow & Kontrolle", icon: "chart" },
            { title: "Prozesse, die Wachstum tragen", icon: "cog" },
          ]}
        />
        
        <PlatformProof
          headline="Von Chaos zu Organisation – im Mitgliederbereich abgebildet"
          intro="Das Signature System ist keine Theorie. Du bekommst SOPs, Frameworks und Umsetzungspfade:"
          features={[
            "SOP- & Prozessbibliothek",
            "KPI-Rhythmus & Organisations-Frameworks",
            "Delegations- und Team-Struktur",
            "90-Tage-Wachstumsplan",
          ]}
        />
        
        <PersonalSupport
          headline="Persönliches Sparring"
          intro="Du bekommst strategische Begleitung für die wichtigsten Entscheidungen:"
          points={[
            "Klare Entscheidungsunterstützung",
            "Strukturierte Wachstumsplanung",
            "Umsetzung statt Dauer-Feuerwehr",
          ]}
          ctaText="Strategiegespräch sichern"
          onCtaClick={openModal}
        />
        
        <OutcomeSection
          headline="Ergebnisse, die du erwarten kannst"
          outcomes={[
            "Zuständigkeiten statt Chaos",
            "Prozesse statt Improvisation",
            "Wachstum wird steuerbar",
            "Kontrolle kommt zurück",
          ]}
        />
        
        <FAQSection
          items={[
            {
              question: "Ist das nur für große Firmen?",
              answer: "Nein. Das Signature System Growth ist für Unternehmer, die bereits Umsatz machen und ein Team haben – egal ob 2 oder 20 Mitarbeiter. Entscheidend ist, dass du an dem Punkt bist, wo Wachstum ohne Struktur nicht mehr funktioniert.",
            },
            {
              question: "Wie schnell sehe ich Ergebnisse?",
              answer: "Die ersten Strukturen und Prozesse setzen wir in den ersten 30 Tagen um. Nachhaltige Transformation braucht Zeit, aber du wirst schnell spüren, dass weniger an dir hängt und mehr planbar läuft.",
            },
            {
              question: "Was passiert im Gespräch?",
              answer: "Im Strategiegespräch analysieren wir deine aktuelle Situation, identifizieren die größten Engpässe und schauen gemeinsam, ob und wie das Signature System dir helfen kann. Kein Verkaufspitch, sondern echte Analyse.",
            },
          ]}
        />
        
        <FinalCTA
          headline="Bereit für kontrollierbares Wachstum?"
          subline="Sichere dir dein Strategiegespräch und erfahre, wie du mit dem Signature System Ordnung ins Wachstum bringst."
          ctaText="Strategiegespräch sichern"
          onCtaClick={openModal}
        />
      </main>
      
      <Footer />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="growth" 
      />
    </div>
  );
};

export default Growth;
