import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/types/social';
import type { SocialPost, SocialPlatform, SocialPostStatus } from '@/types/social';
import { PostDetailModal } from './PostDetailModal';
import { CreatePostDialog } from './CreatePostDialog';

interface Props { posts: SocialPost[] }

export function ListView({ posts }: Props) {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const filtered = posts.filter(p => {
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Plattform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Plattformen</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto"><CreatePostDialog /></div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Plattform</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedPost(p)}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{PLATFORM_LABELS[p.platform]}</TableCell>
                <TableCell>{CONTENT_TYPE_LABELS[p.content_type]}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge></TableCell>
                <TableCell>{p.scheduled_at ? format(new Date(p.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '–'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Keine Posts gefunden</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <PostDetailModal post={selectedPost} open={!!selectedPost} onOpenChange={o => { if (!o) setSelectedPost(null); }} />
    </div>
  );
}
