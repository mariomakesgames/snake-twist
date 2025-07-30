import { Food } from '../Food';

export class SlowFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to pink
        this.sprite.setFillStyle(0xff88ff);
        console.log('Slow food created!');
    }

    public onEaten(): void {
        console.log('Slow food eaten!');
        const scene = this.scene as any;
        
        // Grow snake by 1 segment
        scene.snake.grow(1);
        
        // Reposition food
        this.reposition();
        
        // Show tutorial for slow food if not shown before
        scene.foodTutorialManager.showTutorial('slow-food');
        
        // Update game state
        const gameState = (window as any).gameState;
        gameState.length = scene.snake.getLength();
        const baseScoreGain = 10;
        const scoreGain = Math.round(baseScoreGain * scene.settingsManager.getScoreMultiplier());
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score and effect indicators
        scene.scoreIndicator.showScoreIndicator(scene.snake.head.x, scene.snake.head.y, scoreGain, '#ff69b4');
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 30, '+1🟩', '#ff69b4');
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 50, 'Speed Slow', '#ff69b4');
        
        // Decrease speed
        scene.gameSpeed = Math.min(300, scene.gameSpeed + 30);
        scene.snake.setSpeed(scene.gameSpeed);
        console.log('Speed decreased! New speed:', scene.gameSpeed);
        (window as any).updateUI();
    }
} 