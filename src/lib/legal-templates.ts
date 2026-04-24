// Legal Templates: AGB, Widerrufsbelehrung, Leistungsbeschreibung

import type { OfferMode } from '@/types/offers';
import { OFFER_MODULES, type ModuleDefinition } from './offer-modules';

// =============================================
// AGB
// =============================================

export const DEFAULT_AGB = `ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AGB)
KRS Immobilien GmbH – KI-Automationen

Stand: Februar 2026

§ 1 Geltungsbereich
(1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der KRS Immobilien GmbH, Westerwaldstr. 146, 53773 Hennef (nachfolgend „Anbieter") und dem Auftraggeber (nachfolgend „Kunde") über Beratungs- und Systemaufbau-Dienstleistungen im Rahmen des Programms „KI-Automationen".
(2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.

§ 2 Vertragsgegenstand
(1) Der Anbieter erbringt Beratungs-, Coaching- und Implementierungsleistungen gemäß der individuellen Leistungsbeschreibung im Angebot.
(2) Die konkreten Leistungsbestandteile ergeben sich aus dem jeweiligen Angebot und der darin enthaltenen Modulauswahl.
(3) Der Anbieter schuldet eine fachgerechte Durchführung der vereinbarten Leistungen, jedoch keinen bestimmten wirtschaftlichen Erfolg.

§ 3 Vergütung und Zahlung
(1) Die Vergütung richtet sich nach dem individuellen Angebot.
(2) Alle Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer.
(3) Die Zahlung erfolgt gemäß der im Angebot vereinbarten Zahlungsweise (Einmalzahlung, 3 oder 6 Raten).
(4) Bei Ratenzahlung sind die Raten jeweils zum vereinbarten Fälligkeitstermin zu leisten. Bei Verzug können Verzugszinsen in gesetzlicher Höhe berechnet werden.

§ 4 Laufzeit und Kündigung
(1) Die Vertragslaufzeit beträgt 6 Monate ab dem vereinbarten Startdatum.
(2) Der Kunde kann den Vertrag jederzeit ordentlich kündigen. Die vereinbarte Vergütung für das gebuchte Paket bleibt in voller Höhe fällig und ist unabhängig von einer Kündigung vollständig zu entrichten.
(3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
(4) Die Kündigung bedarf der Schriftform.

§ 5 Mitwirkungspflichten des Kunden
(1) Der Kunde stellt die für die Leistungserbringung erforderlichen Informationen, Zugänge und Ressourcen rechtzeitig zur Verfügung.
(2) Bei dem Programm „Rocket Performance" benennt der Kunde einen internen Verantwortlichen für die Umsetzung.
(3) Verzögert sich die Leistungserbringung aufgrund fehlender Mitwirkung des Kunden, entbindet dies den Anbieter von der Einhaltung vereinbarter Fristen. Eine automatische Verlängerung der Vertragslaufzeit erfolgt nicht.

§ 6 Geistiges Eigentum
(1) Alle im Rahmen des Vertrages erstellten Materialien, Skripte, Konzepte und Systeme verbleiben im Eigentum des Anbieters, soweit nicht ausdrücklich anders vereinbart.
(2) Der Kunde erhält ein einfaches, nicht übertragbares Nutzungsrecht für die vereinbarte Vertragslaufzeit.

§ 7 Vertraulichkeit
(1) Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten vertraulichen Informationen geheim zu halten.
(2) Diese Verpflichtung gilt auch nach Beendigung des Vertrages fort.

§ 8 Haftung
(1) Der Anbieter haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen.
(2) Die Haftung ist der Höhe nach auf den Vertragswert begrenzt.
(3) Die Haftung für mittelbare Schäden und entgangenen Gewinn ist ausgeschlossen.

§ 9 Datenschutz
(1) Der Anbieter verarbeitet personenbezogene Daten des Kunden ausschließlich zur Vertragserfüllung und im Einklang mit der DSGVO.
(2) Einzelheiten sind der Datenschutzerklärung des Anbieters zu entnehmen.

§ 10 Schlussbestimmungen
(1) Es gilt das Recht der Bundesrepublik Deutschland.
(2) Gerichtsstand ist Hennef, sofern der Kunde Kaufmann ist.
(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

KRS Immobilien GmbH
Westerwaldstr. 146, 53773 Hennef
USt-IdNr.: DE224477392 | HRB 18532
Geschäftsführer: Jan Niklas Sommershoff, Yannick Müller`;

// =============================================
// WIDERRUFSBELEHRUNG
// =============================================

export const DEFAULT_WITHDRAWAL_POLICY = `WIDERRUFSBELEHRUNG

Widerrufsrecht

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns

KRS Immobilien GmbH
Westerwaldstr. 146
53773 Hennef
E-Mail: info@krs-signature.de

mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs

Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart.

Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.

---

MUSTER-WIDERRUFSFORMULAR

(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)

An:
KRS Immobilien GmbH
Westerwaldstr. 146
53773 Hennef
E-Mail: info@krs-signature.de

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:

Bestellt am (*) / erhalten am (*):
Name des/der Verbraucher(s):
Anschrift des/der Verbraucher(s):
Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
Datum:

(*) Unzutreffendes streichen.`;

// =============================================
// SERVICE DESCRIPTION GENERATOR
// =============================================

export function generateServiceDescription(mode: OfferMode, selectedModuleIds: string[]): string {
  if (mode === 'variable') {
    return `LEISTUNGSBESCHREIBUNG\nVariables Angebot – Einzelleistung\n\nDie konkrete Leistung, der voraussichtliche Fertigstellungszeitpunkt und die geschätzten Kosten ergeben sich aus dem Angebot.\n\nHinweis: Bei variablen Angeboten können die tatsächlichen Kosten vom Kostenvoranschlag abweichen. Sollte sich während der Umsetzung herausstellen, dass der geschätzte Aufwand überschritten wird, werden Sie vorab informiert und eine Freigabe eingeholt.\n\nKRS Immobilien GmbH\nWesterwaldstr. 146, 53773 Hennef`;
  }

  const modeLabel = mode === 'performance' ? 'Performance' : 'Rocket Performance';
  const selectedModules = OFFER_MODULES.filter(m => selectedModuleIds.includes(m.id));

  let text = `LEISTUNGSBESCHREIBUNG\nKI-Automationen – ${modeLabel} (6 Monate)\n\n`;
  text += `Programmmodus: ${modeLabel}\n`;
  text += `Laufzeit: 6 Monate ab Startdatum\n\n`;

  if (mode === 'performance') {
    text += `Format: Hybrid (Workshops + Umsetzungs-Sprints + Review)\n`;
    text += `Leistungsziel: Vertrieb, Prozesse und Führung in ein funktionierendes Betriebssystem bringen.\n\n`;
  } else {
    text += `Format: Premium-Betreuung (vollständiger Aufbau + individuelle Begleitung)\n`;
    text += `Leistungsziel: Maximale Unterstützung beim Aufbau eines belastbaren Systems mit individueller Betreuung.\n\n`;
  }

  text += `ENTHALTENE BAUSTEINE\n\n`;
  selectedModules.forEach((mod, i) => {
    text += `${i + 1}. ${mod.label}\n`;
    text += `   ${mod.description}\n`;
    text += `   Deliverables:\n`;
    mod.deliverables[mode as 'performance' | 'rocket_performance'].forEach(d => {
      text += `   • ${d}\n`;
    });
    text += '\n';
  });

  text += `\nDie konkrete Ausgestaltung der einzelnen Bausteine erfolgt in Abstimmung mit dem Kunden nach Vertragsbeginn.\n`;
  text += `\nKRS Immobilien GmbH\nWesterwaldstr. 146, 53773 Hennef`;

  return text;
}

// =============================================
// VARIABLE OFFER AGB ADDENDUM
// =============================================

export const VARIABLE_OFFER_AGB_ADDENDUM = `
§ 11 Besondere Bestimmungen für variable Angebote (Kostenvoranschläge)

(1) Bei variablen Angeboten handelt es sich um Kostenvoranschläge im Sinne des § 632 Abs. 2 BGB. Die angegebenen Kosten sind geschätzte Werte und können je nach tatsächlichem Aufwand abweichen.

(2) Sollte sich während der Leistungserbringung abzeichnen, dass die geschätzten Kosten um mehr als 15% überschritten werden, wird der Anbieter den Kunden unverzüglich informieren und eine Freigabe für die Mehrkosten einholen.

(3) Ohne ausdrückliche Freigabe des Kunden werden keine Mehrkosten über 15% der ursprünglichen Schätzung berechnet.

(4) Der Kunde kann den Auftrag jederzeit kündigen. In diesem Fall sind die bis dahin erbrachten Leistungen zu vergüten.

(5) Der Fortschritt der Leistungserbringung wird dokumentiert und dem Kunden im Portal zugänglich gemacht.`;
