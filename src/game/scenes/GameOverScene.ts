import { EventBus } from '../EventBus';

export class GameOverScene extends Phaser.Scene {
    private restartButton!: Phaser.GameObjects.Container;
    private menuButton!: Phaser.GameObjects.Container;
    private reviveButton!: Phaser.GameObjects.Container;
    private restartButtonText!: Phaser.GameObjects.Text;
    private menuButtonText!: Phaser.GameObjects.Text;
    private reviveButtonText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private highScoreText!: Phaser.GameObjects.Text;
    private finalScore: number = 0;
    private isWatchingAd: boolean = false;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    public init(data: { score: number }): void {
        this.finalScore = data.score || 0;
        console.log('GameOverScene init with score:', this.finalScore);
    }

    public create(): void {
        console.log('GameOverScene create() called');
        
        // Disable any mobile input managers that might interfere with button clicks
        this.disableMobileInputInterference();
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create background overlay
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);
        overlay.setOrigin(0, 0);

        // Create game over panel with rounded corners - make it taller to accommodate the new button
        const panelWidth = 500;
        const panelHeight = 480; // Increased height
        const borderRadius = 25;
        
        // Create panel background with rounded corners
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x333333, 1);
        panelBg.fillRoundedRect(
            centerX - panelWidth / 2,
            centerY - panelHeight / 2,
            panelWidth,
            panelHeight,
            borderRadius
        );
        panelBg.lineStyle(4, 0xFF6B6B, 1);
        panelBg.strokeRoundedRect(
            centerX - panelWidth / 2,
            centerY - panelHeight / 2,
            panelWidth,
            panelHeight,
            borderRadius
        );

        // Create title
        this.titleText = this.add.text(centerX, centerY - 140, 'GAME OVER!', {
            fontSize: '48px',
            color: '#FF6B6B',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(centerX, centerY - 80, `Final: ${this.finalScore}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get high score
        const gameState = (window as any).gameState;
        const highScore = gameState ? gameState.highScore : 0;
        
        // Create high score text
        this.highScoreText = this.add.text(centerX, centerY - 40, `High: ${highScore}`, {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create buttons - adjust positions to accommodate three buttons
        this.createReviveButton(centerX, centerY + 20); // Center button
        this.createRestartButton(centerX - 120, centerY + 100); // Left button
        this.createMenuButton(centerX + 120, centerY + 100); // Right button

        // Add panel background to scene
        this.add.existing(panelBg);
        
        // Add entrance animations
        this.addEntranceAnimations();

        // Create particle effect
        this.createGameOverParticles();

        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private disableMobileInputInterference(): void {
        // Disable any global touch/mouse event listeners that might interfere with button clicks
        console.log('Disabling mobile input interference for GameOverScene');
        
        // Check if there are any global event listeners that might interfere
        const gameState = (window as any).gameState;
        if (gameState && gameState.currentScene && gameState.currentScene.snake) {
            const snake = gameState.currentScene.snake;
            if (snake.mobileInputManager) {
                console.log('Disabling mobile input manager');
                snake.mobileInputManager.disable();
            }
        }
        
        // Also disable any global document event listeners that might interfere
        // This is a safety measure to ensure button clicks work properly
        document.addEventListener('click', (e) => {
            console.log('Document click event:', e.target);
        }, { once: true });
    }

    private createReviveButton(x: number, y: number): void {
        const buttonWidth = 240;
        const buttonHeight = 60;
        const borderRadius = 30;

        // Create button background with modern gradient
        const background = this.add.graphics();
        background.fillGradientStyle(0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border with gradient
        background.lineStyle(3, 0x66BB6A, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create button text with ad icon
        const text = this.add.text(0, 0, '📺 REVIVE BY WATCH AD', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#2E7D32',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.reviveButton = this.add.container(x, y, [background, text]);
        this.reviveButton.setActive(true).setVisible(true);

        // Make the background interactive with larger hit area
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Add click handler with better error handling
        const handleReviveClick = () => {
            console.log('Revive button clicked, isWatchingAd:', this.isWatchingAd);
            if (this.isWatchingAd) {
                console.log('Already watching ad, ignoring click');
                return;
            }
            this.watchAdAndRevive();
        };

        // Add multiple event listeners for better compatibility
        background.on('pointerdown', () => {
            console.log('Revive button pointerdown');
        });

        background.on('pointerup', handleReviveClick);
        background.on('pointerover', () => {
            console.log('Revive button hover');
        });
        
        // Also make text interactive with same handlers
        text.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            console.log('Revive text pointerdown');
        });
        text.on('pointerup', handleReviveClick);
        text.on('pointerover', () => {
            console.log('Revive text hover');
        });

        // Add container-level interaction as backup
        this.reviveButton.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        this.reviveButton.on('pointerdown', () => {
            console.log('Revive container pointerdown');
        });
        this.reviveButton.on('pointerup', handleReviveClick);
    }

    private createRestartButton(x: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const borderRadius = 30;

        // Create button background with modern gradient
        const background = this.add.graphics();
        background.fillGradientStyle(0xFF6B6B, 0xFF5252, 0xE53E3E, 0xD32F2F, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border with gradient
        background.lineStyle(3, 0xFF8A80, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create button text with better styling
        const text = this.add.text(0, 0, 'PLAY AGAIN', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#D32F2F',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.restartButton = this.add.container(x, y, [background, text]);
        this.restartButton.setActive(true).setVisible(true);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Hover effects removed

        // Add click effect
        background.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });

        // Add click handler
        background.on('pointerup', () => {
            this.restartGame();
        });
        
        // Also make text interactive
        text.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });
        text.on('pointerup', () => {
            this.restartGame();
        });
    }

    private createMenuButton(x: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const borderRadius = 30;

        // Create button background with modern gradient - dark blue colors
        const background = this.add.graphics();
        background.fillGradientStyle(0x1a237e, 0x283593, 0x303f9f, 0x3949ab, 1);
        background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        // Add border with gradient
        background.lineStyle(3, 0x5c6bc0, 1);
        background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, borderRadius);

        // Create button text with better styling
        const text = this.add.text(0, 0, 'MAIN MENU', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#1a237e',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create container with all elements
        this.menuButton = this.add.container(x, y, [background, text]);
        this.menuButton.setActive(true).setVisible(true);

        // Make the background interactive
        background.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        // Hover effects removed

        // Add click effect
        background.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });

        // Add click handler
        background.on('pointerup', () => {
            this.goToMenu();
        });
        
        // Also make text interactive
        text.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        text.on('pointerdown', () => {
            // 移除缩放效果，只保留点击功能
        });
        text.on('pointerup', () => {
            this.goToMenu();
        });
    }



    private watchAdAndRevive(): void {
        console.log('watchAdAndRevive called, current state:', {
            isWatchingAd: this.isWatchingAd,
            reviveButton: !!this.reviveButton,
            scene: this.scene.key
        });

        if (this.isWatchingAd) {
            console.log('Already watching ad, preventing duplicate calls');
            return;
        }
        
        if (!this.reviveButton) {
            console.error('Revive button not found!');
            return;
        }
        
        console.log('Starting ad watch for revive...');
        this.isWatchingAd = true;
        
        try {
            // Change revive button to show loading state
            const background = this.reviveButton.getAt(0) as Phaser.GameObjects.Graphics;
            const text = this.reviveButton.getAt(1) as Phaser.GameObjects.Text;
            
            if (background && text) {
                background.clear();
                background.fillGradientStyle(0x666666, 0x555555, 0x444444, 0x333333, 1);
                background.fillRoundedRect(-120, -30, 240, 60, 30);
                background.lineStyle(3, 0x888888, 1);
                background.strokeRoundedRect(-120, -30, 240, 60, 30);
                
                text.setText('📺 WATCHING AD...');
                
                // Disable button interactivity during ad watching
                background.disableInteractive();
                text.disableInteractive();
                this.reviveButton.disableInteractive();
            } else {
                console.error('Failed to get button elements');
                this.isWatchingAd = false;
                return;
            }
            
            // Create loading animation
            this.createAdLoadingEffect();
            
            // Mock ad watching - simulate 3 seconds
            this.time.delayedCall(3000, () => {
                console.log('Ad watching simulation completed');
                this.onAdCompleted();
            });
            
        } catch (error) {
            console.error('Error in watchAdAndRevive:', error);
            this.isWatchingAd = false;
            // Restore button state on error
            this.restoreReviveButton();
        }
    }

    private restoreReviveButton(): void {
        if (!this.reviveButton) return;
        
        try {
            const background = this.reviveButton.getAt(0) as Phaser.GameObjects.Graphics;
            const text = this.reviveButton.getAt(1) as Phaser.GameObjects.Text;
            
            if (background && text) {
                background.clear();
                background.fillGradientStyle(0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32, 1);
                background.fillRoundedRect(-120, -30, 240, 60, 30);
                background.lineStyle(3, 0x66BB6A, 1);
                background.strokeRoundedRect(-120, -30, 240, 60, 30);
                
                text.setText('📺 REVIVE BY WATCH AD');
                
                // Re-enable button interactivity
                background.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);
                text.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);
                this.reviveButton.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);
            }
        } catch (error) {
            console.error('Error restoring revive button:', error);
        }
    }

    private createAdLoadingEffect(): void {
        // Create loading particles around the revive button
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(
                this.reviveButton.x + (Math.random() - 0.5) * 100,
                this.reviveButton.y + (Math.random() - 0.5) * 100,
                3,
                0x4CAF50
            );
            
            this.tweens.add({
                targets: particle,
                x: this.reviveButton.x + (Math.random() - 0.5) * 150,
                y: this.reviveButton.y + (Math.random() - 0.5) * 150,
                alpha: 0,
                scale: 0,
                duration: 2000 + Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Add pulsing effect to revive button during ad watching
        this.tweens.add({
            targets: this.reviveButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 500,
            yoyo: true,
            repeat: 5
        });
    }

    private onAdCompleted(): void {
        console.log('Ad completed! Reviving player...');
        
        if (!this.reviveButton) {
            console.error('Revive button not found in onAdCompleted');
            this.isWatchingAd = false;
            return;
        }
        
        try {
            // Show success effect
            this.createReviveSuccessEffect();
            
            // Change button text to show success
            const text = this.reviveButton.getAt(1) as Phaser.GameObjects.Text;
            const background = this.reviveButton.getAt(0) as Phaser.GameObjects.Graphics;
            
            if (text && background) {
                text.setText('✅ REVIVED!');
                
                background.clear();
                background.fillGradientStyle(0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32, 1);
                background.fillRoundedRect(-120, -30, 240, 60, 30);
                background.lineStyle(3, 0x66BB6A, 1);
                background.strokeRoundedRect(-120, -30, 240, 60, 30);
                
                // Keep button disabled to prevent multiple clicks
                background.disableInteractive();
                text.disableInteractive();
                this.reviveButton.disableInteractive();
            } else {
                console.error('Failed to get button elements in onAdCompleted');
            }
            
            // Reset the ad watching flag
            this.isWatchingAd = false;
            
            // After a short delay, revive the player
            this.time.delayedCall(1000, () => {
                console.log('Starting player revival...');
                this.revivePlayer();
            });
            
        } catch (error) {
            console.error('Error in onAdCompleted:', error);
            this.isWatchingAd = false;
            this.restoreReviveButton();
        }
    }

    private createReviveSuccessEffect(): void {
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                this.reviveButton.x + (Math.random() - 0.5) * 120,
                this.reviveButton.y + (Math.random() - 0.5) * 120,
                4,
                0x4CAF50
            );
            
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                scale: 0,
                duration: 800 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // 移除flash效果，只保留粒子动画
    }

    private revivePlayer(): void {
        console.log('Reviving player...');
        
        // Reset game state for revival
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = true; // Set revival flag
            // Keep the current score for revival
        }
        
        // Add exit animation - include the new revive button
        this.tweens.add({
            targets: [this.titleText, this.scoreText, this.highScoreText, this.restartButton, this.menuButton, this.reviveButton, this.reviveButtonText],
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Switch back to game scene for revival
                this.scene.start('SnakeScene');
            }
        });
    }

    private addEntranceAnimations(): void {
        // Panel animation - find the panel background graphics
        const panelBg = this.children.getAt(1) as Phaser.GameObjects.Graphics;
        if (panelBg && panelBg instanceof Phaser.GameObjects.Graphics) {
            panelBg.setScale(0.5);
            panelBg.setAlpha(0);
            this.tweens.add({
                targets: panelBg,
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
        this.reviveButton.setActive(true).setVisible(true);
        console.log('Buttons set to visible immediately - no animation');
    }

    private createGameOverParticles(): void {
        // Create simple particle effect
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                this.cameras.main.centerX + (Math.random() - 0.5) * 200,
                this.cameras.main.centerY + (Math.random() - 0.5) * 200,
                2,
                0x4CAF50
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
        
        // Add exit animation - include button texts and revive button
        this.tweens.add({
            targets: [this.titleText, this.scoreText, this.highScoreText, this.restartButton, this.menuButton, this.reviveButton, this.reviveButtonText],
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
        
        // Add exit animation - include button texts and revive button
        this.tweens.add({
            targets: [this.titleText, this.scoreText, this.highScoreText, this.restartButton, this.menuButton, this.reviveButton, this.reviveButtonText],
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