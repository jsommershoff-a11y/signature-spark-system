import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Trash2, BookOpen, Hash, FileText, Clapperboard } from 'lucide-react';
import { useSocialLibrary } from '@/hooks/useSocialLibrary';
import { CreateLibraryItemDialog } from './CreateLibraryItemDialog';
import { CreatePostDialog } from './CreatePostDialog';
import type { LibraryItemType, SocialLibraryItem } from '@/types/social';

const CATEGORIES: { type: LibraryItemType; label: string; icon: React.ReactNode }[] = [
  { type: 'hook', label: 'Hooks', icon: <span className="text-sm">🪝</span> },
  { type: 'template', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
  { type: 'hashtag', label: 'Hashtags', icon: <Hash className="h-4 w-4" /> },
  { type: 'story', label: 'Story Scripts', icon: <Clapperboard className="h-4 w-4" /> },
];

export function LibraryTab() {
  const { items, isLoading, deleteItem } = useSocialLibrary();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-module-green" />
            Content-Bibliothek
          </CardTitle>
          <CreateLibraryItemDialog />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <Tabs defaultValue="hook">
            <TabsList className="bg-muted/50 mb-4">
              {CATEGORIES.map(c => (
                <TabsTrigger key={c.type} value={c.type} className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
                  {c.icon} {c.label}
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px]">
                    {items.filter(i => i.type === c.type).length}
                  </Badge>
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
                    <div className="col-span-full text-center py-12">
                      <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                        {c.icon}
                      </div>
                      <p className="text-muted-foreground font-medium">Noch keine {c.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">Erstelle deinen ersten Eintrag.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function LibraryItemCard({ item, onDelete }: { item: SocialLibraryItem; onDelete: () => void }) {
  return (
    <Card className="border hover:border-module-green/30 transition-colors group">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="truncate">{item.title}</span>
          {item.tags?.length > 0 && (
            <Badge variant="outline" className="text-[10px] shrink-0 border-module-green/30 text-module-green">
              {item.tags[0]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.content}</p>
        <div className="flex gap-1">
          <CreatePostDialog
            prefill={{
              title: item.title,
              hook: item.type === 'hook' ? item.content || '' : undefined,
              caption: item.type === 'template' ? item.content || '' : undefined,
            }}
            trigger={
              <Button size="sm" variant="outline" className="text-xs hover:border-module-green hover:text-module-green">
                <Copy className="h-3 w-3 mr-1" /> In Post
              </Button>
            }
          />
          <Button size="sm" variant="ghost" className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
