import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/social/CalendarView';
import { ListView } from '@/components/social/ListView';
import { LibraryTab } from '@/components/social/LibraryTab';
import { GeneratorTab } from '@/components/social/GeneratorTab';
import { SettingsTab } from '@/components/social/SettingsTab';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { Calendar, List, BookOpen, Sparkles, Settings } from 'lucide-react';

export default function SocialMedia() {
  const { posts, isLoading } = useSocialPosts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Social Media</h1>
        <p className="text-muted-foreground">Content planen, erstellen und veröffentlichen</p>
      </div>
      <Tabs defaultValue="kalender">
        <TabsList>
          <TabsTrigger value="kalender" className="gap-1"><Calendar className="h-4 w-4" /> Kalender</TabsTrigger>
          <TabsTrigger value="liste" className="gap-1"><List className="h-4 w-4" /> Liste</TabsTrigger>
          <TabsTrigger value="bibliothek" className="gap-1"><BookOpen className="h-4 w-4" /> Bibliothek</TabsTrigger>
          <TabsTrigger value="generator" className="gap-1"><Sparkles className="h-4 w-4" /> Generator</TabsTrigger>
          <TabsTrigger value="einstellungen" className="gap-1"><Settings className="h-4 w-4" /> Einstellungen</TabsTrigger>
        </TabsList>
        <TabsContent value="kalender">
          {isLoading ? <div className="text-center py-8 text-muted-foreground">Lade Posts...</div> : <CalendarView posts={posts} />}
        </TabsContent>
        <TabsContent value="liste">
          <ListView posts={posts} />
        </TabsContent>
        <TabsContent value="bibliothek"><LibraryTab /></TabsContent>
        <TabsContent value="generator"><GeneratorTab /></TabsContent>
        <TabsContent value="einstellungen"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
