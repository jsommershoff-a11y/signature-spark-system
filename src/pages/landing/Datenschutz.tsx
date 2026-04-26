import { PublicLayout } from '@/components/landing/PublicLayout';
import { SEOHead } from '@/components/landing/SEOHead';

const Datenschutz = () => {
  return (
    <PublicLayout>
      <SEOHead
        title="Datenschutz | KI-Automationen"
        description="Datenschutzerklärung der KRS Immobilien GmbH (ki-automationen.io) gemäß DSGVO. Informationen zur Datenverarbeitung, Cookies, Cookie-Consent v2, Google Consent Mode v2 und Ihren Rechten."
        canonical="/datenschutz"
        noIndex
      />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Datenschutzerklärung</h1>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground break-words">

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher für die Datenverarbeitung</h2>
            <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
            <p>
              <strong>KRS Immobilien GmbH</strong><br />
              Westerwaldstr. 146<br />
              53773 Hennef<br />
              Deutschland
            </p>
            <p>
              Telefon: +49 2248 9249907<br />
              E-Mail: <a href="mailto:info@ki-automationen.io" className="text-primary hover:underline">info@ki-automationen.io</a><br />
              Geschäftsführer: Jan Sommershoff
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-semibold text-foreground mt-4">Allgemeine Hinweise</h3>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
            <h3 className="text-lg font-semibold text-foreground mt-4">Datenerfassung auf dieser Website</h3>
            <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
            <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Verantwortlicher für die Datenverarbeitung“ in dieser Datenschutzerklärung entnehmen.</p>
            <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
            <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
            <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Hosting</h2>
            <p>Wir hosten die Inhalte unserer Website bei folgenden Anbietern:</p>
            <h3 className="text-lg font-semibold text-foreground mt-4">3.1 STRATO AG</h3>
            <p>STRATO AG, Otto-Ostrowski-Straße 7, 10249 Berlin, Deutschland.</p>
            <p>Serverstandort: ausschließlich EU (Deutschland). Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO besteht.</p>
            <p>Weitere Informationen: <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.strato.de/datenschutz</a></p>
            <h3 className="text-lg font-semibold text-foreground mt-4">3.2 Lovable (Hosting & Plattform)</h3>
            <p>Lovable Technologies AB, Strandvägen 7A, 114 56 Stockholm, Schweden.</p>
            <p>Zweck: Bereitstellung der Plattform und des Hostings.</p>
            <p>Weitere Informationen: <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev/privacy</a></p>
            <p className="mt-4">Die Nutzung der Hoster erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch professionelle Anbieter (Art. 6 Abs. 1 lit. f DSGVO).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3 className="text-lg font-semibold text-foreground mt-4">Datenschutz</h3>
            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
            <h3 className="text-lg font-semibold text-foreground mt-4">Speicherdauer</h3>
            <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.</p>
            <h3 className="text-lg font-semibold text-foreground mt-4">Ihre Rechte</h3>
            <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Ferner steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. SSL- bzw. TLS-Verschlüsselung</h2>
            <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
            <p>Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Server-Log-Files</h2>
            <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Files, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
            <ul className="list-disc pl-6">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse (gekürzt/anonymisiert)</li>
            </ul>
            <p>Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
            <p>Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Datenerfassung auf dieser Website</h2>
            <h3 className="text-lg font-semibold text-foreground mt-4">Kontaktformular</h3>
            <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
            <p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).</p>
            <h3 className="text-lg font-semibold text-foreground mt-4">Anfrage per E-Mail oder Telefon</h3>
            <p>Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Nutzung von Supabase</h2>
            <p>Für Authentifizierung, Datenbank und Datei-Uploads nutzen wir Supabase.</p>
            <p>Anbieter: Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992.</p>
            <p>Zweck: Bereitstellung von Authentifizierung, Datenbank und Dateispeicher für den geschützten Mitglieder- und Kundenbereich (Angebote, CRM-Daten, Dokumente, Verträge).</p>
            <p>Serverstandort: EU (Frankfurt, Deutschland). Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO besteht.</p>
            <p>Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com/privacy</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. E-Mail-Versand über Resend</h2>
            <p>Für den transaktionalen E-Mail-Versand (z. B. Bestätigungen, Double-Opt-In, Angebote, System-Benachrichtigungen) nutzen wir den Dienst Resend.</p>
            <p>Anbieter: Resend Inc., USA.</p>
            <p>Im Rahmen des E-Mail-Versands werden Ihre E-Mail-Adresse, Ihr Name (sofern angegeben) und der Inhalt der jeweiligen Nachricht an Resend übermittelt. Die Übermittlung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer zuverlässigen E-Mail-Zustellung).</p>
            <p>Mit Resend besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Bei Datenübermittlungen in die USA werden zusätzlich EU-Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO eingesetzt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Zahlungsabwicklung über Stripe</h2>
            <p>Für die Abwicklung von Zahlungen nutzen wir den Zahlungsdienstleister Stripe. Anbieter ist die Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.</p>
            <p>Im Rahmen der Zahlungsabwicklung werden Ihre Zahlungsdaten (z. B. Kreditkartennummer, Rechnungsadresse, E-Mail-Adresse) an Stripe übermittelt. Die Übermittlung Ihrer Daten an Stripe erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie im Interesse eines sicheren und reibungslosen Zahlungsverkehrs (Art. 6 Abs. 1 lit. f DSGVO).</p>
            <p>Stripe kann Daten auch in den USA verarbeiten. Es gelten die Standardvertragsklauseln der EU-Kommission als Grundlage für die Datenübermittlung in Drittländer.</p>
            <p>Weitere Informationen: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/de/privacy</a></p>
          </section>

          <section>
            <h2 id="cookies" className="text-xl font-semibold text-foreground">11. Cookies und Cookie-Consent</h2>
            <p>Beim ersten Besuch unserer Website erhalten Sie ein Cookie-Banner, über das Sie granular entscheiden können, welche Kategorien von Cookies und vergleichbaren Technologien Sie zulassen möchten. Ihre Auswahl wird in Ihrem Browser (localStorage, Schlüssel <code>cookie-consent-v2</code>) gespeichert und kann jederzeit über den Cookie-Button bzw. den Footer-Link „Cookie-Einstellungen“ geändert oder widerrufen werden.</p>
            <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer funktionsfähigen Website) für notwendige Cookies sowie auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für Analyse- und Marketing-Cookies. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.</p>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.1 Notwendig (immer aktiv)</h3>
            <p>Diese Speichervorgänge sind technisch erforderlich, damit die Website funktioniert (z. B. Speicherung Ihrer Cookie-Auswahl, Sicherheits-Token, Theme-Einstellung). Sie können nicht deaktiviert werden. Es findet kein Tracking statt.</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs sm:text-sm border border-border">
                <thead className="bg-muted/50">
                  <tr className="text-left text-foreground">
                    <th className="p-2 border border-border">Name</th>
                    <th className="p-2 border border-border">Anbieter</th>
                    <th className="p-2 border border-border">Zweck</th>
                    <th className="p-2 border border-border">Speicherdauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-border"><code>cookie-consent-v2</code></td>
                    <td className="p-2 border border-border">ki-automationen.io</td>
                    <td className="p-2 border border-border">Speichert Ihre Cookie-Einstellungen</td>
                    <td className="p-2 border border-border">12 Monate (localStorage)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>theme</code></td>
                    <td className="p-2 border border-border">ki-automationen.io</td>
                    <td className="p-2 border border-border">Speichert das Farbschema (Hell/Dunkel)</td>
                    <td className="p-2 border border-border">Persistent (localStorage)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>sb-*-auth-token</code></td>
                    <td className="p-2 border border-border">Supabase</td>
                    <td className="p-2 border border-border">Session-Verwaltung bei Login</td>
                    <td className="p-2 border border-border">Bis Logout / 1 Stunde</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.2 Analyse (optional, nur mit Einwilligung)</h3>
            <p>Mit Ihrer Einwilligung setzen wir – falls aktiviert – Google Analytics 4 (GA4) ein, um anonymisiert zu messen, wie unsere Website genutzt wird (z. B. Seitenaufrufe, Verweildauer, Geräteklasse). Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. IP-Adressen werden vor jeder Verarbeitung gekürzt (IP-Anonymisierung). Eine Übermittlung in Drittländer (insb. USA) ist möglich; Grundlage sind die EU-Standardvertragsklauseln.</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs sm:text-sm border border-border">
                <thead className="bg-muted/50">
                  <tr className="text-left text-foreground">
                    <th className="p-2 border border-border">Name</th>
                    <th className="p-2 border border-border">Anbieter</th>
                    <th className="p-2 border border-border">Zweck</th>
                    <th className="p-2 border border-border">Speicherdauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-border"><code>_ga</code></td>
                    <td className="p-2 border border-border">Google (GA4)</td>
                    <td className="p-2 border border-border">Unterscheidung von Besuchern (pseudonyme Client-ID)</td>
                    <td className="p-2 border border-border">2 Jahre</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>_ga_*</code></td>
                    <td className="p-2 border border-border">Google (GA4)</td>
                    <td className="p-2 border border-border">Sitzungs- und Kampagneninformationen</td>
                    <td className="p-2 border border-border">2 Jahre</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>_gid</code></td>
                    <td className="p-2 border border-border">Google (GA4)</td>
                    <td className="p-2 border border-border">Unterscheidung von Besuchern</td>
                    <td className="p-2 border border-border">24 Stunden</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.3 Marketing (optional, nur mit Einwilligung)</h3>
            <p>Mit Ihrer Einwilligung setzen wir – falls aktiviert – den Meta Pixel (Facebook Pixel) ein, um die Wirksamkeit unserer Werbeanzeigen auf Facebook und Instagram zu messen (Conversion-Tracking) und Zielgruppen für Remarketing-Kampagnen zu bilden. Anbieter ist die Meta Platforms Ireland Limited, Merrion Road, Dublin 4, Irland. Eine Übermittlung von Daten an Meta in den USA ist möglich; Grundlage sind die EU-Standardvertragsklauseln.</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs sm:text-sm border border-border">
                <thead className="bg-muted/50">
                  <tr className="text-left text-foreground">
                    <th className="p-2 border border-border">Name</th>
                    <th className="p-2 border border-border">Anbieter</th>
                    <th className="p-2 border border-border">Zweck</th>
                    <th className="p-2 border border-border">Speicherdauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-border"><code>_fbp</code></td>
                    <td className="p-2 border border-border">Meta (Facebook)</td>
                    <td className="p-2 border border-border">Identifiziert Browser für Werbe- und Analysezwecke</td>
                    <td className="p-2 border border-border">3 Monate</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>_fbc</code></td>
                    <td className="p-2 border border-border">Meta (Facebook)</td>
                    <td className="p-2 border border-border">Letzte angeklickte Werbeanzeige (Click-ID)</td>
                    <td className="p-2 border border-border">3 Monate</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-border"><code>fr</code></td>
                    <td className="p-2 border border-border">Meta (Facebook)</td>
                    <td className="p-2 border border-border">Werbe-Targeting und Conversion-Messung</td>
                    <td className="p-2 border border-border">3 Monate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.4 Google Consent Mode v2</h3>
            <p>Wir setzen den Google Consent Mode v2 ein. Google-Tags (insbesondere GA4 und – falls aktiviert – Google Ads) werden auf unserer Website grundsätzlich mit dem Standardstatus „denied“ für die Signale <code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code> und <code>analytics_storage</code> geladen. Erst nach Ihrer aktiven Einwilligung im Cookie-Banner werden die jeweils freigegebenen Signale per <code>consent update</code> auf „granted“ gesetzt.</p>
            <p>Ohne Ihre Einwilligung werden keine Cookies gesetzt und keine identifizierenden Daten übertragen. Es können in diesem Modus jedoch sogenannte cookielose Pings (anonyme, aggregierte Signale ohne Geräte- oder Nutzer-IDs) an Google gesendet werden, die ausschließlich der statistischen Modellierung von Conversion- und Reichweiten-Lücken dienen.</p>
            <p>Zusätzlich aktivieren wir die Google-Einstellungen <code>ads_data_redaction</code> (Schwärzung werbebezogener Daten bei fehlender Einwilligung) und <code>url_passthrough</code> (cookielose Weitergabe von Klick-Parametern).</p>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.5 Datenübertragung in die USA</h3>
            <p>Bei Nutzung von Google Analytics und Meta Pixel werden Daten an Server in den USA übertragen. Die Datenübertragung erfolgt auf Grundlage von:</p>
            <ul className="list-disc pl-6">
              <li>EU-Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO</li>
              <li>Data Privacy Framework (DPF) – Angemessenheitsbeschluss der EU-Kommission</li>
            </ul>
            <p>Ein Restrisiko eines Zugriffs durch US-Behörden gemäß FISA 702 / Executive Order 12333 kann nicht vollständig ausgeschlossen werden. Sie können die Datenübertragung verhindern, indem Sie Ihre Einwilligung im Cookie-Banner verweigern oder widerrufen.</p>

            <h3 className="text-lg font-semibold text-foreground mt-4">11.6 Widerruf Ihrer Einwilligung</h3>
            <p>Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen oder anpassen. Klicken Sie dazu auf den Cookie-Button bzw. auf den Link „Cookie-Einstellungen“ im Footer. Nach Widerruf werden die zugehörigen Skripte nicht mehr geladen; bereits gesetzte Drittanbieter-Cookies können Sie zusätzlich in den Einstellungen Ihres Browsers löschen.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Plugins und Tools</h2>
            <h3 className="text-lg font-semibold text-foreground mt-4">Google Fonts (lokales Hosting)</h3>
            <p>Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts. Die Google Fonts sind lokal installiert. Eine Verbindung zu Servern von Google findet dabei nicht statt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Empfänger und Auftragsverarbeiter</h2>
            <p>Im Rahmen unserer Dienste setzen wir folgende Auftragsverarbeiter und Empfänger personenbezogener Daten ein:</p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs sm:text-sm border border-border">
                <thead className="bg-muted/50">
                  <tr className="text-left text-foreground">
                    <th className="p-2 border border-border">Anbieter</th>
                    <th className="p-2 border border-border">Zweck</th>
                    <th className="p-2 border border-border">Standort</th>
                    <th className="p-2 border border-border">Grundlage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border border-border">STRATO AG</td><td className="p-2 border border-border">Webhosting</td><td className="p-2 border border-border">Deutschland</td><td className="p-2 border border-border">AV-Vertrag</td></tr>
                  <tr><td className="p-2 border border-border">Lovable Technologies AB</td><td className="p-2 border border-border">Plattform & Hosting</td><td className="p-2 border border-border">Schweden (EU)</td><td className="p-2 border border-border">AV-Vertrag</td></tr>
                  <tr><td className="p-2 border border-border">Supabase Inc.</td><td className="p-2 border border-border">Datenbank, Auth, Storage</td><td className="p-2 border border-border">EU (Frankfurt)</td><td className="p-2 border border-border">AV-Vertrag</td></tr>
                  <tr><td className="p-2 border border-border">Resend Inc.</td><td className="p-2 border border-border">E-Mail-Versand</td><td className="p-2 border border-border">USA</td><td className="p-2 border border-border">AV-Vertrag + SCC</td></tr>
                  <tr><td className="p-2 border border-border">Stripe Payments Europe Ltd.</td><td className="p-2 border border-border">Zahlungsabwicklung</td><td className="p-2 border border-border">Irland / USA</td><td className="p-2 border border-border">Vertragserfüllung + SCC</td></tr>
                  <tr><td className="p-2 border border-border">Google Ireland Ltd.</td><td className="p-2 border border-border">Webanalyse (GA4) – falls aktiviert</td><td className="p-2 border border-border">Irland / USA</td><td className="p-2 border border-border">Einwilligung + SCC</td></tr>
                  <tr><td className="p-2 border border-border">Meta Platforms Ireland Ltd.</td><td className="p-2 border border-border">Marketing (Pixel) – falls aktiviert</td><td className="p-2 border border-border">Irland / USA</td><td className="p-2 border border-border">Einwilligung + SCC</td></tr>
                </tbody>
              </table>
            </div>
            <p>Mit allen Dienstleistern bestehen Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO. Bei Drittlandtransfers (USA) werden zusätzlich EU-Standardvertragsklauseln eingesetzt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">14. Ihre Rechte</h2>
            <p>Sie haben Rechte auf:</p>
            <ul className="list-disc pl-6">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">15. Beschwerderecht</h2>
            <p>Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen<br />
              <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ldi.nrw.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">16. Änderungen</h2>
            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen unserer Dienste anzupassen.</p>
          </section>

          <p className="text-sm text-muted-foreground pt-4">Stand: 26.04.2026</p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Datenschutz;
