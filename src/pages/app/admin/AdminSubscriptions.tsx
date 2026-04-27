import { Link } from "react-router-dom";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Activity } from "lucide-react";

export default function AdminSubscriptions() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Abos"
        description="Aktive Stripe-Subscriptions, Status, Lifecycle und Kündigungen im Überblick."
      />

      <Card>
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Abo-Verwaltung
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Detaillierte Subscription-Listen und Lifecycle-Events findest du
              aktuell direkt im COO Cockpit (Stripe-Sync) und im Stripe-Dashboard.
              Eine eigene Übersicht hier folgt im nächsten Schritt.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild>
              <Link to="/app/coo-cockpit">
                <Activity className="h-4 w-4 mr-2" />
                COO Cockpit öffnen
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://dashboard.stripe.com/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Stripe Dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
