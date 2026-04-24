import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_TITLE = "KI Automationen – Automatisierung für Unternehmen | KI-Systeme & Prozesse digitalisieren";
const DEFAULT_DESC = "Prozesse automatisieren, Mitarbeiter entlasten, Umsatz steigern. KI Automationen baut operative Systeme für Handwerk, Praxen, Dienstleister und Mittelstand. Keine Chatbots – echte Ergebnisse.";
const DEFAULT_IMAGE = "https://ki-automationen.io/og-image.png";
const BASE_URL = "https://ki-automationen.io";

export const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  const jsonLdItems = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};
