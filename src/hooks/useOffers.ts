import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Offer, CreateOfferInput, UpdateOfferInput, OfferContent } from '@/types/offers';
import { useToast } from '@/hooks/use-toast';

export function useOffers(leadId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offers
  const offersQuery = useQuery({
    queryKey: ['offers', leadId],
    queryFn: async () => {
      let query = supabase
        .from('offers')
        .select(`
          *,
          crm_leads!inner (
            id,
            first_name,
            last_name,
            email,
            company
          ),
          creator:profiles!offers_created_by_fkey (
            id,
            first_name,
            last_name,
            full_name
          ),
          approver:profiles!offers_approved_by_fkey (
            id,
            first_name,
            last_name,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        offer_json: item.offer_json as unknown as OfferContent,
        lead: item.crm_leads,
      })) as unknown as Offer[];
    },
  });

  // Create offer
  const createOfferMutation = useMutation({
    mutationFn: async (input: CreateOfferInput) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      const insertPayload = {
        lead_id: input.lead_id,
        analysis_id: input.analysis_id || null,
        created_by: profile?.id || null,
        offer_json: input.offer_json || {},
        notes: input.notes || null,
      };
      
      const { data, error } = await (supabase
        .from('offers')
        .insert(insertPayload as never)
        .select()
        .single());

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Angebot erstellt',
        description: 'Das Angebot wurde als Entwurf gespeichert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update offer
  const updateOfferMutation = useMutation({
    mutationFn: async (input: UpdateOfferInput) => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.status) updateData.status = input.status;
      if (input.offer_json) updateData.offer_json = input.offer_json;
      if (input.notes !== undefined) updateData.notes = input.notes;
      
      if (input.approved_by) {
        updateData.approved_by = input.approved_by;
        updateData.approved_at = new Date().toISOString();
      }
      
      if (input.sent_at) updateData.sent_at = input.sent_at;
      
      if (input.payment_unlocked !== undefined) {
        updateData.payment_unlocked = input.payment_unlocked;
        if (input.payment_unlocked) {
          updateData.payment_unlocked_at = new Date().toISOString();
          updateData.payment_unlocked_by = input.payment_unlocked_by;
        }
      }

      const { data, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Angebot aktualisiert',
        description: 'Die Änderungen wurden gespeichert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit for review
  const submitForReviewMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { data, error } = await supabase
        .from('offers')
        .update({
          status: 'pending_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Zur Prüfung gesendet',
        description: 'Das Angebot wurde zur Genehmigung weitergeleitet.',
      });
    },
  });

  // Approve offer
  const approveOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data, error } = await supabase
        .from('offers')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Angebot genehmigt',
        description: 'Das Angebot kann jetzt versendet werden.',
      });
    },
  });

  // Send offer
  const sendOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { data, error } = await supabase
        .from('offers')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Angebot gesendet',
        description: 'Der Kunde kann das Angebot jetzt einsehen.',
      });
    },
  });

  // Unlock payment
  const unlockPaymentMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data, error } = await supabase
        .from('offers')
        .update({
          payment_unlocked: true,
          payment_unlocked_at: new Date().toISOString(),
          payment_unlocked_by: profile?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: 'Zahlung freigeschaltet',
        description: 'Der Kunde kann jetzt bezahlen.',
      });
    },
  });

  return {
    offers: offersQuery.data || [],
    isLoading: offersQuery.isLoading,
    error: offersQuery.error,
    createOffer: createOfferMutation.mutateAsync,
    updateOffer: updateOfferMutation.mutateAsync,
    submitForReview: submitForReviewMutation.mutateAsync,
    approveOffer: approveOfferMutation.mutateAsync,
    sendOffer: sendOfferMutation.mutateAsync,
    unlockPayment: unlockPaymentMutation.mutateAsync,
    isCreating: createOfferMutation.isPending,
    isUpdating: updateOfferMutation.isPending,
  };
}

// Hook for public offer view
export function usePublicOffer(token: string) {
  return useQuery({
    queryKey: ['public-offer', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          crm_leads (
            id,
            first_name,
            last_name,
            email,
            company
          )
        `)
        .eq('public_token', token)
        .single();

      if (error) throw error;

      // Mark as viewed
      if (data && data.status === 'sent') {
        await supabase
          .from('offers')
          .update({
            status: 'viewed' as const,
            viewed_at: new Date().toISOString(),
          })
          .eq('id', data.id);
      }

      return {
        ...data,
        offer_json: data.offer_json as unknown as OfferContent,
        lead: data.crm_leads,
      } as unknown as Offer;
    },
    enabled: !!token,
  });
}
