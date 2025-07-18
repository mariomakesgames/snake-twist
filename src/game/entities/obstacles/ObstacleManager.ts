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
            new LShapePattern(scene),    // L-shape pattern
            new TShapePattern(scene),    // T-shape pattern
            new HShapePattern(scene),    // H-shape pattern
            new EShapePattern(scene)     // E-shape pattern
        ];
        
        // Check if there's saved pattern information (during revival)
        const gameState = (window as any).gameState;
        if (gameState && gameState.isReviving && gameState.savedObstaclePattern) {
            // Use saved pattern
            const savedPatternName = gameState.savedObstaclePattern;
            this.selectedPattern = this.patterns.find(pattern => pattern.getName() === savedPatternName) || this.patterns[0];
            console.log(`🔄 Revival mode - using saved pattern: ${this.selectedPattern.getName()}`);
        } else {
            // Randomly select one shape, use this shape throughout the entire game
            const randomIndex = Math.floor(Math.random() * this.patterns.length);
            this.selectedPattern = this.patterns[randomIndex];
            console.log(`🎲 Game started! Randomly selected: ${this.selectedPattern.getName()}`);
        }
    }

    public generateObstacles(): void {
        console.log('Generating obstacles...');
        
        // Clear existing obstacles
        this.clearObstacles();
        
        // Use the shape determined in constructor
        console.log(`Using pattern: ${this.selectedPattern.getName()}`);
        
        // Clear any saved obstacle data, force regeneration
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
        if (!snake || !snake.head) {
            console.warn('Cannot setup obstacle collisions: snake or snake head not found');
            return;
        }
        
        console.log(`Setting up collisions for ${this.obstacles.length} obstacles with snake head at (${snake.head.x}, ${snake.head.y})`);
        
        this.obstacles.forEach((obstacle, index) => {
            console.log(`Setting up collision for obstacle ${index} at (${obstacle.x}, ${obstacle.y})`);
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
        
        console.log('Obstacle collision setup complete');
    }

    public setupCollisionsWithSnake(): void {
        console.log('Setting up obstacle collisions with snake...');
        this.setupCollisions();
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