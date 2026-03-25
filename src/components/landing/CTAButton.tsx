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
          "text-primary-foreground font-semibold text-lg px-10 py-6",
          "shadow-[0_0_24px_rgba(246,113,31,0.2)] hover:shadow-[0_0_40px_rgba(246,113,31,0.35)]",
          "transition-all duration-300 rounded-xl",
          className
        )}
      >
        {children}
      </Button>
    );
  }
);

CTAButton.displayName = "CTAButton";
