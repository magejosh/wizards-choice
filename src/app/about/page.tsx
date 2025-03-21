'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// Import CSS
import '../../styles/style.css'
import '../../styles/enhanced-style.css'

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">About Wizard&apos;s Choice</h1>
      
      <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Game Concept</h2>
        <p className="mb-4">
          Wizard&apos;s Choice is a tactical choice-driven wizard duel game where strategic spell selection 
          shapes your path to magical supremacy. Engage in fast-paced magical battles with lightweight, 
          atmospheric visuals powered by ThreeJS.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Strategic Spell System with 15 unique spells across 5 elemental categories</li>
          <li>Progression System that unlocks new spells as you win duels</li>
          <li>AI Opponents with different difficulty levels and strategies</li>
          <li>Immersive Visuals with ThreeJS-powered spell effects</li>
          <li>Achievement System to track your magical mastery</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Development</h2>
        <p className="mb-4">
          Wizard&apos;s Choice was developed as a browser-based game using modern web technologies.
          The game is built with JavaScript and ThreeJS for the core mechanics and visuals, and
          deployed as a Next.js application for optimal performance and accessibility.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Future Plans</h2>
        <p className="mb-4">
          The game is designed with future expansion in mind. Planned features include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Multiplayer duels against other players</li>
          <li>Additional spell elements and tiers</li>
          <li>Tournament mode with multiple opponents</li>
          <li>Custom spell creation</li>
        </ul>
        
        <div className="mt-8 text-center">
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Return to Game
          </Link>
        </div>
      </div>
    </main>
  )
}
