import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSipgate } from '@/hooks/useSipgate';
import { Phone, Loader2 } from 'lucide-react';

interface ClickToCallButtonProps {
  phoneNumber: string;
  leadId?: string;
  leadName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

export function ClickToCallButton({
  phoneNumber,
  leadId,
  leadName,
  variant = 'outline',
  size = 'sm',
}: ClickToCallButtonProps) {
  const { initiateCall, getDevices, isLoading } = useSipgate();
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<Array<{ id: string; alias: string }>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [callee, setCallee] = useState(phoneNumber);

  useEffect(() => {
    if (open) {
      setCallee(phoneNumber);
      getDevices().then((d) => {
        setDevices(d);
        if (d.length > 0) setSelectedDevice(d[0].id);
      });
    }
  }, [open, phoneNumber]);

  const handleCall = async () => {
    if (!selectedDevice || !callee) return;
    const success = await initiateCall(callee, selectedDevice, leadId);
    if (success) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} title={`Anrufen: ${phoneNumber}`}>
          <Phone className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Anrufen</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Sipgate Click-to-Call
            {leadName && (
              <span className="text-muted-foreground font-normal"> — {leadName}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Zielnummer</Label>
            <Input
              value={callee}
              onChange={(e) => setCallee(e.target.value)}
              placeholder="+49..."
            />
          </div>

          <div className="space-y-2">
            <Label>Gerät / Nebenstelle</Label>
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Geräte gefunden. Bitte testen Sie die Verbindung zuerst.
              </p>
            ) : (
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Gerät wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.alias || d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            onClick={handleCall}
            disabled={isLoading || !selectedDevice || !callee}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            Jetzt anrufen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
