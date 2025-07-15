export interface GameSettings {
    obstacleMode: boolean;
    obstacleModeScoreMultiplier: number;
}

export class GameSettingsManager {
    private static instance: GameSettingsManager;
    private settings: GameSettings;
    private readonly STORAGE_KEY = 'snake_game_settings';

    private constructor() {
        this.settings = this.loadSettings();
    }

    public static getInstance(): GameSettingsManager {
        if (!GameSettingsManager.instance) {
            GameSettingsManager.instance = new GameSettingsManager();
        }
        return GameSettingsManager.instance;
    }

    private loadSettings(): GameSettings {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load game settings:', error);
        }

        // 默认设置
        return {
            obstacleMode: false,
            obstacleModeScoreMultiplier: 2.0 // 障碍物模式下得分2倍
        };
    }

    private saveSettings(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save game settings:', error);
        }
    }

    public getSettings(): GameSettings {
        return { ...this.settings };
    }

    public setObstacleMode(enabled: boolean): void {
        this.settings.obstacleMode = enabled;
        this.saveSettings();
    }

    public isObstacleModeEnabled(): boolean {
        return this.settings.obstacleMode;
    }

    public getScoreMultiplier(): number {
        const multiplier = this.settings.obstacleMode ? this.settings.obstacleModeScoreMultiplier : 1.0;
        console.log(`Obstacle mode: ${this.settings.obstacleMode}, Multiplier: ${multiplier}`);
        return multiplier;
    }

    public resetToDefaults(): void {
        this.settings = {
            obstacleMode: false,
            obstacleModeScoreMultiplier: 2.0
        };
        this.saveSettings();
    }

    public setObstacleModeScoreMultiplier(multiplier: number): void {
        this.settings.obstacleModeScoreMultiplier = multiplier;
        this.saveSettings();
    }

    public forceResetTo2x(): void {
        this.settings.obstacleModeScoreMultiplier = 2.0;
        this.saveSettings();
        console.log('Forced reset obstacle mode score multiplier to 2.0x');
    }
} 