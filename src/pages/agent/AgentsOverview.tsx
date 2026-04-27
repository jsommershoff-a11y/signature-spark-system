import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AUTOMATIONS, AUTOMATIONS_BY_CATEGORY, formatPriceEUR } from "@/data/automations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Target, FileText, Mic, Search, MessageSquare, BarChart3, Receipt, Phone, UserCheck, Building2, Sparkles } from "lucide-react";

const iconMap: Record<string, JSX.Element> = {
  calendar: <Calendar className="h-6 w-6" />,
  mail: <Mail className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  document: <FileText className="h-6 w-6" />,
  audio: <Mic className="h-6 w-6" />,
  extract: <Search className="h-6 w-6" />,
  content: <MessageSquare className="h-6 w-6" />,
  hire: <UserCheck className="h-6 w-6" />,
  chat: <MessageSquare className="h-6 w-6" />,
  report: <BarChart3 className="h-6 w-6" />,
  invoice: <Receipt className="h-6 w-6" />,
  phone: <Phone className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
  custom: <Sparkles className="h-6 w-6" />,
};

function AgentCard({ agent }: { agent: typeof AUTOMATIONS[0] }) {
  return (
    <Link to={`/agent/${agent.slug}`} className="block group">
      <Card className="h-full hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="text-primary">{iconMap[agent.icon] ?? iconMap.custom}</div>
            <Badge variant="outline" className="text-xs">{agent.code}</Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">{agent.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{agent.subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              {agent.priceOnRequest ? (
                <span className="text-lg font-bold text-primary">Auf Anfrage</span>
              ) : (
                <>
                  <span className="text-lg font-bold">{formatPriceEUR(agent.priceNet)}</span>
                  <span className="text-xs text-muted-foreground ml-1">{agent.recurring ? "/Mon." : "netto"}</span>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{agent.leadDays}d</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AgentsOverview() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Alle KI-Agenten — KI Automationen</title>
        <meta name="description" content="Alle 19 KI-Agenten im Überblick: 13 Automationen, 2 Education-Programme, 1 Enterprise-Bundle, 3 Custom-Tiers." />
        <link rel="canonical" href="https://ki-automationen.io/agents" />
      </Helmet>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-primary">KI</span> Automationen
          </Link>
          <Link to="/qualifizierung" className="text-sm text-primary hover:underline">Beratung buchen</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 lg:py-16 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Alle KI-Agenten</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {AUTOMATIONS.length} Produkte: {AUTOMATIONS_BY_CATEGORY.automation.length} Standard-Automationen, {AUTOMATIONS_BY_CATEGORY.education.length} Education-Programme, {AUTOMATIONS_BY_CATEGORY.enterprise.length} Enterprise-Komplett-Paket und {AUTOMATIONS_BY_CATEGORY.custom.length} Custom-Tiers.
        </p>
      </section>

      {/* Standard Automations */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Standard-Automationen</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTOMATIONS_BY_CATEGORY.automation.map(a => <AgentCard key={a.code} agent={a} />)}
        </div>
      </section>

      {/* Education */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Education — KI-Profi Programm</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTOMATIONS_BY_CATEGORY.education.map(a => <AgentCard key={a.code} agent={a} />)}
        </div>
      </section>

      {/* Enterprise */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Enterprise & Custom</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTOMATIONS_BY_CATEGORY.enterprise.map(a => <AgentCard key={a.code} agent={a} />)}
          {AUTOMATIONS_BY_CATEGORY.custom.map(a => <AgentCard key={a.code} agent={a} />)}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>KRS Immobilien GmbH · ki-automationen.io · <Link to="/agb" className="underline">AGB</Link> · <Link to="/widerruf" className="underline">Widerruf</Link></p>
        </div>
      </footer>
    </div>
  );
}
