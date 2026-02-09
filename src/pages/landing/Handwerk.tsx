import { useState } from "react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SystemSection } from "@/components/landing/SystemSection";
import { PlatformProof } from "@/components/landing/PlatformProof";
import { PersonalSupport } from "@/components/landing/PersonalSupport";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { ContactModal } from "@/components/landing/ContactModal";

const Handwerk = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <PublicLayout>
      <Hero
        headline="Für Handwerksbetriebe: Mehr Aufträge, weniger Chaos im Büro."
        subline="Du bist Meister deines Fachs – aber Termine, Angebote und Mitarbeiter kosten dich den letzten Nerv? Wir bringen Struktur rein, damit dein Betrieb wieder rund läuft."
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <ProblemSection
        intro="Das kennen die meisten Handwerker:"
        problems={[
          "Terminplanung ist ein Dauerkampf",
          "Angebote bleiben liegen, Nachkalkulation fehlt",
          "Mitarbeiter brauchen ständig Anleitung",
          "Abends noch Papierkram statt Feierabend",
        ]}
        outro="Du brauchst keine App. Du brauchst ein System, das funktioniert."
      />
      
      <SystemSection
        headline="Dein Handwerker-System in 5 Bereichen"
        modules={[
          { title: "Auftragsmanagement & Planung", icon: "calendar" },
          { title: "Angebote & Preiskalkulation", icon: "target" },
          { title: "Mitarbeiterführung & Delegation", icon: "usercheck" },
          { title: "Kundengewinnung ohne Kaltakquise", icon: "users" },
          { title: "Prozesse, die den Alltag erleichtern", icon: "cog" },
        ]}
      />
      
      <PlatformProof
        headline="Ein Blick ins Signature System"
        intro="Du bekommst keine lose Kurssammlung, sondern einen strukturierten Mitgliederbereich:"
        features={[
          "Vorlagen für Angebote, Rechnungen, Checklisten",
          "Schritt-für-Schritt Anleitungen für jeden Bereich",
          "Umsetzungspfad für die ersten 30 Tage",
          "Alles an einem Ort – jederzeit abrufbar",
        ]}
      />
      
      <PersonalSupport
        headline="Persönliche Begleitung"
        intro="Im Alltag entstehen die wichtigsten Fragen. Im Signature System bekommst du:"
        points={[
          "Persönliches Sparring bei Entscheidungen",
          "Klare Antworten statt Grübeln",
          "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
        ]}
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <FAQSection
        items={[
          {
            question: "Ich habe wenig Zeit – passt das trotzdem?",
            answer: "Gerade dann. Das System ist so aufgebaut, dass du pro Woche nur 1-2 Stunden investierst. Alles ist auf Umsetzung ausgelegt, nicht auf stundenlanges Zuschauen.",
          },
          {
            question: "Brauche ich dafür technische Vorkenntnisse?",
            answer: "Nein. Das Signature System ist einfach gehalten. Wir führen dich Schritt für Schritt – auch ohne IT-Kenntnisse.",
          },
          {
            question: "Was kostet das?",
            answer: "Im kostenlosen Analysegespräch schauen wir gemeinsam, ob das System zu dir passt. Erst dann sprechen wir über Preise. Kein Verkaufsdruck.",
          },
        ]}
      />
      
      <FinalCTA
        headline="Bereit für weniger Chaos und mehr Kontrolle?"
        subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie das Signature System deinen Betrieb voranbringt."
        ctaText="Jetzt Gespräch sichern"
        onCtaClick={openModal}
      />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="handwerk" 
      />
    </PublicLayout>
  );
};

export default Handwerk;
