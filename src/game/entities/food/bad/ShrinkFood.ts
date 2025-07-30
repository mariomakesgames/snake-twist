import { Food } from '../Food';

export class ShrinkFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to red
        this.sprite.setFillStyle(0xff0000);
        console.log('Shrink food created!');
    }

    public onEaten(): void {
        console.log('Shrink food eaten!');
        const scene = this.scene as any;
        
        // Shrink snake by 1 segment
        scene.snake.shrink(1);
        
        // Reposition food
        this.reposition();
        
        // Show tutorial for shrink food if not shown before
        scene.foodTutorialManager.showTutorial('shrink-food');
        
        // Update game state
        const gameState = (window as any).gameState;
        gameState.length = scene.snake.getLength();
        // No score change for shrink food
        (window as any).updateUI();
        
        // Show effect indicator only
        scene.scoreIndicator.showEffectIndicator(scene.snake.head.x, scene.snake.head.y + 30, '-1🟩', '#ff0000');
    }
} 