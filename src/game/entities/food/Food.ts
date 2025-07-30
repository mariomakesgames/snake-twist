
export abstract class Food {
    protected scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        console.log('Creating food');
        this.scene = scene;
        const gridSize = (scene as any).gridSize || 20;
        this.sprite = scene.add.rectangle(0, 0, gridSize - 2, gridSize - 2, 0x00ff00);
        this.scene.physics.add.existing(this.sprite);
        this.reposition();
        console.log('Food created at:', this.sprite.x, this.sprite.y);
    }

    // Abstract method that each food type must implement
    public abstract onEaten(): void;

    public reposition(): void {
        const gridSize = (this.scene as any).gridSize || 20;
        const gridWidth = Math.floor(this.scene.scale.width / gridSize);
        const gridHeight = Math.floor(this.scene.scale.height / gridSize);
        
        let x: number, y: number;
        let attempts = 0;
        
        do {
            // generate random grid position
            const gridX = Phaser.Math.Between(0, gridWidth - 1);
            const gridY = Phaser.Math.Between(0, gridHeight - 1);
            x = gridX * gridSize + gridSize / 2;
            y = gridY * gridSize + gridSize / 2;
            attempts++;
        } while ((this.isOnSnake(x, y) || this.isOnObstacle(x, y)) && attempts < 100);
        // attempt 100 times to find a valid position
        
        this.sprite.setPosition(x, y);
        console.log('Food repositioned to:', x, y);
    }

    protected isOnSnake(x: number, y: number): boolean {
        return (this.scene as any).snake.body.some((segment: any) => 
            segment.x === x && segment.y === y
        );
    }

    protected isOnObstacle(x: number, y: number): boolean {
        return (this.scene as any).isPositionOccupied(x, y);
    }
} 