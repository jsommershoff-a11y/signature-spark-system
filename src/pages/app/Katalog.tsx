// ============================================================
// src/pages/app/Katalog.tsx
// Produktkatalog im Mitgliederbereich.
// Wird unter /app/katalog gerendert, innerhalb AppLayout.
// ProtectedRoute im App.tsx handhabt Auth — hier kein eigener Auth-Check.
// ============================================================

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AUTOMATIONS, AUTOMATIONS_BY_CATEGORY, formatPriceEUR, type Automation } from "@/data/automations";
import { CheckCircle, ArrowRight, Sparkles, Info } from "lucide-react";

export default function Katalog() {
  const [searchParams] = useSearchParams();
  const focusProduct = searchParams.get("product");

  useEffect(() => {
    if (focusProduct) {
      setTimeout(() => {
        const el = document.getElementById(`product-${focusProduct}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("ring-4", "ring-blue-400", "ring-offset-2");
          setTimeout(() => el.classList.remove("ring-4", "ring-blue-400", "ring-offset-2"), 3000);
        }
      }, 300);
    }
  }, [focusProduct]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold tracking-wider mb-3">
          <Sparkles size={14} /> KI-AUTOMATIONEN · SOFORTKAUF
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          Produktkatalog
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          {AUTOMATIONS.length} standardisierte KI-Automationen inkl. Sofortkauf via Stripe.
          Alle Preise netto zzgl. 19 % USt. Rechnungsstellung durch KRS Immobilien GmbH.
        </p>
      </div>

      {/* Mengenrabatt-Hinweis */}
      <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info size={22} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong className="text-foreground">Mengenrabatt bei mehreren Automationen:</strong>
          <span className="text-muted-foreground"> 2 Automationen 10 % · 3 Automationen 15 % · 5 Automationen 25 %. </span>
          <span className="text-muted-foreground">Rabatt wird als Gutschrift nach Kauf verrechnet. Bei Paket-Interesse: </span>
          <a href="mailto:j.s@jan-sommershoff.de" className="text-blue-600 font-medium underline">
            j.s@jan-sommershoff.de
          </a>
        </div>
      </div>

      {/* Automationen */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-extrabold text-foreground">KI-Automationen</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            {AUTOMATIONS_BY_CATEGORY.automation.length} Produkte
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AUTOMATIONS_BY_CATEGORY.automation.map((a) => (
            <ProductCard key={a.code} automation={a} />
          ))}
        </div>
      </section>

      {/* KI-Profi-Programm Bundle */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-extrabold text-foreground">Weiterbildung</h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            KI-Profi Programm · 6 Monate
          </span>
        </div>
        <EducationBundleCard />
      </section>
    </div>
  );
}

// ============ PRODUCT CARD ============
function ProductCard({ automation }: { automation: Automation }) {
  return (
    <div
      id={`product-${automation.code}`}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all flex flex-col"
    >
      <div className="aspect-[12/5] bg-slate-900">
        <img
          src={`/thumbnails/${automation.code}.svg`}
          alt={automation.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-blue-600 tracking-wider">{automation.code}</span>
          <span className="text-xs text-muted-foreground">· Lieferung {automation.leadDays} Tage</span>
        </div>
        <h3 className="text-lg font-extrabold text-foreground mb-2">{automation.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">{automation.subtitle}</p>

        <div className="space-y-1 mb-4">
          {automation.outcomes.slice(0, 2).map((o, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{o}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-foreground">{formatPriceEUR(automation.priceNet)}</div>
            <div className="text-xs text-muted-foreground">netto · einmalig</div>
          </div>
          <a
            href={automation.payLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Sofortkauf <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ============ EDUCATION BUNDLE (EDU01 + EDU02) ============
function EducationBundleCard() {
  const kickoff = AUTOMATIONS.find((a) => a.code === "EDU01")!;
  const monthly = AUTOMATIONS.find((a) => a.code === "EDU02")!;
  const totalInvestment = kickoff.priceNet + monthly.priceNet * 6;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl overflow-hidden">
      <div className="p-6 md:p-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400 rounded-full text-amber-200 text-xs font-bold tracking-wider mb-4">
              <Sparkles size={13} /> 6 MONATE · KI-PROFI-PROGRAMM
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
              Werden Sie selbst zum KI-Profi
            </h3>
            <p className="text-slate-300 mb-5 max-w-2xl text-sm">
              6-monatiges Intensivprogramm: wöchentliche Live-Sessions, monatliches 1:1-Coaching,
              Hands-on-Projekte aus Ihrem Arbeitsalltag. Am Ende bauen Sie eigene KI-Automationen.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> Wöchentliche Live-Sessions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> Monatliches 1:1-Coaching
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> 500+ getestete Prompts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> 30+ Workflow-Templates
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> Slack-Community
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> Abschluss-Zertifikat
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 min-w-[260px]">
            <div className="text-xs text-slate-300 mb-1">Kickoff-Gebühr (einmalig)</div>
            <div className="text-2xl font-extrabold mb-3">
              {formatPriceEUR(kickoff.priceNet)}{" "}
              <span className="text-xs font-normal text-slate-400">netto</span>
            </div>

            <div className="border-t border-white/20 my-3"></div>

            <div className="text-xs text-slate-300 mb-1">Monatsgebühr</div>
            <div className="text-2xl font-extrabold mb-1">
              {formatPriceEUR(monthly.priceNet)}{" "}
              <span className="text-xs font-normal text-slate-400">/Monat</span>
            </div>
            <div className="text-xs text-slate-400 mb-3">× 6 Monate Mindestlaufzeit</div>

            <div className="border-t border-white/20 my-3"></div>
            <div className="text-xs text-slate-300">Gesamtinvestition über 6 Monate:</div>
            <div className="text-xl font-extrabold mb-4">{formatPriceEUR(totalInvestment)} netto</div>

            <div className="space-y-2">
              <a
                href={kickoff.payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-bold transition-colors"
              >
                1. Kickoff-Gebühr zahlen →
              </a>
              <a
                href={monthly.payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-bold transition-colors"
              >
                2. Monatsabo starten →
              </a>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              Start nach Zahlung der Kickoff-Gebühr. Der monatliche Beitrag wird automatisch 6× abgebucht.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
