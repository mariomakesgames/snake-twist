import { Portal } from './Portal';

export class PortalManager {
    private scene: Phaser.Scene;
    private portals: Portal[] = [];
    private spawnTimer: Phaser.Time.TimerEvent | null = null;
    private minScore: number = 10;
    private spawnInterval: number = 5000;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public start(): void {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnInterval,
            callback: this.spawnPortals,
            callbackScope: this,
            loop: true
        });
    }

    public stop(): void {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
        this.clearPortals();
    }

    private spawnPortals(): void {
        const gameState = (window as any).gameState;
        if (gameState.isGameOver || gameState.score < this.minScore) {
            return;
        }

        // Clear existing portals
        this.clearPortals();

        // Get random positions for portals
        const portal1Pos = this.getRandomPosition();
        const portal2Pos = this.getRandomPosition();

        // Create portals
        const portal1 = new Portal(this.scene, portal1Pos.x, portal1Pos.y);
        const portal2 = new Portal(this.scene, portal2Pos.x, portal2Pos.y);

        // Set targets
        portal1.setTarget(portal2);
        portal2.setTarget(portal1);

        // Add to portals array
        this.portals.push(portal1, portal2);
    }

    private getRandomPosition(): { x: number; y: number } {
        const gridSize = 20;
        const gameWidth = 600;
        const gameHeight = 600;
        
        let x: number, y: number;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.floor(Math.random() * (gameWidth / gridSize)) * gridSize + gridSize / 2;
            y = Math.floor(Math.random() * (gameHeight / gridSize)) * gridSize + gridSize / 2;
            attempts++;
        } while (this.isPositionOccupied(x, y) && attempts < maxAttempts);

        return { x, y };
    }

    private isPositionOccupied(x: number, y: number): boolean {
        // Check if position overlaps with snake
        const snake = (this.scene as any).snake;
        if (snake) {
            for (const segment of snake.body) {
                if (Math.abs(segment.x - x) < 15 && Math.abs(segment.y - y) < 15) {
                    return true;
                }
            }
        }

        // Check if position overlaps with food
        const food = (this.scene as any).food;
        if (food && Math.abs(food.sprite.x - x) < 15 && Math.abs(food.sprite.y - y) < 15) {
            return true;
        }

        // Check if position overlaps with other special foods
        const specialFoods = [
            (this.scene as any).growthBoostFood,
            (this.scene as any).shrinkFood,
            (this.scene as any).speedBoostFood,
            (this.scene as any).slowFood
        ];

        for (const specialFood of specialFoods) {
            if (specialFood && Math.abs(specialFood.sprite.x - x) < 15 && Math.abs(specialFood.sprite.y - y) < 15) {
                return true;
            }
        }

        return false;
    }

    public checkTeleportation(snakeHeadX: number, snakeHeadY: number): { x: number; y: number } | null {
        for (const portal of this.portals) {
            if (portal.isColliding(snakeHeadX, snakeHeadY)) {
                const target = portal.getTarget();
                if (target) {
                    const targetPos = target.getPosition();
                    Portal.createPortalEffect(this.scene, targetPos.x, targetPos.y);
                    return targetPos;
                }
            }
        }
        return null;
    }

    private clearPortals(): void {
        for (const portal of this.portals) {
            portal.destroy();
        }
        this.portals = [];
    }

    public getPortals(): Portal[] {
        return this.portals;
    }

    public setMinScore(score: number): void {
        this.minScore = score;
    }

    public setSpawnInterval(interval: number): void {
        this.spawnInterval = interval;
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = this.scene.time.addEvent({
                delay: this.spawnInterval,
                callback: this.spawnPortals,
                callbackScope: this,
                loop: true
            });
        }
    }
} 