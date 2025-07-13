
export class Food {
    protected scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        console.log('Creating food');
        this.scene = scene;
        this.sprite = scene.add.rectangle(0, 0, scene.scale.width / 30 - 2, scene.scale.height / 30 - 2, 0x00ff00);
        this.scene.physics.add.existing(this.sprite);
        this.reposition();
        console.log('Food created at:', this.sprite.x, this.sprite.y);
    }

    public reposition(): void {
        const gridWidth = Math.floor(this.scene.scale.width / (this.scene.scale.width / 30));
        const gridHeight = Math.floor(this.scene.scale.height / (this.scene.scale.height / 30));
        
        let x: number, y: number;
        let attempts = 0;
        
        do {
            const gridX = Phaser.Math.Between(0, gridWidth - 1);
            const gridY = Phaser.Math.Between(0, gridHeight - 1);
            x = gridX * (this.scene.scale.width / 30) + (this.scene.scale.width / 30) / 2;
            y = gridY * (this.scene.scale.height / 30) + (this.scene.scale.height / 30) / 2;
            attempts++;
        } while (this.isOnSnake(x, y) && attempts < 100);
        
        this.sprite.setPosition(x, y);
        console.log('Food repositioned to:', x, y);
    }

    protected isOnSnake(x: number, y: number): boolean {
        return (this.scene as any).snake.body.some((segment: any) => 
            segment.x === x && segment.y === y
        );
    }
} 