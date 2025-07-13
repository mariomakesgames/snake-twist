import { EventBus } from '../EventBus';

export class GameOverScene extends Phaser.Scene {
    private restartButton!: Phaser.GameObjects.Rectangle;
    private menuButton!: Phaser.GameObjects.Rectangle;
    private restartButtonText!: Phaser.GameObjects.Text;
    private menuButtonText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private highScoreText!: Phaser.GameObjects.Text;
    private finalScore: number = 0;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    public init(data: { score: number }): void {
        this.finalScore = data.score || 0;
        console.log('GameOverScene init with score:', this.finalScore);
    }

    public create(): void {
        console.log('GameOverScene create() called');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create background overlay
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);
        overlay.setOrigin(0, 0);

        // Create game over panel
        const panelWidth = 500;
        const panelHeight = 400;
        const panel = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x333333);
        panel.setStrokeStyle(4, 0xFF6B6B);

        // Create title
        this.titleText = this.add.text(centerX, centerY - 120, 'GAME OVER!', {
            fontSize: '48px',
            color: '#FF6B6B',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(centerX, centerY - 60, `Final Score: ${this.finalScore}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get high score
        const gameState = (window as any).gameState;
        const highScore = gameState ? gameState.highScore : 0;
        
        // Create high score text
        this.highScoreText = this.add.text(centerX, centerY - 20, `High Score: ${highScore}`, {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create buttons
        this.createRestartButton(centerX - 120, centerY + 80);
        this.createMenuButton(centerX + 120, centerY + 80);

        // Add entrance animations
        this.addEntranceAnimations();

        // Create particle effect
        this.createGameOverParticles();

        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private createRestartButton(x: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 60;

        // Create button background - direct rectangle like MenuScene
        const background = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0xFF6B6B);
        background.setStrokeStyle(3, 0xE53E3E);
        background.setActive(true).setVisible(true);

        // Create button text
        const text = this.add.text(x, y, 'PLAY AGAIN', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        text.setActive(true).setVisible(true);

        // Store references
        this.restartButton = background;
        this.restartButtonText = text;

        // Make background interactive directly
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add hover effects to background
        background.on('pointerover', () => {
            background.setFillStyle(0xFF8A80);
            background.setStrokeStyle(3, 0xFF6B6B);
        });

        background.on('pointerout', () => {
            background.setFillStyle(0xFF6B6B);
            background.setStrokeStyle(3, 0xE53E3E);
        });

        // Add click handler to background
        background.on('pointerdown', () => {
            this.restartGame();
        });
        
        // Also make text interactive and pass through to background
        text.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            this.restartGame();
        });
    }

    private createMenuButton(x: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 60;

        // Create button background - direct rectangle like MenuScene
        const background = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x666666);
        background.setStrokeStyle(3, 0x444444);
        background.setActive(true).setVisible(true);

        // Create button text
        const text = this.add.text(x, y, 'MAIN MENU', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        text.setActive(true).setVisible(true);

        // Store references
        this.menuButton = background;
        this.menuButtonText = text;

        // Make background interactive directly
        background.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add hover effects to background
        background.on('pointerover', () => {
            background.setFillStyle(0x888888);
            background.setStrokeStyle(3, 0x666666);
        });

        background.on('pointerout', () => {
            background.setFillStyle(0x666666);
            background.setStrokeStyle(3, 0x444444);
        });

        // Add click handler to background
        background.on('pointerdown', () => {
            this.goToMenu();
        });
        
        // Also make text interactive and pass through to background
        text.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            this.goToMenu();
        });
    }

    private addEntranceAnimations(): void {
        // Panel animation - find the panel rectangle
        const panel = this.children.getByName('panel') || this.children.getAt(1);
        if (panel && panel instanceof Phaser.GameObjects.Rectangle) {
            panel.setScale(0.5);
            panel.setAlpha(0);
            this.tweens.add({
                targets: panel,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        }

        // Title animation
        this.titleText.setAlpha(0);
        this.titleText.setScale(0.5);
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 200
        });

        // Score text animation
        this.scoreText.setAlpha(0);
        this.scoreText.setY(this.scoreText.y + 30);
        this.tweens.add({
            targets: this.scoreText,
            alpha: 1,
            y: this.scoreText.y - 30,
            duration: 500,
            ease: 'Power2',
            delay: 400
        });

        // High score text animation
        this.highScoreText.setAlpha(0);
        this.highScoreText.setY(this.highScoreText.y + 30);
        this.tweens.add({
            targets: this.highScoreText,
            alpha: 1,
            y: this.highScoreText.y - 30,
            duration: 500,
            ease: 'Power2',
            delay: 600
        });

        // Buttons immediately visible and active - no animation like MenuScene
        this.restartButton.setActive(true).setVisible(true);
        this.menuButton.setActive(true).setVisible(true);
        console.log('Buttons set to visible immediately - no animation');
    }

    private createGameOverParticles(): void {
        // Create simple particle effect
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                this.cameras.main.centerX + (Math.random() - 0.5) * 200,
                this.cameras.main.centerY + (Math.random() - 0.5) * 200,
                2,
                0xFF6B6B
            );
            
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 300,
                y: particle.y + (Math.random() - 0.5) * 300,
                alpha: 0,
                scale: 0,
                duration: 1500 + Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    private restartGame(): void {
        console.log('Restarting game...');
        
        // Add exit animation - include button texts
        this.tweens.add({
            targets: [this.titleText, this.scoreText, this.highScoreText, this.restartButton, this.menuButton, this.restartButtonText, this.menuButtonText],
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

    private goToMenu(): void {
        console.log('Going to menu...');
        
        // Add exit animation - include button texts
        this.tweens.add({
            targets: [this.titleText, this.scoreText, this.highScoreText, this.restartButton, this.menuButton, this.restartButtonText, this.menuButtonText],
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Switch to menu scene
                this.scene.start('MenuScene');
            }
        });
    }
} 