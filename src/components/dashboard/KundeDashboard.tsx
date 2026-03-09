import { Card, CardContent } from '@/components/ui/card';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, TrendingUp, Clock, ArrowRight, Gift, Sparkles, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';

export function KundeDashboard() {
  const { products, isLoading } = useMembershipAccess();
  const hasNoProduct = !isLoading && products.length === 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Freebie Banner */}
      {hasNoProduct && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 shadow-md">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-5 px-4">
            <div className="p-3 rounded-xl bg-primary/15 shrink-0">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h3 className="font-bold text-base">Dein kostenloses KI-Starter-Paket</h3>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Gratis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                5 sofort einsetzbare KI-Prompts + persönliche KI-Bedarfsanalyse.
                Finde heraus, welche KI dein Unternehmen am meisten voranbringt.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/academy">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Prompts ansehen
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/app/pricing">
                  <Phone className="h-4 w-4 mr-1" />
                  Analyse-Gespräch
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-5 px-4">
            <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base">Meine Verträge</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Angebote und Dokumente</p>
            </div>
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link to="/app/contracts"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-5 px-4">
            <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base">KI-Academy</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Lernpfade & Fortschritt</p>
            </div>
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link to="/app/academy"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Kurse in Bearbeitung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Gesamtfortschritt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Nächste Aufgabe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Keine anstehenden Aufgaben</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
