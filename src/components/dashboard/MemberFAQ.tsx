import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight } from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
  cta?: { label: string; to: string };
};

const faqs: FAQ[] = [
  {
    question: "Was bekomme ich mit meiner Mitgliedschaft konkret im Portal?",
    answer:
      "Vollen Zugang zum Mitgliederbereich mit Lernpfaden, Vorlagen, Checklisten, KI-Tools (Angebote, Call-Analyse, Lead-Scoring) und allen Aufzeichnungen der Live-Calls. Dein Fortschritt wird automatisch gespeichert.",
    cta: { label: "Mein System öffnen", to: "/app/academy" },
  },
  {
    question: "Wo sollte ich starten – was ist der nächste Schritt?",
    answer:
      "Beginne mit Modul 1 "Fundament & Setup" in deinem Lernpfad. Jede Lektion endet mit einer konkreten Checkliste – nach 10–15 Minuten weißt du exakt, was als Nächstes zu tun ist.",
    cta: { label: "Nächste Lektion starten", to: "/app/academy" },
  },
  {
    question: "Wann finden die Live-Calls statt und wo trete ich bei?",
    answer:
      "Die wöchentlichen Live-Calls findest du im Kalender im Portal. Termine, Zoom-Links und Aufzeichnungen werden dort automatisch eingetragen. Du kannst live teilnehmen oder die Aufzeichnung im Anschluss ansehen.",
    cta: { label: "Zum Kalender", to: "/app/live-calls" },
  },
  {
    question: "Wo finde ich Vorlagen, Skripte und Prompts?",
    answer:
      "Alle Vorlagen, E-Mail-Sequenzen und KI-Prompts liegen branchenspezifisch in der Prompt-Library und in deinen Dokumenten. Einfach kopieren, anpassen, einsetzen.",
    cta: { label: "Prompt-Library öffnen", to: "/app/prompts" },
  },
  {
    question: "Wie definiere und tracke ich meine Ziele?",
    answer:
      "Über den Bereich "Ziele" legst du dein Quartals- und Jahresziel fest. Das System unterstützt dich dabei, große Ziele in wöchentliche Schritte herunterzubrechen.",
    cta: { label: "Ziele definieren", to: "/app/goals" },
  },
  {
    question: "Wie erreiche ich den Support oder den Gründer direkt?",
    answer:
      "Stelle deine Fragen in der Community oder direkt im Posteingang im Portal. Antworten kommen werktags innerhalb von 24 Stunden – bei dringenden Themen schneller.",
    cta: { label: "Posteingang öffnen", to: "/app/inbox" },
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer:
      "Ja. Deine Mitgliedschaft kannst du jederzeit zum Ende des gebuchten Zeitraums kündigen – ohne versteckte Kosten oder automatische Verlängerung über das gebuchte Jahr hinaus.",
    cta: { label: "Einstellungen öffnen", to: "/app/settings" },
  },
];

export function MemberFAQ() {
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Häufige Fragen & nächste Schritte</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Antworten zu Mitgliedschaft, Inhalten und Ablauf – mit direktem Sprung ins Portal.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border/40 rounded-lg px-4 data-[state=open]:bg-muted/20 transition-colors"
            >
              <AccordionTrigger className="text-sm md:text-base font-medium hover:no-underline py-4 text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 space-y-3">
                <p>{item.answer}</p>
                {item.cta && (
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link to={item.cta.to}>
                      {item.cta.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
