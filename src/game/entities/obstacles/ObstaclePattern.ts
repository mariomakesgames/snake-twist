
export interface ObstaclePosition {
    x: number;
    y: number;
}

export abstract class ObstaclePattern {
    protected scene: Phaser.Scene;
    protected gridSize: number;
    protected gameWidth: number;
    protected gameHeight: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.gridSize = (scene as any).gridSize || 20;
        this.gameWidth = scene.scale.width;
        this.gameHeight = scene.scale.height;
    }

    abstract generate(): ObstaclePosition[];
    abstract getName(): string;

    protected isValidPosition(x: number, y: number, existingPositions: ObstaclePosition[]): boolean {
        // Check if position is within game bounds
        if (x < this.gridSize / 2 || x >= this.gameWidth - this.gridSize / 2 ||
            y < this.gridSize / 2 || y >= this.gameHeight - this.gridSize / 2) {
            return false;
        }

        // Check if position conflicts with existing obstacles
        for (const pos of existingPositions) {
            if (pos.x === x && pos.y === y) {
                return false;
            }
        }

        // Check if position conflicts with snake spawn area (center)
        const centerX = Math.floor(this.gameWidth / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const centerY = Math.floor(this.gameHeight / this.gridSize / 2) * this.gridSize + this.gridSize / 2;
        const spawnRadius = this.gridSize * 4; // 增加保护范围到4格半径
        
        const distanceToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distanceToCenter < spawnRadius) {
            return false;
        }

        return true;
    }

    protected gridToPixel(gridX: number, gridY: number): { x: number, y: number } {
        return {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2
        };
    }
} 