

# Step 34 -- ProgressTracker in OfferDetail einbinden

## Ziel
Mitarbeiter und Admins koennen bei variablen Angeboten (`offer_mode === 'variable'`) direkt im OfferDetail den Fortschritt pflegen, Updates erfassen und per Toggle veroeffentlichen. Admins haben automatisch vollen Zugriff, da `hasMinRole('mitarbeiter')` fuer Admins immer `true` liefert.

## Aenderungen

### `src/pages/app/OfferDetail.tsx`

1. **Import hinzufuegen** (Zeile 7, nach PainPointRadar):
   - `import { ProgressTracker } from '@/components/offers/ProgressTracker';`

2. **`updateOffer` destrukturieren** (Zeile 44):
   - Aendern von: `const { offers, isLoading, approveOffer, sendOffer, unlockPayment, submitForReview } = useOffers();`
   - Zu: `const { offers, isLoading, approveOffer, sendOffer, unlockPayment, submitForReview, updateOffer } = useOffers();`

3. **Handler-Funktion** (nach `copyPublicLink`, ca. Zeile 62):
   ```
   const handleProgressUpdate = async (updatedJson: any) => {
     if (!offer) return;
     await updateOffer({ id: offer.id, offer_json: updatedJson });
   };
   ```

4. **ProgressTracker im JSX rendern** (nach OfferPreview, vor Contract Details, ca. Zeile 229):
   ```
   {offerJson?.offer_mode === 'variable' && hasMinRole('mitarbeiter') && (
     <ProgressTracker offer={offer} onUpdate={handleProgressUpdate} />
   )}
   ```

## Sicherheits-Hinweis

- Die Bedingung `hasMinRole('mitarbeiter')` schliesst automatisch alle hoeheren Rollen ein (Teamleiter, Geschaeftsfuehrung, Admin)
- Admins haben immer Zugriff, da `hasMinRole` im AuthContext fuer `isRealAdmin` stets `true` zurueckgibt
- RLS auf der `offers`-Tabelle erlaubt Updates nur fuer `teamleiter+`, was ebenfalls Admins einschliesst

## Test nach Implementierung

- Build kompiliert ohne Fehler (0 TypeScript-Fehler)
- OfferDetail fuer ein variables Angebot zeigt den ProgressTracker-Bereich
- Fortschritts-Slider (0-100%), Update-Eingabe und Veroeffentlichungs-Toggle funktionieren
- Nach Speichern: Aenderungen persistiert in der Datenbank
- Kundenportal (MyContracts) zeigt aktualisierte Fortschrittsleiste und nur veroeffentlichte Updates
- Admin-User sieht den ProgressTracker ebenfalls

