import { ShrinkFood } from '../entities/food/bad/ShrinkFood';
import { SlowFood } from '../entities/food/bad/SlowFood';
import { Food } from '../entities/food/Food';
import { GrowthBoostFood } from '../entities/food/good/GrowthBoostFood';
import { SpeedBoostFood } from '../entities/food/good/SpeedBoostFood';
import { PortalManager } from '../entities/items/special/portal/PortalManager';
import { ObstacleManager } from '../entities/obstacles/ObstacleManager';
import { ScoreIndicator } from '../entities/ScoreIndicator';
import { SegmentDrop } from '../entities/SegmentDrop';
import { Snake } from '../entities/Snake';
import { EventBus } from '../EventBus';
import { GameSettingsManager } from '../GameSettings';
import { FoodTutorialManager } from '../tutorial/FoodTutorialManager';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0);

export class SnakeScene extends Phaser.Scene {
    public snake!: Snake;
    public food!: Food;
    public growthBoostFood!: GrowthBoostFood;
    public shrinkFood!: ShrinkFood;
    public speedBoostFood!: SpeedBoostFood;
    public slowFood!: SlowFood;
    public portalManager!: PortalManager;
    public obstacleManager!: ObstacleManager;
    public gameSpeed: number;
    private gridSize: number;
    private gameWidth: number;
    private gameHeight: number;
    
    // UI Elements
    private isGameStarted: boolean = false;
    
    // Tutorial
    private foodTutorialManager!: FoodTutorialManager;
    
    // Score Indicator
    private scoreIndicator!: ScoreIndicator;
    
    // Segment Drops
    private segmentDrops: SegmentDrop[] = [];

    // Settings Manager
    private settingsManager: GameSettingsManager;

    constructor() {
        super({ key: 'SnakeScene' });
        this.gameSpeed = 350;
        this.gridSize = 20;
        this.gameWidth = 600;
        this.gameHeight = 800;
        this.settingsManager = GameSettingsManager.getInstance();
    }

    public preload(): void {
        // No image loading needed - we'll use graphics
    }

    public create(): void {
        console.log('SnakeScene create() called');
        console.log('Game dimensions:', this.gameWidth, 'x', this.gameHeight);
        
        // Get game state early to check for revival
        const gameState = (window as any).gameState;
        
        // Create background
        this.add.rectangle(0, 0, this.gameWidth, this.gameHeight, 0x222222).setOrigin(0, 0);
        
        // Create grid pattern
        this.createGrid();
        
        // Create portal manager
        this.portalManager = new PortalManager(this);
        
        // Create obstacle manager and handle obstacles based on revival state
        this.obstacleManager = new ObstacleManager(this);
        
        // Only handle obstacles if obstacle mode is enabled
        if (this.settingsManager.isObstacleModeEnabled()) {
            if (gameState && gameState.isReviving && gameState.savedObstaclePositions) {
                // Restore saved obstacles during revival
                console.log('🔄 Revival mode - restoring saved obstacles');
                this.obstacleManager.restoreObstacles();
            } else {
                // Generate new obstacles for new game
                console.log('🎯 Obstacle mode enabled - generating new obstacles');
                this.obstacleManager.generateObstacles();
            }
        } else {
            console.log('⚪ Obstacle mode disabled - no obstacles generated');
        }
        
        // Initialize snake at grid center (after obstacles)
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        this.snake = new Snake(this, centerX, centerY);
        
        // Create regular food (after obstacles)
        this.food = new Food(this);
        
        // Create growth boost food (yellow)
        this.growthBoostFood = new GrowthBoostFood(this);
        
        // Create shrink food (red)
        this.shrinkFood = new ShrinkFood(this);
        
        // Create speed boost food (orange)
        this.speedBoostFood = new SpeedBoostFood(this);
        
        // Create slow food (pink)
        this.slowFood = new SlowFood(this);
        
        // Initialize tutorial manager
        this.foodTutorialManager = new FoodTutorialManager(this);
        
        // Initialize score indicator
        this.scoreIndicator = new ScoreIndicator(this);
        
        // Setup collision detection
        this.physics.add.overlap(this.snake.head, this.food.sprite, this.eatFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.growthBoostFood.sprite, this.eatGrowthBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.shrinkFood.sprite, this.eatShrinkFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.speedBoostFood.sprite, this.eatSpeedBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.slowFood.sprite, this.eatSlowFood, undefined, this);
        
        // Setup segment drop collision detection (will be updated when drops are created)
        this.setupSegmentDropCollisions();
        
        // Setup wall collision - enable world bounds
        this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
        const headBody = this.snake.head.body as any;
        headBody.setCollideWorldBounds(true);
        this.physics.world.on('worldbounds', this.gameOver, this);
        

        
        // Create mobile controls if on mobile device
        this.createMobileControls();
        
        // Initialize game state
        if (gameState) {
            if (!gameState.isReviving) {
                gameState.score = 0;
                gameState.savedSnakeLength = undefined; // Clear saved length for new games
            }
            gameState.isPaused = false;
            gameState.isGameOver = false;
            gameState.isTeleporting = false;
            gameState.currentScene = this; // Set current scene reference
            (window as any).updateUI();
        }
        
        // Start game based on revival state
        if (gameState && gameState.isReviving) {
            // Revival mode - call reviveGame instead of autoStartGame
            this.reviveGame();
        } else {
            // New game mode
            this.autoStartGame();
        }
        
        // Reset revival flag after handling
        if (gameState) {
            gameState.isReviving = false;
        }
        
        // Notify that scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    private findValidSnakePosition(centerX: number, centerY: number): { x: number, y: number } {
        const gridSize = this.gridSize;
        const gameWidth = this.gameWidth;
        const gameHeight = this.gameHeight;
        
        // Try the center position first
        if (!this.isPositionOccupied(centerX, centerY)) {
            return { x: centerX, y: centerY };
        }
        
        // If center is occupied, search in a spiral pattern
        const maxAttempts = 100;
        let attempts = 0;
        let radius = 1;
        
        while (attempts < maxAttempts) {
            // Check positions in a square pattern around the center
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check the perimeter of the square
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = centerX + dx * gridSize;
                        const testY = centerY + dy * gridSize;
                        
                        // Check if position is within bounds
                        if (testX >= gridSize / 2 && testX < gameWidth - gridSize / 2 &&
                            testY >= gridSize / 2 && testY < gameHeight - gridSize / 2) {
                            
                            // Check if position and body segments don't overlap with obstacles
                            if (!this.isPositionOccupied(testX, testY) &&
                                !this.isPositionOccupied(testX - gridSize, testY) &&
                                !this.isPositionOccupied(testX - gridSize * 2, testY)) {
                                console.log(`Found valid snake position at (${testX}, ${testY}) after ${attempts} attempts`);
                                return { x: testX, y: testY };
                            }
                        }
                        attempts++;
                    }
                }
            }
            radius++;
        }
        
        // If no valid position found, return center (fallback)
        console.warn('No valid snake position found, using center as fallback');
        return { x: centerX, y: centerY };
    }

    private isPositionOccupied(x: number, y: number): boolean {
        if (!this.obstacleManager) return false;
        
        const obstacles = this.obstacleManager.getObstacles();
        return obstacles.some((obstacle: any) => 
            Math.abs(obstacle.x - x) < 15 && Math.abs(obstacle.y - y) < 15
        );
    }

    private findValidSegmentDropPosition(centerX: number, centerY: number): { x: number, y: number } {
        const gridSize = this.gridSize;
        const gameWidth = this.gameWidth;
        const gameHeight = this.gameHeight;
        
        // Try the center position first
        if (!this.isPositionOccupied(centerX, centerY)) {
            return { x: centerX, y: centerY };
        }
        
        // If center is occupied, search in a spiral pattern
        const maxAttempts = 50;
        let attempts = 0;
        let radius = 1;
        
        while (attempts < maxAttempts) {
            // Check positions in a square pattern around the center
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check the perimeter of the square
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testX = centerX + dx * gridSize;
                        const testY = centerY + dy * gridSize;
                        
                        // Check if position is within bounds
                        if (testX >= gridSize / 2 && testX < gameWidth - gridSize / 2 &&
                            testY >= gridSize / 2 && testY < gameHeight - gridSize / 2) {
                            
                            // Check if position doesn't overlap with obstacles
                            if (!this.isPositionOccupied(testX, testY)) {
                                console.log(`Found valid segment drop position at (${testX}, ${testY}) after ${attempts} attempts`);
                                return { x: testX, y: testY };
                            }
                        }
                        attempts++;
                    }
                }
            }
            radius++;
        }
        
        // If no valid position found, return center (fallback)
        console.warn('No valid segment drop position found, using center as fallback');
        return { x: centerX, y: centerY };
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

    private resetSnake(keepLength: boolean = false, repositionFood: boolean = true): void {
        // Find a valid spawn position that doesn't overlap with obstacles
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        
        const validPosition = this.findValidSnakePosition(centerX, centerY);
        
        // Save current length if we need to keep it
        const currentLength = this.snake.body.length;
        
        // Reset head position
        this.snake.head.setPosition(validPosition.x, validPosition.y);
        
        // If not keeping length, reset to 3 segments
        if (!keepLength) {
            // Remove extra segments beyond 3
            while (this.snake.body.length > 3) {
                const lastSegment = this.snake.body.pop();
                if (lastSegment) {
                    lastSegment.destroy();
                }
            }
        }
        
        // Reset body segments positions
        for (let i = 1; i < this.snake.body.length; i++) {
            const segmentX = validPosition.x - i * this.gridSize;
            const segmentY = validPosition.y;
            this.snake.body[i].setPosition(segmentX, segmentY);
        }
        
        // Reset direction
        this.snake.direction.set(1, 0);
        
        // Reset snake state
        this.snake.isMoving = false;
        this.snake.setSpeed(this.gameSpeed);
        
        // Only reposition food if explicitly requested (not during revival)
        if (repositionFood) {
            this.food.reposition();
            this.growthBoostFood.reposition();
            this.shrinkFood.reposition();
            this.speedBoostFood.reposition();
            this.slowFood.reposition();
        }
        
        console.log(`Snake reset: length ${this.snake.body.length}, keepLength: ${keepLength}`);
    }

    private autoStartGame(): void {
        console.log('Auto starting game...');
        const gameState = (window as any).gameState;
        
        // Reset game state only if not reviving
        console.log('Resetting game state');
        if (!gameState.isReviving) {
            gameState.score = 0;
            this.gameSpeed = 350; // Only reset speed for new games
        }
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.isTeleporting = false;
        (window as any).updateUI();
        
        // Reset snake position and state
        this.resetSnake();
        
        // Start the snake
        this.snake.start();
        
        // Start portal manager
        this.portalManager.start();
        
        // Add celebration effect
        this.createStartCelebration();
        
        this.isGameStarted = true;
        
        console.log('Snake started, isMoving:', this.snake.isMoving);
        console.log('Snake head position:', this.snake.head.x, this.snake.head.y);
        console.log('Snake direction:', this.snake.direction.x, this.snake.direction.y);
    }

    // Add public method to check game status
    public isGameActive(): boolean {
        return this.isGameStarted && !(window as any).gameState?.isGameOver;
    }

    // Add public method to force set pause state
    public setPauseState(paused: boolean): void {
        const gameState = (window as any).gameState;
        if (!gameState || gameState.isGameOver || !this.isGameStarted) return;
        
        if (gameState.isPaused !== paused) {
            gameState.isPaused = paused;
            

            
            // Add pause overlay effect
            if (gameState.isPaused) {
                this.createPauseOverlay();
            } else {
                this.removePauseOverlay();
            }
        }
    }

    private pauseOverlay?: Phaser.GameObjects.Graphics;
    private pauseText?: Phaser.GameObjects.Text;
    private pauseIcon?: Phaser.GameObjects.Graphics;
    private pauseSubtitle?: Phaser.GameObjects.Text;

    private createPauseOverlay(): void {
        // Check if pause overlay already exists, if so clean it up first
        if (this.pauseOverlay || this.pauseText || this.pauseIcon || this.pauseSubtitle) {
            this.removePauseOverlay();
            // Wait one frame to ensure cleanup is complete
            this.time.delayedCall(16, () => {
                this.createPauseOverlayInternal();
            });
            return;
        }
        
        this.createPauseOverlayInternal();
    }

    private createPauseOverlayInternal(): void {
        // Create gradient overlay with blur effect
        this.pauseOverlay = this.add.graphics();
        this.pauseOverlay.fillGradientStyle(0x000000, 0x000000, 0x1a1a1a, 0x1a1a1a, 0.7, 0.7, 0.9, 0.9);
        this.pauseOverlay.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Create pause icon with rounded corners
        const pauseIcon = this.add.graphics();
        pauseIcon.fillStyle(0xffffff, 0.9);
        pauseIcon.fillRoundedRect(-15, -30, 8, 60, 4);
        pauseIcon.fillRoundedRect(7, -30, 8, 60, 4);
        
        // Create pause text with better styling
        this.pauseText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2 + 60,
            'TAP TO RESUME',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        // Create subtitle text
        const subtitleText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2 + 100,
            'Game Paused',
            {
                fontSize: '18px',
                color: '#cccccc',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);
        
        // Position pause icon
        pauseIcon.setPosition(this.gameWidth / 2, this.gameHeight / 2 - 20);
        
        // Add entrance animation with staggered timing
        this.pauseOverlay.setAlpha(0);
        pauseIcon.setAlpha(0);
        this.pauseText.setAlpha(0);
        subtitleText.setAlpha(0);
        this.pauseText.setScale(0.5);
        pauseIcon.setScale(0.5);
        
        // Animate overlay first
        this.tweens.add({
            targets: this.pauseOverlay,
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });
        
        // Animate pause icon
        this.tweens.add({
            targets: pauseIcon,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });
        
        // Animate main text
        this.tweens.add({
            targets: this.pauseText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            delay: 300,
            ease: 'Back.easeOut'
        });
        
        // Animate subtitle
        this.tweens.add({
            targets: subtitleText,
            alpha: 1,
            duration: 400,
            delay: 400,
            ease: 'Power2'
        });

        // Add pulsing animation to text
        this.tweens.add({
            targets: this.pauseText,
            alpha: 0.7,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Make everything interactive
        this.pauseOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.gameWidth, this.gameHeight), Phaser.Geom.Rectangle.Contains);
        this.pauseText.setInteractive();
        subtitleText.setInteractive();
        
        const resumeGame = () => {
            const gameState = (window as any).gameState;
            if (gameState && gameState.isPaused && !gameState.isGameOver && this.isGameStarted) {
                console.log('用户点击屏幕恢复游戏');
                this.setPauseState(false); // Changed from togglePause to setPauseState
            }
        };
        
        this.pauseOverlay.on('pointerdown', resumeGame);
        this.pauseText.on('pointerdown', resumeGame);
        subtitleText.on('pointerdown', resumeGame);
        
        // Store references for cleanup
        this.pauseIcon = pauseIcon;
        this.pauseSubtitle = subtitleText;
    }

    private removePauseOverlay(): void {
        if (this.pauseOverlay || this.pauseText || this.pauseIcon || this.pauseSubtitle) {
            // Immediately stop all related tweens
            if (this.pauseOverlay) {
                this.tweens.killTweensOf(this.pauseOverlay);
            }
            if (this.pauseText) {
                this.tweens.killTweensOf(this.pauseText);
            }
            if (this.pauseIcon) {
                this.tweens.killTweensOf(this.pauseIcon);
            }
            if (this.pauseSubtitle) {
                this.tweens.killTweensOf(this.pauseSubtitle);
            }
            
            // Immediately destroy all elements
            this.pauseOverlay?.destroy();
            this.pauseText?.destroy();
            this.pauseIcon?.destroy();
            this.pauseSubtitle?.destroy();
            
            // Reset references
            this.pauseOverlay = undefined;
            this.pauseText = undefined;
            this.pauseIcon = undefined;
            this.pauseSubtitle = undefined;
        }
    }

    private createStartCelebration(): void {
        // Add "GAME START!" text only
        const startText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2 - 100,
            'GAME START!',
            {
                fontSize: '36px',
                color: '#4CAF50',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#2E7D32',
                strokeThickness: 3,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        startText.setAlpha(0);
        startText.setScale(0.5);
        
        this.tweens.add({
            targets: startText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: startText,
                    alpha: 0,
                    y: startText.y - 50,
                    duration: 800,
                    delay: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        startText.destroy();
                    }
                });
            }
        });
    }

    private eatFood(): void {
        console.log('Food eaten!');
        this.snake.grow(1); // Grow by 1 segment
        this.food.reposition();
        
        const gameState = (window as any).gameState;
        const baseScoreGain = 10; // Base score gain of 10 points
        const scoreGain = Math.round(baseScoreGain * this.settingsManager.getScoreMultiplier());
        console.log(`Base score: ${baseScoreGain}, Multiplier: ${this.settingsManager.getScoreMultiplier()}, Final score: ${scoreGain}`);
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score indicator
        this.scoreIndicator.showScoreIndicator(this.snake.head.x, this.snake.head.y, scoreGain, '#00ff00');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 30, '+1🟩', '#00ff00');
        
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
        
        // Show tutorial for growth boost food if not shown before
        this.foodTutorialManager.showTutorial('growth-boost');
        
        const gameState = (window as any).gameState;
        const baseScoreGain = 50;
        const scoreGain = Math.round(baseScoreGain * this.settingsManager.getScoreMultiplier());
        gameState.score += scoreGain; // Higher score for growth boost food
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score indicator
        this.scoreIndicator.showScoreIndicator(this.snake.head.x, this.snake.head.y, scoreGain, '#ffff00');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 30, '+5🟩', '#ffff00');
        
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
        
        // Show tutorial for shrink food if not shown before
        this.foodTutorialManager.showTutorial('shrink-food');
        
        // No score change for shrink food
        (window as any).updateUI();
        
        // Show effect indicator only
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 30, '-1🟩', '#ff0000');
    }

    private eatSpeedBoostFood(): void {
        console.log('Speed boost food eaten!');
        this.snake.grow(1); // Grow by 1 segment
        this.speedBoostFood.reposition();
        
        // Show tutorial for speed boost food if not shown before
        this.foodTutorialManager.showTutorial('speed-boost');
        
        const gameState = (window as any).gameState;
        const baseScoreGain = 10; // Same as regular food since it only grows by 1
        const scoreGain = Math.round(baseScoreGain * this.settingsManager.getScoreMultiplier());
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score indicator
        this.scoreIndicator.showScoreIndicator(this.snake.head.x, this.snake.head.y, scoreGain, '#ff8800');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 30, '+1🟩', '#ff8800');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 50, 'Speed Boost', '#ff8800');
        
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
        
        // Show tutorial for slow food if not shown before
        this.foodTutorialManager.showTutorial('slow-food');
        
        const gameState = (window as any).gameState;
        const baseScoreGain = 10; // Same as regular food since it grows by 1
        const scoreGain = Math.round(baseScoreGain * this.settingsManager.getScoreMultiplier());
        gameState.score += scoreGain;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('snakeHighScore', gameState.highScore.toString());
        }
        (window as any).updateUI();
        
        // Show score indicator
        this.scoreIndicator.showScoreIndicator(this.snake.head.x, this.snake.head.y, scoreGain, '#ff69b4');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 30, '+1🟩', '#ff69b4');
        this.scoreIndicator.showEffectIndicator(this.snake.head.x, this.snake.head.y + 50, 'Speed Slow', '#ff69b4');
        
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
            
            // Save snake length before destroying
            if (this.snake) {
                gameState.savedSnakeLength = this.snake.body.length;
                console.log('Saved snake length:', gameState.savedSnakeLength);
            }
            
            // Create segment drops
            this.createSegmentDrops();
            
            // Store segment drops data for revival BEFORE destroying snake
            gameState.segmentDropsData = this.segmentDrops.map(drop => ({
                x: drop.sprite.x,
                y: drop.sprite.y,
                value: drop.value
            }));
            console.log('Saved segment drops data:', gameState.segmentDropsData);
            
            // Stop portal manager
            this.portalManager.stop();
            
            // Clean up snake
            if (this.snake) {
                this.snake.destroy();
            }
            
            // Clean up tutorial manager
            if (this.foodTutorialManager) {
                this.foodTutorialManager.destroy();
            }
            
            // Clean up score indicator
            if (this.scoreIndicator) {
                this.scoreIndicator.destroy();
            }
            
            // Create particle effect for game over
            this.createGameOverParticles();
            

            
            this.isGameStarted = false;
            
            EventBus.emit('game-over', gameState.score);
            
            // Save obstacles for revival
            if (this.obstacleManager) {
                this.obstacleManager.saveObstacles();
            }
            
            // Switch to game over scene after a short delay
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { score: gameState.score });
            });
        }
    }

    private createSegmentDrops(): void {
        if (!this.snake) return;
        
        const totalSegments = this.snake.body.length;
        const dropCount = Math.max(1, Math.min(5, Math.floor(totalSegments / 3)));
        
        console.log(`Creating ${dropCount} segment drops from ${totalSegments} total segments`);
        
        // Clear existing drops
        this.clearSegmentDrops();
        
        // Get death position (where the collision happened)
        const deathX = this.snake.head.x;
        const deathY = this.snake.head.y;
        
        // Create new drops around the death position, aligned to grid
        for (let i = 0; i < dropCount; i++) {
            const angle = (i / dropCount) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const rawX = deathX + Math.cos(angle) * distance;
            const rawY = deathY + Math.sin(angle) * distance;
            
            // Align to grid
            const gridX = Math.floor(rawX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const gridY = Math.floor(rawY / this.gridSize) * this.gridSize + this.gridSize / 2;
            
            // Ensure drops are within game bounds
            const clampedX = Math.max(this.gridSize / 2, Math.min(this.gameWidth - this.gridSize / 2, gridX));
            const clampedY = Math.max(this.gridSize / 2, Math.min(this.gameHeight - this.gridSize / 2, gridY));
            
            // Find a valid position that doesn't overlap with obstacles
            const validPosition = this.findValidSegmentDropPosition(clampedX, clampedY);
            
            const segmentDrop = new SegmentDrop(this, validPosition.x, validPosition.y, 1);
            this.segmentDrops.push(segmentDrop);
            
            // Add collision detection for this segment drop
            if (this.snake && this.snake.head) {
                this.physics.add.overlap(this.snake.head, segmentDrop.sprite, () => {
                    this.collectSegmentDrop(segmentDrop);
                }, undefined, this);
            }
        }
    }
    
    private clearSegmentDrops(): void {
        this.segmentDrops.forEach(drop => drop.destroy());
        this.segmentDrops = [];
    }
    
    private recreateSegmentDrops(): void {
        const gameState = (window as any).gameState;
        if (!gameState.segmentDropsData) return;
        
        console.log('Recreating segment drops from saved data');
        
        // Clear existing drops
        this.clearSegmentDrops();
        
        // Recreate drops from saved data
        gameState.segmentDropsData.forEach((dropData: any) => {
            const segmentDrop = new SegmentDrop(this, dropData.x, dropData.y, dropData.value);
            this.segmentDrops.push(segmentDrop);
        });
        
        // Setup collision detection for the recreated segment drops
        this.setupSegmentDropCollisions();
        
        // Clear the saved data
        gameState.segmentDropsData = null;
        
        console.log(`Recreated ${this.segmentDrops.length} segment drops`);
    }
    
    private setupSegmentDropCollisions(): void {
        // Setup collision detection for all existing segment drops
        this.segmentDrops.forEach(segmentDrop => {
            this.physics.add.overlap(this.snake.head, segmentDrop.sprite, () => {
                this.collectSegmentDrop(segmentDrop);
            }, undefined, this);
        });
    }
    
    private collectSegmentDrop(segmentDrop: SegmentDrop): void {
        const collected = segmentDrop.collect();
        if (collected > 0) {
            console.log(`Collected segment drop: +${collected}`);
            
            // Grow snake immediately
            if (this.snake) {
                this.snake.grow(collected);
                
                // Show collection indicator
                if (this.scoreIndicator) {
                    this.scoreIndicator.showEffectIndicator(
                        this.snake.head.x, 
                        this.snake.head.y + 30, 
                        `+${collected}🟩`, 
                        '#4CAF50'
                    );
                }
            }
            
            // Remove from array
            const index = this.segmentDrops.indexOf(segmentDrop);
            if (index > -1) {
                this.segmentDrops.splice(index, 1);
            }
        }
    }
    
    private collectSegmentDrops(): void {
        let totalCollected = 0;
        
        this.segmentDrops.forEach(drop => {
            const collected = drop.collect();
            totalCollected += collected;
        });
        
        if (totalCollected > 0) {
            console.log(`Collected ${totalCollected} segment drops`);
            
            // Store the collected count to apply after snake is recreated
            const gameState = (window as any).gameState;
            gameState.collectedSegments = totalCollected;
        }
        
        // Clear the drops array
        this.segmentDrops = [];
    }

    private createGameOverParticles(): void {
        // Create dramatic particle effect with green colors
        const colors = [0x4CAF50, 0x66BB6A, 0x81C784, 0xA5D6A7, 0x2E7D32];
        const deathX = this.snake.head.x;
        const deathY = this.snake.head.y;
        
        // Create explosion effect
        for (let i = 0; i < 35; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = (i / 35) * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            
            const particle = this.add.circle(
                deathX + Math.cos(angle) * distance,
                deathY + Math.sin(angle) * distance,
                4 + Math.random() * 4,
                color
            );
            
            // Add glow effect
            const glow = this.add.circle(particle.x, particle.y, particle.radius + 8, color, 0.4);
            
            // Calculate final position
            const finalX = deathX + Math.cos(angle) * (150 + Math.random() * 100);
            const finalY = deathY + Math.sin(angle) * (150 + Math.random() * 100);
            
            this.tweens.add({
                targets: [particle, glow],
                x: finalX,
                y: finalY,
                alpha: 0,
                scale: 0,
                duration: 1200 + Math.random() * 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                    glow.destroy();
                }
            });
        }
        
        // Game over text removed - no longer displaying "GAME OVER" text
    }

    public update(time: number): void {
        const gameState = (window as any).gameState;
        if (gameState.isPaused || gameState.isGameOver) return;
        
        this.snake.update(time);
    }

    private createMobileControls(): void {
        // Create modern instruction text with gradient background
        const instructionBg = this.add.graphics();
        instructionBg.fillGradientStyle(0x4CAF50, 0x45A049, 0x388E3C, 0x2E7D32, 0.8, 0.8, 0.9, 0.9);
        instructionBg.fillRoundedRect(
            this.gameWidth / 2 - 200, 
            this.gameHeight + 10, 
            400, 
            30, 
            15
        );
        instructionBg.lineStyle(2, 0x66BB6A, 1);
        instructionBg.strokeRoundedRect(
            this.gameWidth / 2 - 200, 
            this.gameHeight + 10, 
            400, 
            30, 
            15
        );

        const instructionText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight + 25,
            '🎮 Use WASD keys, mouse drag, or swipe to control',
            {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#2E7D32',
                strokeThickness: 1
            }
        ).setOrigin(0.5);

        // Create direction indicators (only for mobile)
        if (isMobile) {
            const centerX = this.gameWidth / 2;
            const centerY = this.gameHeight + 80;
            const arrowSize = 20;
            const arrowColor = 0x4CAF50;
            const arrowAlpha = 0.6;

            // Create circular background for arrows
            const arrowBg = this.add.graphics();
            arrowBg.fillStyle(0xffffff, 0.1);
            arrowBg.fillCircle(centerX, centerY, 60);
            arrowBg.lineStyle(2, 0x4CAF50, 0.3);
            arrowBg.strokeCircle(centerX, centerY, 60);

            // Up arrow with gradient
            const upArrow = this.add.graphics();
            upArrow.fillGradientStyle(arrowColor, arrowColor, 0x66BB6A, 0x66BB6A, arrowAlpha, arrowAlpha, 0.8, 0.8);
            upArrow.fillTriangle(
                centerX, centerY - 25,
                centerX - arrowSize, centerY - 5,
                centerX + arrowSize, centerY - 5
            );

            // Down arrow with gradient
            const downArrow = this.add.graphics();
            downArrow.fillGradientStyle(arrowColor, arrowColor, 0x66BB6A, 0x66BB6A, arrowAlpha, arrowAlpha, 0.8, 0.8);
            downArrow.fillTriangle(
                centerX, centerY + 25,
                centerX - arrowSize, centerY + 5,
                centerX + arrowSize, centerY + 5
            );

            // Left arrow with gradient
            const leftArrow = this.add.graphics();
            leftArrow.fillGradientStyle(arrowColor, arrowColor, 0x66BB6A, 0x66BB6A, arrowAlpha, arrowAlpha, 0.8, 0.8);
            leftArrow.fillTriangle(
                centerX - 25, centerY,
                centerX - 5, centerY - arrowSize,
                centerX - 5, centerY + arrowSize
            );

            // Right arrow with gradient
            const rightArrow = this.add.graphics();
            rightArrow.fillGradientStyle(arrowColor, arrowColor, 0x66BB6A, 0x66BB6A, arrowAlpha, arrowAlpha, 0.8, 0.8);
            rightArrow.fillTriangle(
                centerX + 25, centerY,
                centerX + 5, centerY - arrowSize,
                centerX + 5, centerY + arrowSize
            );

            // Add pulsing animation to arrows
            [upArrow, downArrow, leftArrow, rightArrow].forEach((arrow, index) => {
                this.tweens.add({
                    targets: arrow,
                    alpha: 0.3,
                    duration: 1500,
                    delay: index * 200,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            });

            // Store references for cleanup
            this.mobileControls = {
                instructionText,
                instructionBg,
                arrowBg,
                upArrow,
                downArrow,
                leftArrow,
                rightArrow
            };
        } else {
            // For desktop, only store the instruction text and background
            this.mobileControls = {
                instructionText,
                instructionBg
            };
        }
    }

    private mobileControls?: {
        instructionText: Phaser.GameObjects.Text;
        instructionBg?: Phaser.GameObjects.Graphics;
        arrowBg?: Phaser.GameObjects.Graphics;
        upArrow?: Phaser.GameObjects.Graphics;
        downArrow?: Phaser.GameObjects.Graphics;
        leftArrow?: Phaser.GameObjects.Graphics;
        rightArrow?: Phaser.GameObjects.Graphics;
    };

    private reviveGame(): void {
        console.log('Reviving game...');
        const gameState = (window as any).gameState;
        
        // Recreate segment drops from saved data
        this.recreateSegmentDrops();
        
        // Reset snake position and state but keep length and don't reposition food
        this.resetSnake(true, false);
        
        // Restore snake to saved length
        if (gameState.savedSnakeLength && gameState.savedSnakeLength > 3) {
            const currentLength = this.snake.body.length;
            const targetLength = gameState.savedSnakeLength;
            
            if (currentLength < targetLength) {
                // Grow snake to saved length
                const segmentsToAdd = targetLength - currentLength;
                this.snake.grow(segmentsToAdd);
                console.log(`Restored snake length from ${currentLength} to ${targetLength} (added ${segmentsToAdd} segments)`);
            } else if (currentLength > targetLength) {
                // Shrink snake to saved length
                const segmentsToRemove = currentLength - targetLength;
                this.snake.shrink(segmentsToRemove);
                console.log(`Restored snake length from ${currentLength} to ${targetLength} (removed ${segmentsToRemove} segments)`);
            }
        }
        
        // Start the snake
        this.snake.start();
        
        // Start portal manager
        this.portalManager.start();
        

        
        this.isGameStarted = true;
        
        // Create revival celebration effect
        this.createRevivalCelebration();
        
        console.log('Game revived, isMoving:', this.snake.isMoving);
        console.log('Current score:', gameState.score);
        console.log('Snake length after revival:', this.snake.body.length);
    }

    private createRevivalCelebration(): void {
        
        // Add revival text with golden effect
        const revivalText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight / 2 - 100,
            'REVIVED!',
            {
                fontSize: '42px',
                color: '#FFD700',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#FFA500',
                strokeThickness: 3,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        revivalText.setAlpha(0);
        revivalText.setScale(0.5);
        
        this.tweens.add({
            targets: revivalText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: revivalText,
                    alpha: 0,
                    y: revivalText.y - 50,
                    duration: 800,
                    delay: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        revivalText.destroy();
                    }
                });
            }
        });
        
        // Add sparkle effects around the snake
        for (let i = 0; i < 8; i++) {
            const sparkle = this.add.text(
                this.snake.head.x + (Math.random() - 0.5) * 200,
                this.snake.head.y + (Math.random() - 0.5) * 100,
                '✨',
                {
                    fontSize: '24px',
                    color: '#FFD700'
                }
            ).setOrigin(0.5);
            
            sparkle.setAlpha(0);
            
            this.tweens.add({
                targets: sparkle,
                alpha: 1,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 400,
                delay: i * 100,
                ease: 'Back.easeOut',
                yoyo: true,
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
    }
} 