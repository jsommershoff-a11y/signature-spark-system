import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <ShieldX className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold mb-2">Zugriff verweigert</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Du hast nicht die erforderlichen Berechtigungen, um diese Seite zu sehen.
        Bitte wende dich an einen Administrator, wenn du glaubst, dass dies ein Fehler ist.
      </p>
      <Button asChild>
        <Link to="/app">Zurück zum Dashboard</Link>
      </Button>
    </div>
  );
}
