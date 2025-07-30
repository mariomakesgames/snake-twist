import { LevelData } from '../levels/LevelLoader';
import { Obstacle } from './Obstacle';

export class TilemapObstacleManager {
    private scene: Phaser.Scene;
    private obstacles: Obstacle[] = [];
    private levelData: LevelData | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public async loadLevelObstacles(levelData: LevelData): Promise<void> {
        console.log(`Loading obstacles from level: ${levelData.name}`);
        console.log(`Level has ${levelData.obstacles.length} obstacles`);
        
        this.levelData = levelData;
        
        // Clear existing obstacles
        this.clearObstacles();
        
        // Create obstacle objects from level data
        levelData.obstacles.forEach(obstacleData => {
            const obstacle = new Obstacle(this.scene, obstacleData.x, obstacleData.y);
            this.obstacles.push(obstacle);
        });
        
        // Setup collision detection with snake
        this.setupCollisionsWithSnake();
        
        console.log(`Created ${this.obstacles.length} obstacles from tilemap`);
    }

    public setupCollisionsWithSnake(): void {
        const snake = (this.scene as any).snake;
        if (!snake) {
            console.warn('Snake not found for collision setup');
            return;
        }

        // Setup physics collisions between snake and obstacles
        this.obstacles.forEach(obstacle => {
            this.scene.physics.add.overlap(snake.head, obstacle.sprite, () => {
                console.log('🔥 Snake hit obstacle!');
                (this.scene as any).gameOver();
            });
        });

        console.log(`Setup collisions for ${this.obstacles.length} obstacles`);
    }

    public getObstacles(): Obstacle[] {
        return [...this.obstacles];
    }

    public getObstaclePositions(): { x: number; y: number }[] {
        return this.obstacles.map(obstacle => ({ x: obstacle.x, y: obstacle.y }));
    }

    public clearObstacles(): void {
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
        console.log('Cleared all tilemap obstacles');
    }

    public restoreObstacles(): void {
        if (!this.levelData) {
            console.warn('No level data available for obstacle restoration');
            return;
        }

        console.log('🔄 Restoring tilemap obstacles from level data');
        this.loadLevelObstacles(this.levelData);
    }

    public getLevelData(): LevelData | null {
        return this.levelData;
    }

    public isValidPosition(x: number, y: number): boolean {
        if (!this.levelData) {
            return true;
        }

        // Check if position conflicts with any obstacle
        return !this.obstacles.some(obstacle => {
            const distance = Math.sqrt((obstacle.x - x) ** 2 + (obstacle.y - y) ** 2);
            return distance < this.levelData!.tileSize;
        });
    }

    public getObstacleCount(): number {
        return this.obstacles.length;
    }

    public destroy(): void {
        this.clearObstacles();
        this.levelData = null;
    }

    public saveObstacles(): void {
        // Save current obstacle state for level mode
        if (this.levelData) {
            const gameState = (window as any).gameState;
            if (gameState) {
                gameState.savedTilemapObstacles = this.getObstaclePositions();
                gameState.savedLevelData = this.levelData;
                console.log('💾 Saved tilemap obstacles state');
            }
        }
    }
} 