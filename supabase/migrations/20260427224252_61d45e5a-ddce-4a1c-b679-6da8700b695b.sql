-- Catalog products table (admin-managed Stripe product catalog)
CREATE TYPE public.catalog_category AS ENUM ('automation', 'education');
CREATE TYPE public.catalog_mode AS ENUM ('one_time', 'subscription');

CREATE TABLE public.catalog_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category public.catalog_category NOT NULL,
  mode public.catalog_mode NOT NULL DEFAULT 'one_time',
  price_net_cents integer NOT NULL CHECK (price_net_cents >= 0),
  price_gross_cents integer NOT NULL CHECK (price_gross_cents >= 0),
  price_period_label text,
  term_label text,
  delivery_days integer NOT NULL DEFAULT 0 CHECK (delivery_days >= 0),
  stripe_product_id text NOT NULL,
  stripe_price_id text NOT NULL,
  payment_link text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_products_active_sort ON public.catalog_products (active, category, sort_order);

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user can read active catalog
CREATE POLICY "Authenticated can read active catalog"
ON public.catalog_products FOR SELECT
TO authenticated
USING (active = true OR public.has_min_role(auth.uid(), 'admin'));

-- Write: admin only
CREATE POLICY "Admins can insert catalog"
ON public.catalog_products FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update catalog"
ON public.catalog_products FOR UPDATE
TO authenticated
USING (public.has_min_role(auth.uid(), 'admin'))
WITH CHECK (public.has_min_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalog"
ON public.catalog_products FOR DELETE
TO authenticated
USING (public.has_min_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_catalog_products_updated_at
BEFORE UPDATE ON public.catalog_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial catalog (KRS Immobilien GmbH, Stand 27.04.2026)
INSERT INTO public.catalog_products
  (code, name, subtitle, category, mode, price_net_cents, price_gross_cents, price_period_label, term_label, delivery_days, stripe_product_id, stripe_price_id, payment_link, sort_order)
VALUES
  ('A01','KI-Terminbot','Voice + Web: Termine automatisch vergeben','automation','one_time',390000,464100,NULL,NULL,7,'prod_UONcaBrtm6cPoO','price_1TPasVGfeNRIZPeJOtg4firg','https://buy.stripe.com/28EdR970Ydme4B53Eeebu03',1),
  ('A02','KI-E-Mail-Assistent','Inbox-Zero für Geschäftsführung und Team','automation','one_time',290000,345100,NULL,NULL,5,'prod_UONcbTWUiXjn8d','price_1TPasbGfeNRIZPeJN9mL4iBk','https://buy.stripe.com/fZueVdfxucia9Vpgr0ebu04',2),
  ('A03','KI-Lead-Qualifizierer','Web-Formular mit KI-Scoring + CRM-Sync','automation','one_time',240000,285600,NULL,NULL,5,'prod_UONcrDjdcjWmQP','price_1TPasiGfeNRIZPeJTYg4UC9N','https://buy.stripe.com/00wdR92KI0zs8Rl8Yyebu05',3),
  ('A04','KI-Angebots-Generator','Briefing oder Call → fertiges Angebots-PDF','automation','one_time',340000,404600,NULL,NULL,7,'prod_UONcNxJN6MtDzS','price_1TPasnGfeNRIZPeJvoMxsyBy','https://buy.stripe.com/dRmeVdfxudme5F9fmWebu06',4),
  ('A05','KI-Call-Summary-Pipeline','Automatisches Protokoll, Tasks, CRM-Sync','automation','one_time',190000,226100,NULL,NULL,5,'prod_UONcwNRqD5N3J9','price_1TPasuGfeNRIZPeJr9MypfYU','https://buy.stripe.com/7sYdR92KI3LE8Rla2Cebu07',5),
  ('A06','KI-Dokumenten-Extraktion','PDF, Scan, Foto → strukturierte Daten','automation','one_time',290000,345100,NULL,NULL,7,'prod_UONc3scJsLXj73','price_1TPat0GfeNRIZPeJbcEnOayl','https://buy.stripe.com/fZudR98523LEgjN3Eeebu08',6),
  ('A07','KI-Content-Maschine','LinkedIn, Blog, Newsletter automatisch','automation','one_time',290000,345100,NULL,NULL,7,'prod_UONcUzwaBwynY9','price_1TPat6GfeNRIZPeJ3Q4LygP3','https://buy.stripe.com/dRm8wP70Y6XQ8Rlb6Gebu09',7),
  ('A08','KI-Bewerber-Screening','CV → Ranking + Interview-Fragen','automation','one_time',240000,285600,NULL,NULL,5,'prod_UONdf1c92gdTmb','price_1TPatDGfeNRIZPeJPkdg6S9s','https://buy.stripe.com/fZu00j996eqiffJ1w6ebu0a',8),
  ('A09','KI-Kundenservice-Bot','Chat-Widget mit Wissensbasis','automation','one_time',340000,404600,NULL,NULL,7,'prod_UONdFhPgGiLlHU','price_1TPatJGfeNRIZPeJ5ueBvp2q','https://buy.stripe.com/5kQeVd70Y6XQ7Nh5Mmebu0b',9),
  ('A10','KI-Reporting-Bot','Wöchentliche KPI-Auswertung automatisch','automation','one_time',190000,226100,NULL,NULL,5,'prod_UONdOiZqVbqvPj','price_1TPatQGfeNRIZPeJrpAIrV0x','https://buy.stripe.com/7sY28r4SQ5TMgjNb6Gebu0c',10),
  ('A11','KI-Rechnungs-Assistent','Eingangsrechnungen → DATEV-Vorbereitung','automation','one_time',290000,345100,NULL,NULL,7,'prod_UONdj2OKWNqm7H','price_1TPatWGfeNRIZPeJHEDoC37S','https://buy.stripe.com/6oUcN5bheeqic3xdeOebu0d',11),
  ('A12','KI-Voice-Assistent Empfang','KI nimmt Anrufe an wie Ihr Team','automation','one_time',490000,583100,NULL,NULL,10,'prod_UONdidX5r7452D','price_1TPatdGfeNRIZPeJ46FvYnUr','https://buy.stripe.com/aFa00j9960zs5F9gr0ebu0e',12),
  ('A13','KI-Post-Assistent','Social-Media-Posts automatisch erstellen, planen, messen','automation','one_time',149900,178400,NULL,NULL,7,'prod_UOOZfQwMbSWB1S','price_1TPbmbGfeNRIZPeJgsw5gFLP','https://buy.stripe.com/3cI00j99695YgjNgr0ebu0f',13),
  ('EDU01','KI-Profi Programm – Kickoff','Einmalige Startgebühr für 6-monatiges Intensivprogramm','education','one_time',150000,178500,NULL,NULL,0,'prod_UOOZYMvZ1vXOCW','price_1TPbmjGfeNRIZPeJ4fcdB50m','https://buy.stripe.com/bJebJ1fxu4PI9Vpb6Gebu0g',1),
  ('EDU02','KI-Profi Programm – Monatsbeitrag','6-monatiges Intensivprogramm · 899 €/Monat','education','subscription',89900,107000,'/Monat','Mindestlaufzeit 6 Monate',0,'prod_UOOZShlFBdHsKf','price_1TPbmrGfeNRIZPeJqGmCQ2e4','https://buy.stripe.com/aFa5kD99681UffJ0s2ebu0h',2);
