import { MobileInputManager } from './MobileInputManager';

export class Snake {
    protected scene: Phaser.Scene;
    public body: Phaser.GameObjects.Rectangle[];
    public direction: any;
    private nextDirection: any;
    private moveTime: number;
    private speed: number;
    public isMoving: boolean;
    public head: Phaser.GameObjects.Rectangle;
    
    // Mobile input properties
    private mobileInputManager?: MobileInputManager;
    private isMobile: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        console.log('Creating snake at:', x, y);
        this.scene = scene;
        this.body = [];
        this.direction = new Phaser.Math.Vector2(1, 0);
        this.nextDirection = new Phaser.Math.Vector2(1, 0);
        this.moveTime = 0;
        this.speed = (scene as any).gameSpeed;
        this.isMoving = false;
        
        // Detect mobile device
        this.isMobile = this.detectMobileDevice();
        
        // Find a valid spawn position that doesn't overlap with obstacles
        const validPosition = this.findValidSpawnPosition(x, y);
        
        // Create snake head using graphics - align to grid
        const gridSize = (scene as any).gridSize || 20; // 使用统一的网格大小
        this.head = scene.add.rectangle(validPosition.x, validPosition.y, gridSize - 2, gridSize - 2, 0x00ff00);
        scene.physics.add.existing(this.head);
        const headBody = this.head.body as any;
        headBody.setCollideWorldBounds(true);
        headBody.onWorldBounds = true;
        this.body.push(this.head);
        console.log('Snake head created at:', this.head.x, this.head.y);
        
        // Create initial body segments - align to grid
        for (let i = 1; i < 3; i++) {
            const segmentX = validPosition.x - i * gridSize;
            const segmentY = validPosition.y;
            const segment = scene.add.rectangle(segmentX, segmentY, gridSize - 2, gridSize - 2, 0x00cc00);
            scene.physics.add.existing(segment);
            this.body.push(segment);
            console.log('Body segment', i, 'created at:', segment.x, segment.y);
        }
        
        // Setup input handling
        this.setupInput();
        console.log('Snake created with', this.body.length, 'segments');
        console.log('Mobile device detected:', this.isMobile);
    }

    private detectMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    private findValidSpawnPosition(centerX: number, centerY: number): { x: number, y: number } {
        const gridSize = (this.scene as any).gridSize || 20;
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
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
                                console.log(`Found valid spawn position at (${testX}, ${testY}) after ${attempts} attempts`);
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
        console.warn('No valid spawn position found, using center as fallback');
        return { x: centerX, y: centerY };
    }

    private isPositionOccupied(x: number, y: number): boolean {
        const obstacleManager = (this.scene as any).obstacleManager;
        if (!obstacleManager) return false;
        
        const obstacles = obstacleManager.getObstacles();
        return obstacles.some((obstacle: any) => 
            Math.abs(obstacle.x - x) < 15 && Math.abs(obstacle.y - y) < 15
        );
    }

    private setupInput(): void {
        // Keyboard input (desktop) - WASD controls
        this.scene.input.keyboard?.on('keydown', (event: any) => {
            if (!this.isMoving) return;
            
            const key = event.code;
            
            switch (key) {
                case 'KeyW':
                    if (this.direction.y === 0) { // 就排除了180度的turn的情况
                        this.nextDirection.set(0, -1);
                    }
                    break;
                case 'KeyS':
                    if (this.direction.y === 0) {
                        this.nextDirection.set(0, 1);
                    }
                    break;
                case 'KeyA':
                    if (this.direction.x === 0) {
                        this.nextDirection.set(-1, 0);
                    }
                    break;
                case 'KeyD':
                    if (this.direction.x === 0) {
                        this.nextDirection.set(1, 0);
                    }
                    break;
            }
        });

        // Touch/Mouse input (mobile and desktop)
        this.setupMobileInput();
    }

    private setupMobileInput(): void {
        this.mobileInputManager = new MobileInputManager(this.scene);
        this.mobileInputManager.setSwipeCallback((direction: string) => {
            if (!this.isMoving) return;
            
            switch (direction) {
                case 'up':
                    if (this.direction.y === 0) {
                        this.nextDirection.set(0, -1);
                    }
                    break;
                case 'down':
                    if (this.direction.y === 0) {
                        this.nextDirection.set(0, 1);
                    }
                    break;
                case 'left':
                    if (this.direction.x === 0) {
                        this.nextDirection.set(-1, 0);
                    }
                    break;
                case 'right':
                    if (this.direction.x === 0) {
                        this.nextDirection.set(1, 0);
                    }
                    break;
            }
        });
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

    // 每帧执行 根据direction执行移动
    private move(): void {
        // Store old positions
        const oldPositions = this.body.map(segment => ({
            x: segment.x,
            y: segment.y
        }));
        
        // Calculate new head position
        const gridSize = (this.scene as any).gridSize || 20; // 使用统一的网格大小
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
        
        // Check for obstacle collision
        if (this.isPositionOccupied(newHeadX, newHeadY)) {
            console.log('Obstacle collision detected!');
            (this.scene as any).gameOver();
            return;
        }
        
        // Move head
        this.head.x = newHeadX;
        this.head.y = newHeadY;
        
        // Move body segments
        for (let i = 1; i < this.body.length; i++) {
            this.body[i].x = oldPositions[i - 1].x;
            this.body[i].y = oldPositions[i - 1].y;
        }
        
        // Check for self-collision
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
        const gridSize = (this.scene as any).gridSize || 20; // 使用统一的网格大小
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
            this.body.push(newSegment);
        }
        console.log(`Snake grew by ${segments} segments! Total segments: ${this.body.length}`);
    }

    public shrink(segments: number = 1): void {
        for (let i = 0; i < segments; i++) {
            if (this.body.length > 1) {
                const lastSegment = this.body.pop();
                if (lastSegment) {
                    lastSegment.destroy(); // Remove the visual element
                }
            }
        }
        console.log(`Snake shrunk by ${segments} segments! Total segments: ${this.body.length}`);
    }

    public destroy(): void {
        // Clean up mobile input manager
        if (this.mobileInputManager) {
            this.mobileInputManager.destroy();
            this.mobileInputManager = undefined;
        }
        
        // Clean up body segments
        this.body.forEach(segment => {
            segment.destroy();
        });
        this.body = [];
    }
} 