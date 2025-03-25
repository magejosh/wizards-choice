# Wizard's Choice - Technical Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Code Structure](#code-structure)
4. [Authentication System](#authentication-system)
5. [Game State Management](#game-state-management)
6. [Spell System](#spell-system)
7. [Combat Engine](#combat-engine)
8. [3D Battle System](#3d-battle-system)
9. [Equipment System](#equipment-system)
10. [UI Components](#ui-components)
11. [Best Practices](#best-practices)
12. [Deployment Guide](#deployment-guide)
13. [Admin Guide](#admin-guide)
14. [Future Development](#future-development)

## Introduction

Wizard's Choice is a tactical choice-based strategy game where players engage in wizard duels through strategic spell selection. This document provides comprehensive technical documentation for developers working on the codebase.

## Architecture Overview

The game is built using Next.js with React for the frontend and uses ThreeJS for 3D visualizations. The architecture follows these key principles:

1. **Separation of Concerns**: Game logic is separated from UI rendering to facilitate future multiplayer expansion.
2. **State Management**: Game state is managed through a centralized store with persistence capabilities.
3. **Modular Design**: Components and features are organized into logical modules for maintainability.
4. **Type Safety**: TypeScript is used throughout to ensure type safety and improve developer experience.

## Code Structure

The codebase is organized as follows:

```
wizard-choice/
├── docs/                    # Documentation files
├── public/                  # Static assets
│   └── images/              # Game images including spell cards
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Shared React components
│   └── lib/                 # Core game logic and utilities
│       ├── auth/            # Authentication services
│       ├── combat/          # Combat engine and mechanics
│       ├── equipment/       # Equipment data and utilities
│       ├── features/        # Game features (AI, procedural generation, etc.)
│       ├── game-state/      # Game state management
│       ├── spells/          # Spell data and utilities
│       ├── ui/              # UI-specific components and utilities
│       └── wizard/          # Wizard character logic
```

## Authentication System

The authentication system provides user management with login, registration, and admin capabilities. For development, it uses IndexedDB for persistent storage with demo accounts.

### Demo Accounts
- Admin: username: `admin`, password: `admin123`
- Player 1: username: `player1`, password: `player123`
- Player 2: username: `player2`, password: `player123`

### Key Features
- User registration and login with secure password hashing (bcryptjs)
- Persistent game state storage in IndexedDB tied to user accounts
- Admin functionality for user management
- Client-side compatibility with Next.js server-side rendering
- Proper loading states and error handling

### Best Practices
- **AXIOM 1**: All passwords are properly hashed using bcryptjs with a salt factor of 10.
- **AXIOM 2**: Separate authentication logic from game logic for better security boundaries.
- **AXIOM 3**: Always validate user input on both client and server sides.
- **AXIOM 4**: Check for browser API availability with `typeof window !== 'undefined'` for Next.js compatibility.

## Game State Management

Game state is managed through a centralized store using Zustand, which provides:

1. Persistent game state across sessions
2. Multiple save slots per user
3. Automatic saving at key game points
4. Clean separation between UI and game logic

### Best Practices
- **AXIOM 5**: Game state should be immutable; create new state objects rather than mutating existing ones.
- **AXIOM 6**: Separate UI state from game logic state for cleaner architecture.
- **AXIOM 7**: Implement auto-save functionality at natural break points in gameplay.

## Spell System

The spell system is designed to be extensible and balanced, with 10 tiers of spells (expandable to 120 spells).

### Key Features
- Spell tiers with increasing power and complexity
- Elemental types with strategic advantages
- Mana cost scaling based on spell power
- Spell synergies for strategic depth

### Best Practices
- **AXIOM 8**: Balance spell power through a combination of mana cost, damage, and effects.
- **AXIOM 9**: Design spells in sets with complementary effects to encourage strategic combinations.
- **AXIOM 10**: Maintain clear documentation of spell effects and interactions for future expansion.

## Combat Engine

The combat engine handles turn-based duels between wizards with:

1. Turn management
2. Spell casting and effects
3. Health and mana tracking
4. AI opponent decision making
5. Combat resolution

### AI System

Enemy wizards utilize a sophisticated AI system with three distinct strategies:

1. **Defensive Strategy**: Prioritizes healing and buffs when health is low, with selective use of damage spells.
2. **Aggressive Strategy**: Focuses on high-damage spells and debuffs, with minimal health management.
3. **Balanced Strategy**: Adaptively chooses spells based on the combat situation, with a mix of all spell types.

The AI system implements the Strategy pattern, allowing for easy expansion with new strategies.

### Best Practices
- **AXIOM 11**: Separate combat logic from visual effects for cleaner code and easier testing.
- **AXIOM 12**: Implement AI difficulty levels through strategy patterns rather than hardcoded behaviors.
- **AXIOM 13**: Use event-based systems for combat effects to allow for extensibility.

## 3D Battle System

The battle system provides an immersive 3D experience using Three.js via React Three Fiber.

### Components
1. **BattleScene**: Manages the overall 3D scene, including lighting, environment, and camera.
2. **WizardModel**: Renders 3D wizard models with health bars and animations.
3. **SpellEffect3D**: Creates dynamic spell effects based on spell type and element.

### Key Features
- **Real-time Animations**: Wizards and spells animate based on battle state and actions.
- **Element-based Effects**: Spell effects are visually distinct based on their elemental type.
- **Visual Feedback**: Damage and healing numbers appear and float upward for clear feedback.
- **Health Visualization**: Health bars dynamically update with color coding for remaining health.
- **Turn Indicators**: Visual cues show which wizard is actively taking their turn.

### Technical Implementation
- Three.js is used for 3D rendering through React Three Fiber
- useFrame hook manages animations and effect lifetimes
- Component-based architecture for reusable 3D elements
- GPU-accelerated particle effects for spell casting
- Dynamic lighting and environment settings

### Best Practices
- **AXIOM 31**: Batch 3D model updates to minimize render calls and optimize performance.
- **AXIOM 32**: Use instanced meshes for particle effects to improve rendering efficiency.
- **AXIOM 33**: Implement proper cleanup for 3D effects to prevent memory leaks.
- **AXIOM 34**: Scale visual complexity based on device performance capabilities.

## Equipment System

The equipment system allows players to customize their wizard with:

1. Wands (affecting spell power and mana regeneration)
2. Robes (affecting health and damage reduction)
3. Amulets (providing special abilities)
4. Rings (offering passive bonuses)

### Best Practices
- **AXIOM 14**: Design equipment bonuses to complement different play styles rather than having clear "best" items.
- **AXIOM 15**: Implement equipment as composable modifiers to wizard stats for flexibility.
- **AXIOM 16**: Balance equipment bonuses against progression to maintain game challenge.

## UI Components

UI components are built with React and styled for a responsive, engaging experience.

### Key Components
- Main Menu
- Battle Arena
- Wizard's Study
- Spell Cards
- Deck Builder
- Status Bars
- Settings Panel

### Deck Builder
The deck builder provides an intuitive interface for managing spells with:
- Filtering by spell type and element
- Sorting by various attributes (mana cost, tier, etc.)
- Visual indication of equipped spells with slot numbers
- Minimum of five spells required per deck
- Immediate feedback on spell selection and equipment
- Responsive layout adapting to different screen sizes

#### Deck Management System
The deck management system allows players to:
- Create multiple named decks for different strategies
- Save and load decks
- Equip a specific deck for combat
- Delete unwanted decks
- View all spells in their collection
- Track which deck is currently active
- Automatically save deck changes to persistent storage

#### Draw Mechanics
The deck system uses a discard pile mechanic:
- When a spell is cast, it goes to the discard pile
- Cards in the discard pile remain there until after the next draw step
- At the end of the draw step, cards in the discard pile are shuffled back into the deck
- Players and enemies then cast their first spell of the turn

Each deck requires a minimum of 5 spells to ensure the player maintains sufficient spell options throughout combat. Players start with a "Starter Deck" containing their first 5 spells, and can customize their decks as they collect more spells throughout the game.

### Best Practices
- **AXIOM 17**: Use the 'use client' directive for all components that use client-side hooks or interactivity.
- **AXIOM 18**: Break down complex components into smaller, focused components for better maintainability.
- **AXIOM 19**: Implement responsive design principles for all UI components.
- **AXIOM 20**: Separate styling concerns from component logic using CSS modules or styled components.

## Best Practices

### Code Organization
- **AXIOM 21**: Keep files focused on a single responsibility; break out functions when they grow beyond 50-100 lines.
- **AXIOM 22**: Use TypeScript interfaces to define clear contracts between components.
- **AXIOM 23**: Implement proper error handling throughout the application.
- **AXIOM 24**: Write unit tests for core game logic to ensure stability during development.

### Performance
- **AXIOM 25**: Optimize 3D rendering by using proper LOD (Level of Detail) techniques.
- **AXIOM 26**: Implement memoization for expensive calculations in the game logic.
- **AXIOM 27**: Use React's useMemo and useCallback hooks appropriately to prevent unnecessary re-renders.

### Accessibility
- **AXIOM 28**: Ensure proper color contrast for text and UI elements.
- **AXIOM 29**: Implement keyboard navigation for all interactive elements.
- **AXIOM 30**: Provide alternative text for images and visual elements.

## Deployment Guide

### Local Development
1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Access the application at `http://localhost:3000`

### Production Deployment

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `.next`
4. Deploy the site

#### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js settings
3. Deploy the site

#### Hostinger VPS
1. SSH into your VPS
2. Clone the repository
3. Install dependencies with `npm install`
4. Build the application with `npm run build`
5. Install PM2 with `npm install -g pm2`
6. Start the application with `pm2 start npm -- start`
7. Configure Nginx as a reverse proxy to the Next.js application

## Admin Guide

As an admin, you have access to additional functionality for managing the game:

1. **User Management**: View all registered users
2. **Password Reset**: Reset passwords for any user
3. **Game State Inspection**: View and modify game states for debugging

To access admin features:
1. Log in with the admin account (username: `admin`, password: `admin123`)
2. Navigate to the admin panel through the settings menu

## Future Development

The codebase is designed to be extensible for future features:

### Multiplayer Implementation
- The separation of game logic from UI facilitates adding multiplayer functionality
- The authentication system is ready for expansion to handle online users
- Combat engine can be extended to support player vs. player duels

### Content Expansion
- The spell system can be expanded to include all 120 planned spells
- Additional equipment items can be added to the equipment system
- New enemy wizards and creatures can be added to the procedural generation system

### Technical Improvements
- Implement server-side rendering for improved performance
- Add comprehensive test coverage
- Integrate with a proper database for production use
