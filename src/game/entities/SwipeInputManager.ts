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
    private currentX: number = 0;
    private currentY: number = 0;

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
        // Use global event listeners to handle swipes even when dragging outside canvas
        this.setupGlobalInput();
        
        // Keep keyboard input as backup
        this.setupKeyboardInput();
    }

    private setupGlobalInput(): void {
        // Use global event listeners to avoid conflicts and handle out-of-canvas swipes
        // Mouse events
        document.addEventListener('mousedown', this.handleGlobalMouseDown);
        document.addEventListener('mouseup', this.handleGlobalMouseUp);
        document.addEventListener('mousemove', this.handleGlobalMouseMove);
        
        // Touch events
        document.addEventListener('touchstart', this.handleGlobalTouchStart);
        document.addEventListener('touchend', this.handleGlobalTouchEnd);
        document.addEventListener('touchmove', this.handleGlobalTouchMove);
    }

    private handleGlobalMouseDown = (event: MouseEvent): void => {
        if (this.isTracking) return; // Already tracking, ignore
        
        // Allow swiping to start anywhere on the screen
        // Convert global coordinates to canvas coordinates for consistency
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        this.startSwipe(event.clientX - rect.left, event.clientY - rect.top);
    };

    private handleGlobalMouseUp = (event: MouseEvent): void => {
        if (!this.isTracking) return;
        
        // Convert global coordinates to canvas coordinates
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        this.endSwipe(event.clientX - rect.left, event.clientY - rect.top);
    };

    private handleGlobalTouchStart = (event: TouchEvent): void => {
        if (this.isTracking) return; // Already tracking, ignore
        
        // Allow swiping to start anywhere on the screen
        // Convert global coordinates to canvas coordinates for consistency
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        
        this.startSwipe(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    private handleGlobalTouchEnd = (event: TouchEvent): void => {
        if (!this.isTracking) return;
        
        // Convert global coordinates to canvas coordinates
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.changedTouches[0];
        
        this.endSwipe(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    private handleGlobalMouseMove = (event: MouseEvent): void => {
        if (!this.isTracking) return;
        
        // Update end position during global movement (for potential real-time feedback)
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Store current position for potential use
        this.currentX = event.clientX - rect.left;
        this.currentY = event.clientY - rect.top;
    };

    private handleGlobalTouchMove = (event: TouchEvent): void => {
        if (!this.isTracking) return;
        
        // Update end position during global movement (for potential real-time feedback)
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        
        // Store current position for potential use
        this.currentX = touch.clientX - rect.left;
        this.currentY = touch.clientY - rect.top;
    };

    private setupKeyboardInput(): void {
        // WASD keyboard input
        this.scene.input.keyboard?.on('keydown', (event: any) => {
            if (!this.snake.isMoving) return;
            
            const key = event.code;
            
            switch (key) {
                case 'KeyW':
                    const upValid = this.setDirection('up');
                    this.createSwipeEffect('up', upValid);
                    break;
                case 'KeyS':
                    const downValid = this.setDirection('down');
                    this.createSwipeEffect('down', downValid);
                    break;
                case 'KeyA':
                    const leftValid = this.setDirection('left');
                    this.createSwipeEffect('left', leftValid);
                    break;
                case 'KeyD':
                    const rightValid = this.setDirection('right');
                    this.createSwipeEffect('right', rightValid);
                    break;
            }
        });
    }

    /**
     * Centralized method to set snake direction based on input direction
     * This eliminates code duplication across different input managers
     * Returns true if direction was successfully set, false if invalid (180-degree turn)
     */
    private setDirection(direction: string): boolean {
        if (!this.snake.isMoving) return false;
        
        switch (direction) {
            case 'up':
                if (this.snake.direction.y === 0) {
                    this.snake.nextDirection.set(0, -1);
                    return true;
                } else if (this.snake.direction.y === -1) {
                    // Same direction - still valid, just no change needed
                    return true;
                }
                break;
            case 'down':
                if (this.snake.direction.y === 0) {
                    this.snake.nextDirection.set(0, 1);
                    return true;
                } else if (this.snake.direction.y === 1) {
                    // Same direction - still valid, just no change needed
                    return true;
                }
                break;
            case 'left':
                if (this.snake.direction.x === 0) {
                    this.snake.nextDirection.set(-1, 0);
                    return true;
                } else if (this.snake.direction.x === -1) {
                    // Same direction - still valid, just no change needed
                    return true;
                }
                break;
            case 'right':
                if (this.snake.direction.x === 0) {
                    this.snake.nextDirection.set(1, 0);
                    return true;
                } else if (this.snake.direction.x === 1) {
                    // Same direction - still valid, just no change needed
                    return true;
                }
                break;
        }
        return false; // Invalid direction (180-degree turn)
    }

    private startSwipe(x: number, y: number): void {
        this.startX = x;
        this.startY = y;
        this.startTime = Date.now();
        this.isTracking = true;
    }

    private endSwipe(endX: number, endY: number): void {
        if (!this.isTracking) return;

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = Date.now() - this.startTime;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        this.isTracking = false;

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
            if (deltaX > 0) {
                // Swipe right
                const isValid = this.setDirection('right');
                this.createSwipeEffect('right', isValid);
            } else if (deltaX < 0) {
                // Swipe left
                const isValid = this.setDirection('left');
                this.createSwipeEffect('left', isValid);
            }
        } else if (absY > absX && absY / distance > directionThreshold) {
            // Vertical swipe
            if (deltaY > 0) {
                // Swipe down
                const isValid = this.setDirection('down');
                this.createSwipeEffect('down', isValid);
            } else if (deltaY < 0) {
                // Swipe up
                const isValid = this.setDirection('up');
                this.createSwipeEffect('up', isValid);
            }
        }
    }

    private createSwipeEffect(direction: string, isValid: boolean = true): void {
        // Create visual feedback for swipe - green for valid, red for invalid
        const colors = {
            up: isValid ? 0x4CAF50 : 0xFF5252,    // Green for valid, red for invalid
            down: isValid ? 0x4CAF50 : 0xFF5252,
            left: isValid ? 0x4CAF50 : 0xFF5252,
            right: isValid ? 0x4CAF50 : 0xFF5252
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
        // Clean up global event listeners
        document.removeEventListener('mousedown', this.handleGlobalMouseDown);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('touchstart', this.handleGlobalTouchStart);
        document.removeEventListener('touchend', this.handleGlobalTouchEnd);
        document.removeEventListener('touchmove', this.handleGlobalTouchMove);
        
        // Clean up keyboard event listeners
        this.scene.input.keyboard?.off('keydown');
    }
} 