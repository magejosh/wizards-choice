'use client'

import { useEffect } from 'react'
import { initializeAdapter } from '../lib/threeAdapter'

export default function GameInitializer({ children }) {
  useEffect(() => {
    // Initialize the ThreeJS adapter when the component mounts
    initializeAdapter()
    
    // Clean up function
    return () => {
      // Any cleanup needed when component unmounts
      if (window.gameInstance && window.gameInstance.sceneManager) {
        window.gameInstance.sceneManager.dispose()
      }
    }
  }, [])
  
  return <>{children}</>
}
