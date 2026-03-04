import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, PLATFORM_ICONS } from '@/types/social';
import type { SocialPost, SocialPlatform, SocialPostStatus } from '@/types/social';
import { PostDetailModal } from './PostDetailModal';
import { CreatePostDialog } from './CreatePostDialog';
import { List } from 'lucide-react';

interface Props { posts: SocialPost[]; isLoading?: boolean }

export function ListView({ posts, isLoading }: Props) {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const filtered = posts.filter(p => {
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="h-5 w-5 text-module-green" />
            Alle Posts ({filtered.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Plattform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Plattformen</SelectItem>
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{PLATFORM_ICONS[k as SocialPlatform]} {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <CreatePostDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Titel</TableHead>
                <TableHead className="font-semibold">Plattform</TableHead>
                <TableHead className="font-semibold">Typ</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-module-green-muted/30 transition-colors" onClick={() => setSelectedPost(p)}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {PLATFORM_ICONS[p.platform]} {PLATFORM_LABELS[p.platform]}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{CONTENT_TYPE_LABELS[p.content_type]}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.scheduled_at ? format(new Date(p.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de }) : '–'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <List className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Keine Posts gefunden</p>
                      <p className="text-sm">Erstelle deinen ersten Post mit dem Button oben rechts.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <PostDetailModal post={selectedPost} open={!!selectedPost} onOpenChange={o => { if (!o) setSelectedPost(null); }} />
    </Card>
  );
}
