import { EventBus } from '../EventBus';
import { UIHelper } from '../utils/UIHelper';

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
        const overlay = UIHelper.createOverlay(this, 0x000000, 0.8);

        // Create game over panel
        const panelBg = UIHelper.createPanel(this, {
            x: centerX,
            y: centerY,
            width: 500,
            height: 480,
            fillColor: 0x333333,
            borderColor: 0xFF6B6B,
            borderWidth: 4,
            borderRadius: 25
        });

        // Create title
        this.titleText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 140,
            text: 'GAME OVER!',
            fontSize: '48px',
            color: '#FF6B6B',
            fontStyle: 'bold'
        });

        // Create score text
        this.scoreText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 80,
            text: `Final: ${this.finalScore}`,
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        // Get high score
        const gameState = (window as any).gameState;
        const highScore = gameState ? gameState.highScore : 0;
        
        // Create high score text
        this.highScoreText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 40,
            text: `High: ${highScore}`,
            fontSize: '24px',
            color: '#FFD700'
        });

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
            if (snake.swipeInputManager) {
                console.log('Input manager disabled (via snake.isMoving)');
                // Note: SwipeInputManager doesn't have enable/disable methods
                // Input is controlled by the snake's isMoving property
            }
        }
        
        // Also disable any global document event listeners that might interfere
        // This is a safety measure to ensure button clicks work properly
        document.addEventListener('click', (e) => {
            console.log('Document click event:', e.target);
        }, { once: true });
    }

    private createReviveButton(x: number, y: number): void {
        this.reviveButton = UIHelper.createButton(this, {
            x,
            y,
            width: 240,
            height: 60,
            text: '📺 REVIVE BY WATCH AD',
            fontSize: '18px',
            colors: {
                fill: [0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32],
                border: 0x66BB6A,
                text: '#ffffff',
                stroke: '#2E7D32'
            },
            onClick: () => {
                console.log('Revive button clicked, isWatchingAd:', this.isWatchingAd);
                if (this.isWatchingAd) {
                    console.log('Already watching ad, ignoring click');
                    return;
                }
                this.watchAdAndRevive();
            }
        });
    }

    private createRestartButton(x: number, y: number): void {
        this.restartButton = UIHelper.createButton(this, {
            x,
            y,
            width: 200,
            height: 60,
            text: 'PLAY AGAIN',
            fontSize: '20px',
            colors: {
                fill: [0xFF6B6B, 0xFF5252, 0xE53E3E, 0xD32F2F],
                border: 0xFF8A80,
                text: '#ffffff',
                stroke: '#D32F2F'
            },
            onClick: () => {
                this.restartGame();
            }
        });
    }

    private createMenuButton(x: number, y: number): void {
        this.menuButton = UIHelper.createButton(this, {
            x,
            y,
            width: 200,
            height: 60,
            text: 'MAIN MENU',
            fontSize: '20px',
            colors: {
                fill: [0x1a237e, 0x283593, 0x303f9f, 0x3949ab],
                border: 0x5c6bc0,
                text: '#ffffff',
                stroke: '#1a237e'
            },
            onClick: () => {
                this.goToMenu();
            }
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
            UIHelper.setButtonLoadingState(
                this.reviveButton,
                '📺 WATCHING AD...',
                {
                    fill: [0x666666, 0x555555, 0x444444, 0x333333],
                    border: 0x888888,
                    text: '#ffffff'
                }
            );
            
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
            UIHelper.restoreButtonState(
                this.reviveButton,
                '📺 REVIVE BY WATCH AD',
                {
                    fill: [0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32],
                    border: 0x66BB6A,
                    text: '#ffffff'
                }
            );
        } catch (error) {
            console.error('Error restoring revive button:', error);
        }
    }

    private createAdLoadingEffect(): void {
        // Create loading particles around the revive button
        UIHelper.createParticleEffect(this, this.reviveButton, 8, 0x4CAF50, 100);
        
        // Add pulsing effect to revive button during ad watching
        UIHelper.createPulseAnimation(this, this.reviveButton, 1.05, 500, 5);
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
        UIHelper.createParticleEffect(this, this.reviveButton, 20, 0x4CAF50, 120);
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
        // Create simple particle effect around the center
        const centerTarget = { x: this.cameras.main.centerX, y: this.cameras.main.centerY };
        UIHelper.createParticleEffect(this, centerTarget as any, 30, 0x4CAF50, 200);
    }

    private restartGame(): void {
        console.log('Restarting game...');
        
        // Reset game state for restart
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.score = 0; // Reset score for restart
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = false; // Not reviving, this is a restart
        }
        
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
        
        // Reset game state for menu
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.score = 0; // Reset score when going to menu
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = false;
        }
        
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