# Wizard's Choice - README

## Overview

Wizard's Choice is a tactical choice-driven wizard duel game where strategic spell selection shapes your path to magical supremacy. This browser-based game features fast decisions, spell progression trees, and engaging magical battles with responsive visuals powered by ThreeJS.

## Features

- **Strategic Spell System**: Choose from 15 unique spells across 5 elemental categories
- **Progression System**: Unlock new spells as you win duels and advance through wizard ranks
- **AI Opponents**: Face off against opponents with different difficulty levels and strategies
- **Immersive Visuals**: Experience magical duels with ThreeJS-powered visuals and spell effects
- **Achievement System**: Earn achievements by accomplishing specific goals in the game

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/wizards-choice.git
```

2. Navigate to the project directory:
```
cd wizards-choice
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm run dev
```

5. Open your browser and navigate to `http://localhost:8080`

## Building for Production

To build the project for production:

```
npm run build
```

The built files will be in the `dist` directory.

## Documentation

- [Game Design Document](./docs/game_design_document.md): Detailed design specifications
- [Code Documentation](./docs/code_documentation.md): Technical documentation of the codebase
- [User Guide](./docs/user_guide.md): Instructions for players

## Project Structure

```
wizards-choice/
├── src/
│   ├── js/
│   │   ├── core/           # Core game mechanics
│   │   ├── managers/       # Game management systems
│   │   ├── ui/             # User interface components
│   │   ├── testing/        # Testing and debugging utilities
│   │   └── main.js         # Main entry point
│   ├── css/                # Styling
│   ├── assets/             # Game assets
│   └── index.html          # Main HTML file
├── docs/                   # Documentation
└── package.json            # Project configuration
```

## Technologies Used

- **ThreeJS**: For 3D rendering and visual effects
- **JavaScript (ES6+)**: Core programming language
- **HTML5/CSS3**: For structure and styling
- **Webpack**: For bundling and building

## Future Development

The game is designed with future expansion in mind:
- Multiplayer functionality
- Additional spell elements and tiers
- Tournament mode
- Custom spell creation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by choice-driven tactical games like Reigns
- Special thanks to the ThreeJS community for their excellent documentation and examples
