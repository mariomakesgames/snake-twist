import { ObstaclePattern, ObstaclePosition } from '../ObstaclePattern';

export class HShapePattern extends ObstaclePattern {
    generate(): ObstaclePosition[] {
        const positions: ObstaclePosition[] = [];
        const gridWidth = Math.floor(this.gameWidth / this.gridSize);
        const gridHeight = Math.floor(this.gameHeight / this.gridSize);
        
        // Generate ONE H-shaped obstacle from top-left corner
        console.log('Generating ONE H-shaped obstacle from top-left corner');
        
        // Start position with offset from top-left corner, but avoid center spawn area
        const startX = 8; // Increased offset from left edge to avoid center
        const startY = 5; // Increased offset from top edge to avoid center
        
        // Calculate H dimensions: 3 rows thick
        const hThickness = 3; // 3 rows thick
        const hHeight = gridHeight - startY - 3; // Extend down almost to bottom
        const hWidth = Math.floor(gridWidth * 0.5); // Increased width to 50% of map width for more spread
        
        const hPositions: ObstaclePosition[] = [];
        
        // Generate H shape: two vertical lines from top to bottom with middle horizontal connection
        
        // Left vertical line (3 columns thick) - from top to bottom
        for (let col = 0; col < hThickness; col++) {
            for (let y = startY; y <= startY + hHeight; y++) {
                hPositions.push({ x: startX + col, y });
            }
        }
        
        // Right vertical line (3 columns thick) - from top to bottom
        for (let col = 0; col < hThickness; col++) {
            for (let y = startY; y <= startY + hHeight; y++) {
                hPositions.push({ x: startX + hWidth - col, y });
            }
        }
        
        // Middle horizontal line (3 rows thick) - positioned lower than center
        const middleY = startY + Math.floor(hHeight * 0.7) - Math.floor(hThickness / 2); // 70% down instead of 50%
        for (let row = 0; row < hThickness; row++) {
            // Connect from left vertical line to right vertical line
            for (let x = startX + hThickness; x <= startX + hWidth - hThickness; x++) {
                hPositions.push({ x, y: middleY + row });
            }
        }
        
        // Convert grid positions to pixel positions and validate
        hPositions.forEach(pos => {
            const pixelPos = this.gridToPixel(pos.x, pos.y);
            if (this.isValidPosition(pixelPos.x, pixelPos.y, positions)) {
                positions.push(pixelPos);
            }
        });
        
        console.log(`Generated ${positions.length} obstacle blocks for H-shape from top-left corner`);
        console.log(`H dimensions: ${hThickness} rows thick, ${hHeight} height, ${hWidth} width`);
        console.log(`H starts at grid position (${startX}, ${startY})`);
        console.log(`H middle line at Y position: ${middleY}`);
        return positions;
    }

    getName(): string {
        return 'H-Shape Pattern - One H from Top-Left Corner (3 rows thick)';
    }
} 