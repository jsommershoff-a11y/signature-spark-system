import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Github, CheckCircle2, AlertCircle, GitCommit, Loader2 } from 'lucide-react';

/**
 * Header-Badge für Admins: zeigt GitHub-Verbindungsstatus + letzten Commit.
 *
 * Konfiguration via .env:
 *   VITE_GITHUB_REPO_URL=https://github.com/<owner>/<repo>
 *
 * Letzter Commit wird live von der öffentlichen GitHub-API geladen
 * (funktioniert ohne Token nur für public repos; private → Fallback "nicht abrufbar").
 */

type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'gerade eben';
  const min = Math.floor(sec / 60);
  if (min < 60) return `vor ${min} Min.`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `vor ${hr} Std.`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `vor ${months} Mon.`;
  return `vor ${Math.floor(months / 12)} J.`;
}

export function GitHubStatusBadge() {
  const { roles } = useAuth();
  const isAdmin = roles.includes('admin');

  const repoUrl = (import.meta.env.VITE_GITHUB_REPO_URL as string | undefined)?.trim();
  const isConnected = !!repoUrl && /^https?:\/\/(www\.)?github\.com\//.test(repoUrl);
  const repoSlug = isConnected
    ? repoUrl!.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '')
    : null;

  const [commit, setCommit] = useState<CommitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !repoSlug) return;
    let cancelled = false;

    const fetchCommit = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repoSlug}/commits?per_page=1`,
          { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (!res.ok) {
          if (res.status === 404) throw new Error('Repo nicht öffentlich erreichbar');
          if (res.status === 403) throw new Error('GitHub-Rate-Limit erreicht');
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const c = Array.isArray(data) ? data[0] : null;
        if (!c) throw new Error('Keine Commits');
        if (cancelled) return;
        setCommit({
          sha: c.sha.slice(0, 7),
          message: (c.commit?.message ?? '').split('\n')[0],
          author: c.commit?.author?.name ?? c.author?.login ?? 'unbekannt',
          date: c.commit?.author?.date ?? c.commit?.committer?.date,
          url: c.html_url,
        });
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Fehler');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCommit();
    const interval = setInterval(fetchCommit, 5 * 60 * 1000); // alle 5 Min refresh
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin, repoSlug]);

  if (!isAdmin) return null;

  // --- Nicht verbunden ---
  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://docs.lovable.dev/integrations/github"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
            >
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 gap-1.5"
              >
                <Github className="h-3.5 w-3.5" />
                <AlertCircle className="h-3 w-3" />
                <span>Nicht verbunden</span>
              </Badge>
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium">Kein externes GitHub-Repo verbunden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Verbinde via <strong>Connectors → GitHub</strong> und setze{' '}
              <code>VITE_GITHUB_REPO_URL</code> in <code>.env</code>.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // --- Verbunden ---
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={commit?.url ?? repoUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
          >
            <Badge
              variant="secondary"
              className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 gap-1.5"
            >
              <Github className="h-3.5 w-3.5" />
              <CheckCircle2 className="h-3 w-3" />
              {loading && !commit ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : commit ? (
                <span className="flex items-center gap-1">
                  <GitCommit className="h-3 w-3" />
                  <span className="font-mono text-[10px]">{commit.sha}</span>
                  <span className="opacity-70">· {formatRelative(commit.date)}</span>
                </span>
              ) : (
                <span className="max-w-[160px] truncate">{repoSlug}</span>
              )}
            </Badge>
          </a>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-2">
            <div>
              <p className="font-medium">GitHub verbunden</p>
              <p className="text-xs text-muted-foreground break-all">{repoSlug}</p>
            </div>
            {commit ? (
              <div className="border-t pt-2 space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  <GitCommit className="h-3 w-3" /> Letzter Commit
                </p>
                <p className="text-xs">{commit.message}</p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-mono">{commit.sha}</span> · {commit.author} ·{' '}
                  {new Date(commit.date).toLocaleString('de-DE')} ({formatRelative(commit.date)})
                </p>
              </div>
            ) : error ? (
              <div className="border-t pt-2">
                <p className="text-xs text-amber-400">Letzter Commit nicht abrufbar</p>
                <p className="text-[11px] text-muted-foreground">{error}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  (Privates Repo? Dann ist die GitHub-API ohne Token nicht erreichbar.)
                </p>
              </div>
            ) : loading ? (
              <p className="text-xs text-muted-foreground">Lade letzten Commit…</p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
