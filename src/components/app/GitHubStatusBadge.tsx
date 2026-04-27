import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Github, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Zeigt im Header an, ob das Projekt mit einem externen GitHub-Repo verbunden ist.
 *
 * Erkennung: Wir setzen die Variable `VITE_GITHUB_REPO_URL` (z. B. in `.env`),
 * sobald das Repo via Lovable Connectors → GitHub verbunden wurde.
 * Lovable bietet keine Runtime-API, um den Verbindungsstatus direkt auszulesen –
 * dies ist daher der saubere Build-time-Weg.
 *
 * Sichtbar nur für Admins.
 */
export function GitHubStatusBadge() {
  const { roles } = useAuth();
  const isAdmin = roles.includes('admin');
  if (!isAdmin) return null;

  const repoUrl = (import.meta.env.VITE_GITHUB_REPO_URL as string | undefined)?.trim();
  const isConnected = !!repoUrl && /^https?:\/\/(www\.)?github\.com\//.test(repoUrl);

  const repoLabel = isConnected
    ? repoUrl!.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '')
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={
              isConnected
                ? repoUrl!
                : 'https://docs.lovable.dev/integrations/github'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
            aria-label="GitHub-Verbindungsstatus"
          >
            <Badge
              variant="secondary"
              className={
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 gap-1.5'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 gap-1.5'
              }
            >
              <Github className="h-3.5 w-3.5" />
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="max-w-[160px] truncate">{repoLabel}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>Nicht verbunden</span>
                </>
              )}
            </Badge>
          </a>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {isConnected ? (
            <div className="space-y-1">
              <p className="font-medium">GitHub verbunden</p>
              <p className="text-xs text-muted-foreground">{repoUrl}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium">Kein externes GitHub-Repo verbunden</p>
              <p className="text-xs text-muted-foreground">
                Verbinde das Projekt via <strong>Connectors → GitHub</strong> und setze
                anschließend <code>VITE_GITHUB_REPO_URL</code> in der <code>.env</code>,
                damit der Status hier korrekt angezeigt wird.
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
