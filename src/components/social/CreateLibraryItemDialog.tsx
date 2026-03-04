import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSocialLibrary } from '@/hooks/useSocialLibrary';
import type { LibraryItemType } from '@/types/social';

const TYPE_LABELS: Record<LibraryItemType, string> = {
  hook: 'Hook',
  template: 'Template',
  hashtag: 'Hashtag-Set',
  story: 'Story Script',
};

export function CreateLibraryItemDialog() {
  const [open, setOpen] = useState(false);
  const { createItem } = useSocialLibrary();
  const [type, setType] = useState<LibraryItemType>('hook');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem.mutate({
      type,
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    }, {
      onSuccess: () => { setOpen(false); setTitle(''); setContent(''); setTags(''); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neuer Eintrag</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Bibliothek-Eintrag erstellen</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Typ</Label>
            <Select value={type} onValueChange={v => setType(v as LibraryItemType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Titel</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><Label>Inhalt</Label><Textarea rows={4} value={content} onChange={e => setContent(e.target.value)} /></div>
          <div><Label>Tags (kommagetrennt)</Label><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="z.B. handwerk, marketing" /></div>
          <Button type="submit" className="w-full" disabled={createItem.isPending}>Erstellen</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
