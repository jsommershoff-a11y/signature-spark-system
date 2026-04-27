import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast, isFuture, addHours, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveEvents, useTopicSubmissions } from '@/hooks/useLiveEvents';
import { STAFF_ROLES } from '@/lib/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  Video,
  Users,
  Clock,
  Plus,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Trash2,
  CalendarDays,
} from 'lucide-react';

export default function LiveCallsCalendar() {
  const { effectiveRole, user, profile } = useAuth() as any;
  const { events, isLoading, register, unregister, createEvent, deleteEvent } = useLiveEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { topics, submitTopic } = useTopicSubmissions(selectedEventId);
  const [createOpen, setCreateOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [canBook, setCanBook] = useState<boolean>(true);

  const isStaff = effectiveRole ? STAFF_ROLES.includes(effectiveRole) : false;

  // Check live-call booking eligibility (trial: 1x, active: unlimited, expired: 0)
  useEffect(() => {
    if (!user || isStaff) {
      setCanBook(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('can_book_live_call', { _user_id: user.id });
      if (!cancelled && !error) setCanBook(Boolean(data));
    })();
    return () => { cancelled = true; };
  }, [user, isStaff, profile?.live_call_used_at, profile?.subscription_status]);

  const subStatus = (profile as any)?.subscription_status as string | undefined;
  const trialUsed = Boolean((profile as any)?.live_call_used_at);
  const showTrialLockBanner = !isStaff && subStatus === 'trialing' && trialUsed;
  const showExpiredBanner = !isStaff && (subStatus === 'expired' || subStatus === 'canceled' || subStatus === 'past_due');

  // Form states for create event
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState('19:00');
  const [newDuration, setNewDuration] = useState('60');
  const [newUrl, setNewUrl] = useState('');
  const [newProvider, setNewProvider] = useState('zoom');

  // Topic submission
  const [topicText, setTopicText] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  const upcomingEvents = events.filter(e => isFuture(new Date(e.event_date)) || e.status === 'live');
  const pastEvents = events.filter(e => isPast(new Date(e.event_date)) && e.status !== 'live');

  const handleCreateEvent = async () => {
    if (!newTitle || !newDate) return;
    const [hours, minutes] = newTime.split(':').map(Number);
    const eventDate = new Date(newDate);
    eventDate.setHours(hours, minutes, 0, 0);

    await createEvent({
      title: newTitle,
      description: newDesc || null,
      event_date: eventDate.toISOString(),
      duration_minutes: parseInt(newDuration),
      meeting_url: newUrl || null,
      meeting_provider: newProvider,
    });
    setCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewDate(undefined);
    setNewUrl('');
  };

  const handleSubmitTopic = async () => {
    if (!topicText.trim()) return;
    await submitTopic({ topic: topicText.trim(), description: topicDesc.trim() || undefined });
    setTopicText('');
    setTopicDesc('');
    setTopicDialogOpen(false);
  };

  const canSubmitTopic = (eventDate: string) => {
    const deadline = addHours(new Date(eventDate), -12);
    return isAfter(deadline, new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live Calls & Kalender</h1>
          <p className="text-muted-foreground mt-1">Wöchentliche Live-Sessions, Workshops & Q&A</p>
        </div>
        {isStaff && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Neues Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Neues Live-Event erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Event-Titel" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <Textarea placeholder="Beschreibung (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start", !newDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDate ? format(newDate, 'dd.MM.yyyy') : 'Datum wählen'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newDate} onSelect={setNewDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-28" />
                </div>
                <div className="flex gap-3">
                  <Input type="number" placeholder="Dauer (Min.)" value={newDuration} onChange={e => setNewDuration(e.target.value)} className="w-32" />
                  <select value={newProvider} onChange={e => setNewProvider(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Teams</option>
                  </select>
                </div>
                <Input placeholder="Meeting-URL (Zoom/Meet Link)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                <Button onClick={handleCreateEvent} disabled={!newTitle || !newDate} className="w-full">
                  Event erstellen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Anstehende Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Keine anstehenden Events</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="relative overflow-hidden">
                {event.status === 'live' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      {event.description && (
                        <CardDescription className="mt-1 line-clamp-2">{event.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {event.status === 'live' && <Badge variant="destructive">LIVE</Badge>}
                      <Badge variant="secondary" className="capitalize">{event.meeting_provider || 'zoom'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {format(new Date(event.event_date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(event.event_date), 'HH:mm')} Uhr · {event.duration_minutes} Min.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {event.registration_count} Teilnehmer
                    {event.max_participants && ` / ${event.max_participants}`}
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 flex-wrap">
                    {event.is_registered ? (
                      <>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Angemeldet
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => unregister(event.id)}>Abmelden</Button>
                        {event.meeting_url && event.status === 'live' && (
                          <Button size="sm" asChild>
                            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Video className="h-3.5 w-3.5 mr-1.5" /> Teilnehmen
                            </a>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" onClick={() => register(event.id)}>
                        <Users className="h-3.5 w-3.5 mr-1.5" /> Anmelden
                      </Button>
                    )}

                    {canSubmitTopic(event.event_date) && (
                      <Dialog open={topicDialogOpen && selectedEventId === event.id} onOpenChange={(open) => { setTopicDialogOpen(open); if (open) setSelectedEventId(event.id); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Thema einreichen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Thema für "{event.title}" einreichen</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 pt-2">
                            <Input placeholder="Dein Thema" value={topicText} onChange={e => setTopicText(e.target.value)} />
                            <Textarea placeholder="Kurze Beschreibung (optional)" value={topicDesc} onChange={e => setTopicDesc(e.target.value)} />
                            <Button onClick={handleSubmitTopic} disabled={!topicText.trim()} className="w-full">Einreichen</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {event.meeting_url && !event.is_registered && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Link
                        </a>
                      </Button>
                    )}

                    {isStaff && (
                      <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Show submitted topics */}
                  {selectedEventId === event.id && topics.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Eingereichte Themen</p>
                      {topics.map(t => (
                        <div key={t.id} className="text-sm p-2 bg-muted rounded-lg">
                          <span className="font-medium">{t.topic}</span>
                          {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Vergangene Events</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pastEvents.slice(0, 6).map(event => (
              <Card key={event.id} className="opacity-70">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), 'dd.MM.yyyy HH:mm', { locale: de })} · {event.registration_count} Teilnehmer
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Abgeschlossen</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
