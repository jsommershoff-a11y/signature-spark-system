

## CHANNEL_INGEST_API_KEY Secret anlegen

### Was passiert

Das Secret `CHANNEL_INGEST_API_KEY` wird ueber das Lovable Secret-Tool in deinem Supabase-Projekt konfiguriert. Du wirst aufgefordert, einen API-Key einzugeben.

### Vorbereitung

Generiere vorher einen sicheren Key, z.B. im Terminal:

```text
openssl rand -hex 32
```

Das ergibt einen 64-Zeichen-Hex-String wie `a3f8b2c1d4e5...`.

### Ablauf

1. Nach Genehmigung dieses Plans wirst du aufgefordert, den Key-Wert einzugeben
2. Der Key wird als Supabase Secret gespeichert
3. Die Edge Function `channel_event_ingest` liest ihn automatisch ueber `Deno.env.get('CHANNEL_INGEST_API_KEY')`

