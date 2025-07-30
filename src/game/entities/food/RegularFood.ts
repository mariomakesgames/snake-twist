import { Food } from './Food';

export class RegularFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Keep the default green color (0x00ff00 is already set in parent)
        console.log('Regular food created!');
    }

    public onEaten(): void {
        console.log('Food eaten!');
        const scene = this.scene as any;
        
        // Grow snake by 1 segment
        scene.snake.grow(1);
        
        // Reposition food
        this.reposition();
        
        // Update game state
        const gameState = (window as any).gameState;
        gameState.length = scene.snake.getLength();
        const baseScoreGain = 10; // Base score gain of 10 points
        const scoreGain = Math.round(baseScoreGain * scene.settingsManager.getScoreMultiplier());
        console.log(`Base score: ${baseScoreGain}, Multiplier: ${scene.settingsManager.getScoreMultiplier()}, Final score: ${scoreGain}`);
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score and effect indicators
        scene.scoreIndicator.showScoreIndicator(scene.snake.head.x, scene.snake.head.y, scoreGain, '#00ff00');
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 30, '+1🟩', '#00ff00');
        
        // Increase speed every 50 points
        if (gameState.score % 50 === 0) {
            scene.gameSpeed = Math.max(50, scene.gameSpeed - 10);
            scene.snake.setSpeed(scene.gameSpeed);
            (window as any).updateUI();
        }
    }
}