import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/social/CalendarView';
import { ListView } from '@/components/social/ListView';
import { LibraryTab } from '@/components/social/LibraryTab';
import { GeneratorTab } from '@/components/social/GeneratorTab';
import { SettingsTab } from '@/components/social/SettingsTab';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { CalendarDays, List, BookOpen, Sparkles, Settings, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SocialMedia() {
  const { posts, isLoading } = useSocialPosts();

  const stats = {
    total: posts.length,
    ideen: posts.filter(p => p.status === 'idee').length,
    geplant: posts.filter(p => p.status === 'geplant').length,
    veroeffentlicht: posts.filter(p => p.status === 'veroeffentlicht').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-module-green flex items-center justify-center shadow-lg shadow-module-green/20">
          <Share2 className="h-6 w-6 text-module-green-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
          <p className="text-muted-foreground text-sm">Content planen, erstellen und veröffentlichen</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Gesamt', value: stats.total, color: 'border-module-green/30' },
          { label: 'Ideen', value: stats.ideen, color: 'border-muted' },
          { label: 'Geplant', value: stats.geplant, color: 'border-module-green-light/40' },
          { label: 'Veröffentlicht', value: stats.veroeffentlicht, color: 'border-module-green/60' },
        ].map(s => (
          <Card key={s.label} className={`p-4 border-l-4 ${s.color}`}>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{isLoading ? <Skeleton className="h-8 w-12" /> : s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kalender" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="kalender" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <CalendarDays className="h-4 w-4" /> Kalender
          </TabsTrigger>
          <TabsTrigger value="liste" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <List className="h-4 w-4" /> Liste
          </TabsTrigger>
          <TabsTrigger value="bibliothek" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <BookOpen className="h-4 w-4" /> Bibliothek
          </TabsTrigger>
          <TabsTrigger value="generator" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <Sparkles className="h-4 w-4" /> KI-Generator
          </TabsTrigger>
          <TabsTrigger value="einstellungen" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <Settings className="h-4 w-4" /> Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kalender">
          {isLoading ? (
            <Card className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            </Card>
          ) : (
            <CalendarView posts={posts} />
          )}
        </TabsContent>
        <TabsContent value="liste">
          <ListView posts={posts} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="bibliothek"><LibraryTab /></TabsContent>
        <TabsContent value="generator"><GeneratorTab /></TabsContent>
        <TabsContent value="einstellungen"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
