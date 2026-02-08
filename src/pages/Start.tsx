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

const Start = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero
          headline="Signature System Start – Die Plattform + persönliche Begleitung, um deine erste Firma sauber aufzubauen."
          subline="Du willst gründen, aber dir fehlt ein klarer Fahrplan? Mit dem Signature System bekommst du Schritt-für-Schritt Module, Vorlagen, Checklisten und persönliches Sparring, damit du strukturiert startest."
          ctaText="Kostenloses Klarheitsgespräch sichern"
          onCtaClick={openModal}
        />
        
        <ProblemSection
          intro="Die meisten Gründer scheitern nicht an der Idee, sondern an fehlender Struktur:"
          problems={[
            "Zu viele offene Fragen gleichzeitig",
            "Keine klare Reihenfolge der nächsten Schritte",
            "Chaos statt System",
            "Niemand, der persönlich erreichbar ist",
          ]}
          outro="Du brauchst kein weiteres Video. Du brauchst ein Fundament."
        />
        
        <SystemSection
          headline="Dein Signature Start-System in 5 Modulen"
          modules={[
            { title: "Gründungs-Setup & Orientierung", icon: "compass" },
            { title: "Angebot & Positionierung", icon: "target" },
            { title: "Erste Kunden gewinnen", icon: "users" },
            { title: "Prozesse & Tools von Anfang an richtig", icon: "settings" },
            { title: "Business-Rhythmus statt Dauerstress", icon: "calendar" },
          ]}
        />
        
        <PlatformProof
          headline="Ein Blick ins Signature System"
          intro="Du bekommst keine lose Kursbibliothek, sondern einen Mitgliederbereich, der dich führt:"
          features={[
            "Umsetzungspfad für die ersten 30 Tage",
            "Vorlagen & Checklisten für jede Phase",
            "Klar strukturierte Module",
            "Alles an einem Ort – jederzeit abrufbar",
          ]}
        />
        
        <PersonalSupport
          headline="Persönliche Begleitung"
          intro="Gerade am Anfang entstehen die wichtigsten Fragen im Alltag. Im Signature System bekommst du:"
          points={[
            "Persönliches Sparring bei Entscheidungen",
            "Klare Antworten statt Gründer-Unsicherheit",
            "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
          ]}
          ctaText="Kostenloses Klarheitsgespräch sichern"
          onCtaClick={openModal}
        />
        
        <FAQSection
          items={[
            {
              question: "Wie schnell kann ich starten?",
              answer: "Direkt nach dem Klarheitsgespräch. Sobald wir gemeinsam entschieden haben, dass das Signature System zu dir passt, bekommst du sofortigen Zugang zum Mitgliederbereich und wir starten mit deiner persönlichen Begleitung.",
            },
            {
              question: "Ist das ein Coaching?",
              answer: "Nicht nur. Das Signature System ist ein Business Operating System – eine Kombination aus strukturierten Modulen, Vorlagen und persönlichem Sparring. Du bekommst also beides: Selbstlern-Inhalte und direkte Unterstützung.",
            },
            {
              question: "Wie läuft das Gespräch ab?",
              answer: "Im kostenlosen Klarheitsgespräch schauen wir gemeinsam auf deine aktuelle Situation, deine Ziele und ob das Signature System der richtige nächste Schritt für dich ist. Kein Verkaufsdruck, sondern echte Beratung.",
            },
          ]}
        />
        
        <FinalCTA
          headline="Bereit, strukturiert zu starten?"
          subline="Sichere dir jetzt dein kostenloses Klarheitsgespräch und erfahre, wie das Signature System dir helfen kann."
          ctaText="Jetzt Gespräch sichern"
          onCtaClick={openModal}
        />
      </main>
      
      <Footer />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="start" 
      />
    </div>
  );
};

export default Start;
