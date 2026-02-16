import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Eye, EyeOff } from 'lucide-react';
import type { Offer, ProgressUpdate, OfferContent } from '@/types/offers';

interface ProgressTrackerProps {
  offer: Offer;
  onUpdate: (updatedJson: OfferContent) => Promise<void>;
}

export function ProgressTracker({ offer, onUpdate }: ProgressTrackerProps) {
  const offerJson = offer.offer_json;
  const variableData = offerJson?.variable_offer_data;
  
  const [progress, setProgress] = useState(variableData?.progress_percent ?? 0);
  const [updates, setUpdates] = useState<ProgressUpdate[]>(variableData?.progress_updates ?? []);
  const [newText, setNewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addUpdate = () => {
    if (!newText.trim()) return;
    setUpdates(prev => [...prev, {
      date: new Date().toISOString(),
      text: newText.trim(),
      author: 'Mitarbeiter',
      published: false,
    }]);
    setNewText('');
  };

  const togglePublished = (index: number) => {
    setUpdates(prev => prev.map((u, i) => i === index ? { ...u, published: !u.published } : u));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: OfferContent = {
        ...offerJson,
        variable_offer_data: {
          ...variableData!,
          progress_percent: progress,
          progress_updates: updates,
        },
      };
      await onUpdate(updated);
    } finally {
      setIsSaving(false);
    }
  };

  if (!variableData) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fortschritt & Dokumentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fortschritt</Label>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
          <Slider value={[progress]} onValueChange={v => setProgress(v[0])} max={100} step={5} />
        </div>

        <Separator />

        {/* Add Update */}
        <div className="space-y-2">
          <Label>Neues Update</Label>
          <div className="flex gap-2">
            <Textarea placeholder="Was wurde erledigt?" rows={2} value={newText} onChange={e => setNewText(e.target.value)} className="flex-1" />
            <Button type="button" variant="outline" size="icon" onClick={addUpdate} disabled={!newText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Updates List */}
        {updates.length > 0 && (
          <div className="space-y-2">
            <Label>Updates</Label>
            {updates.map((u, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                <div className="flex-1">
                  <p>{u.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(u.date).toLocaleDateString('de-DE')} · {u.author}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={u.published ? 'default' : 'secondary'} className="text-xs">
                    {u.published ? <><Eye className="h-3 w-3 mr-1" />Sichtbar</> : <><EyeOff className="h-3 w-3 mr-1" />Intern</>}
                  </Badge>
                  <Switch checked={u.published} onCheckedChange={() => togglePublished(i)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Speichern...' : 'Fortschritt aktualisieren'}
        </Button>
      </CardContent>
    </Card>
  );
}
