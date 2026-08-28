import "./globals.css";
import "./visual-overrides.css";
import "./brand-fix.css";
import "./dashboard-polish.css";

export const metadata = {
  title: "Go Sniff Challenge",
  description: "Défis amusants de détection d’odeurs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
