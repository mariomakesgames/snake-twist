export class Obstacle {
    protected scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Rectangle;
    public x: number;
    public y: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        const gridSize = (scene as any).gridSize || 20;
        this.sprite = scene.add.rectangle(x, y, gridSize - 2, gridSize - 2, 0x666666);
        scene.physics.add.existing(this.sprite);
        
        // Make obstacle static (immovable)
        const body = this.sprite.body as any;
        body.setImmovable(true);
    }

    public destroy(): void {
        this.sprite.destroy();
    }
} 