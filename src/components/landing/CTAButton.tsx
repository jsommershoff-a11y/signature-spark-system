import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "lg";
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ children, onClick, className, size = "lg" }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        size={size}
        className={cn(
          "bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary",
          "text-primary-foreground font-semibold text-lg px-8 py-6",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "rounded-lg",
          className
        )}
      >
        {children}
      </Button>
    );
  }
);

CTAButton.displayName = "CTAButton";
