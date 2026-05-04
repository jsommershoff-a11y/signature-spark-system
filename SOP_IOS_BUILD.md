# SOP: iOS-App Build & Deployment über Lovable

Diese Standard Operating Procedure (SOP) beschreibt den genauen Ablauf, um das bestehende Capacitor-Projekt (`signature-spark-system`) aus Lovable als native iOS-App in TestFlight und den Apple App Store zu bringen.

## Zielsetzung
Veröffentlichung der Lovable Web-App als native iOS-App, ohne dass lokal ein Mac oder Xcode benötigt wird, indem Cloud-Build-Services genutzt werden.

---

## Phase 1: Apple Developer Account Setup (Voraussetzung)

Um eine iOS-App zu veröffentlichen, ist ein Apple Developer Account zwingend erforderlich. Dieser Prozess muss vom Geschäftsführer (Jan Sommershoff) durchgeführt werden.

1.  **Apple ID erstellen/nutzen:** Gehe zu [developer.apple.com](https://developer.apple.com) und logge dich mit der Firmen-Apple-ID ein.
2.  **Enrollment starten:** Klicke auf "Enroll" und wähle die Registrierung als **Unternehmen/Organisation** (Company/Organization).
3.  **D-U-N-S Nummer bereithalten:** Apple verlangt zwingend eine D-U-N-S Nummer zur Verifizierung der KRS Immobilien GmbH. Falls diese nicht vorliegt, kann sie im Prozess kostenlos bei Dun & Bradstreet angefragt werden.
4.  **Zahlung:** Die Gebühr beträgt $99 pro Jahr.
5.  **App Store Connect:** Nach Freischaltung hast du Zugriff auf [App Store Connect](https://appstoreconnect.apple.com), das Dashboard zur Verwaltung der App.

---

## Phase 2: App in App Store Connect anlegen

Bevor der Code gebaut werden kann, muss der "Container" für die App bei Apple existieren.

1.  Logge dich in **App Store Connect** ein.
2.  Gehe zu **Certificates, Identifiers & Profiles** -> **Identifiers**.
3.  Klicke auf das **+** und erstelle eine neue **App ID**.
    *   **Bundle ID:** Muss exakt mit der `appId` aus deiner `capacitor.config.ts` übereinstimmen: `app.lovable.41126098f0644976a8a0b387a8a83999` (Empfehlung: Ändere dies vor dem ersten Build in Lovable zu etwas Lesbarem wie `de.krsimmobilien.kiautomationen`).
4.  Gehe zurück zum App Store Connect Hauptmenü und klicke auf **My Apps**.
5.  Klicke auf das **+** -> **New App**.
    *   **Plattform:** iOS
    *   **Name:** KI Automationen
    *   **Bundle ID:** Wähle die gerade erstellte ID aus.

---

## Phase 3: Der Build-Prozess (3 Optionen)

Da das Projekt in Lovable liegt und Capacitor bereits konfiguriert ist, gibt es drei Wege, um die `.ipa`-Datei (das iOS-App-Format) zu erzeugen.

### Option A: Lovable Mobile Export (Empfohlener, schnellster Weg)
Wenn du einen Lovable Pro/Scale Plan nutzt, bietet Lovable einen direkten Export an [1].
1.  Öffne das Projekt in Lovable.
2.  Klicke oben rechts auf **Export** oder **Publish**.
3.  Wähle **Mobile App / iOS**.
4.  Lovable führt den Build-Prozess auf ihren eigenen Mac-Servern durch.
5.  Lade die fertige `.ipa` Datei herunter oder folge dem Lovable-Flow zum direkten Upload.

### Option B: Cloud Build via EAS (Expo Application Services)
Falls Lovable den Export blockiert, nutzen wir EAS Build (Cloud-Service für React/Capacitor).
1.  Verbinde dein GitHub-Repo (`signature-spark-system`) mit einem kostenlosen [Expo-Account](https://expo.dev).
2.  Erstelle im Root-Verzeichnis eine `eas.json` mit folgendem Inhalt:
    ```json
    {
      "build": {
        "production": {
          "ios": {
            "autoIncrement": true
          }
        }
      }
    }
    ```
3.  Führe über die Kommandozeile (kann ich für dich machen) `eas build --platform ios` aus. EAS verbindet sich mit deinem Apple-Account, erstellt die Zertifikate automatisch und baut die App in der Cloud.

### Option C: Xcode Cloud via GitHub [2]
Apple bietet einen eigenen Cloud-CI/CD Service an.
1.  Verbinde App Store Connect mit deinem GitHub-Repository.
2.  Erstelle in App Store Connect einen **Xcode Cloud Workflow**.
3.  Füge ein Post-Clone-Script (`ios/App/ci_scripts/ci_post_clone.sh`) hinzu, das `npm run build` und `npx cap sync ios` ausführt.
4.  Xcode Cloud baut die App bei jedem Push auf den `main`-Branch automatisch und lädt sie in TestFlight hoch.

---

## Phase 4: TestFlight und Release

Sobald der Build abgeschlossen und die App zu Apple hochgeladen wurde:

1.  **TestFlight (Beta-Testing):**
    *   Gehe in App Store Connect zum Reiter **TestFlight**.
    *   Füge dich selbst und dein Team als interne Tester hinzu.
    *   Lade die TestFlight-App auf dein iPhone und installiere die Beta-Version.
2.  **App Store Review:**
    *   Wenn die App fehlerfrei läuft, fülle in App Store Connect alle Metadaten aus (Screenshots, Beschreibung, Datenschutzrichtlinie).
    *   Reiche die App zur Prüfung ("Review") bei Apple ein.
    *   Nach 24-48 Stunden wird die App freigegeben und ist im App Store verfügbar.

---

## Nächster operativer Schritt
Bitte bestätige, ob die **D-U-N-S Nummer** und der **Apple Developer Account** bereits vorliegen. Sobald der Account steht, können wir Option A oder B sofort initiieren.

***

## References
[1] Lovable. "Mobile App Development — Product Capabilities FAQ." https://lovable.dev/faq/capabilities/mobile
[2] Capgo. "How to build Ionic Capacitor app in Xcode Cloud." https://capgo.app/blog/how-to-build-capacitor-app-in-xcode-cloud/
