import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { STATUS_COLORS, PLATFORM_LABELS } from '@/types/social';
import type { SocialPost } from '@/types/social';
import { CreatePostDialog } from './CreatePostDialog';
import { PostDetailModal } from './PostDetailModal';
import { cn } from '@/lib/utils';

interface Props { posts: SocialPost[] }

export function CalendarView({ posts }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    posts.forEach(p => {
      if (p.scheduled_at) {
        const key = format(new Date(p.scheduled_at), 'yyyy-MM-dd');
        map.set(key, [...(map.get(key) || []), p]);
      }
    });
    return map;
  }, [posts]);

  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">{format(currentMonth, 'MMMM yyyy', { locale: de })}</h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>Heute</Button>
        </div>
        <CreatePostDialog />
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
          <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay.get(key) || [];
          return (
            <div key={key} className={cn(
              'bg-card min-h-[100px] p-1.5 relative',
              !isSameMonth(day, currentMonth) && 'opacity-40',
              isToday(day) && 'ring-2 ring-primary ring-inset',
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-xs font-medium', isToday(day) && 'text-primary font-bold')}>{format(day, 'd')}</span>
                <CreatePostDialog defaultDate={format(day, "yyyy-MM-dd'T'09:00")} trigger={
                  <button className="text-muted-foreground hover:text-foreground text-xs">+</button>
                } />
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(p => (
                  <button key={p.id} onClick={() => setSelectedPost(p)} className={cn('w-full text-left text-[10px] px-1 py-0.5 rounded truncate', STATUS_COLORS[p.status])}>
                    {PLATFORM_LABELS[p.platform]?.slice(0, 2)} · {p.title}
                  </button>
                ))}
                {dayPosts.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} mehr</span>}
              </div>
            </div>
          );
        })}
      </div>
      <PostDetailModal post={selectedPost} open={!!selectedPost} onOpenChange={o => { if (!o) setSelectedPost(null); }} />
    </div>
  );
}
