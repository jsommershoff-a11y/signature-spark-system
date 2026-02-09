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

const Praxen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <PublicLayout>
      <Hero
        headline="Für Praxen: Mehr Zeit für Patienten, weniger Verwaltungschaos."
        subline="Du bist Arzt, Zahnarzt oder Therapeut – aber Terminausfälle, Personal und Abrechnung fressen deine Energie? Wir bringen Struktur in deinen Praxisalltag."
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <ProblemSection
        intro="Das kennen die meisten Praxisinhaber:"
        problems={[
          "Terminausfälle und No-Shows kosten Umsatz",
          "Mitarbeiter kommen und gehen – Einarbeitung frisst Zeit",
          "Abrechnung, Dokumentation, Verwaltung: endlos",
          "Work-Life-Balance? Eher Work-Work-Balance.",
        ]}
        outro="Du brauchst kein neues Tool. Du brauchst ein System, das funktioniert."
      />
      
      <SystemSection
        headline="Dein Praxis-System in 5 Bereichen"
        modules={[
          { title: "Praxisorganisation & Terminmanagement", icon: "calendar" },
          { title: "Patientengewinnung ohne Werbedruck", icon: "users" },
          { title: "Team & Mitarbeiterführung", icon: "usercheck" },
          { title: "Prozesse, die den Alltag erleichtern", icon: "cog" },
          { title: "Work-Life-Balance für Praxisinhaber", icon: "compass" },
        ]}
      />
      
      <PlatformProof
        headline="Ein Blick ins Signature System"
        intro="Du bekommst keine lose Kurssammlung, sondern einen strukturierten Mitgliederbereich:"
        features={[
          "Vorlagen für Patientenkommunikation & Prozesse",
          "Checklisten für Einarbeitung neuer Mitarbeiter",
          "Umsetzungspfad für die ersten 30 Tage",
          "Alles an einem Ort – jederzeit abrufbar",
        ]}
      />
      
      <PersonalSupport
        headline="Persönliche Begleitung"
        intro="Im Praxisalltag entstehen die wichtigsten Fragen. Im Signature System bekommst du:"
        points={[
          "Persönliches Sparring bei Entscheidungen",
          "Klare Antworten auf Organisations-Fragen",
          "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
        ]}
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <FAQSection
        items={[
          {
            question: "Ich habe kaum Zeit neben der Praxis – passt das?",
            answer: "Gerade dann. Das System ist so aufgebaut, dass du pro Woche nur 1-2 Stunden investierst. Alles ist auf Umsetzung ausgelegt, nicht auf stundenlanges Zuschauen.",
          },
          {
            question: "Funktioniert das auch für kleine Praxen?",
            answer: "Ja. Das Signature System ist für Praxen jeder Größe geeignet – vom Einzelkämpfer bis zur Gemeinschaftspraxis.",
          },
          {
            question: "Was kostet das?",
            answer: "Im kostenlosen Analysegespräch schauen wir gemeinsam, ob das System zu dir passt. Erst dann sprechen wir über Preise. Kein Verkaufsdruck.",
          },
        ]}
      />
      
      <FinalCTA
        headline="Bereit für mehr Fokus auf das, was zählt?"
        subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie das Signature System deinen Praxisalltag verändert."
        ctaText="Jetzt Gespräch sichern"
        onCtaClick={openModal}
      />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="praxen" 
      />
    </PublicLayout>
  );
};

export default Praxen;
