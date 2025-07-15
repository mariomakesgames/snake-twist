import { ObstaclePattern, ObstaclePosition } from '../ObstaclePattern';

export class TShapePattern extends ObstaclePattern {
    generate(): ObstaclePosition[] {
        const positions: ObstaclePosition[] = [];
        const gridWidth = Math.floor(this.gameWidth / this.gridSize);
        const gridHeight = Math.floor(this.gameHeight / this.gridSize);
        
        // Generate ONE T-shaped obstacle from top-left corner
        console.log('Generating ONE T-shaped obstacle from top-left corner');
        
        // Start position with offset from top-left corner
        const startX = 3; // Offset from left edge
        const startY = 2; // Offset from top edge
        
        // Calculate T dimensions: 3 rows thick, extends down and right
        const tThickness = 3; // 3 rows thick
        const tHeight = gridHeight - startY - 3; // Extend down almost to bottom
        const tWidth = Math.floor(gridWidth * 0.4); // Width is 40% of map width
        
        const tPositions: ObstaclePosition[] = [];
        
        // Generate T shape: vertical part first (down from top-left), then horizontal part (right)
        
        // Vertical part (3 columns thick) - from start position down
        for (let col = 0; col < tThickness; col++) {
            for (let y = startY; y <= startY + tHeight; y++) {
                tPositions.push({ x: startX + col, y });
            }
        }
        
        // Horizontal part (3 rows thick) - from middle of vertical part to the right
        const horizontalStartY = startY + Math.floor(tHeight / 2) - Math.floor(tThickness / 2);
        for (let row = 0; row < tThickness; row++) {
            for (let x = startX + tThickness; x <= startX + tThickness + tWidth; x++) {
                tPositions.push({ x, y: horizontalStartY + row });
            }
        }
        
        // Convert grid positions to pixel positions and validate
        tPositions.forEach(pos => {
            const pixelPos = this.gridToPixel(pos.x, pos.y);
            if (this.isValidPosition(pixelPos.x, pixelPos.y, positions)) {
                positions.push(pixelPos);
            }
        });
        
        console.log(`Generated ${positions.length} obstacle blocks for T-shape from top-left corner`);
        console.log(`T dimensions: ${tThickness} rows thick, ${tHeight} height, ${tWidth} width`);
        console.log(`T starts at grid position (${startX}, ${startY})`);
        return positions;
    }

    getName(): string {
        return 'T-Shape Pattern - One T from Top-Left Corner (3 rows thick)';
    }
} 