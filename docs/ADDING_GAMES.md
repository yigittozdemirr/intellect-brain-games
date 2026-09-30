# Adding a New Game to INTELLECT

## Quick Steps

1. **Create the game file** under `src/games/<category>/YourGame.jsx`
2. **Add one line** to `src/games/registry.js`

That's it! The Games screen, Home dashboard, Daily Workout, progress storage, and category filters will all pick up the new game automatically.

## Game Component Props Contract

Every game component receives these props from `GameShell`:

```jsx
function YourGame({ level, onCorrect, onWrong, isActive }) {
  // level    - starts at 1, increases by 1 every 5 correct answers
  //            use it to scale difficulty (grid size, speed, length, etc.)
  // onCorrect - call when the player answers correctly
  //             optional: onCorrect({ bonus: 50 }) for speed bonus chips
  // onWrong   - call when the player answers wrong
  // isActive  - true when the game is running (not paused/countdown/finished)
  //             do NOT accept input when isActive is false
}
```

## Minimal Example

```jsx
// src/games/speed/MyGame.jsx
import { useState, useCallback } from "react";

export default function MyGame({ level, onCorrect, onWrong, isActive }) {
  const [target, setTarget] = useState(() => generateQuestion(level));

  const handleAnswer = useCallback((answer) => {
    if (!isActive) return;
    if (answer === target.correct) {
      onCorrect();
    } else {
      onWrong();
    }
    setTarget(generateQuestion(level));
  }, [isActive, level, onCorrect, onWrong, target]);

  return (
    <div className="flex items-center justify-center h-full p-4">
      {/* your game UI */}
    </div>
  );
}

function generateQuestion(level) {
  // Return { display, correct, options }
  // Must have exactly ONE correct answer
  // Must scale difficulty with level
}
```

## Registry Entry

In `src/games/registry.js`, add the import and one object:

```js
import MyGame from "./speed/MyGame";

// Add to GAME_REGISTRY array:
{
  id: "my-game",
  name: "My Game",
  category: "Speed",
  description: "One-line description for the card.",
  rules: "1-2 sentences shown before first play.",
  icon: "🎮",
  Component: MyGame,
  color: "orange",   // matches category color
},
```

## Rules

- Use `isActive` to gate ALL user input
- Call `onCorrect()` or `onWrong()` for every answer — GameShell handles scoring, combo, timer penalties
- Scale difficulty with `level` (more items, faster timers, longer sequences, etc.)
- Every generated question must have exactly ONE correct answer
- Use the pixel design system: existing colors, fonts, `PixelButton`, `PixelPanel`
- Use inline SVG with `shapeRendering="crispEdges"` for pixel art
- Clean up timers/intervals in useEffect return
- Touch-friendly: `touch-action: manipulation`, large tap targets (min 44px)
