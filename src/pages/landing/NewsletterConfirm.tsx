import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { CheckCircle2, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type State =
  | { status: "loading" }
  | { status: "success"; alreadyConfirmed?: boolean; magicLinkSent?: boolean }
  | { status: "error"; message: string };

const NewsletterConfirm = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Bestätigungslink ungültig oder unvollständig." });
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("newsletter-confirm", {
          body: { token },
        });
        if (error || (data as any)?.error) {
          throw new Error((data as any)?.error ?? error?.message ?? "Bestätigung fehlgeschlagen.");
        }
        setState({
          status: "success",
          alreadyConfirmed: !!(data as any)?.already_confirmed,
          magicLinkSent: !!(data as any)?.magic_link_sent,
        });
      } catch (err: any) {
        setState({
          status: "error",
          message: err?.message ?? "Bestätigung fehlgeschlagen. Bitte erneut anmelden.",
        });
      }
    })();
  }, [token]);

  return (
    <PublicLayout>
      <Helmet>
        <title>Newsletter-Bestätigung | KI-Automationen</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <section className="max-w-xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-2xl border bg-card shadow-sm p-8 md:p-10 text-center space-y-5">
          {state.status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <h1 className="text-2xl font-bold">Wir bestätigen deine E-Mail …</h1>
              <p className="text-muted-foreground">Das dauert nur einen Moment.</p>
            </>
          )}

          {state.status === "success" && (
            <>
              <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto" />
              <h1 className="text-2xl md:text-3xl font-bold">
                {state.alreadyConfirmed ? "Du bist bereits bestätigt 🎉" : "Bestätigt – willkommen! 🎉"}
              </h1>
              <p className="text-muted-foreground">
                {state.magicLinkSent ? (
                  <>
                    Dein 30-Tage-Mitgliederbereich-Zugang ist freigeschaltet. Wir haben dir
                    gerade eine zweite E-Mail mit deinem <strong>1-Klick-Login</strong> geschickt –
                    bitte schau in dein Postfach.
                  </>
                ) : (
                  <>
                    Dein 30-Tage-Mitgliederbereich-Zugang ist freigeschaltet. Du kannst dich
                    jetzt im Mitgliederbereich anmelden.
                  </>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg">
                  <Link to="/auth">
                    <Sparkles className="h-4 w-4 mr-2" /> Zum Mitgliederbereich
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Zur Startseite</Link>
                </Button>
              </div>
            </>
          )}

          {state.status === "error" && (
            <>
              <AlertTriangle className="h-14 w-14 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold">Bestätigung nicht möglich</h1>
              <p className="text-muted-foreground">{state.message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg">
                  <Link to="/newsletter">Erneut anmelden</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Zur Startseite</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default NewsletterConfirm;
