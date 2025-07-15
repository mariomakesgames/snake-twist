# Food Tutorial System

## Overview

The Food Tutorial System provides players with introductions and effect descriptions for each type of food, helping new players understand the game mechanics.

## Features

### 1. Automatic Tutorial Display
- Automatically displays tutorials when each food type is eaten for the first time
- Tutorials are shown only once and won't repeatedly disturb players
- Uses localStorage to persist tutorial states
- Automatically pauses the game when showing tutorials to ensure players focus on reading

### 2. Tutorial Content
Each food includes the following information:
- **Icon**: Intuitive emoji icon
- **Name**: Food name
- **Description**: Detailed functional description
- **Effect**: Specific numerical effects
- **Color**: Corresponding color identifier

### 3. Food Types

| Food/Item | Color | Icon | Effect |
|-----------|-------|------|--------|
| Regular Food | Green | 🍎 | +1 segment, +10 points |
| Growth Boost | Yellow | ⭐ | +5 segments, +50 points |
| Speed Boost | Orange | ⚡ | +1 segment, +15 points, +20% speed |
| Shrink Food | Red | ⚠️ | -1 segment, -10 points |
| Slow Food | Pink | 🐌 | +1 segment, +5 points, -30% speed |
| Portal | Purple | 🌀 | Instant teleportation, temporary cooldown |

## Technical Implementation

### Core Classes

#### FoodTutorialManager
- Manages the state of all tutorials
- Handles tutorial display and hiding
- Manages localStorage persistence

#### FoodTutorial Interface
```typescript
interface FoodTutorial {
    id: string;           // Unique identifier
    name: string;         // Display name
    description: string;  // Detailed description
    effect: string;       // Effect description
    color: number;        // Color value
    icon: string;         // Icon
    shown: boolean;       // Whether already shown
}
```

### Main Methods

#### Display Tutorial
```typescript
// Show single tutorial
foodTutorialManager.showTutorial('growth-boost');

// Show all tutorials (in order)
foodTutorialManager.showAllTutorials();
```

#### State Management
```typescript
// Check if tutorial has been shown
foodTutorialManager.isTutorialShown('speed-boost');

// Reset all tutorials
foodTutorialManager.resetTutorials();

// Get tutorial statistics
foodTutorialManager.getShownTutorialCount();
foodTutorialManager.getTotalTutorialCount();

// Game pause/resume (internal methods)
foodTutorialManager.pauseGame();  // Pause game
foodTutorialManager.resumeGame(); // Resume game

// Tutorial state check
foodTutorialManager.isTutorialActive(); // Check if tutorial is currently being displayed

### localStorage Storage

Tutorial states are saved in localStorage:
- **Key**: `snake_food_tutorials_shown`
- **Value**: JSON array containing IDs of shown tutorials
- **Example**: `["regular-food", "growth-boost", "speed-boost"]`

## Integration

### Integration in SnakeScene

1. **Import Tutorial Manager**
```typescript
import { FoodTutorialManager } from '../tutorial/FoodTutorialManager';
```

2. **Initialization**
```typescript
this.foodTutorialManager = new FoodTutorialManager(this);
```

3. **Show Tutorials When Eating Food or Using Items**
```typescript
// Food tutorial
private eatFood(): void {
    // ... food effect logic ...
    this.foodTutorialManager.showTutorial('regular-food');
}

// Portal tutorial (in Snake.ts)
const teleportPos = portalManager.checkTeleportation(newHeadX, newHeadY);
if (teleportPos) {
    const foodTutorialManager = (this.scene as any).foodTutorialManager;
    if (foodTutorialManager) {
        foodTutorialManager.showTutorial('portal');
    }
    // ... teleportation logic ...
}
```

4. **Clean Up Resources**
```typescript
public gameOver(): void {
    // ... other cleanup logic ...
    
    if (this.foodTutorialManager) {
        this.foodTutorialManager.destroy();
    }
}
```

## User Experience

### Tutorial Interface
- Semi-transparent background overlay
- Centered tutorial card
- Smooth animation effects
- Interactive buttons

### Animation Effects
- Entrance animation: Scale + transparency
- Exit animation: Shrink + fade out
- Button hover effects

### Game Pause Mechanism
- Automatically pauses game when showing tutorials
- Automatically resumes game when hiding tutorials
- Supports displaying multiple tutorials consecutively (pauses only once)
- Pauses portal generation when showing tutorials, keeping portal positions unchanged

### Responsive Design
- Adapts to different screen sizes
- Mobile device friendly
- Touch operation support

## Testing

Use `food-tutorial-test.html` for testing:

1. **Basic Functionality Testing**
   - Eat different foods to verify tutorial display
   - Repeatedly eat the same food to verify no duplicate display

2. **Persistence Testing**
   - Restart game to verify state persistence
   - Reset tutorials to verify state clearing

3. **localStorage Testing**
   - Check stored data format
   - Verify data persistence

## Extensibility

### Adding New Food Types or Items
1. Add new tutorial configuration in `initializeTutorials()`
2. Add tutorial calls at corresponding food class or item trigger points
3. Update test page and documentation

### Customizing Tutorial Styles
- Modify `createTutorialOverlay()` method
- Adjust colors, fonts, layout
- Add new animation effects

### Multi-language Support
- Extract tutorial text to configuration files
- Display corresponding text based on language settings
- Support dynamic language switching 