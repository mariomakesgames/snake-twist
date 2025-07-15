import { EventBus } from '../EventBus';

export class MenuScene extends Phaser.Scene {
    private startButton!: Phaser.GameObjects.Container;
    private startButtonText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    public create(): void {
        console.log('MenuScene create() called');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x222222).setOrigin(0, 0);

        // Create title
        this.titleText = this.add.text(centerX, centerY - 150, '🐍 SNAKE GAME', {
            fontSize: '48px',
            color: '#2196F3',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create subtitle
        this.subtitleText = this.add.text(centerX, centerY - 100, 'Eat food, grow longer, don\'t crash!', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create start button
        this.createStartButton(centerX, centerY + 50);

        // Add game instructions below the start button
        const instructions = [
            '🎮 Controls: WASD keys, or swipe.',
            '🍎 Goal: Eat food and boosters to grow!',
            '⚠️ Avoid: Walls and your own body!',
            '📺 Revive: Can pick up dropped segments.'
        ];
        const instructionsText = this.add.text(centerX, centerY + 120, instructions.join('\n'), {
            fontSize: '18px',
            color: '#e3f2fd',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 420, useAdvancedWrap: true },
            padding: { top: 10, bottom: 10 }
        }).setOrigin(0.5, 0);

        // Add entrance animations
        this.addEntranceAnimations();

        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private createStartButton(x: number, y: number): void {
        const buttonWidth = 250;
        const buttonHeight = 70;
        const borderRadius = 35;

        // Create button background with modern gradient
        const background = this.add.graphics();
        background.fillGradientStyle(0x2196F3, 0x1976D2, 0x1565C0, 0x0D47A1, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border with gradient
        background.lineStyle(3, 0x42A5F5, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create button text with better styling
        const text = this.add.text(0, 0, 'START GAME', {
            fontSize: '28px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#0D47A1',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.startButton = this.add.container(x, y, [background, text]);
        this.startButton.setActive(true).setVisible(true);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Hover effects removed

        // Add click effect
        background.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });

        // Add click handler
        background.on('pointerup', () => {
            this.startGame();
        });
        
        // Also make text interactive
        text.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });
        text.on('pointerup', () => {
            this.startGame();
        });
    }



    private addEntranceAnimations(): void {
        // Title animation
        this.titleText.setAlpha(0);
        this.titleText.setScale(0.5);
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Back.easeOut',
            delay: 200
        });

        // Subtitle animation
        this.subtitleText.setAlpha(0);
        this.subtitleText.setY(this.subtitleText.y + 50);
        this.tweens.add({
            targets: this.subtitleText,
            alpha: 1,
            y: this.subtitleText.y - 50,
            duration: 600,
            ease: 'Power2',
            delay: 600
        });

        // Button immediately visible and active - no animation
        this.startButton.setActive(true).setVisible(true);
    }

    private startGame(): void {
        console.log('Starting game from menu...');
        
        // Add exit animation for all elements
        this.tweens.add({
            targets: [this.titleText, this.subtitleText, this.startButton],
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Switch to game scene
                this.scene.start('SnakeScene');
            }
        });
    }
} 