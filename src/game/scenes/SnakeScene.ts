import { ShrinkFood } from '../entities/food/bad/ShrinkFood';
import { SlowFood } from '../entities/food/bad/SlowFood';
import { Food } from '../entities/food/Food';
import { GrowthBoostFood } from '../entities/food/good/GrowthBoostFood';
import { SpeedBoostFood } from '../entities/food/good/SpeedBoostFood';
import { Snake } from '../entities/Snake';
import { EventBus } from '../EventBus';

export class SnakeScene extends Phaser.Scene {
    public snake!: Snake;
    public food!: Food;
    public growthBoostFood!: GrowthBoostFood;
    public shrinkFood!: ShrinkFood;
    public speedBoostFood!: SpeedBoostFood;
    public slowFood!: SlowFood;
    // private cursors: any; // Removed unused variable
    // private scoreText: any; // Removed unused variable
    public gameSpeed: number;
    private gridSize: number;
    private gameWidth: number;
    private gameHeight: number;

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
        
        // Setup input - removed cursors as it's not used
        // this.cursors = this.input.keyboard?.createCursorKeys();
        
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
        
        // Setup UI buttons - removed since we use React event handlers
        // this.setupButtons();
        
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

    // Removed setupButtons method since we use React event handlers

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

    public startGame(): void {
        console.log('Start Game clicked');
        const gameState = (window as any).gameState;
        
        // If game is over, reset the game state but don't restart the scene
        if (gameState.isGameOver) {
            console.log('Game was over, resetting state');
            gameState.score = 0;
            gameState.isPaused = false;
            gameState.isGameOver = false;
            gameState.isTeleporting = false;
            this.gameSpeed = 350;
            (window as any).updateUI();
            
            // Reset snake position and state
            this.resetSnake();
        }
        
        // Start the snake
        this.snake.start();
        console.log('Snake started, isMoving:', this.snake.isMoving);
        console.log('Snake head position:', this.snake.head.x, this.snake.head.y);
        console.log('Snake direction:', this.snake.direction.x, this.snake.direction.y);
    }

    public togglePause(): void {
        const gameState = (window as any).gameState;
        if (!gameState.isGameOver) {
            gameState.isPaused = !gameState.isPaused;
        }
    }

    public restartGame(): void {
        console.log('Restarting game');
        const gameState = (window as any).gameState;
        gameState.score = 0;
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.isTeleporting = false;
        (window as any).updateUI();
        
        // Reset game speed
        this.gameSpeed = 350;
        
        // Reset snake instead of restarting scene
        this.resetSnake();
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
            EventBus.emit('game-over', gameState.score);
        }
    }

    public update(time: number): void {
        const gameState = (window as any).gameState;
        if (gameState.isPaused || gameState.isGameOver) return;
        
        this.snake.update(time);
    }
} 