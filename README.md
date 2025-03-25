# Wizard's Choice - README

## Overview

Wizard's Choice is a tactical choice-based strategy game where players engage in wizard duels through strategic spell selection. The game features fast-paced battles, progression through spell trees, and an engaging fantasy theme.

## Features

- **Strategic Spell Selection**: Choose from a variety of spells with different elemental types and effects
- **Progression System**: Level up your wizard and unlock more powerful spells
- **Equipment System**: Customize your wizard with wands, robes, amulets, and rings
- **Multiple Difficulty Levels**: Challenge yourself with different AI opponent strategies
- **Save System**: Multiple save slots to track different game progressions
- **Responsive Design**: Play on any device with a responsive UI
- **3D Battle Arena**: Engaging visual experience with ThreeJS

## Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/magejosh/wizards-choice.git
cd wizard-choice
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Accounts

For testing purposes, the following accounts are available:

- Admin: username: `admin`, password: `admin123`
- Player 1: username: `player1`, password: `player123`
- Player 2: username: `player2`, password: `player123`

## Game Mechanics

### Spell System

Spells are categorized into 10 tiers, with higher tiers offering more powerful effects at increased mana costs. Each spell has:
- Name
- Type (damage, healing, buff, debuff)
- Elemental type (fire, water, arcane, etc.)
- Mana cost
- Effects
- Description

### Combat

Battles are turn-based with each wizard selecting one spell per turn. The combat system includes:
- Health and mana management
- Mana regeneration each turn
- Option to discard a spell for a "mystic punch"
- Reaction spells that can be cast outside normal turn order

### Progression

As you win duels, you gain experience points to level up. Each level-up grants points to enhance:
- Maximum Health
- Maximum Mana
- Mana Regeneration

### Equipment

Equip items to enhance your wizard's capabilities:
- Wands: Affect spell power and mana costs
- Robes: Provide health bonuses and damage reduction
- Amulets: Grant special abilities
- Rings: Offer various passive bonuses

## Development

### Project Structure

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

### Key Technologies

- **Next.js**: React framework for the application
- **ThreeJS**: 3D rendering library for the battle arena
- **Zustand**: State management
- **TypeScript**: Type safety throughout the codebase

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `.next`
4. Deploy the site

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js settings
3. Deploy the site

### Hostinger VPS

1. SSH into your VPS
2. Clone the repository
3. Install dependencies with `npm install`
4. Build the application with `npm run build`
5. Install PM2 with `npm install -g pm2`
6. Start the application with `pm2 start npm -- start`
7. Configure Nginx as a reverse proxy to the Next.js application

## Future Development

The codebase is designed to be extensible for future features:

- **Multiplayer Mode**: Challenge friends to wizard duels
- **Additional Spells**: Expand the spell library to 120 unique spells
- **New Equipment**: Add more wands, robes, amulets, and rings
- **Enhanced AI**: More sophisticated opponent strategies
- **Mobile App**: Native mobile applications

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by choice-driven tactical games like _Reigns_
- Fantasy wizard duels from classic literature and games
