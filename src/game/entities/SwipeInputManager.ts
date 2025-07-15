export class SwipeInputManager {
    private scene: Phaser.Scene;
    private snake: any;
    private startX: number = 0;
    private startY: number = 0;
    private startTime: number = 0;
    private isTracking: boolean = false;
    private minSwipeDistance: number = 30; // Minimum swipe distance
    private maxSwipeTime: number = 500; // Maximum swipe time (milliseconds)
    private isMobile: boolean;

    constructor(scene: Phaser.Scene, snake: any) {
        this.scene = scene;
        this.snake = snake;
        this.isMobile = this.detectMobile();
        this.setupInput();
    }

    private detectMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    private setupInput(): void {
        if (this.isMobile) {
            this.setupTouchInput();
        } else {
            this.setupMouseInput();
        }
        
        // Keep keyboard input as backup
        this.setupKeyboardInput();
    }

    private setupTouchInput(): void {
        // Touch start
        this.scene.input.on('pointerdown', (pointer: any) => {
            if (pointer.isTouch) {
                this.startSwipe(pointer.x, pointer.y);
            }
        });

        // Touch end
        this.scene.input.on('pointerup', (pointer: any) => {
            if (pointer.isTouch) {
                this.endSwipe(pointer.x, pointer.y);
            }
        });

        // Touch move (optional, for real-time feedback)
        this.scene.input.on('pointermove', (pointer: any) => {
            if (pointer.isTouch && this.isTracking) {
                // Can add visual feedback here
                this.updateSwipeFeedback(pointer.x, pointer.y);
            }
        });
    }

    private setupMouseInput(): void {
        // Mouse down
        this.scene.input.on('pointerdown', (pointer: any) => {
            if (!pointer.isTouch) {
                this.startSwipe(pointer.x, pointer.y);
            }
        });

        // Mouse release
        this.scene.input.on('pointerup', (pointer: any) => {
            if (!pointer.isTouch) {
                this.endSwipe(pointer.x, pointer.y);
            }
        });

        // Mouse move (for real-time feedback)
        this.scene.input.on('pointermove', (pointer: any) => {
            if (!pointer.isTouch && this.isTracking) {
                this.updateSwipeFeedback(pointer.x, pointer.y);
            }
        });
    }

    private setupKeyboardInput(): void {
        // WASD keyboard input
        this.scene.input.keyboard?.on('keydown', (event: any) => {
            if (!this.snake.isMoving) return;
            
            const key = event.code;
            
            switch (key) {
                case 'KeyW':
                    if (this.snake.direction.y === 0) {
                        this.snake.nextDirection.set(0, -1);
                    }
                    break;
                case 'KeyS':
                    if (this.snake.direction.y === 0) {
                        this.snake.nextDirection.set(0, 1);
                    }
                    break;
                case 'KeyA':
                    if (this.snake.direction.x === 0) {
                        this.snake.nextDirection.set(-1, 0);
                    }
                    break;
                case 'KeyD':
                    if (this.snake.direction.x === 0) {
                        this.snake.nextDirection.set(1, 0);
                    }
                    break;
            }
        });
    }

    private startSwipe(x: number, y: number): void {
        this.startX = x;
        this.startY = y;
        this.startTime = Date.now();
        this.isTracking = true;
        
        // Add visual feedback
        this.createSwipeIndicator(x, y);
    }

    private endSwipe(endX: number, endY: number): void {
        if (!this.isTracking) return;

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = Date.now() - this.startTime;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        this.isTracking = false;
        this.removeSwipeIndicator();

        // Check if swipe conditions are met
        if (distance >= this.minSwipeDistance && deltaTime <= this.maxSwipeTime) {
            this.processSwipe(deltaX, deltaY, distance);
        }
    }

    private processSwipe(deltaX: number, deltaY: number, distance: number): void {
        if (!this.snake.isMoving) return;

        // Determine primary swipe direction
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Need more obvious direction difference to avoid diagonal swipes
        const directionThreshold = 0.3; // 30% direction difference threshold
        
        if (absX > absY && absX / distance > directionThreshold) {
            // Horizontal swipe
            if (deltaX > 0 && this.snake.direction.x === 0) {
                // Swipe right
                this.snake.nextDirection.set(1, 0);
                this.createSwipeEffect('right');
            } else if (deltaX < 0 && this.snake.direction.x === 0) {
                // Swipe left
                this.snake.nextDirection.set(-1, 0);
                this.createSwipeEffect('left');
            }
        } else if (absY > absX && absY / distance > directionThreshold) {
            // Vertical swipe
            if (deltaY > 0 && this.snake.direction.y === 0) {
                // Swipe down
                this.snake.nextDirection.set(0, 1);
                this.createSwipeEffect('down');
            } else if (deltaY < 0 && this.snake.direction.y === 0) {
                // Swipe up
                this.snake.nextDirection.set(0, -1);
                this.createSwipeEffect('up');
            }
        }
    }

    private updateSwipeFeedback(x: number, y: number): void {
        // Update swipe indicator position
        if (this.swipeIndicator) {
            this.swipeIndicator.setPosition(x, y);
        }
    }

    private swipeIndicator?: Phaser.GameObjects.Graphics;

    private createSwipeIndicator(x: number, y: number): void {
        this.swipeIndicator = this.scene.add.graphics();
        this.swipeIndicator.lineStyle(3, 0x4CAF50, 0.8);
        this.swipeIndicator.strokeCircle(x, y, 20);
        this.swipeIndicator.setDepth(1000);
    }

    private removeSwipeIndicator(): void {
        if (this.swipeIndicator) {
            this.swipeIndicator.destroy();
            this.swipeIndicator = undefined;
        }
    }

    private createSwipeEffect(direction: string): void {
        // Create visual feedback for successful swipe
        const colors = {
            up: 0x4CAF50,
            down: 0x4CAF50,
            left: 0x4CAF50,
            right: 0x4CAF50
        };

        const effect = this.scene.add.graphics();
        effect.lineStyle(4, colors[direction as keyof typeof colors], 0.9);
        
        // Draw arrow based on direction
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        switch (direction) {
            case 'up':
                effect.beginPath();
                effect.moveTo(centerX, centerY + 20);
                effect.lineTo(centerX, centerY - 20);
                effect.moveTo(centerX - 10, centerY - 10);
                effect.lineTo(centerX, centerY - 20);
                effect.lineTo(centerX + 10, centerY - 10);
                break;
            case 'down':
                effect.beginPath();
                effect.moveTo(centerX, centerY - 20);
                effect.lineTo(centerX, centerY + 20);
                effect.moveTo(centerX - 10, centerY + 10);
                effect.lineTo(centerX, centerY + 20);
                effect.lineTo(centerX + 10, centerY + 10);
                break;
            case 'left':
                effect.beginPath();
                effect.moveTo(centerX + 20, centerY);
                effect.lineTo(centerX - 20, centerY);
                effect.moveTo(centerX - 10, centerY - 10);
                effect.lineTo(centerX - 20, centerY);
                effect.lineTo(centerX - 10, centerY + 10);
                break;
            case 'right':
                effect.beginPath();
                effect.moveTo(centerX - 20, centerY);
                effect.lineTo(centerX + 20, centerY);
                effect.moveTo(centerX + 10, centerY - 10);
                effect.lineTo(centerX + 20, centerY);
                effect.lineTo(centerX + 10, centerY + 10);
                break;
        }
        
        effect.strokePath();
        effect.setDepth(1000);

        // Fade out animation
        this.scene.tweens.add({
            targets: effect,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    public destroy(): void {
        this.removeSwipeIndicator();
        // Clean up event listeners
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
        this.scene.input.off('pointermove');
    }
} 