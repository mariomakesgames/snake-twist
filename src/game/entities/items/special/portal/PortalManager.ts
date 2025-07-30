import { Portal } from './Portal';

export class PortalManager {
    private scene: Phaser.Scene;
    private portals: Portal[] = [];
    private spawnTimer: Phaser.Time.TimerEvent | null = null;
    private minScore: number = 10;
    private spawnInterval: number = 15000; // Increased to 15 seconds
    private minPortalLifetime: number = 10000; // Minimum lifetime 10 seconds
    private lastSpawnTime: number = 0;
    private isTeleporting: boolean = false;
    private teleportationStartTime: number = 0;
    private consecutiveTeleports: number = 0; // Consecutive teleportation count
    private maxConsecutiveTeleports: number = 3; // Maximum consecutive teleportations

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
        if (gameState.isGameOver || gameState.score < this.minScore || this.isTeleporting) {
            return;
        }

        // Check if tutorial is being shown
        const foodTutorialManager = (this.scene as any).foodTutorialManager;
        if (foodTutorialManager && foodTutorialManager.isTutorialActive()) {
            console.log('Portal spawning paused due to tutorial display');
            return;
        }

        // Check minimum lifetime of existing portals
        const currentTime = this.scene.time.now;
        if (this.portals.length > 0 && (currentTime - this.lastSpawnTime) < this.minPortalLifetime) {
            console.log('Portal spawning skipped - minimum lifetime not reached');
            return;
        }

        // If consecutive teleportations are too frequent, extend spawn interval
        if (this.consecutiveTeleports >= this.maxConsecutiveTeleports) {
            console.log('Portal spawning delayed due to excessive teleportation');
            this.consecutiveTeleports = 0;
            return;
        }

        // Dynamically adjust spawn probability based on game progress
        const dynamicSpawnChance = this.calculateDynamicSpawnChance();
        if (Math.random() > dynamicSpawnChance) {
            console.log(`Portal spawning skipped - dynamic chance: ${dynamicSpawnChance.toFixed(2)}`);
            return;
        }

        // Clear existing portals (but not during tutorial)
        if (!foodTutorialManager || !foodTutorialManager.isTutorialActive()) {
            this.clearPortals();
        }

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
        
        // Record spawn time
        this.lastSpawnTime = currentTime;
        
        console.log('New portals spawned at:', portal1Pos, portal2Pos);
    }

    private calculateDynamicSpawnChance(): number {
        const gameState = (window as any).gameState;
        const score = gameState.score;
        const snake = (this.scene as any).snake;
        const snakeLength = snake ? snake.body.length : 1;
        
        // Base spawn probability
        let baseChance = 0.7; // 70% base probability
        
        // Adjust based on score: higher score, lower spawn probability
        if (score > 50) {
            baseChance *= 0.8;
        }
        if (score > 100) {
            baseChance *= 0.7;
        }
        if (score > 200) {
            baseChance *= 0.6;
        }
        
        // Adjust based on snake length: longer snake, lower spawn probability
        if (snakeLength > 20) {
            baseChance *= 0.8;
        }
        if (snakeLength > 40) {
            baseChance *= 0.7;
        }
        
        // Adjust based on consecutive teleportation count
        if (this.consecutiveTeleports > 0) {
            baseChance *= (1 - this.consecutiveTeleports * 0.2);
        }
        
        // Ensure probability stays within reasonable range
        return Math.max(0.1, Math.min(0.9, baseChance));
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

        // Check if position overlaps with obstacles
        if ((this.scene as any).isPositionOccupied(x, y)) {
            return true;
        }

        return false;
    }

    public checkTeleportation(snakeHeadX: number, snakeHeadY: number): { x: number; y: number } | null {
        if (this.isTeleporting) {
            return null; // Don't allow teleportation while already teleporting
        }

        for (const portal of this.portals) {
            if (portal.isColliding(snakeHeadX, snakeHeadY)) {
                const target = portal.getTarget();
                if (target) {
                    this.startTeleportation(portal, target);
                    const targetPos = target.getPosition();
                    return targetPos;
                }
            }
        }
        return null;
    }

    // This is just for the effect and state update for portals.
    private startTeleportation(portal1: Portal, portal2: Portal): void {
        this.isTeleporting = true;
        this.teleportationStartTime = this.scene.time.now;
        this.consecutiveTeleports++; // Increment consecutive teleportation count
        
        // Deactivate both portals during teleportation
        portal1.deactivate();
        portal2.deactivate();
        
        // Set teleporting state
        portal1.setTeleportingState(true);
        portal2.setTeleportingState(true);

        // Calculate teleportation duration based on snake length
        const snake = (this.scene as any).snake;
        const snakeLength = snake ? snake.body.length : 1;
        const teleportDuration = Math.max(2000, snakeLength * 150); // At least 4.5 seconds, plus 150ms per segment

        console.log(`Starting teleportation for snake with ${snakeLength} segments, duration: ${teleportDuration}ms`);

        // Reactivate portals after teleportation is complete
        this.scene.time.delayedCall(teleportDuration, () => {
            portal1.activate();
            portal2.activate();
            portal1.setTeleportingState(false);
            portal2.setTeleportingState(false);
            this.isTeleporting = false;
            console.log('Teleportation completed, portals reactivated');
        });
    }

    private clearPortals(): void {
        for (const portal of this.portals) {
            portal.destroy();
        }
        this.portals = [];
        this.isTeleporting = false;
        this.teleportationStartTime = 0;
        // Don't clear consecutive teleportation count, let it reset naturally on next spawn
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

    public setMinPortalLifetime(lifetime: number): void {
        this.minPortalLifetime = lifetime;
    }

    public setMaxConsecutiveTeleports(max: number): void {
        this.maxConsecutiveTeleports = max;
    }

    public isCurrentlyTeleporting(): boolean {
        return this.isTeleporting;
    }

    public getTeleportationProgress(): number {
        if (!this.isTeleporting) return 0;
        
        const elapsed = this.scene.time.now - this.teleportationStartTime;
        const snake = (this.scene as any).snake;
        const snakeLength = snake ? snake.body.length : 1;
        const totalDuration = Math.max(1500, snakeLength * 150);
        
        return Math.min(1, elapsed / totalDuration);
    }

    public getConsecutiveTeleports(): number {
        return this.consecutiveTeleports;
    }

    public resetConsecutiveTeleports(): void {
        this.consecutiveTeleports = 0;
    }
} 