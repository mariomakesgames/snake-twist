export class MobileInputManager {
    private scene: Phaser.Scene;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private touchEndX: number = 0;
    private touchEndY: number = 0;
    private minSwipeDistance: number = 30;
    private maxSwipeTime: number = 500; // Maximum time for a swipe in milliseconds
    private touchStartTime: number = 0;
    private onSwipeCallback?: (direction: string) => void;
    private isEnabled: boolean = true;
    private isDragging: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupGlobalInput();
    }

    private setupGlobalInput(): void {
        // Use only global event listeners to avoid conflicts
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
        if (!this.isEnabled || this.isDragging) return;
        
        // Check if the click is within the canvas bounds
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
            
            this.isDragging = true;
            this.touchStartX = event.clientX - rect.left;
            this.touchStartY = event.clientY - rect.top;
            this.touchStartTime = Date.now();
        }
    };

    private handleGlobalMouseUp = (event: MouseEvent): void => {
        if (!this.isEnabled || !this.isDragging) return;
        
        // Convert global coordinates to canvas coordinates
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        this.touchEndX = event.clientX - rect.left;
        this.touchEndY = event.clientY - rect.top;
        
        this.handleSwipe();
        this.isDragging = false;
    };

    private handleGlobalTouchStart = (event: TouchEvent): void => {
        if (!this.isEnabled || this.isDragging) return;
        
        // Check if the touch is within the canvas bounds
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            
            this.isDragging = true;
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.touchStartTime = Date.now();
        }
    };

    private handleGlobalTouchEnd = (event: TouchEvent): void => {
        if (!this.isEnabled || !this.isDragging) return;
        
        // Convert global coordinates to canvas coordinates
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.changedTouches[0];
        
        this.touchEndX = touch.clientX - rect.left;
        this.touchEndY = touch.clientY - rect.top;
        
        this.handleSwipe();
        this.isDragging = false;
    };

    private handleGlobalMouseMove = (event: MouseEvent): void => {
        if (!this.isEnabled || !this.isDragging) return;
        
        // Update touch end position during global movement
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        
        this.touchEndX = event.clientX - rect.left;
        this.touchEndY = event.clientY - rect.top;
    };

    private handleGlobalTouchMove = (event: TouchEvent): void => {
        if (!this.isEnabled || !this.isDragging) return;
        
        // Update touch end position during global movement
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        
        this.touchEndX = touch.clientX - rect.left;
        this.touchEndY = touch.clientY - rect.top;
    };

    private handleSwipe(): void {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const touchEndTime = Date.now();
        const swipeTime = touchEndTime - this.touchStartTime;
        
        // Calculate swipe distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Check if swipe distance is sufficient and time is reasonable
        if (distance < this.minSwipeDistance || swipeTime > this.maxSwipeTime) {
            return; // Not a valid swipe
        }
        
        // Determine swipe direction
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        let direction = '';
        
        // Horizontal swipe
        if (absDeltaX > absDeltaY) {
            if (deltaX > 0) {
                direction = 'right';
            } else {
                direction = 'left';
            }
        }
        // Vertical swipe
        else {
            if (deltaY > 0) {
                direction = 'down';
            } else {
                direction = 'up';
            }
        }
        
        // Call the callback with the detected direction
        if (this.onSwipeCallback && direction) {
            this.onSwipeCallback(direction);
            this.createSwipeEffect(direction);
        }
    }

    private createSwipeEffect(direction: string): void {
        // Create visual feedback for swipe
        const colors = {
            'up': 0x4CAF50,
            'down': 0x4CAF50,
            'left': 0x4CAF50,
            'right': 0x4CAF50
        };
        
        const color = colors[direction as keyof typeof colors];
        
        // Create swipe trail effect
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(
                this.touchStartX + (this.touchEndX - this.touchStartX) * (i / 5),
                this.touchStartY + (this.touchEndY - this.touchStartY) * (i / 5),
                3,
                color
            );
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 300,
                delay: i * 50,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    public setSwipeCallback(callback: (direction: string) => void): void {
        this.onSwipeCallback = callback;
    }

    public enable(): void {
        this.isEnabled = true;
    }

    public disable(): void {
        this.isEnabled = false;
    }

    public setMinSwipeDistance(distance: number): void {
        this.minSwipeDistance = distance;
    }

    public setMaxSwipeTime(time: number): void {
        this.maxSwipeTime = time;
    }

    public destroy(): void {
        // Clean up global listeners only
        document.removeEventListener('mousedown', this.handleGlobalMouseDown);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('touchstart', this.handleGlobalTouchStart);
        document.removeEventListener('touchend', this.handleGlobalTouchEnd);
        document.removeEventListener('touchmove', this.handleGlobalTouchMove);
    }
} 