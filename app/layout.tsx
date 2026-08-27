import "./globals.css";
import "./visual-overrides.css";
import "./brand-fix.css";

export const metadata = {
  title: "Sniff and Fun Challenge",
  description: "Défi de détection d'odeurs pour chiens"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
