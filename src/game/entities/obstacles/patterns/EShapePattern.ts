import { ObstaclePattern, ObstaclePosition } from '../ObstaclePattern';

export class EShapePattern extends ObstaclePattern {
    generate(): ObstaclePosition[] {
        const positions: ObstaclePosition[] = [];
        const gridWidth = Math.floor(this.gameWidth / this.gridSize);
        const gridHeight = Math.floor(this.gameHeight / this.gridSize);
        
        // Generate ONE E-shaped obstacle from top-left corner
        console.log('Generating ONE E-shaped obstacle from top-left corner');
        
        // Start position with offset from top-left corner
        const startX = 3; // Offset from left edge
        const startY = 2; // Offset from top edge
        
        // Calculate E dimensions: 3 rows thick
        const eThickness = 3; // 3 rows thick
        const eHeight = gridHeight - startY - 3; // Extend down almost to bottom
        const eWidth = Math.floor(gridWidth * 0.4); // Width is 40% of map width
        
        const ePositions: ObstaclePosition[] = [];
        
        // Generate E shape: one vertical line with three horizontal lines
        
        // Left vertical line (3 columns thick)
        for (let col = 0; col < eThickness; col++) {
            for (let y = startY; y <= startY + eHeight; y++) {
                ePositions.push({ x: startX + col, y });
            }
        }
        
        // Top horizontal line (3 rows thick)
        for (let row = 0; row < eThickness; row++) {
            for (let x = startX + eThickness; x <= startX + eWidth; x++) {
                ePositions.push({ x, y: startY + row });
            }
        }
        
        // Middle horizontal line (3 rows thick)
        const middleY = startY + Math.floor(eHeight / 2) - Math.floor(eThickness / 2);
        for (let row = 0; row < eThickness; row++) {
            for (let x = startX + eThickness; x <= startX + Math.floor(eWidth * 0.7); x++) {
                ePositions.push({ x, y: middleY + row });
            }
        }
        
        // Bottom horizontal line (3 rows thick)
        for (let row = 0; row < eThickness; row++) {
            for (let x = startX + eThickness; x <= startX + eWidth; x++) {
                ePositions.push({ x, y: startY + eHeight - row });
            }
        }
        
        // Convert grid positions to pixel positions and validate
        ePositions.forEach(pos => {
            const pixelPos = this.gridToPixel(pos.x, pos.y);
            if (this.isValidPosition(pixelPos.x, pixelPos.y, positions)) {
                positions.push(pixelPos);
            }
        });
        
        console.log(`Generated ${positions.length} obstacle blocks for E-shape from top-left corner`);
        console.log(`E dimensions: ${eThickness} rows thick, ${eHeight} height, ${eWidth} width`);
        console.log(`E starts at grid position (${startX}, ${startY})`);
        return positions;
    }

    getName(): string {
        return 'E-Shape Pattern - One E from Top-Left Corner (3 rows thick)';
    }
} 