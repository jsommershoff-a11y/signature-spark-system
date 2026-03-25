import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FUNNEL_STAGES, MARKETING_CHANNELS, CONTENT_CALENDAR, SCALING_ROADMAP, SPRINT_PLAN, MARKETING_KPIS, DAILY_ACTIVITIES, PRODUCT_TIERS, SALES_TARGETS } from '@/lib/sales-scripts';
import { TrendingUp, Calendar, Megaphone, Target, ArrowRight } from 'lucide-react';

export default function SalesPlanTab() {
  return (
    <Tabs defaultValue="funnel" className="space-y-4">
      <TabsList className="overflow-x-auto print:hidden">
        <TabsTrigger value="funnel">Funnel & KPIs</TabsTrigger>
        <TabsTrigger value="sprint">Sprint-Plan</TabsTrigger>
        <TabsTrigger value="marketing">Marketing</TabsTrigger>
        <TabsTrigger value="roadmap">12-Monats-Roadmap</TabsTrigger>
      </TabsList>

      <TabsContent value="funnel" className="space-y-4">
        <FunnelSection />
      </TabsContent>
      <TabsContent value="sprint" className="space-y-4">
        <SprintSection />
      </TabsContent>
      <TabsContent value="marketing" className="space-y-4">
        <MarketingSection />
      </TabsContent>
      <TabsContent value="roadmap" className="space-y-4">
        <RoadmapSection />
      </TabsContent>
    </Tabs>
  );
}

function FunnelSection() {
  return (
    <>
      {/* Products */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Produkte & Preise</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRODUCT_TIERS.map((p) => (
              <div key={p.name} className="p-4 rounded-2xl border border-border/60 bg-muted/30 text-center">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{p.priceBrutto.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground mt-1">Ziel: {p.monthlyTarget}×/Monat</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Sales Funnel</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {FUNNEL_STAGES.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="text-xs font-medium w-36 shrink-0">{s.stage}</span>
              <div className="flex-1 relative">
                <Progress value={(s.targetCount / FUNNEL_STAGES[0].targetCount) * 100} className="h-6 rounded-lg" />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{s.targetCount}</span>
              </div>
              {i > 0 && (
                <Badge variant="outline" className="text-[10px] shrink-0">{s.conversionRate}%</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Daily Activities */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tägliche Aktivitäten-Ziele</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Aktivität</TableHead><TableHead className="text-right">Ziel/Tag</TableHead><TableHead className="text-right">Ziel/Monat</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {DAILY_ACTIVITIES.map((a) => (
                <TableRow key={a.label}>
                  <TableCell className="font-medium text-sm">{a.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.target}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{a.target * 22}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function SprintSection() {
  return (
    <div className="space-y-4">
      {SPRINT_PLAN.map((day) => (
        <Card key={day.day}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> {day.day}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Zeit</TableHead>
                  <TableHead>Aufgabe</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Kanal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {day.slots.map((slot, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs tabular-nums font-medium">{slot.time}</TableCell>
                    <TableCell className="font-medium text-sm">{slot.task}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{slot.details}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{slot.channel}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MarketingSection() {
  return (
    <>
      {/* Channels */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Marketing-Kanäle</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kanal</TableHead>
                <TableHead>Maßnahme</TableHead>
                <TableHead>Frequenz</TableHead>
                <TableHead className="text-right">Ziel-Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MARKETING_CHANNELS.map((c) => (
                <TableRow key={c.channel}>
                  <TableCell className="font-medium">{c.channel}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.measure}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{c.frequency}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{c.targetLeads}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Content Calendar */}
      <Card>
        <CardHeader><CardTitle className="text-base">Content-Kalender (Woche)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Plattform</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Hook</TableHead>
                <TableHead>CTA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONTENT_CALENDAR.map((d) => (
                <TableRow key={d.day}>
                  <TableCell className="font-medium">{d.day}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{d.platform}</Badge></TableCell>
                  <TableCell className="text-sm">{d.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.hook}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.cta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Card>
        <CardHeader><CardTitle className="text-base">Marketing-KPIs (Monat)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Posts', value: `${MARKETING_KPIS.postsPerMonth}+` },
              { label: 'Reels', value: `${MARKETING_KPIS.reelsPerMonth}+` },
              { label: 'DMs', value: `${MARKETING_KPIS.dmsPerMonth}+` },
              { label: 'Kaltanrufe', value: `${MARKETING_KPIS.coldCallsPerMonth}+` },
              { label: 'Lead-Magnet Downloads', value: `${MARKETING_KPIS.leadMagnetDownloads}+` },
              { label: 'Webinare', value: `${MARKETING_KPIS.webinarsPerMonth}` },
              { label: 'Empfehlungen', value: `${MARKETING_KPIS.referrals}+` },
            ].map((k) => (
              <div key={k.label} className="p-3 rounded-xl border border-border/40 bg-muted/20 text-center">
                <p className="text-xl font-bold tabular-nums">{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function RoadmapSection() {
  const maxRevenue = Math.max(...SCALING_ROADMAP.map((m) => m.total));

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> 12-Monats-Skalierung</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {SCALING_ROADMAP.map((m) => (
          <div key={m.month} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium w-20">{m.month}</span>
                {m.milestone && <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">{m.milestone}</Badge>}
              </div>
              <span className="text-sm font-bold tabular-nums">{m.total.toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex gap-0.5 h-4">
              <div className="bg-primary rounded-l-md" style={{ width: `${(m.oneTime / maxRevenue) * 100}%` }} title={`Einmalig: ${m.oneTime.toLocaleString('de-DE')} €`} />
              <div className="bg-primary/40 rounded-r-md" style={{ width: `${(m.recurring / maxRevenue) * 100}%` }} title={`Recurring: ${m.recurring.toLocaleString('de-DE')} €`} />
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span>Einmalig: {m.oneTime.toLocaleString('de-DE')} €</span>
              <span>Recurring: {m.recurring.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary" /> Einmalig</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/40" /> Recurring</span>
        </div>
      </CardContent>
    </Card>
  );
}
