import { ShrinkFood } from '../entities/food/bad/ShrinkFood';
import { SlowFood } from '../entities/food/bad/SlowFood';
import { Food } from '../entities/food/Food';
import { GrowthBoostFood } from '../entities/food/good/GrowthBoostFood';
import { SpeedBoostFood } from '../entities/food/good/SpeedBoostFood';
import { PortalManager } from '../entities/items/special/portal/PortalManager';
import { LevelLoader } from '../entities/levels/LevelLoader';
import { ObstacleManager } from '../entities/obstacles/ObstacleManager';
import { TilemapObstacleManager } from '../entities/obstacles/TilemapObstacleManager';
import { ScoreIndicator } from '../entities/ScoreIndicator';
import { SegmentDrop } from '../entities/SegmentDrop';
import { Snake } from '../entities/Snake';
import { EventBus } from '../EventBus';
import { GameSettingsManager } from '../GameSettings';
import { FoodTutorialManager } from '../tutorial/FoodTutorialManager';
import { UIHelper } from '../utils/UIHelper';

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
    public obstacleManager: ObstacleManager | null = null;
    public tilemapObstacleManager: TilemapObstacleManager | null = null;
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

    // Game Over Overlay Elements
    private gameOverOverlay?: Phaser.GameObjects.Rectangle;
    private gameOverPanel?: Phaser.GameObjects.Graphics;
    private gameOverTitleText?: Phaser.GameObjects.Text;
    private gameOverScoreText?: Phaser.GameObjects.Text;
    private gameOverHighScoreText?: Phaser.GameObjects.Text;
    private gameOverRestartButton?: Phaser.GameObjects.Container;
    private gameOverMenuButton?: Phaser.GameObjects.Container;
    private gameOverReviveButton?: Phaser.GameObjects.Container;
    private isWatchingAd: boolean = false;

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

    public async create(): Promise<void> {
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
        
        // Handle obstacles based on current mode
        await this.setupObstacles(gameState);
        
        // Initialize snake at grid center (after obstacles)
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        this.snake = new Snake(this, centerX, centerY);
        
        // Setup obstacle collisions with snake after snake is created
        if (this.obstacleManager) {
            this.obstacleManager.setupCollisionsWithSnake();
        }
        if (this.tilemapObstacleManager) {
            this.tilemapObstacleManager.setupCollisionsWithSnake();
        }
        
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

    public isPositionOccupied(x: number, y: number): boolean {
        if (!this.obstacleManager && !this.tilemapObstacleManager) return false;
        
        const obstacles = this.obstacleManager ? this.obstacleManager.getObstacles() : [];
        const tilemapObstacles = this.tilemapObstacleManager ? this.tilemapObstacleManager.getObstacles() : [];

        return obstacles.some((obstacle: any) => 
            Math.abs(obstacle.x - x) < 15 && Math.abs(obstacle.y - y) < 15
        ) || tilemapObstacles.some((obstacle: any) => 
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
            
            // Create segment drops (they will persist in the scene)
            this.createSegmentDrops();
            
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
            
            // No need to save obstacles since we're not switching scenes anymore
            
            // Show game over overlay instead of switching scene
            this.time.delayedCall(1000, () => {
                this.showGameOverOverlay(gameState.score);
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
    
    // recreateSegmentDrops method removed - segment drops persist in scene now
    
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
        
        // Add null check for snake
        if (this.snake) {
            this.snake.update(time);
        }
    }



    private reviveGame(): void {
        console.log('Reviving game...');
        const gameState = (window as any).gameState;
        
        // Segment drops already exist in scene, no need to recreate
        
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

    private async setupObstacles(gameState: any): Promise<void> {
        if (this.settingsManager.isObstacleModeEnabled()) {
            // Create obstacle manager for dynamic obstacle mode
            this.obstacleManager = new ObstacleManager(this);
            this.tilemapObstacleManager = null;
            
            // Always generate new obstacles (no saving/restoring needed anymore)
            console.log('🎯 Obstacle mode enabled - generating obstacles');
            this.obstacleManager.generateObstacles();
        } else if (this.settingsManager.isLevelModeEnabled()) {
            // Create tilemap obstacle manager for level mode
            const selectedLevelFile = this.settingsManager.getSelectedLevelFile();
            if (selectedLevelFile) {
                console.log('📋 Level mode enabled - loading level:', selectedLevelFile);
                this.tilemapObstacleManager = new TilemapObstacleManager(this);
                this.obstacleManager = null;
                
                try {
                    const levelData = await LevelLoader.loadLevel(selectedLevelFile);
                    if (levelData) {
                        await this.tilemapObstacleManager.loadLevelObstacles(levelData);
                        console.log(`✅ Successfully loaded level: ${levelData.name}`);
                    } else {
                        console.error('❌ Failed to load level data');
                        // Fall back to no obstacles
                        this.tilemapObstacleManager = null;
                    }
                } catch (error) {
                    console.error('❌ Error loading level:', error);
                    // Fall back to no obstacles
                    this.tilemapObstacleManager = null;
                }
            } else {
                console.warn('⚠️ Level mode enabled but no level selected');
                this.obstacleManager = null;
                this.tilemapObstacleManager = null;
            }
        } else {
            console.log('⚪ No obstacle mode enabled');
            this.obstacleManager = null;
            this.tilemapObstacleManager = null;
        }
    }

    // =================== GAME OVER OVERLAY METHODS ===================

    private showGameOverOverlay(finalScore: number): void {
        console.log('Showing game over overlay with score:', finalScore);
        
        // Disable any mobile input interference
        this.disableMobileInputInterference();
        
        const centerX = this.gameWidth / 2;
        const centerY = this.gameHeight / 2;

        // Create background overlay
        this.gameOverOverlay = UIHelper.createOverlay(this, 0x000000, 0.8);

        // Create game over panel
        this.gameOverPanel = UIHelper.createPanel(this, {
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
        this.gameOverTitleText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 140,
            text: 'GAME OVER!',
            fontSize: '48px',
            color: '#FF6B6B',
            fontStyle: 'bold'
        });

        // Create score text
        this.gameOverScoreText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 80,
            text: `Final: ${finalScore}`,
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        // Get high score
        const gameState = (window as any).gameState;
        const highScore = gameState ? gameState.highScore : 0;
        
        // Create high score text
        this.gameOverHighScoreText = UIHelper.createText(this, {
            x: centerX,
            y: centerY - 40,
            text: `High: ${highScore}`,
            fontSize: '24px',
            color: '#FFD700'
        });

        // Create buttons - adjust positions to accommodate three buttons
        this.createGameOverReviveButton(centerX, centerY + 20); // Center button
        this.createGameOverRestartButton(centerX - 120, centerY + 100); // Left button
        this.createGameOverMenuButton(centerX + 120, centerY + 100); // Right button

        // Add entrance animations
        this.addGameOverEntranceAnimations();

        // Create particle effect
        this.createGameOverOverlayParticles();
    }

    private disableMobileInputInterference(): void {
        console.log('Disabling mobile input interference for Game Over overlay');
        
        const gameState = (window as any).gameState;
        if (gameState && gameState.currentScene && gameState.currentScene.snake) {
            const snake = gameState.currentScene.snake;
            if (snake.swipeInputManager) {
                console.log('Input manager disabled (via snake.isMoving)');
            }
        }
    }

    private createGameOverReviveButton(x: number, y: number): void {
        this.gameOverReviveButton = UIHelper.createButton(this, {
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

    private createGameOverRestartButton(x: number, y: number): void {
        this.gameOverRestartButton = UIHelper.createButton(this, {
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
                this.restartGameFromOverlay();
            }
        });
    }

    private createGameOverMenuButton(x: number, y: number): void {
        this.gameOverMenuButton = UIHelper.createButton(this, {
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
                this.goToMenuFromOverlay();
            }
        });
    }

    private watchAdAndRevive(): void {
        console.log('watchAdAndRevive called, current state:', {
            isWatchingAd: this.isWatchingAd,
            reviveButton: !!this.gameOverReviveButton
        });

        if (this.isWatchingAd) {
            console.log('Already watching ad, preventing duplicate calls');
            return;
        }
        
        if (!this.gameOverReviveButton) {
            console.error('Revive button not found!');
            return;
        }
        
        console.log('Starting ad watch for revive...');
        this.isWatchingAd = true;
        
        try {
            // Change revive button to show loading state
            UIHelper.setButtonLoadingState(
                this.gameOverReviveButton,
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
            this.restoreReviveButton();
        }
    }

    private restoreReviveButton(): void {
        if (!this.gameOverReviveButton) return;
        
        try {
            UIHelper.restoreButtonState(
                this.gameOverReviveButton,
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
        if (!this.gameOverReviveButton) return;
        
        // Create loading particles around the revive button
        UIHelper.createParticleEffect(this, this.gameOverReviveButton, 8, 0x4CAF50, 100);
        
        // Add pulsing effect to revive button during ad watching
        UIHelper.createPulseAnimation(this, this.gameOverReviveButton, 1.05, 500, 5);
    }

    private onAdCompleted(): void {
        console.log('Ad completed! Reviving player...');
        
        if (!this.gameOverReviveButton) {
            console.error('Revive button not found in onAdCompleted');
            this.isWatchingAd = false;
            return;
        }
        
        try {
            // Show success effect
            this.createReviveSuccessEffect();
            
            // Change button text to show success
            const text = this.gameOverReviveButton.getAt(1) as Phaser.GameObjects.Text;
            const background = this.gameOverReviveButton.getAt(0) as Phaser.GameObjects.Graphics;
            
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
                this.gameOverReviveButton.disableInteractive();
            } else {
                console.error('Failed to get button elements in onAdCompleted');
            }
            
            // Reset the ad watching flag
            this.isWatchingAd = false;
            
            // After a short delay, revive the player
            this.time.delayedCall(1000, () => {
                console.log('Starting player revival...');
                this.revivePlayerFromOverlay();
            });
            
        } catch (error) {
            console.error('Error in onAdCompleted:', error);
            this.isWatchingAd = false;
            this.restoreReviveButton();
        }
    }

    private createReviveSuccessEffect(): void {
        if (!this.gameOverReviveButton) return;
        
        // Create celebration particles
        UIHelper.createParticleEffect(this, this.gameOverReviveButton, 20, 0x4CAF50, 120);
    }

    private revivePlayerFromOverlay(): void {
        console.log('Reviving player from overlay...');
        
        // Reset game state for revival
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = true; // Set revival flag
            // Keep the current score for revival
        }
        
        // Hide game over overlay with animation
        this.hideGameOverOverlay(() => {
            // Revive directly in current scene without restarting
            this.reviveInCurrentScene();
        });
    }

    private restartGameFromOverlay(): void {
        console.log('Restarting game from overlay...');
        
        // Reset game state for restart
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.score = 0; // Reset score for restart
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = false; // Not reviving, this is a restart
        }
        
        // Hide game over overlay with animation
        this.hideGameOverOverlay(() => {
            this.scene.restart();
        });
    }

    private goToMenuFromOverlay(): void {
        console.log('Going to menu from overlay...');
        
        // Reset game state for menu
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.score = 0; // Reset score when going to menu
            gameState.isGameOver = false;
            gameState.isPaused = false;
            gameState.isReviving = false;
        }
        
        // Hide game over overlay with animation
        this.hideGameOverOverlay(() => {
            this.scene.start('MenuScene');
        });
    }

    private hideGameOverOverlay(onComplete?: () => void): void {
        const targets = [
            this.gameOverTitleText,
            this.gameOverScoreText,
            this.gameOverHighScoreText,
            this.gameOverRestartButton,
            this.gameOverMenuButton,
            this.gameOverReviveButton
        ].filter(target => target !== undefined);

        if (targets.length > 0) {
            this.tweens.add({
                targets: targets,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.cleanupGameOverOverlay();
                    if (onComplete) {
                        onComplete();
                    }
                }
            });
        } else {
            this.cleanupGameOverOverlay();
            if (onComplete) {
                onComplete();
            }
        }
    }

    private cleanupGameOverOverlay(): void {
        // Destroy all game over overlay elements
        this.gameOverOverlay?.destroy();
        this.gameOverPanel?.destroy();
        this.gameOverTitleText?.destroy();
        this.gameOverScoreText?.destroy();
        this.gameOverHighScoreText?.destroy();
        this.gameOverRestartButton?.destroy();
        this.gameOverMenuButton?.destroy();
        this.gameOverReviveButton?.destroy();
        
        // Reset references
        this.gameOverOverlay = undefined;
        this.gameOverPanel = undefined;
        this.gameOverTitleText = undefined;
        this.gameOverScoreText = undefined;
        this.gameOverHighScoreText = undefined;
        this.gameOverRestartButton = undefined;
        this.gameOverMenuButton = undefined;
        this.gameOverReviveButton = undefined;
        this.isWatchingAd = false;
    }

    private addGameOverEntranceAnimations(): void {
        // Panel animation
        if (this.gameOverPanel) {
            this.gameOverPanel.setScale(0.5);
            this.gameOverPanel.setAlpha(0);
            this.tweens.add({
                targets: this.gameOverPanel,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        }

        // Title animation
        if (this.gameOverTitleText) {
            this.gameOverTitleText.setAlpha(0);
            this.gameOverTitleText.setScale(0.5);
            this.tweens.add({
                targets: this.gameOverTitleText,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 600,
                ease: 'Back.easeOut',
                delay: 200
            });
        }

        // Score text animation
        if (this.gameOverScoreText) {
            this.gameOverScoreText.setAlpha(0);
            this.gameOverScoreText.setY(this.gameOverScoreText.y + 30);
            this.tweens.add({
                targets: this.gameOverScoreText,
                alpha: 1,
                y: this.gameOverScoreText.y - 30,
                duration: 500,
                ease: 'Power2',
                delay: 400
            });
        }

        // High score text animation
        if (this.gameOverHighScoreText) {
            this.gameOverHighScoreText.setAlpha(0);
            this.gameOverHighScoreText.setY(this.gameOverHighScoreText.y + 30);
            this.tweens.add({
                targets: this.gameOverHighScoreText,
                alpha: 1,
                y: this.gameOverHighScoreText.y - 30,
                duration: 500,
                ease: 'Power2',
                delay: 600
            });
        }

        // Buttons immediately visible and active
        if (this.gameOverRestartButton) {
            this.gameOverRestartButton.setActive(true).setVisible(true);
        }
        if (this.gameOverMenuButton) {
            this.gameOverMenuButton.setActive(true).setVisible(true);
        }
        if (this.gameOverReviveButton) {
            this.gameOverReviveButton.setActive(true).setVisible(true);
        }
        console.log('Game Over buttons set to visible immediately');
    }

    private createGameOverOverlayParticles(): void {
        // Create simple particle effect around the center
        const centerTarget = { x: this.gameWidth / 2, y: this.gameHeight / 2 };
        UIHelper.createParticleEffect(this, centerTarget as any, 30, 0x4CAF50, 200);
    }

    private reviveInCurrentScene(): void {
        console.log('Reviving in current scene without restart...');
        const gameState = (window as any).gameState;
        
        // Initialize snake at grid center (obstacles remain unchanged)
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        this.snake = new Snake(this, centerX, centerY);
        
        // Setup obstacle collisions with snake after snake is created
        if (this.obstacleManager) {
            this.obstacleManager.setupCollisionsWithSnake();
        }
        if (this.tilemapObstacleManager) {
            this.tilemapObstacleManager.setupCollisionsWithSnake();
        }
        
        // Create food (reposition existing food)
        if (!this.food) {
            this.food = new Food(this);
        } else {
            this.food.reposition();
        }
        
        if (!this.growthBoostFood) {
            this.growthBoostFood = new GrowthBoostFood(this);
        } else {
            this.growthBoostFood.reposition();
        }
        
        if (!this.shrinkFood) {
            this.shrinkFood = new ShrinkFood(this);
        } else {
            this.shrinkFood.reposition();
        }
        
        if (!this.speedBoostFood) {
            this.speedBoostFood = new SpeedBoostFood(this);
        } else {
            this.speedBoostFood.reposition();
        }
        
        if (!this.slowFood) {
            this.slowFood = new SlowFood(this);
        } else {
            this.slowFood.reposition();
        }
        
        // Recreate managers
        this.foodTutorialManager = new FoodTutorialManager(this);
        this.scoreIndicator = new ScoreIndicator(this);
        
        // Setup collision detection
        this.physics.add.overlap(this.snake.head, this.food.sprite, this.eatFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.growthBoostFood.sprite, this.eatGrowthBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.shrinkFood.sprite, this.eatShrinkFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.speedBoostFood.sprite, this.eatSpeedBoostFood, undefined, this);
        this.physics.add.overlap(this.snake.head, this.slowFood.sprite, this.eatSlowFood, undefined, this);
        
        // Segment drops already exist in scene, just setup collisions
        this.setupSegmentDropCollisions();
        
        // Setup wall collision
        const headBody = this.snake.head.body as any;
        headBody.setCollideWorldBounds(true);
        this.physics.world.on('worldbounds', this.gameOver, this);
        
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
        
        // Update game state
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.currentScene = this;
        (window as any).updateUI();
        
        // Create revival celebration effect
        this.createRevivalCelebration();
        
        console.log('Revival completed in current scene, obstacles preserved');
        console.log('Snake length after revival:', this.snake.body.length);
    }
} 