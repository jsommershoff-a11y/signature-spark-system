import { ReactNode } from "react";
import { isPublicPricingEnabled } from "@/config/feature-flags";

/**
 * Wrapper, der Kinder nur rendert, wenn öffentliche Preisanzeigen aktiviert sind.
 * Optional kann ein Fallback (z.B. CTA ins Portal) angezeigt werden.
 */
type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const PricingGate = ({ children, fallback = null }: Props) => {
  if (!isPublicPricingEnabled()) return <>{fallback}</>;
  return <>{children}</>;
};

export default PricingGate;
