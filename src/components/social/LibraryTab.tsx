import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy } from 'lucide-react';
import { useSocialLibrary } from '@/hooks/useSocialLibrary';
import { CreateLibraryItemDialog } from './CreateLibraryItemDialog';
import { CreatePostDialog } from './CreatePostDialog';
import type { LibraryItemType, SocialLibraryItem } from '@/types/social';

const CATEGORIES: { type: LibraryItemType; label: string }[] = [
  { type: 'hook', label: 'Hooks' },
  { type: 'template', label: 'Templates' },
  { type: 'hashtag', label: 'Hashtags' },
  { type: 'story', label: 'Story Scripts' },
];

export function LibraryTab() {
  const { items, isLoading, deleteItem } = useSocialLibrary();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Content-Bibliothek</h2>
        <CreateLibraryItemDialog />
      </div>
      <Tabs defaultValue="hook">
        <TabsList>
          {CATEGORIES.map(c => (
            <TabsTrigger key={c.type} value={c.type}>
              {c.label} ({items.filter(i => i.type === c.type).length})
            </TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map(c => (
          <TabsContent key={c.type} value={c.type}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.filter(i => i.type === c.type).map(item => (
                <LibraryItemCard key={item.id} item={item} onDelete={() => deleteItem.mutate(item.id)} />
              ))}
              {items.filter(i => i.type === c.type).length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">Noch keine {c.label} gespeichert</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function LibraryItemCard({ item, onDelete }: { item: SocialLibraryItem; onDelete: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          {item.title}
          {item.tags?.length > 0 && <Badge variant="secondary" className="text-[10px]">{item.tags[0]}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.content}</p>
        <div className="flex gap-1">
          <CreatePostDialog
            prefill={{ title: item.title, hook: item.type === 'hook' ? item.content || '' : undefined, caption: item.type === 'template' ? item.content || '' : undefined }}
            trigger={<Button size="sm" variant="outline" className="text-xs"><Copy className="h-3 w-3 mr-1" /> In Post</Button>}
          />
          <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={onDelete}>Löschen</Button>
        </div>
      </CardContent>
    </Card>
  );
}
