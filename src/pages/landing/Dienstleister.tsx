import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SystemSection } from "@/components/landing/SystemSection";
import { PlatformProof } from "@/components/landing/PlatformProof";
import { PersonalSupport } from "@/components/landing/PersonalSupport";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { ContactModal } from "@/components/landing/ContactModal";

const Dienstleister = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero
          headline="Für Agenturen & Berater: Skalierbare Prozesse, bessere Kundengewinnung."
          subline="Du lieferst exzellente Arbeit – aber Akquise, Projektmanagement und Team kosten dich den letzten Nerv? Wir bringen Struktur rein, damit dein Business skaliert."
          ctaText="Kostenloses Analysegespräch sichern"
          onCtaClick={openModal}
        />
        
        <ProblemSection
          intro="Das kennen die meisten Dienstleister:"
          problems={[
            "Kundenakquise ist ein Auf und Ab",
            "Projekte laufen, aber Marge schrumpft",
            "Du bist in jedem Projekt selbst involviert",
            "Team wächst, aber Chaos wächst mit",
          ]}
          outro="Du brauchst kein neues CRM. Du brauchst ein System, das funktioniert."
        />
        
        <SystemSection
          headline="Dein Dienstleister-System in 5 Bereichen"
          modules={[
            { title: "Akquise & Lead-Pipeline", icon: "trending" },
            { title: "Projektmanagement & Delivery", icon: "package" },
            { title: "Preisgestaltung & Marge", icon: "chart" },
            { title: "Team & Delegation", icon: "usercheck" },
            { title: "Prozesse für Skalierung", icon: "cog" },
          ]}
        />
        
        <PlatformProof
          headline="Ein Blick ins Signature System"
          intro="Du bekommst keine lose Kurssammlung, sondern einen strukturierten Mitgliederbereich:"
          features={[
            "Vorlagen für Angebote, Verträge, Onboarding",
            "SOPs für wiederkehrende Prozesse",
            "Umsetzungspfad für die ersten 30 Tage",
            "Alles an einem Ort – jederzeit abrufbar",
          ]}
        />
        
        <PersonalSupport
          headline="Persönliche Begleitung"
          intro="Im Agentur-Alltag entstehen die wichtigsten Fragen. Im Signature System bekommst du:"
          points={[
            "Persönliches Sparring bei Entscheidungen",
            "Klare Antworten auf Skalierungs-Fragen",
            "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
          ]}
          ctaText="Kostenloses Analysegespräch sichern"
          onCtaClick={openModal}
        />
        
        <FAQSection
          items={[
            {
              question: "Ist das nur für große Agenturen?",
              answer: "Nein. Das Signature System ist für Dienstleister jeder Größe geeignet – vom Freelancer bis zur 20-Mann-Agentur. Entscheidend ist, dass du wachsen willst.",
            },
            {
              question: "Ich habe schon Tools – brauche ich noch eins?",
              answer: "Das Signature System ersetzt keine Tools. Es gibt dir die Struktur und Prozesse, damit deine Tools richtig funktionieren.",
            },
            {
              question: "Was kostet das?",
              answer: "Im kostenlosen Analysegespräch schauen wir gemeinsam, ob das System zu dir passt. Erst dann sprechen wir über Preise. Kein Verkaufsdruck.",
            },
          ]}
        />
        
        <FinalCTA
          headline="Bereit für planbares Wachstum?"
          subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie das Signature System dein Business voranbringt."
          ctaText="Jetzt Gespräch sichern"
          onCtaClick={openModal}
        />
      </main>
      
      <Footer />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="dienstleister" 
      />
    </div>
  );
};

export default Dienstleister;
