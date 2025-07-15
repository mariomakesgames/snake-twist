# Obstacle System

This system adds randomly generated obstacles to the snake game, increasing the challenge and fun.

## Features

- **Single Large Obstacle**: Each game generates only one large, thick obstacle starting from the top-left corner.
- **Multiple Letter-Shaped Patterns**: Supports large obstacles in L, T, S, Z, M, and other letter shapes.
- **Top-Left Start**: All obstacles start from the top-left and extend to the map edge.
- **Smart Avoidance**: Obstacles do not spawn in the snake's spawn area (center, 4-tile radius).
- **Collision Detection**: The game ends if the snake hits an obstacle.
- **Food Avoidance**: Food will not spawn on obstacles.
- **Balanced Design**: Simple patterns (30% chance) for beginners, complex patterns for advanced players.

## Obstacle Types

### 1. Simple Pattern (Recommended)
- Generates one huge, centered obstacle.
- Includes: 8x8 block (64 tiles), 10x6 rectangle (60 tiles), extra-large L (20 tiles), extra-large T (24 tiles), extra-large cross (25 tiles).
- 30% chance to appear, suitable for new players.
- Provides moderate challenge.

### 2. L-Shape Pattern
- Generates one large L-shaped obstacle starting from the top-left.
- 3 tiles thick, vertical part extends to the bottom, horizontal part extends right.
- Starts at grid position (3,2), covers 40% of map width.
- 10% chance to appear.

### 3. T-Shape Pattern
- Generates one large T-shaped obstacle starting from the top-left.
- 3 tiles thick, vertical part extends to the bottom, horizontal part extends right from the middle.
- Starts at grid position (3,2), covers 40% of map width.
- 10% chance to appear.

### 4. S-Shape Pattern
- Generates one large S-shaped obstacle starting from the top-left.
- 3 tiles thick, forms a curved S path.
- Starts at grid position (3,2), covers 40% of map width.
- 10% chance to appear.

### 5. Z-Shape Pattern
- Generates one large Z-shaped obstacle starting from the top-left.
- 3 tiles thick, forms a Z-shaped combination of straight and diagonal lines.
- Starts at grid position (3,2), covers 40% of map width.
- 10% chance to appear.

### 6. M-Shape Pattern
- Generates one large M-shaped obstacle starting from the top-left.
- 3 tiles thick, forms an M with double verticals and connecting diagonals.
- Starts at grid position (3,2), covers 40% of map width.
- 10% chance to appear.

### 7. Maze Pattern
- Creates a large maze structure, centered.
- Corridors are 3 tiles wide, walls are 2 tiles thick.
- Large 20x25 grid maze area.
- Adds 8 random internal walls for complexity.
- 10% chance to appear.

### 8. Random Pattern
- Generates one huge random-shaped obstacle, centered.
- Includes: 10x10 block (100 tiles), 12x8 rectangle (96 tiles), extra-large L (40 tiles), extra-large T (50 tiles), extra-large cross (41 tiles).
- Completely random shape combinations.
- Suitable for intermediate difficulty.
- 10% chance to appear.

## System Structure

### Core Classes

1. **Obstacle**: Single obstacle block
   - Position, appearance, physics properties
   - Collision detection

2. **ObstaclePattern**: Base class for obstacle patterns
   - Abstract class, defines obstacle generation interface
   - Provides position validation and grid conversion functions

3. **ObstacleManager**: Obstacle manager
   - Manages all obstacles
   - Weighted random selection of patterns and obstacle generation
   - Handles collision detection

### Pattern Implementations

- `SimplePattern`: Simple obstacle generation (recommended)
- `LShapePattern`: L-shape obstacle generation
- `TShapePattern`: T-shape obstacle generation
- `SShapePattern`: S-shape obstacle generation
- `ZShapePattern`: Z-shape obstacle generation
- `MShapePattern`: M-shape obstacle generation
- `MazePattern`: Maze obstacle generation
- `RandomPattern`: Random obstacle generation

## Integration

1. **Scene Integration**: Initialize ObstacleManager in SnakeScene
2. **Game Restart**: Regenerate obstacles on each new game
3. **Food Avoidance**: Modify Food class to ensure food does not spawn on obstacles
4. **Collision Handling**: Trigger game over when snake hits an obstacle

## Usage

```typescript
// Initialize in SnakeScene
this.obstacleManager = new ObstacleManager(this);
this.obstacleManager.generateObstacles();

// Regenerate on new game
this.obstacleManager.generateObstacles();
```

## Configuration Options

- **Grid Size**: 20px (consistent with game grid)
- **Obstacle Color**: Gray (#666666)
- **Generation Area**: Avoids snake spawn area (center, 4-tile radius)
- **Max Attempts**: Prevents infinite loops
- **Pattern Weights**: Simple pattern 30%, others 10% each

## Balance Design

- **Single Large Obstacle**: Only one large obstacle per game to avoid excessive complexity
- **Top-Left Start**: All letter-shaped obstacles start from the top-left for consistency
- **Simple Pattern Priority**: 30% chance for simple pattern, beginner-friendly
- **Protected Area**: Enlarged snake spawn protection area
- **Progressive Difficulty**: Patterns range from simple to complex

## Extensibility

The system is designed to be extensible, allowing easy addition of new obstacle patterns:

1. Inherit from `ObstaclePattern` class
2. Implement `generate()` and `getName()` methods
3. Register new pattern in `ObstacleManager`
4. Adjust weight distribution as needed

## Performance Considerations

- Uses grid alignment to reduce computational complexity
- Limits max attempts to prevent infinite loops
- Efficient collision detection using Phaser physics engine
- Optimized pattern selection algorithm 