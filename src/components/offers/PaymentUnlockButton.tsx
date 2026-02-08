import { Button } from '@/components/ui/button';
import { Unlock, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentUnlockButtonProps {
  isUnlocked: boolean;
  onUnlock: () => Promise<void>;
  disabled?: boolean;
}

export function PaymentUnlockButton({ 
  isUnlocked, 
  onUnlock, 
  disabled 
}: PaymentUnlockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isUnlocked) return;
    
    setIsLoading(true);
    try {
      await onUnlock();
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnlocked) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Unlock className="h-4 w-4 text-green-600" />
        Zahlung freigeschaltet
      </Button>
    );
  }

  return (
    <Button 
      variant="default" 
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      Zahlung freischalten
    </Button>
  );
}
