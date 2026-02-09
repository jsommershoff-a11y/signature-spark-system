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

const Immobilien = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <PublicLayout>
      <Hero
        headline="Für Immobilienprofis: Mehr Abschlüsse, bessere Prozesse."
        subline="Du bist Makler oder Verwalter – aber Lead-Qualität, Follow-up und Objektakquise kosten dich Zeit und Nerven? Wir bringen Struktur rein, damit du mehr abschließt."
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <ProblemSection
        intro="Das kennen die meisten Immobilienprofis:"
        problems={[
          "Leads kommen, aber Qualität schwankt stark",
          "Follow-up-Prozesse sind chaotisch",
          "Objektakquise ist mühsam",
          "Skalierung scheitert an fehlenden Prozessen",
        ]}
        outro="Du brauchst keine neuen Leads. Du brauchst ein System, das funktioniert."
      />
      
      <SystemSection
        headline="Dein Immobilien-System in 5 Bereichen"
        modules={[
          { title: "Lead-Pipeline & Qualifizierung", icon: "trending" },
          { title: "Objektakquise & Eigentümer-Ansprache", icon: "target" },
          { title: "Follow-up & Kundenbetreuung", icon: "users" },
          { title: "Team & Delegation", icon: "usercheck" },
          { title: "Prozesse für Skalierung", icon: "cog" },
        ]}
      />
      
      <PlatformProof
        headline="Ein Blick ins Signature System"
        intro="Du bekommst keine lose Kurssammlung, sondern einen strukturierten Mitgliederbereich:"
        features={[
          "Vorlagen für Exposés, Akquise-Anschreiben, Follow-ups",
          "Lead-Scoring und Qualifizierungs-Frameworks",
          "Umsetzungspfad für die ersten 30 Tage",
          "Alles an einem Ort – jederzeit abrufbar",
        ]}
      />
      
      <PersonalSupport
        headline="Persönliche Begleitung"
        intro="Im Immobilien-Alltag entstehen die wichtigsten Fragen. Im Signature System bekommst du:"
        points={[
          "Persönliches Sparring bei Entscheidungen",
          "Klare Antworten auf Akquise-Fragen",
          "Unterstützung beim Umsetzen, nicht nur beim Verstehen",
        ]}
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={openModal}
      />
      
      <FAQSection
        items={[
          {
            question: "Funktioniert das auch für Einzelmakler?",
            answer: "Ja. Das Signature System ist für Immobilienprofis jeder Größe geeignet – vom Solo-Makler bis zum Team. Entscheidend ist, dass du strukturiert wachsen willst.",
          },
          {
            question: "Ich habe schon ein CRM – brauche ich noch eins?",
            answer: "Das Signature System ersetzt kein CRM. Es gibt dir die Struktur und Prozesse, damit dein CRM richtig funktioniert.",
          },
          {
            question: "Was kostet das?",
            answer: "Im kostenlosen Analysegespräch schauen wir gemeinsam, ob das System zu dir passt. Erst dann sprechen wir über Preise. Kein Verkaufsdruck.",
          },
        ]}
      />
      
      <FinalCTA
        headline="Bereit für mehr Abschlüsse mit weniger Aufwand?"
        subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie das Signature System dein Immobilien-Business voranbringt."
        ctaText="Jetzt Gespräch sichern"
        onCtaClick={openModal}
      />
      
      <ContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        source="immobilien" 
      />
    </PublicLayout>
  );
};

export default Immobilien;
