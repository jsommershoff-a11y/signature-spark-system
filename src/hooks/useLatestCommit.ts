import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LatestCommit {
  sha: string;
  short_sha: string;
  message: string | null;
  author: {
    name: string | null;
    email: string | null;
    login: string | null;
    avatar_url: string | null;
  };
  date: string | null;
  html_url: string;
  branch: string;
  repo: string;
}

export interface LatestCommitState {
  commit: LatestCommit | null;
  error: string | null;
  loading: boolean;
  /** Relativzeit, z. B. "vor 12 Min.". Bei null: nicht berechenbar. */
  relative: string | null;
}

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `vor ${seconds} Sek.`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `vor ${days} Tagen`;
  const months = Math.floor(days / 30);
  if (months < 12) return `vor ${months} Mon.`;
  const years = Math.floor(days / 365);
  return `vor ${years} J.`;
}

/**
 * Holt den letzten Commit eines (gewhitelisteten) GitHub-Repos via
 * Supabase Edge Function `github-latest-commit`.
 *
 * Auto-Refresh alle 5 Min. (Tab muss aktiv sein.)
 */
export function useLatestCommit(
  owner: string,
  repo: string,
  branch: string = "main",
  refreshIntervalMs: number = 5 * 60 * 1000,
): LatestCommitState {
  const [commit, setCommit] = useState<LatestCommit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "github-latest-commit",
          { method: "GET", body: { owner, repo, branch } as any },
        );
        // Edge Functions im Supabase-JS-Client unterstuetzen GET via Query in v2.x; alternativ direkter Fetch:
        if (fnError && (!data || (data as any).error)) {
          // Fallback: direkter Fetch mit Query-Params
          const url = `${import.meta.env.VITE_SUPABASE_URL ?? (supabase as any).supabaseUrl}/functions/v1/github-latest-commit?owner=${encodeURIComponent(
            owner,
          )}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`;
          const res = await fetch(url, {
            headers: {
              apikey: (supabase as any).supabaseKey ?? "",
              Authorization: `Bearer ${(supabase as any).supabaseKey ?? ""}`,
            },
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
          if (!cancelled) {
            setCommit(body);
            setError(null);
          }
          return;
        }
        if ((data as any)?.error) {
          throw new Error((data as any).message || (data as any).error);
        }
        if (!cancelled) {
          setCommit(data as LatestCommit);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setCommit(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const refresh = setInterval(load, refreshIntervalMs);
    // Tick alle 30s, damit relative Zeit lebendig bleibt
    const tick = setInterval(() => setTick((t) => t + 1), 30 * 1000);

    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, [owner, repo, branch, refreshIntervalMs]);

  return {
    commit,
    error,
    loading,
    relative: relativeTime(commit?.date ?? null),
  };
}
