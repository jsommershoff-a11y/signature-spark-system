import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAutomationBySlug, formatPriceEUR } from "@/data/automations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Calendar, Mail, Target, FileText, Mic, Search, MessageSquare, BarChart3, Receipt, Phone, UserCheck, Building2, Sparkles } from "lucide-react";

const iconMap: Record<string, JSX.Element> = {
  calendar: <Calendar className="h-8 w-8" />,
  mail: <Mail className="h-8 w-8" />,
  target: <Target className="h-8 w-8" />,
  document: <FileText className="h-8 w-8" />,
  audio: <Mic className="h-8 w-8" />,
  extract: <Search className="h-8 w-8" />,
  content: <MessageSquare className="h-8 w-8" />,
  hire: <UserCheck className="h-8 w-8" />,
  chat: <MessageSquare className="h-8 w-8" />,
  report: <BarChart3 className="h-8 w-8" />,
  invoice: <Receipt className="h-8 w-8" />,
  phone: <Phone className="h-8 w-8" />,
  enterprise: <Building2 className="h-8 w-8" />,
  custom: <Sparkles className="h-8 w-8" />,
};

export default function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const agent = slug ? getAutomationBySlug(slug) : undefined;

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold">Agent nicht gefunden</h1>
          <p className="text-muted-foreground">Der gesuchte KI-Agent existiert nicht. Hier sind alle verfügbaren Agenten:</p>
          <Button onClick={() => navigate("/agents")}>Alle Agenten anzeigen</Button>
        </div>
      </div>
    );
  }

  const isOnRequest = agent.priceOnRequest === true;
  const ctaUrl = isOnRequest ? (agent.inquiryUrl ?? "/qualifizierung") : agent.payLink;
  const ctaLabel = isOnRequest ? "Beratungsgespräch buchen" : (agent.recurring ? "Programm starten" : "Jetzt buchen");
  const icon = iconMap[agent.icon] ?? iconMap.custom;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{agent.name} — KI Automationen</title>
        <meta name="description" content={agent.subtitle} />
        <meta property="og:title" content={`${agent.name} — KI Automationen`} />
        <meta property="og:description" content={agent.subtitle} />
        <link rel="canonical" href={`https://ki-automationen.io/agent/${agent.slug}`} />
      </Helmet>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-primary">KI</span> Automationen
          </Link>
          <Link to="/agents" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Alle Agenten
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-xs">{agent.code}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{agent.category}</Badge>
            {agent.bundleSize && <Badge variant="outline" className="text-xs">{agent.bundleSize}</Badge>}
          </div>
          <div className="flex items-start gap-4 mb-6">
            <div className="text-primary mt-1">{icon}</div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{agent.name}</h1>
              <p className="text-xl text-muted-foreground mt-2">{agent.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="text-3xl font-bold">
              {isOnRequest ? (
                <span className="text-primary">Preis auf Anfrage</span>
              ) : (
                <>
                  {formatPriceEUR(agent.priceNet)}
                  <span className="text-base font-normal text-muted-foreground ml-2">netto{agent.recurring ? "/Monat" : ""}</span>
                </>
              )}
            </div>
            {!isOnRequest && (
              <div className="text-sm text-muted-foreground">{formatPriceEUR(agent.priceGrossVAT)} brutto inkl. 19 % USt.</div>
            )}
            <div className="text-sm text-muted-foreground">Go-Live in {agent.leadDays} Tagen</div>
          </div>
          {ctaUrl && (
            <div className="mt-8">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <a href={ctaUrl} target={isOnRequest ? "_self" : "_blank"} rel={isOnRequest ? "" : "noopener noreferrer"}>
                  {ctaLabel}
                </a>
              </Button>
              {agent.bundleNote && (
                <p className="text-xs text-muted-foreground mt-3">{agent.bundleNote}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pain + Solution */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle className="text-xl">Das Problem</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{agent.pain}</p></CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader><CardTitle className="text-xl text-primary">Die Lösung</CardTitle></CardHeader>
              <CardContent><p>{agent.solution}</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Was Sie bekommen</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {agent.outcomes.map((outcome, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p>{outcome}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Im Paket enthalten</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {agent.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <p className="text-muted-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader><CardTitle>Ideal für</CardTitle></CardHeader>
          <CardContent><p className="text-lg">{agent.idealFor}</p></CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Bereit für {agent.name}?</h2>
          <p className="text-lg opacity-90 mb-8">
            {isOnRequest
              ? "Buchen Sie ein unverbindliches Discovery-Gespräch — wir definieren Scope und Preis gemeinsam."
              : `Implementierung in ${agent.leadDays} Tagen, 30 Tage Optimierungssupport inklusive.`}
          </p>
          {ctaUrl && (
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <a href={ctaUrl} target={isOnRequest ? "_self" : "_blank"} rel={isOnRequest ? "" : "noopener noreferrer"}>
                {ctaLabel}
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>KRS Immobilien GmbH · ki-automationen.io · <Link to="/agb" className="underline">AGB</Link> · <Link to="/widerruf" className="underline">Widerruf</Link></p>
        </div>
      </footer>
    </div>
  );
}
