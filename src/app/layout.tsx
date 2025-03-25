// src/app/layout.tsx
import '../lib/ui/styles/main.css';

export const metadata = {
  title: 'Wizard\'s Choice',
  description: 'A tactical choice-driven strategy game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
