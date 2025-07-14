export class SegmentDrop {
    private scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Rectangle;
    public value: number;
    private isCollected: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
        this.scene = scene;
        this.value = value;
        
        // Create visual representation of dropped segment
        this.sprite = scene.add.rectangle(x, y, 16, 16, 0x4CAF50);
        this.sprite.setStrokeStyle(2, 0x2E7D32);
        
        // Add physics body
        scene.physics.add.existing(this.sprite);
        
        // Add pulsing animation
        this.createPulseAnimation();
        
        console.log(`Segment drop created at (${x}, ${y}) with value ${value}`);
    }

    private createPulseAnimation(): void {
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    public collect(): number {
        if (this.isCollected) return 0;
        
        this.isCollected = true;
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Destroy the sprite after a short delay
        this.scene.time.delayedCall(300, () => {
            this.sprite.destroy();
        });
        
        return this.value;
    }

    private createCollectionEffect(): void {
        // Create sparkle effect
        for (let i = 0; i < 8; i++) {
            const sparkle = this.scene.add.circle(
                this.sprite.x + (Math.random() - 0.5) * 40,
                this.sprite.y + (Math.random() - 0.5) * 40,
                2,
                0x4CAF50
            );
            
            this.scene.tweens.add({
                targets: sparkle,
                x: sparkle.x + (Math.random() - 0.5) * 60,
                y: sparkle.y + (Math.random() - 0.5) * 60,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
    }

    public destroy(): void {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
} 