'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Import CSS
import '../../styles/style.css'
import '../../styles/enhanced-style.css'

export default function GuidePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="max-w-4xl w-full">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="mr-2" size={16} />
          Return to Game
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 text-center">Wizard&apos;s Choice - User Guide</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Welcome to Wizard&apos;s Choice, a tactical choice-driven wizard duel game! This guide will help you 
            understand the game mechanics, spell system, and progression to become a master wizard.
          </p>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Main Menu</h3>
          <p className="mb-4">From the main menu, you can:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Start New Duel</strong>: Begin a new wizard duel</li>
            <li><strong>Spell Collection</strong>: View and manage your unlocked spells</li>
            <li><strong>Progression</strong>: View your wizard rank and achievements</li>
            <li><strong>Settings</strong>: Adjust game settings</li>
            <li><strong>Help</strong>: Access this user guide</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Game Basics</h2>
          <p className="mb-4">
            Wizard&apos;s Choice is a turn-based tactical game where you face off against AI opponents in magical duels. 
            Each turn, you&apos;ll select a spell to cast, and your opponent will do the same. The outcome is determined 
            immediately based on your choices.
          </p>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Resources</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Health</strong>: Represents your life force. When it reaches zero, you lose the duel.</li>
            <li><strong>Mana</strong>: Required to cast spells. Different spells cost different amounts of mana.</li>
            <li><strong>Spells</strong>: Your arsenal of magical abilities, which you&apos;ll unlock as you progress.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Game Flow</h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>Select difficulty level (Easy, Normal, Hard)</li>
            <li>Choose your spells for the duel</li>
            <li>Take turns casting spells against your opponent</li>
            <li>Win by reducing your opponent&apos;s health to zero</li>
            <li>Unlock new spells and progress through wizard ranks</li>
          </ol>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Spell System</h2>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Spell Types</h3>
          <p className="mb-4">Spells are divided into five elemental categories:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Fire</strong>: Offensive spells with high damage</li>
            <li><strong>Water</strong>: Balanced spells with moderate damage and healing</li>
            <li><strong>Earth</strong>: Defensive spells with strong healing effects</li>
            <li><strong>Air</strong>: Quick spells with mana restoration abilities</li>
            <li><strong>Arcane</strong>: Versatile spells with unique effects</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Spell Tiers</h3>
          <p className="mb-4">Each element has three tiers of spells:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Tier 1</strong>: Basic spells available from the start</li>
            <li><strong>Tier 2</strong>: Intermediate spells unlocked through progression</li>
            <li><strong>Tier 3</strong>: Advanced spells with powerful effects</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Progression System</h2>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Wizard Ranks</h3>
          <p className="mb-4">As you win duels, you&apos;ll progress through wizard ranks:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li><strong>Novice</strong>: Beginning rank</li>
            <li><strong>Apprentice</strong>: Requires 3 wins</li>
            <li><strong>Adept</strong>: Requires 7 wins</li>
            <li><strong>Expert</strong>: Requires 12 wins</li>
            <li><strong>Master</strong>: Requires 18 wins</li>
            <li><strong>Archmage</strong>: Requires 25 wins</li>
          </ol>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Unlocking Spells</h3>
          <p className="mb-4">After winning a duel, you have a chance to unlock a new spell:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Easy difficulty: 50% chance</li>
            <li>Normal difficulty: 75% chance</li>
            <li>Hard difficulty: 100% chance</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Battle Strategies</h2>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">For Beginners</h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li><strong>Balance your spell selection</strong>: Include both offensive and defensive spells</li>
            <li><strong>Manage your mana</strong>: Don&apos;t cast high-cost spells early unless necessary</li>
            <li><strong>Start with Easy difficulty</strong>: This gives you time to learn the game mechanics</li>
            <li><strong>Focus on one element</strong>: Unlocking a complete spell tree gives you powerful options</li>
          </ol>
          
          <h3 className="text-xl font-semibold mb-2 mt-6">Advanced Strategies</h3>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li><strong>Counter your opponent</strong>: Pay attention to your opponent&apos;s element focus and adapt</li>
            <li><strong>Mana efficiency</strong>: Calculate the damage or healing per mana point to maximize efficiency</li>
            <li><strong>Spell combinations</strong>: Plan sequences of spells that work well together</li>
            <li><strong>Adaptive play</strong>: Change your strategy based on how the battle is progressing</li>
          </ol>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Tips and Tricks</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The first spell you cast sets the tone for the battle</li>
            <li>Healing early is often better than healing when your health is low</li>
            <li>Different opponents have different elemental preferences</li>
            <li>Watch your opponent&apos;s mana - if it&apos;s low, they may not be able to cast powerful spells</li>
            <li>Achievements can help guide your progression path</li>
          </ul>
          
          <div className="mt-8 text-center">
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Return to Game
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
