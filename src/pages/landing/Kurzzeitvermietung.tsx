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

const Kurzzeitvermietung = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero
          headline="Für Kurzzeitvermieter: Bessere Auslastung, weniger manueller Aufwand."
          subline="Du vermietest auf Airbnb, Booking oder direkt – aber Anfragen, Reinigung und Gäste-Kommunikation fressen deine Zeit? Wir bringen Struktur rein, damit dein Business automatisiert läuft."
          ctaText="Kostenloses Analysegespräch sichern"
          onCtaClick={openModal}
        />
        
        <ProblemSection
          intro="Das kennen die meisten Vermieter:"
          problems={[
            "Anfragen beantworten kostet Stunden pro Woche",
            "Reinigung und Check-in sind logistische Alpträume",
            "Auslastung schwankt stark je nach Saison",
            "Mehr Objekte = mehr Chaos, nicht mehr Gewinn",
          ]}
          outro="Du brauchst keine neue Plattform. Du brauchst ein System, das funktioniert."
        />
        
        <SystemSection
          headline="Dein Vermietungs-System in 5 Bereichen"
          modules={[
            { title: "Automatisierte Gäste-Kommunikation", icon: "users" },
            { title: "Reinigungs- & Check-in-Prozesse", icon: "calendar" },
            { title: "Preisoptimierung & Auslastung", icon: "chart" },
            { title: "Multi-Plattform Management", icon: "grid" },
            { title: "Skalierung ohne Mehraufwand", icon: "cog" },
          ]}
        />
        
        <PlatformProof
          headline="Ein Blick ins Signature System"
          intro="Du bekommst keine lose Kurssammlung, sondern einen strukturierten Mitgliederbereich:"
          features={[
            "Vorlagen für Gäste-Nachrichten und Hausregeln",
            "Checklisten für Reinigung und Übergabe",
            "Umsetzungspfad für die ersten 30 Tage",
            "Alles an einem Ort – jederzeit abrufbar",
          ]}
        />
        
        <PersonalSupport
          headline="Persönliche Begleitung"
          intro="Im Vermieter-Alltag entstehen die wichtigsten Fragen. Im Signature System bekommst du:"
          points={[
            "Persönliches Sparring bei Entscheidungen",
            "Klare Antworten auf Optimierungs-Fragen",
            "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
          ]}
          ctaText="Kostenloses Analysegespräch sichern"
          onCtaClick={openModal}
        />
        
        <FAQSection
          items={[
            {
              question: "Funktioniert das auch mit nur 1-2 Objekten?",
              answer: "Ja. Das Signature System hilft dir, von Anfang an die richtigen Prozesse aufzubauen – damit du skalieren kannst, wenn du willst.",
            },
            {
              question: "Ich nutze schon Channel-Manager – brauche ich noch mehr?",
              answer: "Das Signature System ersetzt keine Tools. Es gibt dir die Struktur und Prozesse, damit deine Tools richtig funktionieren.",
            },
            {
              question: "Was kostet das?",
              answer: "Im kostenlosen Analysegespräch schauen wir gemeinsam, ob das System zu dir passt. Erst dann sprechen wir über Preise. Kein Verkaufsdruck.",
            },
          ]}
        />
        
        <FinalCTA
          headline="Bereit für mehr Gewinn bei weniger Aufwand?"
          subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie das Signature System dein Vermietungs-Business voranbringt."
          ctaText="Jetzt Gespräch sichern"
          onCtaClick={openModal}
        />
      </main>
      
      <Footer />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="kurzzeitvermietung" 
      />
    </div>
  );
};

export default Kurzzeitvermietung;
