export interface TilemapLayer {
    data: number[];
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

export interface TilemapData {
    compressionlevel: number;
    height: number;
    infinite: boolean;
    layers: TilemapLayer[];
    nextlayerid: number;
    nextobjectid: number;
    orientation: string;
    renderorder: string;
    tiledversion: string;
    tileheight: number;
    tilesets: any[];
    tilewidth: number;
    type: string;
    version: string;
    width: number;
}

export interface LevelObstacle {
    x: number;
    y: number;
    gridX: number;
    gridY: number;
}

export interface LevelData {
    obstacles: LevelObstacle[];
    width: number;
    height: number;
    tileSize: number;
    name: string;
}

export class LevelLoader {
    private static availableLevels: string[] = [
        'level-editor/map/scratch/s1.json',
        'level-editor/map/scratch/s2.json',
        'level-editor/map/scratch/s3.json',
    ];

    public static getAvailableLevels(): string[] {
        return [...this.availableLevels];
    }

    public static async loadLevel(levelPath: string): Promise<LevelData | null> {
        try {
            console.log(`Loading level from: ${levelPath}`);
            
            const response = await fetch(levelPath);
            if (!response.ok) {
                throw new Error(`Failed to load level: ${response.statusText}`);
            }

            const tilemapData: TilemapData = await response.json();
            console.log('Loaded tilemap data:', tilemapData);

            return this.parseTilemapData(tilemapData, levelPath);
        } catch (error) {
            console.error('Error loading level:', error);
            return null;
        }
    }

    private static parseTilemapData(tilemapData: TilemapData, levelPath: string): LevelData {
        const obstacles: LevelObstacle[] = [];
        
        // Find the obstacle layer
        const obstacleLayer = tilemapData.layers.find(layer => 
            layer.name.toLowerCase().includes('obstacle') && layer.type === 'tilelayer'
        );

        if (obstacleLayer) {
            console.log(`Found obstacle layer: ${obstacleLayer.name}`);
            console.log(`Layer dimensions: ${obstacleLayer.width}x${obstacleLayer.height}`);
            
            // Parse obstacle data
            for (let y = 0; y < obstacleLayer.height; y++) {
                for (let x = 0; x < obstacleLayer.width; x++) {
                    const index = y * obstacleLayer.width + x;
                    const tileId = obstacleLayer.data[index];
                    
                    // If tile ID is not 0, it's an obstacle (assuming 0 = empty, any other value = obstacle)
                    if (tileId !== 0) {
                        const pixelX = x * tilemapData.tilewidth + tilemapData.tilewidth / 2;
                        const pixelY = y * tilemapData.tileheight + tilemapData.tileheight / 2;
                        
                        obstacles.push({
                            x: pixelX,
                            y: pixelY,
                            gridX: x,
                            gridY: y
                        });
                    }
                }
            }
        } else {
            console.warn('No obstacle layer found in tilemap');
        }

        const levelName = levelPath.split('/').pop()?.replace('.json', '') || 'unknown';
        
        const levelData: LevelData = {
            obstacles,
            width: tilemapData.width * tilemapData.tilewidth,
            height: tilemapData.height * tilemapData.tileheight,
            tileSize: tilemapData.tilewidth,
            name: levelName
        };

        console.log(`Parsed level "${levelName}": ${obstacles.length} obstacles`);
        return levelData;
    }

    public static addCustomLevel(levelPath: string): void {
        if (!this.availableLevels.includes(levelPath)) {
            this.availableLevels.push(levelPath);
            console.log(`Added custom level: ${levelPath}`);
        }
    }
} 