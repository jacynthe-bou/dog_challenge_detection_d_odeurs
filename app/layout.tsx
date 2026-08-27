import "./globals.css";

export const metadata = {
  title: "Dog Challenge",
  description: "Défis de détection d'odeurs pour chiens"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
