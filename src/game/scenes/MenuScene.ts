import { LevelLoader } from '../entities/levels/LevelLoader';
import { EventBus } from '../EventBus';
import { GameSettingsManager } from '../GameSettings';
import { UIHelper } from '../utils/UIHelper';

export class MenuScene extends Phaser.Scene {
    private startButton!: Phaser.GameObjects.Container;
    private startButtonText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private obstacleToggleButton!: Phaser.GameObjects.Container;
    private obstacleToggleText!: Phaser.GameObjects.Text;
    private obstacleToggleIcon!: Phaser.GameObjects.Text;
    private levelToggleButton!: Phaser.GameObjects.Container;
    private levelToggleText!: Phaser.GameObjects.Text;
    private levelToggleIcon!: Phaser.GameObjects.Text;
    private levelSelectButton!: Phaser.GameObjects.Container;
    private levelSelectText!: Phaser.GameObjects.Text;
    private settingsManager: GameSettingsManager;
    private availableLevels: string[] = [];

    constructor() {
        super({ key: 'MenuScene' });
        this.settingsManager = GameSettingsManager.getInstance();
    }

    public create(): void {
        console.log('MenuScene create() called');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Load available levels
        this.availableLevels = LevelLoader.getAvailableLevels();

        // Create background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x222222).setOrigin(0, 0);

        // Create title
        this.titleText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 200,
            text: '🐍 SNAKE GAME',
            fontSize: '48px',
            color: '#2196F3',
            fontStyle: 'bold'
        });

        // Create subtitle
        this.subtitleText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 150,
            text: 'Eat food, grow longer, don\'t crash!',
            fontSize: '18px',
            color: '#ffffff'
        });

        // Create start button
        this.createStartButton(centerX, centerY);

        // Create obstacle mode toggle button
        this.createObstacleToggleButton(centerX, centerY + 70);

        // Create level mode toggle button
        this.createLevelToggleButton(centerX, centerY + 120);

        // Create level selector (initially hidden)
        this.createLevelSelectButton(centerX, centerY + 170);

        // Add game instructions below the toggle buttons
        const instructions = [
            '🎮 Controls: WASD keys, or swipe.',
            '🍎 Goal: Eat food and boosters to grow!',
            '⚠️ Avoid: Walls and your own body!',
            '📺 Revive: Can pick up dropped segments.',
            '🎯 Obstacle Mode: Higher score multiplier!',
            '📋 Level Mode: Play custom levels!'
        ];
        const instructionsText = UIHelper.createText(this, {
            x: centerX,
            y: centerY + 230,
            text: instructions.join('\n'),
            fontSize: '16px',
            color: '#e3f2fd',
            align: 'left',
            lineSpacing: 6,
            wordWrap: { width: 420, useAdvancedWrap: true },
            padding: { top: 10, bottom: 10 }
        });
        instructionsText.setOrigin(0.5, 0);

        // Update UI state
        this.updateLevelSelectVisibility();
        this.updateLevelToggleDisplay();

        // Add entrance animations
        this.addEntranceAnimations();

        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private createObstacleToggleButton(x: number, y: number): void {
        const buttonWidth = 280;
        const buttonHeight = 40;
        const borderRadius = 20;

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
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Create toggle text
        this.obstacleToggleText = this.add.text(10, 0, `Obstacle: ${isEnabled ? 'ON' : 'OFF'} (${isEnabled ? '2x' : '1x'} Score)`, {
            fontSize: '16px',
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

    private createLevelToggleButton(x: number, y: number): void {
        const buttonWidth = 280;
        const buttonHeight = 40;
        const borderRadius = 20;

        // Create button background
        const background = this.add.graphics();
        const isEnabled = this.settingsManager.isLevelModeEnabled();
        const bgColor = isEnabled ? 0xFF9800 : 0x666666;
        const borderColor = isEnabled ? 0xFFB74D : 0x888888;
        
        background.fillGradientStyle(bgColor, bgColor, bgColor, bgColor, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create toggle icon
        this.levelToggleIcon = this.add.text(-buttonWidth/2 + 30, 0, isEnabled ? '📋' : '⚪', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Create toggle text
        this.levelToggleText = this.add.text(10, 0, `Level Mode: ${isEnabled ? 'ON' : 'OFF'}`, {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.levelToggleButton = this.add.container(x, y, [background, this.levelToggleIcon, this.levelToggleText]);
        this.levelToggleButton.setActive(true).setVisible(true);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add click handler
        background.on('pointerup', () => {
            this.toggleLevelMode();
        });
        
        // Also make text interactive
        this.levelToggleText.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        this.levelToggleText.on('pointerup', () => {
            this.toggleLevelMode();
        });
    }

    private createLevelSelectButton(x: number, y: number): void {
        const buttonWidth = 280;
        const buttonHeight = 35;
        const borderRadius = 18;

        // Create button background
        const background = this.add.graphics();
        background.fillGradientStyle(0x9C27B0, 0x9C27B0, 0x9C27B0, 0x9C27B0, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border
        background.lineStyle(2, 0xBA68C8, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Get current level name
        const selectedLevel = this.settingsManager.getSelectedLevelFile();
        const levelName = selectedLevel ? selectedLevel.split('/').pop()?.replace('.json', '') || 'Unknown' : 'Select Level';

        // Create select text
        this.levelSelectText = this.add.text(0, 0, `📂 Level: ${levelName}`, {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.levelSelectButton = this.add.container(x, y, [background, this.levelSelectText]);
        this.levelSelectButton.setActive(true).setVisible(false);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add click handler
        background.on('pointerup', () => {
            this.showLevelSelector();
        });
    }

    private toggleObstacleMode(): void {
        const currentState = this.settingsManager.isObstacleModeEnabled();
        const newState = !currentState;
        
        this.settingsManager.setObstacleMode(newState);
        this.updateObstacleToggleDisplay();
        this.updateLevelSelectVisibility();
        
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

    private toggleLevelMode(): void {
        const currentState = this.settingsManager.isLevelModeEnabled();
        const newState = !currentState;
        
        this.settingsManager.setLevelMode(newState);
        this.updateLevelToggleDisplay();
        this.updateLevelSelectVisibility();
        
        // Add toggle animation
        this.tweens.add({
            targets: this.levelToggleButton,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            ease: 'Power2',
            yoyo: true
        });
    }

    private showLevelSelector(): void {
        // Simple level cycling for now (can be enhanced with a proper dropdown later)
        const currentLevel = this.settingsManager.getSelectedLevelFile();
        const currentIndex = this.availableLevels.indexOf(currentLevel || '');
        const nextIndex = (currentIndex + 1) % this.availableLevels.length;
        const newLevel = this.availableLevels[nextIndex];
        
        this.settingsManager.setSelectedLevelFile(newLevel);
        this.updateLevelSelectDisplay();
        
        // Add selection animation
        this.tweens.add({
            targets: this.levelSelectButton,
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
        background.fillRoundedRect(-140, -20, 280, 40, 20);
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-140, -20, 280, 40, 20);
    }

    private updateLevelToggleDisplay(): void {
        const isEnabled = this.settingsManager.isLevelModeEnabled();
        
        // Update icon
        this.levelToggleIcon.setText(isEnabled ? '📋' : '⚪');
        
        // Update text
        this.levelToggleText.setText(`Level Mode: ${isEnabled ? 'ON' : 'OFF'}`);
        
        // Update background color
        const background = this.levelToggleButton.getAt(0) as Phaser.GameObjects.Graphics;
        const bgColor = isEnabled ? 0xFF9800 : 0x666666;
        const borderColor = isEnabled ? 0xFFB74D : 0x888888;
        
        background.clear();
        background.fillGradientStyle(bgColor, bgColor, bgColor, bgColor, 1);
        background.fillRoundedRect(-140, -20, 280, 40, 20);
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-140, -20, 280, 40, 20);
        
        // Hide obstacle toggle button when level mode is enabled
        this.obstacleToggleButton.setVisible(!isEnabled);
    }

    private updateLevelSelectDisplay(): void {
        const selectedLevel = this.settingsManager.getSelectedLevelFile();
        const levelName = selectedLevel ? selectedLevel.split('/').pop()?.replace('.json', '') || 'Unknown' : 'Select Level';
        this.levelSelectText.setText(`📂 Level: ${levelName}`);
    }

    private updateLevelSelectVisibility(): void {
        const isLevelModeEnabled = this.settingsManager.isLevelModeEnabled();
        this.levelSelectButton.setVisible(isLevelModeEnabled);
        
        // Set default level if none selected and level mode is enabled
        if (isLevelModeEnabled && !this.settingsManager.getSelectedLevelFile() && this.availableLevels.length > 0) {
            this.settingsManager.setSelectedLevelFile(this.availableLevels[0]);
            this.updateLevelSelectDisplay();
        }
    }

    private createStartButton(x: number, y: number): void {
        this.startButton = UIHelper.createButton(this, {
            x,
            y,
            width: 250,
            height: 70,
            text: 'START GAME',
            fontSize: '28px',
            colors: {
                fill: [0x2196F3, 0x1976D2, 0x1565C0, 0x0D47A1],
                border: 0x42A5F5,
                text: '#FFFFFF',
                stroke: '#0D47A1'
            },
            onClick: () => {
                this.startGame();
            },
            borderRadius: 35
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