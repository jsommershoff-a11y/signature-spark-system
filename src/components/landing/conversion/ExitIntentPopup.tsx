import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift } from "lucide-react";

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("exit_shown")) {
        sessionStorage.setItem("exit_shown", "1");
        setOpen(true);
      }
    };
    document.documentElement.addEventListener("mouseleave", handler);
    return () => document.documentElement.removeEventListener("mouseleave", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Warten Sie – Bonus-Angebot!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Nur jetzt: Sichern Sie sich eine <strong className="text-foreground">kostenlose KI-Potenzialanalyse</strong> im Wert von 299 €.
            Wir zeigen Ihnen genau, wo Ihr Unternehmen Zeit und Geld verschwendet.
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={() => {
            setOpen(false);
            navigate("/qualifizierung");
          }}
          className="w-full bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all mt-2"
        >
          Kostenlose KI-Potenzialanalyse sichern →
        </button>
        <p className="text-xs text-muted-foreground text-center">
          100% kostenlos · Unverbindlich · Kein Risiko
        </p>
      </DialogContent>
    </Dialog>
  );
};
