import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS, PLATFORM_ICONS } from '@/types/social';
import type { SocialPlatform, SocialContentType, SocialPostStatus } from '@/types/social';

interface Props {
  defaultDate?: string;
  prefill?: { title?: string; hook?: string; caption?: string; platform?: SocialPlatform; content_type?: SocialContentType };
  trigger?: React.ReactNode;
}

export function CreatePostDialog({ defaultDate, prefill, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { createPost } = useSocialPosts();
  const [title, setTitle] = useState(prefill?.title || '');
  const [platform, setPlatform] = useState<SocialPlatform>(prefill?.platform || 'instagram');
  const [contentType, setContentType] = useState<SocialContentType>(prefill?.content_type || 'post');
  const [status, setStatus] = useState<SocialPostStatus>('idee');
  const [scheduledAt, setScheduledAt] = useState(defaultDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({
      title,
      platform,
      content_type: contentType,
      status,
      scheduled_at: scheduledAt || null,
      hook: prefill?.hook || null,
      caption: prefill?.caption || null,
    }, {
      onSuccess: () => {
        setOpen(false);
        setTitle('');
        setScheduledAt('');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-module-green hover:bg-module-green-dark text-module-green-foreground shadow-sm">
            <Plus className="h-4 w-4 mr-1" /> Neuer Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-module-green/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-module-green" />
            </div>
            Neuen Post erstellen
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Titel *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Was ist das Thema?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Plattform</Label>
              <Select value={platform} onValueChange={v => setPlatform(v as SocialPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{PLATFORM_ICONS[k as SocialPlatform]} {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Typ</Label>
              <Select value={contentType} onValueChange={v => setContentType(v as SocialContentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as SocialPostStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Geplant für</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-module-green hover:bg-module-green-dark text-module-green-foreground" disabled={createPost.isPending}>
            {createPost.isPending ? 'Erstelle...' : 'Post erstellen'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
