// Adapter for ThreeJS to work with Next.js
// This file helps bridge the original game code with the React environment

import * as THREE from 'three';

// Make THREE available globally for the game code
if (typeof window !== 'undefined') {
  window.THREE = THREE;
}

// Create a global game instance container
if (typeof window !== 'undefined' && !window.gameInstance) {
  window.gameInstance = {};
}

// Adapter functions to handle DOM manipulation in React environment
export const DOMAdapter = {
  // Get element by ID with React-safe approach
  getElementById: (id) => {
    if (typeof document !== 'undefined') {
      return document.getElementById(id);
    }
    return null;
  },
  
  // Create element with React-safe approach
  createElement: (tag) => {
    if (typeof document !== 'undefined') {
      return document.createElement(tag);
    }
    return null;
  },
  
  // Add event listener with React-safe approach
  addEventListener: (element, event, handler) => {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler);
      return true;
    }
    return false;
  },
  
  // Remove event listener with React-safe approach
  removeEventListener: (element, event, handler) => {
    if (element && typeof element.removeEventListener === 'function') {
      element.removeEventListener(event, handler);
      return true;
    }
    return false;
  }
};

// Storage adapter to handle localStorage in React environment
export const StorageAdapter = {
  // Get item from localStorage with React-safe approach
  getItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  // Set item in localStorage with React-safe approach
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    return false;
  },
  
  // Remove item from localStorage with React-safe approach
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  }
};

// Animation frame adapter for React environment
export const AnimationAdapter = {
  // Request animation frame with React-safe approach
  requestAnimationFrame: (callback) => {
    if (typeof window !== 'undefined') {
      return window.requestAnimationFrame(callback);
    }
    return null;
  },
  
  // Cancel animation frame with React-safe approach
  cancelAnimationFrame: (id) => {
    if (typeof window !== 'undefined' && id) {
      window.cancelAnimationFrame(id);
      return true;
    }
    return false;
  }
};

// Event adapter to handle custom events in React environment
export const EventAdapter = {
  // Dispatch custom event with React-safe approach
  dispatchEvent: (eventName, detail) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
      return true;
    }
    return false;
  },
  
  // Add custom event listener with React-safe approach
  addEventListener: (eventName, handler) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(eventName, handler);
      return true;
    }
    return false;
  },
  
  // Remove custom event listener with React-safe approach
  removeEventListener: (eventName, handler) => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(eventName, handler);
      return true;
    }
    return false;
  }
};

// Export a function to initialize the adapter
export function initializeAdapter() {
  if (typeof window !== 'undefined') {
    // Add adapters to window for global access
    window.DOMAdapter = DOMAdapter;
    window.StorageAdapter = StorageAdapter;
    window.AnimationAdapter = AnimationAdapter;
    window.EventAdapter = EventAdapter;
    
    console.log('ThreeJS adapter initialized for Next.js environment');
    return true;
  }
  return false;
}
