// =============================================================
// analytics.test.ts
// Verifiziert die Session-Deduplication in trackLeadConversion.
// Erwartung: Pro sessionStorage-Lifetime feuert das Conversion-
// Event genau EINMAL, egal wie oft trackLeadConversion() laeuft.
// `force: true` umgeht die Dedup bewusst.
// =============================================================

import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackLeadConversion } from "./analytics";

type GtagCall = [string, string, Record<string, unknown>];

function setupGtagSpy(): { gtag: ReturnType<typeof vi.fn>; calls: () => GtagCall[] } {
  const gtag = vi.fn();
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  return {
    gtag,
    calls: () => gtag.mock.calls as unknown as GtagCall[],
  };
}

describe("trackLeadConversion — Session-Deduplication", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("feuert beim 1. Aufruf genau einmal und gibt true zurueck", () => {
    const { gtag, calls } = setupGtagSpy();
    const result = trackLeadConversion();
    expect(result).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(calls()[0][0]).toBe("event");
    expect(calls()[0][1]).toBe("conversion");
    expect(calls()[0][2].send_to).toBe("AW-18031969359/GVlGCK-N26McEM-IqJZD");
  });

  it("feuert bei 5 aufeinanderfolgenden Aufrufen pro Session NUR EINMAL", () => {
    const { gtag } = setupGtagSpy();
    const results = Array.from({ length: 5 }, () => trackLeadConversion());
    expect(results).toEqual([true, false, false, false, false]);
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("feuert nach sessionStorage-Reset (= neue Session) erneut", () => {
    const { gtag } = setupGtagSpy();
    expect(trackLeadConversion()).toBe(true);
    expect(trackLeadConversion()).toBe(false);

    // Simuliere neuen Browser-Tab / neue Session
    window.sessionStorage.clear();

    expect(trackLeadConversion()).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it("force: true umgeht die Dedup und feuert bei jedem Aufruf", () => {
    const { gtag } = setupGtagSpy();
    trackLeadConversion();
    trackLeadConversion({ force: true });
    trackLeadConversion({ force: true });
    expect(gtag).toHaveBeenCalledTimes(3);
  });

  it("returnt false wenn window.gtag fehlt (Tag noch nicht geladen)", () => {
    // kein setupGtagSpy() -> gtag ist undefined
    const result = trackLeadConversion();
    expect(result).toBe(false);
    // Storage darf NICHT markiert werden, sonst wuerde der Real-Fire spaeter fehlen
    expect(
      window.sessionStorage.getItem("krs_gads_fired:GVlGCK-N26McEM-IqJZD"),
    ).toBeNull();
  });

  it("simuliert das React-StrictMode-Doppelrendering der Thanks-Seite (useEffect 2x)", () => {
    const { gtag } = setupGtagSpy();
    // useEffect feuert in StrictMode im Dev zweimal direkt nacheinander
    trackLeadConversion();
    trackLeadConversion();
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});
