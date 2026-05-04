// Konfiguration der wiederkehrenden Live-Calls.
// Wochentage: 0 = So, 1 = Mo, 2 = Di, ... 4 = Do
export type LiveCallSlot = {
  weekday: number;
  hour: number;
  minute: number;
  label: string;
};

export const LIVE_CALL_SLOTS: LiveCallSlot[] = [
  { weekday: 2, hour: 19, minute: 0, label: "Prompt- & KI-Werkstatt" },
  { weekday: 4, hour: 19, minute: 0, label: "Live-Umsetzung & Q&A" },
];

export const LIVE_CALL_TIMEZONE = "Europe/Berlin";

export type UpcomingCall = {
  date: Date;
  label: string;
};

/**
 * Berechnet die nächsten N Live-Call-Termine basierend auf der Slot-Konfiguration.
 */
export function getNextLiveCalls(count = 2, from: Date = new Date()): UpcomingCall[] {
  const horizonDays = 21;
  const candidates: UpcomingCall[] = [];

  for (let offset = 0; offset <= horizonDays; offset++) {
    const day = new Date(from);
    day.setDate(day.getDate() + offset);

    for (const slot of LIVE_CALL_SLOTS) {
      if (day.getDay() !== slot.weekday) continue;
      const date = new Date(day);
      date.setHours(slot.hour, slot.minute, 0, 0);
      if (date.getTime() <= from.getTime()) continue;
      candidates.push({ date, label: slot.label });
    }
  }

  return candidates
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

const WEEKDAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function formatLiveCall(date: Date): string {
  const wd = WEEKDAY_LABELS[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${wd} ${dd}.${mm}. · ${hh}:${min} Uhr`;
}
