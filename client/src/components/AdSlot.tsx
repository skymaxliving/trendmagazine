/*
 * TrendMagazine.cz – Ad Slot Component
 * Prepared for Google AdSense integration
 * Positions: header, sidebar, in-article, footer
 * When AdSense is approved, replace placeholder with actual ad unit code
 */

interface AdSlotProps {
  position: "header" | "sidebar" | "in-article" | "footer";
  className?: string;
}

const adSizes: Record<string, { label: string; className: string }> = {
  header: { label: "Reklama – 728×90", className: "h-[90px] max-w-[728px]" },
  sidebar: { label: "Reklama – 300×250", className: "h-[250px] w-[300px]" },
  "in-article": { label: "Reklama", className: "h-[100px] w-full" },
  footer: { label: "Reklama – 728×90", className: "h-[90px] max-w-[728px]" },
};

export default function AdSlot({ position, className = "" }: AdSlotProps) {
  const config = adSizes[position];

  // In production with AdSense approved, this would render actual ad code:
  // <ins className="adsbygoogle" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX" />
  // For now, render a subtle placeholder that's invisible to users

  return (
    <div
      className={`mx-auto ${config.className} ${className}`}
      data-ad-position={position}
      aria-hidden="true"
    >
      {/* Google AdSense code will be inserted here after approval */}
      {/* 
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      */}
    </div>
  );
}
