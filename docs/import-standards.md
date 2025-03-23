# Import Path Standards for Wizard's Choice

## Import Types

### Relative Imports
- **Use for**:
  - Files in the same directory
  - Files in immediate parent/child directories (one level up/down)
  - Sibling modules within the same feature area
- **Format**: `./` for same directory, `../` for parent directory
- **Example**: 
  ```javascript
  import { SpellCard } from './SpellCard.js';
  import { BaseEffect } from '../effects/BaseEffect.js';
  ```

### Absolute Imports
- **Use for**:
  - Cross-module references (more than 2 directory levels apart)
  - Core utilities and shared components
  - Any imports that would require multiple `../` segments
- **Base path**: All absolute imports should start from `src/game/`
- **Example**:
  ```javascript
  import { GameManager } from 'src/game/managers/GameManager.js';
  import EnhancedSpellSystem from 'src/game/core/EnhancedSpellSystem.js';
  ```

## Import Order
1. External libraries/dependencies (if any)
2. Absolute imports (sorted alphabetically)
3. Relative imports (sorted alphabetically)
4. CSS/asset imports

Example:
```javascript
// External libraries first (if any)
import * as THREE from 'three';

// Absolute imports
import { AudioManager } from 'src/game/managers/AudioManager.js';
import { GameManager } from 'src/game/managers/GameManager.js';

// Relative imports
import { SpellCard } from './SpellCard.js';
import { BaseEffect } from '../effects/BaseEffect.js';

// CSS/asset imports (if applicable)
import '../styles/component.css';
```

## Named vs Default Exports
- Use **named exports** for most modules to allow for better static analysis and auto-imports
- Use **default exports** only for main component/class files where there is a clear primary export

## Import Statements Format
- Always include the `.js` file extension in import statements
- Use destructuring for named imports
- Group multiple imports from the same module

## Circular Dependencies
- Avoid circular dependencies between modules
- If circular references are unavoidable, use dependency injection or event systems

## Dynamic Imports
- Use dynamic imports only when necessary for code-splitting or lazy-loading
- Example:
  ```javascript
  async function loadSpellEffects() {
    const { FireEffect } = await import('src/game/effects/FireEffect.js');
    return new FireEffect();
  }
  ```
