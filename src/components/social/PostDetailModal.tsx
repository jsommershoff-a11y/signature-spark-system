import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, PLATFORM_ICONS } from '@/types/social';
import type { SocialPost, SocialPlatform, SocialContentType, SocialPostStatus } from '@/types/social';
import { Save, Trash2, BarChart3 } from 'lucide-react';

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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-lg">{PLATFORM_ICONS[post.platform]}</span>
            Post bearbeiten
            <Badge className={STATUS_COLORS[post.status]}>{STATUS_LABELS[post.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Titel</Label>
            <Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Plattform</Label>
              <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v as SocialPlatform }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{PLATFORM_ICONS[k as SocialPlatform]} {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Typ</Label>
              <Select value={form.content_type} onValueChange={v => setForm(f => ({ ...f, content_type: v as SocialContentType }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as SocialPostStatus }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Geplant für</Label>
            <Input type="datetime-local" value={form.scheduled_at?.slice(0, 16) || ''} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value || null }))} className="mt-1" />
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hook</Label>
            <Input value={form.hook || ''} onChange={e => setForm(f => ({ ...f, hook: e.target.value }))} placeholder="Starker erster Satz..." className="mt-1" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Caption</Label>
            <Textarea rows={4} value={form.caption || ''} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Post-Text..." className="mt-1" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Notizen</Label>
            <Textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Interne Notizen..." className="mt-1" />
          </div>

          {form.status === 'veroeffentlicht' && (
            <>
              <Separator />
              <div>
                <Label className="flex items-center gap-2 mb-3 text-xs text-muted-foreground uppercase tracking-wider">
                  <BarChart3 className="h-3.5 w-3.5" /> Metriken
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['views', 'likes', 'comments', 'shares', 'saves', 'link_clicks'].map(metric => (
                    <div key={metric}>
                      <Label className="text-xs capitalize text-muted-foreground">{metric}</Label>
                      <Input
                        type="number"
                        className="mt-0.5"
                        value={(form.metrics as any)?.[metric] || 0}
                        onChange={e => setForm(f => ({ ...f, metrics: { ...(f.metrics as any || {}), [metric]: parseInt(e.target.value) || 0 } }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={updatePost.isPending} className="flex-1 bg-module-green hover:bg-module-green-dark text-module-green-foreground">
              <Save className="h-4 w-4 mr-2" /> Speichern
            </Button>
            <Button variant="destructive" size="icon" onClick={() => { deletePost.mutate(post.id); onOpenChange(false); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
