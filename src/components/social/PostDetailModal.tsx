import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS } from '@/types/social';
import type { SocialPost, SocialPlatform, SocialContentType, SocialPostStatus } from '@/types/social';

interface Props {
  post: SocialPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailModal({ post, open, onOpenChange }: Props) {
  const { updatePost, deletePost } = useSocialPosts();
  const [form, setForm] = useState<Partial<SocialPost>>({});

  useEffect(() => {
    if (post) setForm(post);
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    updatePost.mutate({ id: post.id, ...form }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Post bearbeiten</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Titel</Label><Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Plattform</Label>
              <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v as SocialPlatform }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PLATFORM_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Typ</Label>
              <Select value={form.content_type} onValueChange={v => setForm(f => ({ ...f, content_type: v as SocialContentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as SocialPostStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Datum</Label><Input type="datetime-local" value={form.scheduled_at?.slice(0, 16) || ''} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value || null }))} /></div>
          <div><Label>Hook</Label><Input value={form.hook || ''} onChange={e => setForm(f => ({ ...f, hook: e.target.value }))} /></div>
          <div><Label>Caption</Label><Textarea rows={4} value={form.caption || ''} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} /></div>
          <div><Label>Notizen</Label><Textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          
          {form.status === 'veroeffentlicht' && (
            <div>
              <Label className="mb-2 block">Metriken</Label>
              <div className="grid grid-cols-3 gap-2">
                {['views', 'likes', 'comments', 'shares', 'saves', 'link_clicks'].map(metric => (
                  <div key={metric}>
                    <Label className="text-xs capitalize">{metric}</Label>
                    <Input type="number" value={(form.metrics as any)?.[metric] || 0} onChange={e => setForm(f => ({ ...f, metrics: { ...(f.metrics as any || {}), [metric]: parseInt(e.target.value) || 0 } }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={updatePost.isPending} className="flex-1">Speichern</Button>
            <Button variant="destructive" onClick={() => { deletePost.mutate(post.id); onOpenChange(false); }}>Löschen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
