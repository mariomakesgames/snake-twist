export class ScoreIndicator {
    private scene: Phaser.Scene;
    private indicators: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Show score indicator
     * @param x X coordinate of display position
     * @param y Y coordinate of display position
     * @param score Score change value
     * @param color Text color
     */
    public showScoreIndicator(x: number, y: number, score: number, color: string = '#ffffff'): void {
        // Create score text
        const scoreText = this.scene.add.text(x, y, `${score > 0 ? '+' : ''}${score}`, {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0.5);

        // Add to indicator list
        this.indicators.push(scoreText);

        // Create background glow effect
        const glow = this.scene.add.circle(x, y, 30, 0xffffff, 0.3);
        this.scene.tweens.add({
            targets: glow,
            radius: 60,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                glow.destroy();
            }
        });

        // Create animation effect: float upward and fade out
        this.scene.tweens.add({
            targets: scoreText,
            y: y - 80, // Move up 80 pixels
            alpha: 0,  // Gradually transparent
            scaleX: 1.3, // Slightly enlarge
            scaleY: 1.3,
            duration: 1000, // 1 second animation
            ease: 'Power2',
            onComplete: () => {
                // Destroy text after animation completes
                scoreText.destroy();
                // Remove from list
                const index = this.indicators.indexOf(scoreText);
                if (index > -1) {
                    this.indicators.splice(index, 1);
                }
            }
        });

        // Add bounce and rotation effects
        this.scene.tweens.add({
            targets: scoreText,
            scaleX: 1.5,
            scaleY: 1.5,
            angle: 5,
            duration: 200,
            ease: 'Back.easeOut',
            yoyo: true,
            onComplete: () => {
                scoreText.setScale(1);
                scoreText.setAngle(0);
            }
        });

        // Add color change effect
        this.scene.tweens.add({
            targets: scoreText,
            alpha: 0.8,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true
        });
    }

    /**
     * Show food effect indicator
     * @param x X coordinate of display position
     * @param y Y coordinate of display position
     * @param effect Effect text
     * @param color Text color
     */
    public showEffectIndicator(x: number, y: number, effect: string, color: string = '#ffffff'): void {
        // Create effect text
        const effectText = this.scene.add.text(x, y, effect, {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        // Add to indicator list
        this.indicators.push(effectText);

        // Create small glow effect
        const smallGlow = this.scene.add.circle(x, y, 20, 0xffffff, 0.2);
        this.scene.tweens.add({
            targets: smallGlow,
            radius: 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                smallGlow.destroy();
            }
        });

        // Create animation effect: float upward and fade out
        this.scene.tweens.add({
            targets: effectText,
            y: y - 50, // Move up 50 pixels
            alpha: 0,  // Gradually transparent
            scaleX: 1.2, // Slightly enlarge
            scaleY: 1.2,
            duration: 1400, // 1.4 second animation
            ease: 'Power2',
            onComplete: () => {
                // Destroy text after animation completes
                effectText.destroy();
                // Remove from list
                const index = this.indicators.indexOf(effectText);
                if (index > -1) {
                    this.indicators.splice(index, 1);
                }
            }
        });

        // Add slight bounce effect
        this.scene.tweens.add({
            targets: effectText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 250,
            ease: 'Back.easeOut',
            yoyo: true,
            onComplete: () => {
                effectText.setScale(1);
            }
        });
    }

    /**
     * Clean up all indicators
     */
    public destroy(): void {
        this.indicators.forEach(indicator => {
            if (indicator && indicator.active) {
                indicator.destroy();
            }
        });
        this.indicators = [];
    }
} 