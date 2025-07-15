import { EventBus } from '../EventBus';
import { GameSettingsManager } from '../GameSettings';

export class MenuScene extends Phaser.Scene {
    private startButton!: Phaser.GameObjects.Container;
    private startButtonText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private obstacleToggleButton!: Phaser.GameObjects.Container;
    private obstacleToggleText!: Phaser.GameObjects.Text;
    private obstacleToggleIcon!: Phaser.GameObjects.Text;
    private settingsManager: GameSettingsManager;

    constructor() {
        super({ key: 'MenuScene' });
        this.settingsManager = GameSettingsManager.getInstance();
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

        // Create obstacle mode toggle button
        this.createObstacleToggleButton(centerX, centerY + 140);

        // Add game instructions below the toggle button
        const instructions = [
            '🎮 Controls: WASD keys, or swipe.',
            '🍎 Goal: Eat food and boosters to grow!',
            '⚠️ Avoid: Walls and your own body!',
            '📺 Revive: Can pick up dropped segments.',
            '🎯 Obstacle Mode: Higher score multiplier!'
        ];
        const instructionsText = this.add.text(centerX, centerY + 200, instructions.join('\n'), {
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

    private createObstacleToggleButton(x: number, y: number): void {
        const buttonWidth = 300;
        const buttonHeight = 50;
        const borderRadius = 25;

        // Create button background
        const background = this.add.graphics();
        const isEnabled = this.settingsManager.isObstacleModeEnabled();
        const bgColor = isEnabled ? 0x4CAF50 : 0x666666;
        const borderColor = isEnabled ? 0x66BB6A : 0x888888;
        
        background.fillGradientStyle(bgColor, bgColor, bgColor, bgColor, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create toggle icon
        this.obstacleToggleIcon = this.add.text(-buttonWidth/2 + 30, 0, isEnabled ? '🎯' : '⚪', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Create toggle text
        this.obstacleToggleText = this.add.text(10, 0, `Obstacle: ${isEnabled ? 'ON' : 'OFF'} (${isEnabled ? '2x' : '1x'} Score)`, {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.obstacleToggleButton = this.add.container(x, y, [background, this.obstacleToggleIcon, this.obstacleToggleText]);
        this.obstacleToggleButton.setActive(true).setVisible(true);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add click handler
        background.on('pointerup', () => {
            this.toggleObstacleMode();
        });
        
        // Also make text interactive
        this.obstacleToggleText.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        this.obstacleToggleText.on('pointerup', () => {
            this.toggleObstacleMode();
        });
    }

    private toggleObstacleMode(): void {
        const currentState = this.settingsManager.isObstacleModeEnabled();
        const newState = !currentState;
        
        this.settingsManager.setObstacleMode(newState);
        this.updateObstacleToggleDisplay();
        
        // Add toggle animation
        this.tweens.add({
            targets: this.obstacleToggleButton,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            ease: 'Power2',
            yoyo: true
        });
    }

    private updateObstacleToggleDisplay(): void {
        const isEnabled = this.settingsManager.isObstacleModeEnabled();
        
        // Update icon
        this.obstacleToggleIcon.setText(isEnabled ? '🎯' : '⚪');
        
        // Update text
        this.obstacleToggleText.setText(`Obstacle: ${isEnabled ? 'ON' : 'OFF'} (${isEnabled ? '2x' : '1x'} Score)`);
        
        // Update background color
        const background = this.obstacleToggleButton.getAt(0) as Phaser.GameObjects.Graphics;
        const bgColor = isEnabled ? 0x4CAF50 : 0x666666;
        const borderColor = isEnabled ? 0x66BB6A : 0x888888;
        
        background.clear();
        background.fillGradientStyle(bgColor, bgColor, bgColor, bgColor, 1);
        background.fillRoundedRect(-150, -25, 300, 50, 25);
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-150, -25, 300, 50, 25);
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
            // Remove scale effect, keep only click functionality
        });

        // Add click handler
        background.on('pointerup', () => {
            this.startGame();
        });
        
        // Also make text interactive
        text.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            // Remove scale effect, keep only click functionality
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