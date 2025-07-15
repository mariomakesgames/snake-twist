import { ObstaclePattern, ObstaclePosition } from '../ObstaclePattern';

export class LShapePattern extends ObstaclePattern {
    generate(): ObstaclePosition[] {
        const positions: ObstaclePosition[] = [];
        const gridWidth = Math.floor(this.gameWidth / this.gridSize);
        const gridHeight = Math.floor(this.gameHeight / this.gridSize);
        
        // Generate ONE L-shaped obstacle from top-left corner
        console.log('Generating ONE L-shaped obstacle from top-left corner');
        
        // Start position with offset from top-left corner
        const startX = 3; // Offset from left edge
        const startY = 2; // Offset from top edge
        
        // Calculate L dimensions: 3 rows thick, extends down almost to bottom
        const lThickness = 3; // 3 rows thick
        const lHeight = gridHeight - startY - 3; // Extend down almost to bottom (leave 3 grid spaces)
        const lWidth = Math.floor(gridWidth * 0.4); // Width is 40% of map width
        
        const lPositions: ObstaclePosition[] = [];
        
        // Generate L shape: vertical part first (down from top-left), then horizontal part (right)
        
        // Vertical part (3 columns thick) - from start position down
        for (let col = 0; col < lThickness; col++) {
            for (let y = startY; y <= startY + lHeight; y++) {
                lPositions.push({ x: startX + col, y });
            }
        }
        
        // Horizontal part (3 rows thick) - from bottom of vertical part to the right
        for (let row = 0; row < lThickness; row++) {
            for (let x = startX + lThickness; x <= startX + lThickness + lWidth; x++) {
                lPositions.push({ x, y: startY + lHeight - row });
            }
        }
        
        // Convert grid positions to pixel positions and validate
        lPositions.forEach(pos => {
            const pixelPos = this.gridToPixel(pos.x, pos.y);
            if (this.isValidPosition(pixelPos.x, pixelPos.y, positions)) {
                positions.push(pixelPos);
            }
        });
        
        console.log(`Generated ${positions.length} obstacle blocks for L-shape from top-left corner`);
        console.log(`L dimensions: ${lThickness} rows thick, ${lHeight} height, ${lWidth} width`);
        console.log(`L starts at grid position (${startX}, ${startY})`);
        return positions;
    }

    getName(): string {
        return 'L-Shape Pattern - One L from Top-Left Corner (3 rows thick)';
    }
} 