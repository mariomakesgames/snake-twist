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
            fontSize: '24px',
            fontFamily: 'Arial',
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
        this.indicators.push(scoreText);

        // 创建动画效果：向上飘动并逐渐消失
        this.scene.tweens.add({
            targets: scoreText,
            y: y - 60, // 向上移动60像素
            alpha: 0,  // 逐渐透明
            scaleX: 1.2, // 稍微放大
            scaleY: 1.2,
            duration: 1500, // 1.5秒动画
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

        // 添加轻微的弹跳效果
        this.scene.tweens.add({
            targets: scoreText,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 200,
            ease: 'Back.easeOut',
            yoyo: true,
            onComplete: () => {
                scoreText.setScale(1);
            }
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
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 1.5,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 2,
                fill: true
            }
        }).setOrigin(0.5);

        // 添加到指示器列表
        this.indicators.push(effectText);

        // 创建动画效果：向上飘动并逐渐消失
        this.scene.tweens.add({
            targets: effectText,
            y: y - 40, // 向上移动40像素
            alpha: 0,  // 逐渐透明
            duration: 1200, // 1.2秒动画
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