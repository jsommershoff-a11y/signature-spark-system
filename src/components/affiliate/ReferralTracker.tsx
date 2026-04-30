import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { captureUtmParams } from '@/lib/analytics';

const REF_KEY = 'krs_ref_code';
const REF_EXPIRY_DAYS = 60;

interface StoredRef {
  code: string;
  expires: number;
}

/**
 * Listens for ?ref=CODE in URL, persists to localStorage with 60-day expiry,
 * and pings track-referral edge function (anonymous click).
 */
export function ReferralTracker() {
  useEffect(() => {
    // First-touch UTM-Capture für Apollo-Segmentierung (sessionStorage).
    captureUtmParams();

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    if (ref && /^[A-Z0-9]{4,16}$/i.test(ref)) {
      const code = ref.toUpperCase();
      const stored: StoredRef = {
        code,
        expires: Date.now() + REF_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      };
      try {
        localStorage.setItem(REF_KEY, JSON.stringify(stored));
      } catch { /* ignore */ }

      // Fire-and-forget tracking ping
      supabase.functions.invoke('track-referral', {
        body: { ref_code: code },
      }).catch(() => {/* ignore */});
    }
  }, []);

  return null;
}

export function getStoredRefCode(): string | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredRef;
    if (Date.now() > stored.expires) {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    return stored.code;
  } catch {
    return null;
  }
}

export function clearStoredRefCode() {
  try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
}
