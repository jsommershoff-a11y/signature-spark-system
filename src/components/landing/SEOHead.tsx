import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_TITLE =
  "KI-Automationen – Automatisierung für Unternehmen | KI-Systeme & Prozesse digitalisieren";
const DEFAULT_DESC =
  "Prozesse automatisieren, Mitarbeiter entlasten, Umsatz steigern. KI-Automationen baut operative Systeme für Handwerk, Praxen, Dienstleister und Mittelstand. Keine Chatbots – echte Ergebnisse.";
const DEFAULT_IMAGE = "https://ki-automationen.io/og-image.png";
const BASE_URL = "https://ki-automationen.io";
const SITE_NAME = "KI-Automationen";

export const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;
  // OG-Image absolut machen, falls nur Pfad übergeben wurde
  const absoluteOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {!noIndex && <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="de_DE" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:image:alt" content={title} />

      {jsonLdItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};
