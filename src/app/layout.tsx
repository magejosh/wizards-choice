'use client'

import { ReactNode } from 'react'
import GameInitializer from '../components/GameInitializer'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Wizard's Choice - A Tactical Wizard Duel Game</title>
        <meta name="description" content="A quick, choice-driven wizard duel game where strategic spell selection shapes your path to magical supremacy." />
      </head>
      <body>
        <GameInitializer>
          {children}
        </GameInitializer>
      </body>
    </html>
  )
}
