import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { STATUS_DOT_COLORS, PLATFORM_ICONS } from '@/types/social';
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

  return (
    <Card className="overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-module-green-muted/50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-module-green hover:text-module-green" onClick={() => setCurrentMonth(new Date())}>
            Heute
          </Button>
        </div>
        <CreatePostDialog />
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay.get(key) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={key}
              className={cn(
                'min-h-[110px] p-1.5 border-b border-r relative group transition-colors',
                !isCurrentMonth && 'bg-muted/20 opacity-50',
                today && 'bg-module-green-muted/40',
                idx % 7 === 0 && 'border-l-0',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full',
                  today && 'bg-module-green text-module-green-foreground font-bold',
                )}>
                  {format(day, 'd')}
                </span>
                <CreatePostDialog
                  defaultDate={format(day, "yyyy-MM-dd'T'09:00")}
                  trigger={
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded bg-module-green/10 hover:bg-module-green/20 text-module-green">
                      <Plus className="h-3 w-3" />
                    </button>
                  }
                />
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPost(p)}
                    className="w-full text-left text-[10px] leading-tight px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-module-green/10 transition-colors truncate"
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT_COLORS[p.status])} />
                    <span className="shrink-0">{PLATFORM_ICONS[p.platform]}</span>
                    <span className="truncate">{p.title}</span>
                  </button>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">+{dayPosts.length - 3} mehr</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PostDetailModal post={selectedPost} open={!!selectedPost} onOpenChange={o => { if (!o) setSelectedPost(null); }} />
    </Card>
  );
}
