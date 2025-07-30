import { Food } from '../Food';

export class SpeedBoostFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to orange
        this.sprite.setFillStyle(0xff8800);
        console.log('Speed boost food created!');
    }

    public onEaten(): void {
        console.log('Speed boost food eaten!');
        const scene = this.scene as any;
        
        // Grow snake by 1 segment
        scene.snake.grow(1);
        
        // Reposition food
        this.reposition();
        
        // Show tutorial for speed boost food if not shown before
        scene.foodTutorialManager.showTutorial('speed-boost');
        
        // Update game state
        const gameState = (window as any).gameState;
        gameState.length = scene.snake.getLength();
        const baseScoreGain = 10; // Same as regular food since it only grows by 1
        const scoreGain = Math.round(baseScoreGain * scene.settingsManager.getScoreMultiplier());
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score and effect indicators
        scene.scoreIndicator.showScoreIndicator(scene.snake.head.x, scene.snake.head.y, scoreGain, '#ff8800');
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 30, '+1🟩', '#ff8800');
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 50, 'Speed Boost', '#ff8800');
        
        // Increase speed immediately
        scene.gameSpeed = Math.max(30, scene.gameSpeed - 20);
        scene.snake.setSpeed(scene.gameSpeed);
        console.log('Speed increased! New speed:', scene.gameSpeed);
        (window as any).updateUI();
    }
} 