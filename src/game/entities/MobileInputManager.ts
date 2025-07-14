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

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupTouchInput();
    }

    private setupTouchInput(): void {
        // Touch/Mouse start event
        this.scene.input.on('pointerdown', (pointer: any) => {
            if (!this.isEnabled) return;
            
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
            this.touchStartTime = Date.now();
        });

        // Touch/Mouse end event
        this.scene.input.on('pointerup', (pointer: any) => {
            if (!this.isEnabled) return;
            
            this.touchEndX = pointer.x;
            this.touchEndY = pointer.y;
            
            this.handleSwipe();
        });

        // Touch/Mouse move event (for better swipe detection)
        this.scene.input.on('pointermove', (pointer: any) => {
            if (!this.isEnabled) return;
            
            // Update touch end position during movement
            this.touchEndX = pointer.x;
            this.touchEndY = pointer.y;
        });
    }

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
        // Clean up event listeners
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
        this.scene.input.off('pointermove');
    }
} 