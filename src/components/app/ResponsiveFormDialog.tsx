import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ResponsiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Max width on desktop (Dialog only). Defaults to "max-w-2xl". */
  desktopMaxWidth?: string;
  /** Use a sticky submit footer on mobile. Pass the submit/cancel buttons here. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a centered Dialog on desktop and a full-height bottom Sheet on mobile.
 *
 * Mobile UX optimizations:
 *  - Bottom-sheet pattern (familiar mobile gesture, easier reach with thumb).
 *  - 90vh height with internal scroll, header sticks visually at top.
 *  - Sticky submit-bar at the bottom (above home-indicator via safe-area).
 *  - Single-column form layout is the caller's responsibility (use grid-cols-1 md:grid-cols-2).
 */
export function ResponsiveFormDialog({
  open,
  onOpenChange,
  title,
  description,
  desktopMaxWidth = 'max-w-2xl',
  footer,
  children,
  className,
}: ResponsiveFormDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            'h-[92vh] p-0 flex flex-col rounded-t-2xl',
            'gap-0 border-t border-border/40',
            className
          )}
        >
          <SheetHeader className="px-4 pt-5 pb-3 border-b border-border/40 text-left">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm">{description}</SheetDescription>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {children}
          </div>

          {footer && (
            <div
              className="border-t border-border/40 bg-background px-4 py-3"
              style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
            >
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(desktopMaxWidth, 'max-h-[90vh] overflow-y-auto', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
