export class ScoreIndicator {
    private scene: Phaser.Scene;
    private indicators: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 显示分数指示器
     * @param x 显示位置的x坐标
     * @param y 显示位置的y坐标
     * @param score 分数变化值
     * @param color 文字颜色
     */
    public showScoreIndicator(x: number, y: number, score: number, color: string = '#ffffff'): void {
        // 创建分数文本
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

        // 添加到指示器列表
        this.indicators.push(scoreText);

        // 创建背景光晕效果
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

        // 创建动画效果：向上飘动并逐渐消失
        this.scene.tweens.add({
            targets: scoreText,
            y: y - 80, // 向上移动80像素
            alpha: 0,  // 逐渐透明
            scaleX: 1.3, // 稍微放大
            scaleY: 1.3,
            duration: 1000, // 1秒动画
            ease: 'Power2',
            onComplete: () => {
                // 动画完成后销毁文本
                scoreText.destroy();
                // 从列表中移除
                const index = this.indicators.indexOf(scoreText);
                if (index > -1) {
                    this.indicators.splice(index, 1);
                }
            }
        });

        // 添加弹跳和旋转效果
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

        // 添加颜色变化效果
        this.scene.tweens.add({
            targets: scoreText,
            alpha: 0.8,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true
        });
    }

    /**
     * 显示食物效果指示器
     * @param x 显示位置的x坐标
     * @param y 显示位置的y坐标
     * @param effect 效果文本
     * @param color 文字颜色
     */
    public showEffectIndicator(x: number, y: number, effect: string, color: string = '#ffffff'): void {
        // 创建效果文本
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

        // 添加到指示器列表
        this.indicators.push(effectText);

        // 创建小光晕效果
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

        // 创建动画效果：向上飘动并逐渐消失
        this.scene.tweens.add({
            targets: effectText,
            y: y - 50, // 向上移动50像素
            alpha: 0,  // 逐渐透明
            scaleX: 1.2, // 稍微放大
            scaleY: 1.2,
            duration: 1400, // 1.4秒动画
            ease: 'Power2',
            onComplete: () => {
                // 动画完成后销毁文本
                effectText.destroy();
                // 从列表中移除
                const index = this.indicators.indexOf(effectText);
                if (index > -1) {
                    this.indicators.splice(index, 1);
                }
            }
        });

        // 添加轻微的弹跳效果
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
     * 清理所有指示器
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