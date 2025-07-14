import { AUTO, Game } from 'phaser';
import { GameOverScene } from './scenes/GameOverScene';
import { MenuScene } from './scenes/MenuScene';
import { SnakeScene } from './scenes/SnakeScene';
import { GameConfig, GameState } from './types/game';

// Game state variables
const gameState: GameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    isPaused: false,
    isGameOver: false
};

// Make gameState globally accessible
(window as any).gameState = gameState;

// Update UI elements
function updateUI(): void {
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    
    if (scoreElement) scoreElement.textContent = gameState.score.toString();
    if (highScoreElement) highScoreElement.textContent = gameState.highScore.toString();
    
    // Update speed display if element exists
    const speedElement = document.getElementById('speed');
    if (speedElement) {
        const currentSpeed = (window as any).game?.scene?.scenes[0]?.gameSpeed;
        if (currentSpeed) {
            speedElement.textContent = `Speed: ${currentSpeed}ms`;
        }
    }
}

// Make updateUI globally accessible
(window as any).updateUI = updateUI;

// Initialize UI
updateUI();

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 ('ontouchstart' in window) ||
                 (navigator.maxTouchPoints > 0);

// Game configuration
const config: GameConfig = {
    type: AUTO,
    width: 600,
    height: 600,
    parent: 'gameCanvas',
    backgroundColor: '#222222',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, SnakeScene, GameOverScene],
    render: {
        pixelArt: false,
        antialias: true
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Function export for React component compatibility
export const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    // Make game globally accessible
    (window as any).game = game;
    return game;
};

// Export for React component compatibility
export default StartGame;
