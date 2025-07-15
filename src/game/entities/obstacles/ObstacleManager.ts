import { Obstacle } from './Obstacle';
import { ObstaclePattern } from './ObstaclePattern';
import { EShapePattern } from './patterns/EShapePattern';
import { HShapePattern } from './patterns/HShapePattern';
import { LShapePattern } from './patterns/LShapePattern';
import { TShapePattern } from './patterns/TShapePattern';

export class ObstacleManager {
    private scene: Phaser.Scene;
    private obstacles: Obstacle[] = [];
    private patterns: ObstaclePattern[];
    private selectedPattern: ObstaclePattern;
    private savedObstaclePositions: { x: number; y: number }[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.patterns = [
            new LShapePattern(scene),    // L型模式
            new TShapePattern(scene),    // T型模式
            new HShapePattern(scene),    // H型模式
            new EShapePattern(scene)     // E型模式
        ];
        
        // 检查是否有保存的模式信息（复活时）
        const gameState = (window as any).gameState;
        if (gameState && gameState.isReviving && gameState.savedObstaclePattern) {
            // 使用保存的模式
            const savedPatternName = gameState.savedObstaclePattern;
            this.selectedPattern = this.patterns.find(pattern => pattern.getName() === savedPatternName) || this.patterns[0];
            console.log(`🔄 Revival mode - using saved pattern: ${this.selectedPattern.getName()}`);
        } else {
            // 随机选择一种形状，整个游戏过程都使用这种形状
            const randomIndex = Math.floor(Math.random() * this.patterns.length);
            this.selectedPattern = this.patterns[randomIndex];
            console.log(`🎲 游戏开始！随机选择了: ${this.selectedPattern.getName()}`);
        }
    }

    public generateObstacles(): void {
        console.log('Generating obstacles...');
        
        // Clear existing obstacles
        this.clearObstacles();
        
        // 使用构造函数中确定的形状
        console.log(`Using pattern: ${this.selectedPattern.getName()}`);
        
        // 清除任何保存的障碍物数据，强制重新生成
        this.savedObstaclePositions = [];
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.savedObstaclePositions = null;
        }
        
        // Generate obstacle positions
        const positions = this.selectedPattern.generate();
        console.log(`Generated ${positions.length} obstacle positions`);
        
        // Create obstacle objects
        positions.forEach(pos => {
            const obstacle = new Obstacle(this.scene, pos.x, pos.y);
            this.obstacles.push(obstacle);
        });
        
        // Setup collision detection with snake
        this.setupCollisions();
        
        console.log(`Created ${this.obstacles.length} obstacles`);
    }

    private setupCollisions(): void {
        const snake = (this.scene as any).snake;
        if (!snake || !snake.head) return;
        
        this.obstacles.forEach(obstacle => {
            this.scene.physics.add.overlap(
                snake.head, 
                obstacle.sprite, 
                () => {
                    console.log('Snake hit obstacle!');
                    (this.scene as any).gameOver();
                }, 
                undefined, 
                this.scene
            );
        });
    }

    public clearObstacles(): void {
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
    }

    public getObstacles(): Obstacle[] {
        return this.obstacles;
    }

    public destroy(): void {
        this.clearObstacles();
    }

    public saveObstacles(): void {
        this.savedObstaclePositions = this.obstacles.map(obstacle => ({
            x: obstacle.x,
            y: obstacle.y
        }));
        
        // Also save to global state for revival
        const gameState = (window as any).gameState;
        if (gameState) {
            gameState.savedObstaclePositions = this.savedObstaclePositions;
            gameState.savedObstaclePattern = this.selectedPattern.getName();
        }
        
        console.log(`Saved ${this.savedObstaclePositions.length} obstacle positions and pattern: ${this.selectedPattern.getName()}`);
    }

    public restoreObstacles(): void {
        // Try to get saved positions from global state first
        const gameState = (window as any).gameState;
        let positionsToRestore = this.savedObstaclePositions;
        
        if (gameState && gameState.savedObstaclePositions) {
            positionsToRestore = gameState.savedObstaclePositions;
            // Clear the saved data after restoring
            gameState.savedObstaclePositions = null;
            gameState.savedObstaclePattern = null;
        }
        
        if (positionsToRestore.length === 0) {
            console.log('No saved obstacles to restore');
            return;
        }

        console.log(`Restoring ${positionsToRestore.length} obstacles`);
        
        // Clear existing obstacles
        this.clearObstacles();
        
        // Create obstacles from saved positions
        positionsToRestore.forEach(pos => {
            const obstacle = new Obstacle(this.scene, pos.x, pos.y);
            this.obstacles.push(obstacle);
        });
        
        // Setup collision detection with snake
        this.setupCollisions();
        
        console.log(`Restored ${this.obstacles.length} obstacles`);
    }

    public hasSavedObstacles(): boolean {
        return this.savedObstaclePositions.length > 0;
    }
}