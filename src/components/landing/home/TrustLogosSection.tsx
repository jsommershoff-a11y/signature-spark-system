import n8nLogo from "@/assets/trust/n8n.png";
import makeLogo from "@/assets/trust/make.png";
import stripeLogo from "@/assets/trust/stripe.png";
import paypalLogo from "@/assets/trust/paypal.png";
import chatgptLogo from "@/assets/trust/chatgpt.png";
import gdriveLogo from "@/assets/trust/gdrive.png";
import outlookLogo from "@/assets/trust/outlook.png";
import excelLogo from "@/assets/trust/excel.png";
import gsheetsLogo from "@/assets/trust/gsheets.png";

const tools = [
  { name: "n8n", logo: n8nLogo },
  { name: "Make", logo: makeLogo },
  { name: "Stripe", logo: stripeLogo },
  { name: "PayPal", logo: paypalLogo },
  { name: "ChatGPT", logo: chatgptLogo },
  { name: "Google Drive", logo: gdriveLogo },
  { name: "Outlook", logo: outlookLogo },
  { name: "Excel", logo: excelLogo },
  { name: "Google Sheets", logo: gsheetsLogo },
];

export const TrustLogosSection = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border/30">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Unsere Tools & Automatisierungen – powered by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {tools.map((tool) => (
            <div key={tool.name} className="group flex flex-col items-center gap-2">
              <img
                src={tool.logo}
                alt={tool.name}
                className="h-10 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
              />
              <span className="text-xs text-muted-foreground">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
