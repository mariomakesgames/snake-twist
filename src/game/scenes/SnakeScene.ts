import { ShrinkFood } from '../entities/food/bad/ShrinkFood';
import { SlowFood } from '../entities/food/bad/SlowFood';
import { Food } from '../entities/food/Food';
import { GrowthBoostFood } from '../entities/food/good/GrowthBoostFood';
import { SpeedBoostFood } from '../entities/food/good/SpeedBoostFood';
import { PortalManager } from '../entities/items/special/portal/PortalManager';
import { Snake } from '../entities/Snake';
import { EventBus } from '../EventBus';

export class SnakeScene extends Phaser.Scene {
    public snake!: Snake;
    public food!: Food;
    public growthBoostFood!: GrowthBoostFood;
    public shrinkFood!: ShrinkFood;
    public speedBoostFood!: SpeedBoostFood;
    public slowFood!: SlowFood;
    public portalManager!: PortalManager;
    public gameSpeed: number;
    private gridSize: number;
    private gameWidth: number;
    private gameHeight: number;
    
    // UI Elements
    private pauseButton!: Phaser.GameObjects.Container;
    private isGameStarted: boolean = false;

    constructor() {
        super({ key: 'SnakeScene' });
        this.gameSpeed = 350;
        this.gridSize = 20;
        this.gameWidth = 600;
        this.gameHeight = 600;
    }

    public preload(): void {
        // No image loading needed - we'll use graphics
    }

    public create(): void {
        console.log('SnakeScene create() called');
        console.log('Game dimensions:', this.gameWidth, 'x', this.gameHeight);
        
        // Create background
        this.add.rectangle(0, 0, this.gameWidth, this.gameHeight, 0x222222).setOrigin(0, 0);
        
        // Create grid pattern
        this.createGrid();
        
        // Initialize snake at grid center
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        this.snake = new Snake(this, centerX, centerY);
        
        // Create regular food
        this.food = new Food(this);
        
        // Create growth boost food (yellow)
        this.growthBoostFood = new GrowthBoostFood(this);
        
        // Create shrink food (red)
        this.shrinkFood = new ShrinkFood(this);
        
        // Create speed boost food (orange)
        this.speedBoostFood = new SpeedBoostFood(this);
        
        // Create slow food (pink)
        this.slowFood = new SlowFood(this);
        
        // Create portal manager
        this.portalManager = new PortalManager(this);
        
        // Setup collision detection
        this.physics.add.overlap(this.snake.head, this.food.sprite, this.eatFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.growthBoostFood.sprite, this.eatGrowthBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.shrinkFood.sprite, this.eatShrinkFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.speedBoostFood.sprite, this.eatSpeedBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.slowFood.sprite, this.eatSlowFood, undefined, this);
        
        // Setup wall collision - enable world bounds
        this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
        const headBody = this.snake.head.body as any;
        headBody.setCollideWorldBounds(true);
        this.physics.world.on('worldbounds', this.gameOver, this);
        
        // Setup pause button
        this.createPauseButton();
        
        // Create mobile controls if on mobile device
        this.createMobileControls();
        
        // Check if this is a revival
        const gameState = (window as any).gameState;
        if (gameState && gameState.isReviving) {
            this.reviveGame();
        } else {
            // Auto start the game for new games
            this.autoStartGame();
        }
        
        // Initialize game state
        if (gameState) {
            if (!gameState.isReviving) {
                gameState.score = 0;
            }
            gameState.isPaused = false;
            gameState.isGameOver = false;
            gameState.isTeleporting = false;
            gameState.isReviving = false; // Reset revival flag
            (window as any).updateUI();
        }
        
        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private createGrid(): void {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.3);
        
        for (let x = 0; x <= this.gameWidth; x += this.gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.gameHeight);
        }
        
        for (let y = 0; y <= this.gameHeight; y += this.gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.gameWidth, y);
        }
        
        graphics.stroke();
    }

    private resetSnake(): void {
        // Reset snake to center position
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        
        // Reset head position
        this.snake.head.setPosition(centerX, centerY);
        
        // Reset body segments
        for (let i = 1; i < this.snake.body.length; i++) {
            const segmentX = centerX - i * (this.gameWidth / 30);
            const segmentY = centerY;
            this.snake.body[i].setPosition(segmentX, segmentY);
        }
        
        // Reset direction
        this.snake.direction.set(1, 0);
        
        // Reset snake state
        this.snake.isMoving = false;
        this.snake.setSpeed(this.gameSpeed);
        
        // Reposition all food
        this.food.reposition();
        this.growthBoostFood.reposition();
        this.shrinkFood.reposition();
        this.speedBoostFood.reposition();
        this.slowFood.reposition();
    }

    private autoStartGame(): void {
        console.log('Auto starting game...');
        const gameState = (window as any).gameState;
        
        // Reset game state
        console.log('Resetting game state');
        gameState.score = 0;
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.isTeleporting = false;
        this.gameSpeed = 350;
        (window as any).updateUI();
        
        // Reset snake position and state
        this.resetSnake();
        
        // Start the snake
        this.snake.start();
        
        // Start portal manager
        this.portalManager.start();
        
        // Add celebration effect
        this.createStartCelebration();
        
        // Show pause button with animation
        this.pauseButton.setVisible(true);
        this.pauseButton.setAlpha(0);
        this.pauseButton.setScale(0.8);
        this.tweens.add({
            targets: this.pauseButton,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        this.isGameStarted = true;
        
        console.log('Snake started, isMoving:', this.snake.isMoving);
        console.log('Snake head position:', this.snake.head.x, this.snake.head.y);
        console.log('Snake direction:', this.snake.direction.x, this.snake.direction.y);
    }

    public togglePause(): void {
        const gameState = (window as any).gameState;
        if (!gameState.isGameOver && this.isGameStarted) {
            gameState.isPaused = !gameState.isPaused;
            
            // Update pause button text
            const text = this.pauseButton.getAt(1) as Phaser.GameObjects.Text;
            text.setText(gameState.isPaused ? 'RESUME' : 'PAUSE');
            
            // Add button animation
            this.tweens.add({
                targets: this.pauseButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Power2',
                yoyo: true
            });
            
            // Add pause overlay effect
            if (gameState.isPaused) {
                this.createPauseOverlay();
            } else {
                this.removePauseOverlay();
            }
        }
    }

    private pauseOverlay?: Phaser.GameObjects.Rectangle;
    private pauseText?: Phaser.GameObjects.Text;

    private createPauseOverlay(): void {
        // Create semi-transparent overlay
        this.pauseOverlay = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0x000000,
            0.5
        );
        
        // Create pause text
        this.pauseText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2,
            'PAUSED',
            {
                fontSize: '48px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Add entrance animation
        this.pauseOverlay.setAlpha(0);
        this.pauseText.setAlpha(0);
        this.pauseText.setScale(0.5);
        
        this.tweens.add({
            targets: [this.pauseOverlay, this.pauseText],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: this.pauseText,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    private removePauseOverlay(): void {
        if (this.pauseOverlay && this.pauseText) {
            this.tweens.add({
                targets: [this.pauseOverlay, this.pauseText],
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    this.pauseOverlay?.destroy();
                    this.pauseText?.destroy();
                    this.pauseOverlay = undefined;
                    this.pauseText = undefined;
                }
            });
        }
    }

    private createStartCelebration(): void {
        // Create celebration particles around the snake head
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(
                this.snake.head.x + (Math.random() - 0.5) * 80,
                this.snake.head.y + (Math.random() - 0.5) * 80,
                2,
                0x4CAF50
            );
            
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 150,
                y: particle.y + (Math.random() - 0.5) * 150,
                alpha: 0,
                scale: 0,
                duration: 800 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Add a brief flash effect
        const flash = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0x4CAF50,
            0.3
        );
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    private eatFood(): void {
        console.log('Food eaten!');
        this.snake.grow(1); // Grow by 1 segment
        this.food.reposition();
        
        const gameState = (window as any).gameState;
        gameState.score += 10;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Increase speed every 50 points
        if (gameState.score % 50 === 0) {
            this.gameSpeed = Math.max(50, this.gameSpeed - 10);
            this.snake.setSpeed(this.gameSpeed);
            (window as any).updateUI();
        }
    }

    private eatGrowthBoostFood(): void {
        console.log('Growth boost food eaten!');
        this.snake.grow(5); // Grow by 5 segments
        this.growthBoostFood.reposition();
        
        const gameState = (window as any).gameState;
        gameState.score += 50; // Higher score for growth boost food
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Increase speed every 50 points
        if (gameState.score % 50 === 0) {
            this.gameSpeed = Math.max(50, this.gameSpeed - 10);
            this.snake.setSpeed(this.gameSpeed);
            (window as any).updateUI();
        }
    }

    private eatShrinkFood(): void {
        console.log('Shrink food eaten!');
        this.snake.shrink(1); // Shrink by 1 segment
        this.shrinkFood.reposition();
        
        const gameState = (window as any).gameState;
        gameState.score -= 10; // Lower score for shrink food
        if (gameState.score < 0) gameState.score = 0; // Ensure score doesn't go below 0
        if (gameState.score < gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
    }

    private eatSpeedBoostFood(): void {
        console.log('Speed boost food eaten!');
        this.snake.grow(1); // Grow by 1 segment
        this.speedBoostFood.reposition();
        
        const gameState = (window as any).gameState;
        gameState.score += 15; // Higher score for speed boost food
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Increase speed immediately
        this.gameSpeed = Math.max(30, this.gameSpeed - 20);
        this.snake.setSpeed(this.gameSpeed);
        console.log('Speed increased! New speed:', this.gameSpeed);
        (window as any).updateUI();
    }

    private eatSlowFood(): void {
        console.log('Slow food eaten!');
        this.snake.grow(1); // Grow by 1 segment
        this.slowFood.reposition();
        
        const gameState = (window as any).gameState;
        gameState.score += 5; // Lower score for slow food
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Decrease speed immediately
        this.gameSpeed = Math.min(300, this.gameSpeed + 30);
        this.snake.setSpeed(this.gameSpeed);
        console.log('Speed decreased! New speed:', this.gameSpeed);
        (window as any).updateUI();
    }

    public gameOver(): void {
        console.log('Game Over!');
        const gameState = (window as any).gameState;
        if (!gameState.isGameOver) {
            gameState.isGameOver = true;
            
            // Stop portal manager
            this.portalManager.stop();
            
            // Clean up snake
            if (this.snake) {
                this.snake.destroy();
            }
            
            // Create particle effect for game over
            this.createGameOverParticles();
            
            // Hide pause button with animation
            this.tweens.add({
                targets: this.pauseButton,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.pauseButton.setVisible(false);
                }
            });
            
            this.isGameStarted = false;
            
            EventBus.emit('game-over', gameState.score);
            
            // Switch to game over scene after a short delay
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { score: gameState.score });
            });
        }
    }

    private createGameOverParticles(): void {
        // Create simple particle effect using graphics
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                this.snake.head.x + (Math.random() - 0.5) * 100,
                this.snake.head.y + (Math.random() - 0.5) * 100,
                3,
                0xFF6B6B
            );
            
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                scale: 0,
                duration: 1000 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    public update(time: number): void {
        const gameState = (window as any).gameState;
        if (gameState.isPaused || gameState.isGameOver) return;
        
        this.snake.update(time);
    }

    private createPauseButton(): void {
        const buttonWidth = 120;
        const buttonHeight = 50;
        const x = this.gameWidth - 80;
        const y = 40;

        // Create button background
        const background = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0xFF9800);
        background.setStrokeStyle(2, 0xF57C00);

        // Create button text
        const text = this.add.text(x, y, 'PAUSE', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Create container first
        this.pauseButton = this.add.container(x, y, [background, text]);
        this.pauseButton.setActive(true).setVisible(false);

        // Make the rectangle itself interactive
        background.setInteractive();

        // Add hover effects (desktop only)
        if (!this.isMobileDevice()) {
            background.on('pointerover', () => {
                this.tweens.add({
                    targets: this.pauseButton,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 150,
                    ease: 'Power2'
                });
                background.setFillStyle(0xFFB74D);
            });

            background.on('pointerout', () => {
                this.tweens.add({
                    targets: this.pauseButton,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Power2'
                });
                background.setFillStyle(0xFF9800);
            });
        }

        // Add click effect
        background.on('pointerdown', () => {
            this.tweens.add({
                targets: this.pauseButton,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true
            });
        });

        // Add click handler
        background.on('pointerup', () => {
            this.togglePause();
        });
    }

    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    private createMobileControls(): void {
        // Create unified instruction text
        const instructionText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight + 20,
            'Use arrow keys, mouse drag, or swipe to control',
            {
                fontSize: '14px',
                color: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);

        // Create direction indicators (only for mobile)
        if (this.isMobileDevice()) {
            const indicatorSize = 40;
            const indicatorColor = 0x4CAF50;
            const indicatorAlpha = 0.3;

            // Up arrow
            const upArrow = this.add.graphics();
            upArrow.fillStyle(indicatorColor, indicatorAlpha);
            upArrow.fillTriangle(
                this.gameWidth / 2, this.gameHeight + 80,
                this.gameWidth / 2 - 15, this.gameHeight + 100,
                this.gameWidth / 2 + 15, this.gameHeight + 100
            );

            // Down arrow
            const downArrow = this.add.graphics();
            downArrow.fillStyle(indicatorColor, indicatorAlpha);
            downArrow.fillTriangle(
                this.gameWidth / 2, this.gameHeight + 120,
                this.gameWidth / 2 - 15, this.gameHeight + 100,
                this.gameWidth / 2 + 15, this.gameHeight + 100
            );

            // Left arrow
            const leftArrow = this.add.graphics();
            leftArrow.fillStyle(indicatorColor, indicatorAlpha);
            leftArrow.fillTriangle(
                this.gameWidth / 2 - 20, this.gameHeight + 110,
                this.gameWidth / 2, this.gameHeight + 95,
                this.gameWidth / 2, this.gameHeight + 125
            );

            // Right arrow
            const rightArrow = this.add.graphics();
            rightArrow.fillStyle(indicatorColor, indicatorAlpha);
            rightArrow.fillTriangle(
                this.gameWidth / 2 + 20, this.gameHeight + 110,
                this.gameWidth / 2, this.gameHeight + 95,
                this.gameWidth / 2, this.gameHeight + 125
            );

            // Store references for cleanup
            this.mobileControls = {
                instructionText,
                upArrow,
                downArrow,
                leftArrow,
                rightArrow
            };
        } else {
            // For desktop, only store the instruction text
            this.mobileControls = {
                instructionText
            };
        }
    }

    private mobileControls?: {
        instructionText: Phaser.GameObjects.Text;
        upArrow?: Phaser.GameObjects.Graphics;
        downArrow?: Phaser.GameObjects.Graphics;
        leftArrow?: Phaser.GameObjects.Graphics;
        rightArrow?: Phaser.GameObjects.Graphics;
    };

    private reviveGame(): void {
        console.log('Reviving game...');
        const gameState = (window as any).gameState;
        
        // Reset snake position and state but keep score
        this.resetSnake();
        
        // Start the snake
        this.snake.start();
        
        // Start portal manager
        this.portalManager.start();
        
        // Show pause button with animation
        this.pauseButton.setVisible(true);
        this.pauseButton.setAlpha(0);
        this.pauseButton.setScale(0.8);
        this.tweens.add({
            targets: this.pauseButton,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        this.isGameStarted = true;
        
        // Create revival celebration effect
        this.createRevivalCelebration();
        
        console.log('Game revived, isMoving:', this.snake.isMoving);
        console.log('Current score:', gameState.score);
    }

    private createRevivalCelebration(): void {
        // Create revival particles around the snake head
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                this.snake.head.x + (Math.random() - 0.5) * 100,
                this.snake.head.y + (Math.random() - 0.5) * 100,
                3,
                0x4CAF50
            );
            
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                scale: 0,
                duration: 1000 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Add a revival flash effect
        const flash = this.add.rectangle(
            this.gameWidth / 2,
            this.gameHeight / 2,
            this.gameWidth,
            this.gameHeight,
            0x4CAF50,
            0.3
        );
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Add revival text
        const revivalText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2 - 100,
            'REVIVED!',
            {
                fontSize: '36px',
                color: '#4CAF50',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        this.tweens.add({
            targets: revivalText,
            alpha: 0,
            y: revivalText.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                revivalText.destroy();
            }
        });
    }
} 