export interface GameSettings {
    obstacleMode: boolean;
    obstacleModeScoreMultiplier: number;
    levelMode: boolean;
    selectedLevelFile: string | null;
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

        // Default settings
        return {
            obstacleMode: false,
            obstacleModeScoreMultiplier: 2.0, // 2x score multiplier in obstacle mode
            levelMode: false,
            selectedLevelFile: null
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
        // If enabling obstacle mode, disable level mode
        if (enabled) {
            this.settings.levelMode = false;
        }
        this.saveSettings();
    }

    public isObstacleModeEnabled(): boolean {
        return this.settings.obstacleMode;
    }

    public setLevelMode(enabled: boolean): void {
        this.settings.levelMode = enabled;
        // If enabling level mode, disable obstacle mode
        if (enabled) {
            this.settings.obstacleMode = false;
        }
        this.saveSettings();
    }

    public isLevelModeEnabled(): boolean {
        return this.settings.levelMode;
    }

    public setSelectedLevelFile(fileName: string | null): void {
        this.settings.selectedLevelFile = fileName;
        this.saveSettings();
    }

    public getSelectedLevelFile(): string | null {
        return this.settings.selectedLevelFile;
    }

    public getScoreMultiplier(): number {
        let multiplier = 1.0;
        if (this.settings.obstacleMode) {
            multiplier = this.settings.obstacleModeScoreMultiplier;
        } else if (this.settings.levelMode) {
            multiplier = 1.0; // Level mode uses normal multiplier
        }
        console.log(`Obstacle mode: ${this.settings.obstacleMode}, Level mode: ${this.settings.levelMode}, Multiplier: ${multiplier}`);
        return multiplier;
    }

    public resetToDefaults(): void {
        this.settings = {
            obstacleMode: false,
            obstacleModeScoreMultiplier: 2.0,
            levelMode: false,
            selectedLevelFile: null
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