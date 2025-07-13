import { EventBus } from '../EventBus';

export class MenuScene extends Phaser.Scene {
    private startButton!: Phaser.GameObjects.Rectangle;
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
            color: '#4CAF50',
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

        // Add entrance animations
        this.addEntranceAnimations();

        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private createStartButton(x: number, y: number): void {
        const buttonWidth = 250;
        const buttonHeight = 70;

        // Create button background - beautiful green style
        const background = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x4CAF50);
        background.setStrokeStyle(3, 0x2E7D32);
        background.setActive(true).setVisible(true);

        // Create button text
        const text = this.add.text(x, y, 'START GAME', {
            fontSize: '28px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        text.setActive(true).setVisible(true);

        // Store references
        this.startButton = background;
        this.startButtonText = text;

        // Make background interactive directly
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add hover effects to background
        background.on('pointerover', () => {
            background.setFillStyle(0x66BB6A);
            background.setStrokeStyle(3, 0x4CAF50);
        });

        background.on('pointerout', () => {
            background.setFillStyle(0x4CAF50);
            background.setStrokeStyle(3, 0x2E7D32);
        });

        // Add click handler to background
        background.on('pointerdown', () => {
            this.startGame();
        });
        
        // Also make text interactive
        text.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
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
        
        // Immediately hide button text
        this.startButtonText.setVisible(false);
        
        // Add exit animation for other elements
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