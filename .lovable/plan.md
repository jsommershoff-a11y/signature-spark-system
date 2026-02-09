

# SEO-Optimierung für Landing-Pages

## Ziel

Vollständige SEO-Optimierung der öffentlichen Landing-Pages (/, /start, /growth) für bessere Suchmaschinen-Sichtbarkeit und Social-Media-Vorschauen.

---

## Identifizierte Probleme

| Priorität | Problem | Impact |
|-----------|---------|--------|
| Kritisch | Statische Meta-Tags für alle Seiten | Google indexiert falsche Inhalte |
| Kritisch | Falscher Page Title "Lovable App" | Schlechte Klickraten in Suchergebnissen |
| Kritisch | Falsche OG-Daten | Schlechte Social-Media-Vorschauen |
| Hoch | Keine Sitemap | Langsame/unvollständige Indexierung |
| Hoch | HTML lang="en" statt "de" | Falsche Sprachzuordnung |
| Mittel | Keine Schema.org-Daten | Fehlende Rich Snippets für FAQs |
| Mittel | robots.txt ohne Sitemap-Referenz | Crawler finden Sitemap nicht |
| Niedrig | Fehlende Impressum/Datenschutz-Links | Rechtliche Compliance |

---

## Lösung: react-helmet-async Integration

Da die App auf React/Vite basiert (SPA), benötigen wir eine Lösung für dynamische Meta-Tags. Wir verwenden `react-helmet-async`.

---

## Implementierungsschritte

### Step 01: Dependency installieren

```bash
react-helmet-async
```

### Step 02: HTML-Sprache korrigieren

```html
<!-- index.html -->
<html lang="de">
```

### Step 03: HelmetProvider in App.tsx hinzufügen

```tsx
import { HelmetProvider } from 'react-helmet-async';

// Wrap App content with HelmetProvider
<HelmetProvider>
  {/* existing app */}
</HelmetProvider>
```

### Step 04: SEO-Komponente erstellen

Neue Datei: `src/components/SEO.tsx`

```tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export const SEO = ({ title, description, canonical, ogImage }: SEOProps) => {
  const siteUrl = 'https://signature-spark-system.lovable.app';
  const defaultImage = `${siteUrl}/og-image.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical || siteUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:url" content={canonical || siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="de_DE" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  );
};
```

### Step 05: SEO in Landing-Pages integrieren

**Home.tsx:**
```tsx
<SEO 
  title="KRS Signature System | Plattform + Sparring für Unternehmer"
  description="Die Plattform + persönliches Sparring für echte Unternehmer. Kein loses Coaching. Ein System, das mit dir wächst."
  canonical="https://signature-spark-system.lovable.app/"
/>
```

**Start.tsx:**
```tsx
<SEO 
  title="Signature Start | Dein System für die erste Firma | KRS"
  description="Du willst gründen? Mit dem Signature System bekommst du Module, Vorlagen, Checklisten und persönliches Sparring für einen strukturierten Start."
  canonical="https://signature-spark-system.lovable.app/start"
/>
```

**Growth.tsx:**
```tsx
<SEO 
  title="Signature Growth | Struktur für skalierende Unternehmer | KRS"
  description="Du hast Umsatz, aber Prozesse und Team ziehen nicht mit? Wir bauen Ordnung ins System, damit Wachstum kontrollierbar wird."
  canonical="https://signature-spark-system.lovable.app/growth"
/>
```

### Step 06: FAQ Schema.org-Daten hinzufügen

FAQSection erweitern mit JSON-LD:

```tsx
// In FAQSection.tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  })}
</script>
```

### Step 07: Sitemap erstellen

Neue Datei: `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://signature-spark-system.lovable.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://signature-spark-system.lovable.app/start</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://signature-spark-system.lovable.app/growth</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

### Step 08: robots.txt aktualisieren

```text
User-agent: *
Allow: /
Disallow: /app/
Disallow: /auth

Sitemap: https://signature-spark-system.lovable.app/sitemap.xml
```

### Step 09: index.html bereinigen

- Sprache auf Deutsch ändern
- Fallback-Meta-Tags aktualisieren
- Favicon-Referenz prüfen

---

## Dateien

| Datei | Aktion |
|-------|--------|
| `index.html` | Bearbeiten (lang="de", Fallback-Metas) |
| `src/App.tsx` | HelmetProvider hinzufügen |
| `src/components/SEO.tsx` | Neu erstellen |
| `src/pages/Home.tsx` | SEO-Komponente integrieren |
| `src/pages/Start.tsx` | SEO-Komponente integrieren |
| `src/pages/Growth.tsx` | SEO-Komponente integrieren |
| `src/components/landing/FAQSection.tsx` | JSON-LD hinzufügen |
| `public/sitemap.xml` | Neu erstellen |
| `public/robots.txt` | Aktualisieren |

---

## Erwartetes Ergebnis

Nach Implementierung:

- Jede Seite hat eigenen Title und Meta-Description
- Social-Media-Vorschauen zeigen korrekte Inhalte
- Google findet alle öffentlichen Seiten via Sitemap
- FAQ-Seiten können als Rich Snippets erscheinen
- /app-Bereich wird nicht indexiert (Datenschutz)

---

## Technische Details

### Warum react-helmet-async?

- Standardlösung für dynamische Meta-Tags in React SPAs
- Unterstützt Server-Side Rendering (falls später benötigt)
- Async-Version verhindert Memory Leaks
- Kleine Bundle-Größe (~3kb gzipped)

### OG-Image

Aktuell verweist das OG-Image auf lovable.dev. Es sollte ein eigenes OG-Image erstellt werden (empfohlen: 1200x630px).

