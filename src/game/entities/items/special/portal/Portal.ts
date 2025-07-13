export class Portal {
    private scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Sprite;
    public targetPortal: Portal | null = null;
    private rotationTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        
        // Create portal graphics
        const portalGraphics = scene.add.graphics();
        portalGraphics.lineStyle(3, 0x9b59b6);
        portalGraphics.strokeCircle(15, 15, 12);
        portalGraphics.lineStyle(1, 0xe74c3c);
        portalGraphics.strokeCircle(15, 15, 8);
        portalGraphics.generateTexture('portal', 30, 30);
        portalGraphics.destroy();

        // Create portal sprite
        this.sprite = scene.add.sprite(x, y, 'portal');
        this.sprite.setOrigin(0.5);
        
        // Add rotation animation
        this.startRotation();
    }

    private startRotation(): void {
        this.rotationTween = this.scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 2000,
            ease: 'Linear',
            loop: -1
        });
    }

    public setTarget(target: Portal): void {
        this.targetPortal = target;
    }

    public getTarget(): Portal | null {
        return this.targetPortal;
    }

    public getPosition(): { x: number; y: number } {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    public isColliding(x: number, y: number, threshold: number = 15): boolean {
        return Math.abs(x - this.sprite.x) < threshold && Math.abs(y - this.sprite.y) < threshold;
    }

    public destroy(): void {
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        this.sprite.destroy();
    }

    public static createPortalEffect(scene: Phaser.Scene, x: number, y: number): void {
        const effect = scene.add.graphics();
        effect.fillStyle(0x9b59b6, 0.8);
        effect.fillCircle(x, y, 30);
        effect.setAlpha(1);

        scene.tweens.add({
            targets: effect,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 500,
            onComplete: () => effect.destroy()
        });
    }
} 