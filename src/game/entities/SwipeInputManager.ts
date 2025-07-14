export class SwipeInputManager {
    private scene: Phaser.Scene;
    private snake: any;
    private startX: number = 0;
    private startY: number = 0;
    private startTime: number = 0;
    private isTracking: boolean = false;
    private minSwipeDistance: number = 30; // 最小滑动距离
    private maxSwipeTime: number = 500; // 最大滑动时间（毫秒）
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
        
        // 保留键盘输入作为备用
        this.setupKeyboardInput();
    }

    private setupTouchInput(): void {
        // 触摸开始
        this.scene.input.on('pointerdown', (pointer: any) => {
            if (pointer.isTouch) {
                this.startSwipe(pointer.x, pointer.y);
            }
        });

        // 触摸结束
        this.scene.input.on('pointerup', (pointer: any) => {
            if (pointer.isTouch) {
                this.endSwipe(pointer.x, pointer.y);
            }
        });

        // 触摸移动（可选，用于实时反馈）
        this.scene.input.on('pointermove', (pointer: any) => {
            if (pointer.isTouch && this.isTracking) {
                // 可以在这里添加视觉反馈
                this.updateSwipeFeedback(pointer.x, pointer.y);
            }
        });
    }

    private setupMouseInput(): void {
        // 鼠标按下
        this.scene.input.on('pointerdown', (pointer: any) => {
            if (!pointer.isTouch) {
                this.startSwipe(pointer.x, pointer.y);
            }
        });

        // 鼠标释放
        this.scene.input.on('pointerup', (pointer: any) => {
            if (!pointer.isTouch) {
                this.endSwipe(pointer.x, pointer.y);
            }
        });

        // 鼠标移动（用于实时反馈）
        this.scene.input.on('pointermove', (pointer: any) => {
            if (!pointer.isTouch && this.isTracking) {
                this.updateSwipeFeedback(pointer.x, pointer.y);
            }
        });
    }

    private setupKeyboardInput(): void {
        // 保留原有的键盘输入作为备用
        this.scene.input.keyboard?.on('keydown', (event: any) => {
            if (!this.snake.isMoving) return;
            
            const key = event.code;
            
            switch (key) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.snake.direction.y === 0) {
                        this.snake.nextDirection.set(0, -1);
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.snake.direction.y === 0) {
                        this.snake.nextDirection.set(0, 1);
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.snake.direction.x === 0) {
                        this.snake.nextDirection.set(-1, 0);
                    }
                    break;
                case 'ArrowRight':
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
        
        // 添加视觉反馈
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

        // 检查是否满足滑动条件
        if (distance >= this.minSwipeDistance && deltaTime <= this.maxSwipeTime) {
            this.processSwipe(deltaX, deltaY, distance);
        }
    }

    private processSwipe(deltaX: number, deltaY: number, distance: number): void {
        if (!this.snake.isMoving) return;

        // 确定主要滑动方向
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // 需要更明显的方向差异来避免对角线滑动
        const directionThreshold = 0.3; // 30% 的方向差异阈值
        
        if (absX > absY && absX / distance > directionThreshold) {
            // 水平滑动
            if (deltaX > 0 && this.snake.direction.x === 0) {
                // 向右滑动
                this.snake.nextDirection.set(1, 0);
                this.createSwipeEffect('right');
            } else if (deltaX < 0 && this.snake.direction.x === 0) {
                // 向左滑动
                this.snake.nextDirection.set(-1, 0);
                this.createSwipeEffect('left');
            }
        } else if (absY > absX && absY / distance > directionThreshold) {
            // 垂直滑动
            if (deltaY > 0 && this.snake.direction.y === 0) {
                // 向下滑动
                this.snake.nextDirection.set(0, 1);
                this.createSwipeEffect('down');
            } else if (deltaY < 0 && this.snake.direction.y === 0) {
                // 向上滑动
                this.snake.nextDirection.set(0, -1);
                this.createSwipeEffect('up');
            }
        }
    }

    private updateSwipeFeedback(x: number, y: number): void {
        // 更新滑动指示器的位置
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
        // 创建滑动成功的视觉反馈
        const colors = {
            up: 0x4CAF50,
            down: 0x4CAF50,
            left: 0x4CAF50,
            right: 0x4CAF50
        };

        const effect = this.scene.add.graphics();
        effect.lineStyle(4, colors[direction as keyof typeof colors], 0.9);
        
        // 根据方向绘制箭头
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

        // 淡出动画
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
        // 清理事件监听器
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
        this.scene.input.off('pointermove');
    }
} 