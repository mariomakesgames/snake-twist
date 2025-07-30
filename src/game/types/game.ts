// Game state interface
export interface GameState {
    score: number;
    highScore: number;
    length: number;
    isPaused: boolean;
    isGameOver: boolean;
}

// Direction interface
export interface Direction {
    x: number;
    y: number;
}

// Position interface
export interface Position {
    x: number;
    y: number;
}

// Game configuration interface
export interface GameConfig extends Phaser.Types.Core.GameConfig {
    // Extends Phaser's GameConfig with our specific requirements
} 