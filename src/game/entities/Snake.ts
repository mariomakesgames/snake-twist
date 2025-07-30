import { SwipeInputManager } from './SwipeInputManager';

export class Snake {
    protected scene: Phaser.Scene;
    public body: Phaser.GameObjects.Rectangle[];
    public direction: any;
    private nextDirection: any;
    private moveTime: number;
    private speed: number;
    public isMoving: boolean;
    public head: Phaser.GameObjects.Rectangle;

    // Input management - use SwipeInputManager for all input handling
    private swipeInputManager?: SwipeInputManager;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        console.log('Creating snake at:', x, y);
        this.scene = scene;
        this.body = [];
        this.direction = new Phaser.Math.Vector2(1, 0);
        this.nextDirection = new Phaser.Math.Vector2(1, 0);
        this.moveTime = 0;
        this.speed = (scene as any).gameSpeed;
        this.isMoving = false;

        // Find a valid spawn position that doesn't overlap with obstacles
        const validPosition = this.findValidSpawnPosition(x, y);

        // Create snake head using graphics - align to grid
        const gridSize = (scene as any).gridSize || 20; // Use unified grid size
        this.head = scene.add.rectangle(validPosition.x, validPosition.y, gridSize - 2, gridSize - 2, 0x00ff00);
        scene.physics.add.existing(this.head);
        const headBody = this.head.body as any;
        headBody.setCollideWorldBounds(true);
        headBody.onWorldBounds = true;
        this.body.push(this.head);
        console.log('Snake head created at:', this.head.x, this.head.y);
        console.log('Snake head physics body:', headBody);

        // Create initial body segments - align to grid
        for (let i = 1; i < 3; i++) {
            const segmentX = validPosition.x - i * gridSize;
            const segmentY = validPosition.y;
            const segment = scene.add.rectangle(segmentX, segmentY, gridSize - 2, gridSize - 2, 0x00cc00);
            scene.physics.add.existing(segment);
            this.body.push(segment);
            console.log('Body segment', i, 'created at:', segment.x, segment.y);
        }

        // Initialize input manager
        this.setupInput();
        console.log('Snake created with', this.body.length, 'segments');
    }



    private findValidSpawnPosition(centerX: number, centerY: number): { x: number, y: number } {
        const gridSize = (this.scene as any).gridSize || 20;
        const margin = 2; // Keep some distance from edges

        // Try center position first
        if (!(this.scene as any).isPositionOccupied(centerX, centerY)) {
            return { x: centerX, y: centerY };
        }

        // Try positions around center in expanding spiral
        for (let radius = 1; radius <= 5; radius++) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 4) {
                const x = centerX + Math.cos(angle) * radius * gridSize;
                const y = centerY + Math.sin(angle) * radius * gridSize;

                // Ensure position is within bounds
                if (x >= margin * gridSize && x < this.scene.scale.width - margin * gridSize &&
                    y >= margin * gridSize && y < this.scene.scale.height - margin * gridSize) {

                    if (!(this.scene as any).isPositionOccupied(x, y)) {
                        return { x, y };
                    }
                }
            }
        }

        // Fallback to center if no valid position found
        console.warn('No valid spawn position found, using center');
        return { x: centerX, y: centerY };
    }



    /**
     * Setup input handling using SwipeInputManager
     * This replaces the duplicate input code that was previously in Snake.ts
     */
    private setupInput(): void {
        // Use SwipeInputManager for all input handling (keyboard, touch, mouse)
        this.swipeInputManager = new SwipeInputManager(this.scene, this);
    }

    public start(): void {
        console.log('Snake start() called');
        this.isMoving = true;
        this.moveTime = this.scene.time.now;
        console.log('Snake isMoving set to:', this.isMoving);
        console.log('Move time set to:', this.moveTime);
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    public update(time: number): boolean {
        if (!this.isMoving || time < this.moveTime) {
            return false;
        }

        this.direction.copy(this.nextDirection);
        this.move();
        this.moveTime = time + this.speed;
        return true;
    }

    // Execute movement based on direction each frame
    private move(): void {
        // Store old positions
        const oldPositions = this.body.map(segment => ({
            x: segment.x,
            y: segment.y
        }));

        // Calculate new head position
        const gridSize = (this.scene as any).gridSize || 20; // Use unified grid size
        const newHeadX = this.head.x + this.direction.x * gridSize;
        const newHeadY = this.head.y + this.direction.y * gridSize;

        // Check for portal teleportation
        const portalManager = (this.scene as any).portalManager;
        if (portalManager && !portalManager.isCurrentlyTeleporting()) {
            const teleportPos = portalManager.checkTeleportation(newHeadX, newHeadY);
            if (teleportPos) {
                console.log('Portal teleportation!', teleportPos);

                // Show portal tutorial if not shown before
                const foodTutorialManager = (this.scene as any).foodTutorialManager;
                if (foodTutorialManager) {
                    foodTutorialManager.showTutorial('portal');
                }

                // Teleport head to new position immediately
                this.head.x = teleportPos.x;
                this.head.y = teleportPos.y;

                // Move all body segments to follow the teleported head
                // This ensures the entire snake moves together
                for (let i = 1; i < this.body.length; i++) {
                    this.body[i].x = oldPositions[i - 1].x;
                    this.body[i].y = oldPositions[i - 1].y;
                }

                // Check for self-collision after teleportation
                this.checkSelfCollision();

                return;
            }
        }

        // Check for wall collision
        if (newHeadX < 0 || newHeadX >= this.scene.scale.width ||
            newHeadY < 0 || newHeadY >= this.scene.scale.height) {
            console.log('Wall collision detected!');
            (this.scene as any).gameOver();
            return;
        }

        // Note: Obstacle collision is handled by Phaser physics in ObstacleManager
        // No need for manual collision detection here

        // Move head
        this.head.x = newHeadX;
        this.head.y = newHeadY;

        // Move body segments
        // Moving the snake's body segments after the head has already been moved
        // Each body segment i moves to where the segment in front of it (i-1) used to be
        for (let i = 1; i < this.body.length; i++) {
            this.body[i].x = oldPositions[i - 1].x;
            this.body[i].y = oldPositions[i - 1].y;
        }

        // Check for self-collision
        // Only after the entire snake (head + all body segments) has moved to their final positions can we accurately determine if the head truly collides with any body segment. Imagine forming into a circle.
        this.checkSelfCollision();
    }

    private checkSelfCollision(): void {
        for (let i = 1; i < this.body.length; i++) {
            if (this.head.x === this.body[i].x && this.head.y === this.body[i].y) {
                (this.scene as any).gameOver();
                return;
            }
        }
    }

    public grow(segments: number = 1): void {
        const gridSize = (this.scene as any).gridSize || 20;
        for (let i = 0; i < segments; i++) {
            const lastSegment = this.body[this.body.length - 1];
            const newSegment = this.scene.add.rectangle(
                lastSegment.x,
                lastSegment.y,
                gridSize - 2,
                gridSize - 2,
                0x00cc00
            );
            this.scene.physics.add.existing(newSegment);
            this.body.push(newSegment); // Add the new segment to the end of the body array, making it the new last segment, next time move loop will place it in the correct position where previous last segment was
        }
        console.log(`Snake grew by ${segments} segments! Total segments: ${this.body.length}`);
    }

    public shrink(segments: number = 1): void {
        // parameter to specify how many segments to remove

        for (let i = 0; i < segments; i++) { // remove X times
            if (this.body.length > 1) { // (prevents removing the head)
                const lastSegment = this.body.pop(); // Remove the last segment from the body array
                if (lastSegment) {
                    lastSegment.destroy(); // Remove the visual element
                }
            }
        }
        console.log(`Snake shrunk by ${segments} segments! Total segments: ${this.body.length}`);
    }

    public getLength(): number {
        return this.body.length;
    }

    public getHeadPosition(): { x: number, y: number } {
        return { x: this.head.x, y: this.head.y };
    }

    public getBodyPositions(): { x: number, y: number }[] {
        return this.body.map(segment => ({ x: segment.x, y: segment.y }));
    }

    public destroy(): void {
        // Clean up input manager
        if (this.swipeInputManager) {
            this.swipeInputManager.destroy();
        }

        // Clean up body segments
        for (const segment of this.body) {
            segment.destroy();
        }
        this.body = [];
    }
} 