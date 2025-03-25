'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Import CSS
import '../styles/style.css'
import '../styles/enhanced-style.css'
import '../styles/scene-overlay.css'

// Create a dynamic import for the Game component to avoid SSR issues with ThreeJS
const GameComponent = dynamic(
  () => import('../components/GameComponent'),
  { ssr: false }
)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {isLoading ? (
        <div className="loading-screen">
          <h1 className="text-4xl font-bold mb-4 text-center">Wizard&apos;s Choice</h1>
          <div className="loading-spinner"></div>
          <p className="mt-4 text-center">Loading magical elements...</p>
        </div>
      ) : (
        <>
          <GameComponent />
          
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Wizard&apos;s Choice - A tactical choice-driven wizard duel game</p>
            <div className="mt-2">
              <Link href="/about" className="text-blue-500 hover:text-blue-700 mr-4">
                About
              </Link>
              <Link href="/guide" className="text-blue-500 hover:text-blue-700">
                User Guide
              </Link>
            </div>
          </footer>
        </>
      )}
    </main>
  )
}
