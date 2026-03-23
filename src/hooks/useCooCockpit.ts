import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  CooInvoice, CooContact, CooOffer, CooOpenItem,
  CooRevenueSummary, CooSyncLog, CooSyncError,
} from '@/types/coo';

const fetchTable = async <T>(table: string): Promise<T[]> => {
  const { data, error } = await (supabase as any).from(table).select('*').limit(1000);
  if (error) throw error;
  return (data ?? []) as T[];
};

export function useInvoices() {
  return useQuery<CooInvoice[]>({
    queryKey: ['coo', 'invoices'],
    queryFn: () => fetchTable<CooInvoice>('invoices'),
    retry: 1,
  });
}

export function useCooContacts() {
  return useQuery<CooContact[]>({
    queryKey: ['coo', 'contacts'],
    queryFn: () => fetchTable<CooContact>('contacts'),
    retry: 1,
  });
}

export function useCooOffers() {
  return useQuery<CooOffer[]>({
    queryKey: ['coo', 'offers'],
    queryFn: () => fetchTable<CooOffer>('coo_offers'),
    retry: 1,
  });
}

export function useOpenItems() {
  return useQuery<CooOpenItem[]>({
    queryKey: ['coo', 'open_items'],
    queryFn: () => fetchTable<CooOpenItem>('open_items'),
    retry: 1,
  });
}

export function useRevenueSummary() {
  return useQuery<CooRevenueSummary[]>({
    queryKey: ['coo', 'revenue_summary'],
    queryFn: () => fetchTable<CooRevenueSummary>('revenue_summary'),
    retry: 1,
  });
}

export function useSyncLogs() {
  return useQuery<CooSyncLog[]>({
    queryKey: ['coo', 'sync_logs'],
    queryFn: () => fetchTable<CooSyncLog>('sync_logs'),
    retry: 1,
  });
}

export function useSyncErrors() {
  return useQuery<CooSyncError[]>({
    queryKey: ['coo', 'sync_errors'],
    queryFn: () => fetchTable<CooSyncError>('sync_errors'),
    retry: 1,
  });
}

export function useRefreshCooData() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['coo'] });
}

export function useCooKpis() {
  const invoices = useInvoices();
  const openItems = useOpenItems();
  const contacts = useCooContacts();
  const offers = useCooOffers();
  const syncLogs = useSyncLogs();
  const syncErrors = useSyncErrors();

  const isLoading = invoices.isLoading || openItems.isLoading || contacts.isLoading || offers.isLoading || syncLogs.isLoading || syncErrors.isLoading;
  const isError = invoices.isError && openItems.isError && contacts.isError;

  const inv = invoices.data ?? [];
  const oi = openItems.data ?? [];
  const sl = syncLogs.data ?? [];
  const se = syncErrors.data ?? [];

  const today = new Date().toISOString().slice(0, 10);

  return {
    isLoading,
    isError,
    invoiceCount: inv.length,
    brutto: inv.reduce((s, i) => s + (i.betrag_brutto || 0), 0),
    netto: inv.reduce((s, i) => s + (i.betrag_netto || 0), 0),
    openItemCount: oi.length,
    openItemSum: oi.reduce((s, i) => s + (i.betrag || 0), 0),
    offerCount: (offers.data ?? []).length,
    contactCount: (contacts.data ?? []).length,
    lastSuccessSync: sl.filter(l => l.status === 'success').sort((a, b) => b.timestamp?.localeCompare(a.timestamp ?? '') ?? 0)[0]?.timestamp ?? null,
    lastError: se.sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''))[0]?.timestamp ?? null,
    errorsToday: se.filter(e => e.timestamp?.startsWith(today)).length,
  };
}
