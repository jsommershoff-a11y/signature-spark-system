import { Bell, Check, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  "lead.created": "Neuer Lead",
  "payment.received": "Zahlungseingang",
  "mail.reply": "Mail-Antwort",
  "task.assigned": "Aufgabe zugewiesen",
  "call.scheduled": "Termin geplant",
  "offer.accepted": "Angebot angenommen",
  "system": "System",
};

export function NotificationsCenter() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10 h-9 w-9 md:h-10 md:w-10"
          aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Benachrichtigungen</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Alle gelesen
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[480px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Keine Benachrichtigungen.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onRead={markRead} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface RowProps {
  notification: Notification;
  onRead: (id: string) => void | Promise<void>;
}

function NotificationRow({ notification: n, onRead }: RowProps) {
  const isUnread = n.read_at === null;
  const baseClass = `block p-4 transition-colors ${
    isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
  }`;

  const content = (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {TYPE_LABELS[n.type] ?? n.type}
          </span>
          {isUnread && (
            <span
              className="w-2 h-2 rounded-full bg-primary shrink-0"
              aria-label="ungelesen"
            />
          )}
        </div>
        <p className="text-sm font-medium leading-tight">{n.title}</p>
        {n.body && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {format(new Date(n.created_at), "dd.MM. HH:mm", { locale: de })}
        </p>
      </div>
      {isUnread && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRead(n.id);
          }}
          aria-label="Als gelesen markieren"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  if (n.link) {
    return (
      <Link
        to={n.link}
        className={baseClass}
        onClick={() => isUnread && onRead(n.id)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={baseClass}
      role="button"
      tabIndex={0}
      onClick={() => isUnread && onRead(n.id)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && isUnread) onRead(n.id);
      }}
    >
      {content}
    </div>
  );
}
