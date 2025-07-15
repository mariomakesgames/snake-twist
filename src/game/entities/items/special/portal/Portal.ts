export class Portal {
    private scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Sprite;
    public targetPortal: Portal | null = null;
    private rotationTween: Phaser.Tweens.Tween | null = null;
    public isActive: boolean = true;
    public teleportingSnake: boolean = false;
    private glowEffect: Phaser.GameObjects.Graphics | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        
        // Create portal graphics with improved design
        const portalGraphics = scene.add.graphics();
        
        // 外圈光晕效果
        portalGraphics.lineStyle(3, 0x4a90e2, 0.3);
        portalGraphics.strokeCircle(15, 15, 13);
        
        // 主外圈
        portalGraphics.lineStyle(2, 0x4a90e2, 0.8);
        portalGraphics.strokeCircle(15, 15, 10);
        
        // 内圈
        portalGraphics.lineStyle(1, 0x4a90e2, 0.9);
        portalGraphics.strokeCircle(15, 15, 6);
        
        // 中心点
        portalGraphics.fillStyle(0x4a90e2, 0.7);
        portalGraphics.fillCircle(15, 15, 2);
        
        portalGraphics.generateTexture('portal', 30, 30);
        portalGraphics.destroy();

        // Create portal sprite
        this.sprite = scene.add.sprite(x, y, 'portal');
        this.sprite.setOrigin(0.5);
        
        // 添加发光效果
        this.createGlowEffect();
        
        // Add rotation animation
        this.startRotation();
    }

    private createGlowEffect(): void {
        this.glowEffect = this.scene.add.graphics();
        this.glowEffect.lineStyle(4, 0x4a90e2, 0.15);
        this.glowEffect.strokeCircle(this.sprite.x, this.sprite.y, 16);
        this.glowEffect.setDepth(this.sprite.depth - 1);
        
        // 发光动画
        this.scene.tweens.add({
            targets: this.glowEffect,
            alpha: 0.3,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });
    }

    private startRotation(): void {
        this.startNormalRotation();
    }

    private startNormalRotation(): void {
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        this.rotationTween = this.scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 3000,
            ease: 'Linear',
            loop: -1
        });
    }

    private startFastRotation(): void {
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        this.rotationTween = this.scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 500, // 快速旋转，0.5秒一圈
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
        return this.isActive && Math.abs(x - this.sprite.x) < threshold && Math.abs(y - this.sprite.y) < threshold;
    }

    public setTeleportingState(teleporting: boolean): void {
        this.teleportingSnake = teleporting;
        if (this.targetPortal) {
            this.targetPortal.teleportingSnake = teleporting;
        }
    }

    public deactivate(): void {
        this.isActive = false;
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        // 传送时不降低透明度，保持正常显示
        // this.sprite.setAlpha(0.3); // 移除透明度降低
        // if (this.glowEffect) {
        //     this.glowEffect.setAlpha(0.1); // 移除发光效果透明度降低
        // }
    }

    public activate(): void {
        this.isActive = true;
        // 确保透明度为1，即使之前没有降低过
        this.sprite.setAlpha(1);
        if (this.glowEffect) {
            this.glowEffect.setAlpha(0.15);
        }
        this.startNormalRotation();
    }

    public destroy(): void {
        if (this.rotationTween) {
            this.rotationTween.stop();
        }
        if (this.glowEffect) {
            this.glowEffect.destroy();
        }
        this.sprite.destroy();
    }

    public static createPortalEffect(scene: Phaser.Scene, x: number, y: number): void {
        // 创建传送特效
        const effect = scene.add.graphics();
        effect.fillStyle(0x4a90e2, 0.5);
        effect.fillCircle(x, y, 20);
        effect.setAlpha(1);

        scene.tweens.add({
            targets: effect,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 600,
            ease: 'Power2',
            onComplete: () => effect.destroy()
        });
    }
} 