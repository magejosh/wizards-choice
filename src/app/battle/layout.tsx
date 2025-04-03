import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 