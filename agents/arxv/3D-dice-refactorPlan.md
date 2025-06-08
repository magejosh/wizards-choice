Okay, I've reviewed the `3D-dice/dice-box` documentation and your requirements. Here's the refined plan to replace the current dice system in `InitiativeRoll.tsx` and adjust the rolling logic:

**Phase 1: Setup & Integration**

1.  **Install Dependencies:**
    *   Install the core library: `npm install @3d-dice/dice-box`
    *   Manually copy static assets from `node_modules/@3d-dice/dice-box/src/assets/` to your project's `public/assets/dice-box/` directory. Ensure this path exists.

2.  **Refactor `InitiativeRoll.tsx` - Initial Setup:**
    *   Remove all imports and state related to Three.js and Cannon.js (`THREE`, `Cannon`, `useFrame`, scene refs, physics refs, etc.).
    *   Import `DiceBox` from `@3d-dice/dice-box`.
    *   Add state to manage the DiceBox instance (e.g., `diceBoxInstance`, initialized to `null`).
    *   Add state to track if the dice roll has been triggered (e.g., `rollTriggered`, default `false`).
    *   Add a container `div` in the JSX where the dice canvas will be rendered. Assign it a unique ID (e.g., `id="dice-canvas"`).

3.  **Initialize DiceBox:**
    *   Use a `useEffect` hook that runs once on component mount.
    *   Inside the hook, create a new `DiceBox` instance:
        ```javascript
        const box = new DiceBox({
          id: 'dice-canvas', // Match the container div ID
          assetPath: '/assets/dice-box/', // Path to copied assets within public folder
          container: '#dice-canvas', // Query selector for the container div
          scale: 7, // Adjust scale as needed (default 6)
          throwForce: 6, // Adjust throw force (default 5)
          spinForce: 5, // Adjust spin force (default 4)
          theme: 'diceOfRolling', // Or 'default', 'rust', etc.
          offscreen: true, // Use offscreenCanvas if available (default true)
          enableShadows: true, // Keep shadows (default true)
          onRollComplete: handleDiceRollComplete // Assign result handler function
        });
        ```
    *   Call `box.init()` which returns a promise.
    *   Once initialized (`.then()`), store the instance in the state (`setDiceBoxInstance(box)`).
    *   Include a cleanup function in the `useEffect` to call `diceBoxInstance?.clear()` if the instance exists when the component unmounts.

**Phase 2: Implementing Roll Logic & UI**

4.  **Add "Roll Dice" Button:**
    *   Add a button labeled "Roll Dice" to the modal's JSX.
    *   This button should only be visible/enabled before the roll is triggered (`!rollTriggered`).

5.  **Trigger Roll Function:**
    *   Create an `onClick` handler function for the "Roll Dice" button (e.g., `triggerRoll`).
    *   Inside `triggerRoll`:
        *   Check if `diceBoxInstance` exists and `rollTriggered` is false.
        *   Set `rollTriggered` state to `true`.
        *   Call the roll method on the instance, specifying two d20s with distinct colors/themes if possible to easily identify player vs. enemy in results. Example using themeColor:
            ```javascript
            diceBoxInstance.roll([
              { qty: 1, sides: 20, themeColor: '#YOUR_WIZARD_COLOR' }, // Player Die
              { qty: 1, sides: 20, themeColor: '#ENEMY_WIZARD_COLOR' }  // Enemy Die
            ]);
            ```
            *(Replace colors with actual hex codes representing player/enemy)*
        *   Disable the "Roll Dice" button.

6.  **Handle Roll Results:**
    *   Create the `handleDiceRollComplete` function (assigned to `onRollComplete` during init).
    *   This function receives the `results` array (an array of roll group objects).
    *   Parse the `results` array:
        *   Identify the player's roll value and the enemy's roll value based on the `themeColor` (or `groupId` if colors aren't used) defined in the `roll` call.
        *   Update local component state to display "Your Roll: X" and "Enemy Roll: Y".
        *   Call the original `onRollComplete` prop (passed from `BattleView`) with the extracted `{ playerRoll, enemyRoll }` values.
    *   Update UI: Hide "Roll Dice", show results text, ensure "Continue" button is now active.

**Phase 3: Polish & Cleanup**

7.  **Visual Tuning:**
    *   Adjust `DiceBox` config options (`scale`, forces, lighting, theme, themeColor) to achieve the desired look and animation feel.
    *   Ensure the canvas integrates seamlessly into the modal layout.

8.  **Code Cleanup:**
    *   Remove any remaining unused variables, state, refs, or functions related to the old Three.js implementation.
    *   Verify all state transitions and prop calls work correctly.
