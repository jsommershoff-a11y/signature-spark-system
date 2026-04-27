// =============================================================
// Supabase Edge Function: github-latest-commit
// Purpose: Proxy fuer GitHub-Commits-Endpoint mit PAT-Auth fuer private Repos
// Secret needed: GITHUB_PAT  (fine-grained PAT mit Read-Only auf gewhitelistete Repos)
// =============================================================
//
// Aufruf vom Frontend (anonym, kein User-JWT noetig):
//   GET /functions/v1/github-latest-commit?owner=jsommershoff-a11y&repo=signature-spark-system
//
// Response: { sha, short_sha, message, author, date, html_url, branch }
// Caching: 5 Min via Cache-Control header (Edge + Browser).
// =============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Whitelist: nur Jans Lovable-Repos sind erlaubt.
const ALLOWED_REPOS: ReadonlySet<string> = new Set([
  "jsommershoff-a11y/signature-spark-system",
  "jsommershoff-a11y/ueben",
  "jsommershoff-a11y/jan-sommershoff",
  "jsommershoff-a11y/craft-clean-layout",
  "jsommershoff-a11y/krs-property-zenith",
]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

const CACHE_HEADERS = {
  // 5 Min CDN + Browser Cache, danach stale-while-revalidate fuer 5 weitere Min.
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=300",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extra,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const owner = (url.searchParams.get("owner") || "").trim();
  const repo = (url.searchParams.get("repo") || "").trim();
  const branch = (url.searchParams.get("branch") || "main").trim();

  if (!owner || !repo) {
    return json({ error: "missing_parameters", message: "owner und repo sind Pflicht" }, 400);
  }

  const key = `${owner}/${repo}`;
  if (!ALLOWED_REPOS.has(key)) {
    return json(
      {
        error: "repo_not_allowed",
        message: `Repo ${key} ist nicht in der Whitelist. Erlaubt: ${[...ALLOWED_REPOS].join(", ")}`,
      },
      403,
    );
  }

  const pat = Deno.env.get("GITHUB_PAT");
  if (!pat) {
    return json(
      {
        error: "missing_secret",
        message: "GITHUB_PAT ist nicht im Supabase-Secret hinterlegt.",
      },
      500,
    );
  }

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "ki-automatisierungen.io/edge-function",
        },
      },
    );

    if (ghRes.status === 401) {
      return json({ error: "github_unauthorized", message: "GitHub-PAT abgelaufen oder ungueltig" }, 401);
    }
    if (ghRes.status === 404) {
      return json(
        { error: "github_not_found", message: `Repo ${key} oder Branch ${branch} nicht gefunden (oder PAT hat keinen Zugriff)` },
        404,
      );
    }
    if (!ghRes.ok) {
      const text = await ghRes.text();
      return json({ error: "github_error", status: ghRes.status, body: text.slice(0, 500) }, 502);
    }

    const data = (await ghRes.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      return json({ error: "no_commits", message: "Keine Commits gefunden" }, 404);
    }
    const c = data[0] as any;

    return json(
      {
        sha: c.sha as string,
        short_sha: (c.sha as string).slice(0, 7),
        message: c.commit?.message ?? null,
        author: {
          name: c.commit?.author?.name ?? null,
          email: c.commit?.author?.email ?? null,
          login: c.author?.login ?? null,
          avatar_url: c.author?.avatar_url ?? null,
        },
        date: c.commit?.author?.date ?? null,
        html_url: c.html_url as string,
        branch,
        repo: key,
      },
      200,
      CACHE_HEADERS,
    );
  } catch (err) {
    return json({ error: "fetch_failed", message: String(err) }, 500);
  }
});
