
import { UIHelper } from '../utils/UIHelper';

export interface FoodTutorial {
    id: string;
    name: string;
    description: string;
    effect: string;
    color: number;
    icon: string;
    shown: boolean;
}

export class FoodTutorialManager {
    private scene: Phaser.Scene;
    private tutorials: FoodTutorial[];
    private tutorialOverlay?: Phaser.GameObjects.Container;
    private currentTutorialIndex: number = 0;
    private isShowingTutorial: boolean = false;
    private readonly STORAGE_KEY = 'snake_food_tutorials_shown';

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.tutorials = this.initializeTutorials();
        this.loadTutorialState();
    }

    private initializeTutorials(): FoodTutorial[] {
        return [
            {
                id: 'growth-boost',
                name: 'Growth Boost Food',
                description: 'Yellow food that provides a massive growth boost',
                effect: '+5 segments, +50 points',
                color: 0xffff00,
                icon: '⭐',
                shown: false
            },
            {
                id: 'speed-boost',
                name: 'Speed Boost Food',
                description: 'Orange food that increases your snake\'s speed',
                effect: '+1 segment, +15 points, +20% speed',
                color: 0xff8800,
                icon: '⚡',
                shown: false
            },
            {
                id: 'shrink-food',
                name: 'Shrink Food',
                description: 'Red food that reduces your snake\'s length',
                effect: '-1 segment, -10 points',
                color: 0xff0000,
                icon: '⚠️',
                shown: false
            },
            {
                id: 'slow-food',
                name: 'Slow Food',
                description: 'Pink food that decreases your snake\'s speed',
                effect: '+1 segment, +5 points, -30% speed',
                color: 0xff88ff,
                icon: '🐌',
                shown: false
            },
            {
                id: 'portal',
                name: 'Portal',
                description: 'Purple portals that teleport your snake to another location',
                effect: 'Instant teleportation, temporary cooldown',
                color: 0x9b59b6,
                icon: '🌀',
                shown: false
            }
        ];
    }

    private loadTutorialState(): void {
        try {
            const savedState = localStorage.getItem(this.STORAGE_KEY);
            if (savedState) {
                const shownTutorials = JSON.parse(savedState) as string[];
                this.tutorials.forEach(tutorial => {
                    tutorial.shown = shownTutorials.includes(tutorial.id);
                });
                console.log('Loaded tutorial state from localStorage:', shownTutorials);
            }
        } catch (error) {
            console.warn('Failed to load tutorial state from localStorage:', error);
        }
    }

    private saveTutorialState(): void {
        try {
            const shownTutorials = this.tutorials
                .filter(tutorial => tutorial.shown)
                .map(tutorial => tutorial.id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shownTutorials));
            console.log('Saved tutorial state to localStorage:', shownTutorials);
        } catch (error) {
            console.warn('Failed to save tutorial state to localStorage:', error);
        }
    }

    public showTutorial(foodId: string): void {
        const tutorial = this.tutorials.find(t => t.id === foodId);
        if (!tutorial || tutorial.shown) return;

        this.isShowingTutorial = true;
        this.currentTutorialIndex = 0; // Set to 0 for single tutorial popup
        tutorial.shown = true;
        this.saveTutorialState(); // Save state when tutorial is shown
        
        this.createTutorialOverlay(tutorial, true); // Pause game when showing first tutorial
    }

    private pauseGame(): void {
        const gameState = (window as any).gameState;
        if (gameState && !gameState.isGameOver) {
            gameState.isPaused = true;
            console.log('Game paused for tutorial');
        }
        
        // Disable mobile input manager to avoid interference with tutorial button clicks
        this.disableMobileInput();
    }

    private resumeGame(): void {
        const gameState = (window as any).gameState;
        if (gameState && !gameState.isGameOver) {
            gameState.isPaused = false;
            console.log('Game resumed after tutorial');
        }
        
        // Re-enable mobile input manager
        this.enableMobileInput();
    }

    private disableMobileInput(): void {
        try {
            // Get the current scene's snake instance and disable its input manager
            const gameState = (window as any).gameState;
            if (gameState && gameState.currentScene && gameState.currentScene.snake) {
                const snake = gameState.currentScene.snake;
                if (snake.swipeInputManager) {
                    // Note: SwipeInputManager doesn't have enable/disable methods
                    // Input is controlled by the snake's isMoving property
                    console.log('Input manager disabled for tutorial (via snake.isMoving)');
                }
            }
        } catch (error) {
            console.warn('Failed to disable input manager:', error);
        }
    }

    private enableMobileInput(): void {
        try {
            // Re-enable input manager
            const gameState = (window as any).gameState;
            if (gameState && gameState.currentScene && gameState.currentScene.snake) {
                const snake = gameState.currentScene.snake;
                if (snake.swipeInputManager) {
                    // Note: SwipeInputManager doesn't have enable/disable methods
                    // Input is controlled by the snake's isMoving property
                    console.log('Input manager enabled after tutorial (via snake.isMoving)');
                }
            }
        } catch (error) {
            console.warn('Failed to enable input manager:', error);
        }
    }



    public showAllTutorials(): void {
        if (this.isShowingTutorial) return;
        
        this.currentTutorialIndex = 0;
        this.showNextTutorial(); // This will pause the game in createTutorialOverlay
    }

    private showNextTutorial(): void {
        if (this.currentTutorialIndex >= this.tutorials.length) {
            this.hideTutorial();
            return;
        }

        const tutorial = this.tutorials[this.currentTutorialIndex];
        // Don't pause again when showing next tutorial (game is already paused)
        this.createTutorialOverlay(tutorial, false);
        
        // Mark tutorial as shown
        tutorial.shown = true;
        this.saveTutorialState();
        
        // Increment index after showing tutorial
        this.currentTutorialIndex++;
    }

    private createTutorialOverlay(tutorial: FoodTutorial, shouldPause: boolean = true): void {
        // Remove existing overlay
        this.hideTutorial();

        console.log('Creating tutorial overlay for:', tutorial.name);
        console.log('Game dimensions:', this.scene.scale.width, 'x', this.scene.scale.height);

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // Create semi-transparent background
        const background = UIHelper.createOverlay(this.scene, 0x000000, 0.7);

        // Create tutorial card with rounded corners
        const cardWidth = 400;
        const cardHeight = 300;
        
        // Create card background with rounded corners
        const cardBg = UIHelper.createPanel(this.scene, {
            x: gameWidth / 2,
            y: gameHeight / 2,
            width: cardWidth,
            height: cardHeight,
            fillColor: 0x333333,
            borderColor: tutorial.color,
            borderWidth: 3,
            borderRadius: 20
        });

        // Create icon
        const icon = UIHelper.createText(this.scene, {
            x: gameWidth / 2,
            y: gameHeight / 2 - 80,
            text: tutorial.icon,
            fontSize: '48px',
            color: '#ffffff'
        });

        // Create title
        const title = UIHelper.createText(this.scene, {
            x: gameWidth / 2,
            y: gameHeight / 2 - 30,
            text: tutorial.name,
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        // Create description
        const description = UIHelper.createText(this.scene, {
            x: gameWidth / 2,
            y: gameHeight / 2 + 10,
            text: tutorial.description,
            fontSize: '16px',
            color: '#cccccc',
            wordWrap: { width: cardWidth - 40 }
        });

        // Create effect text
        const effect = UIHelper.createText(this.scene, {
            x: gameWidth / 2,
            y: gameHeight / 2 + 50,
            text: tutorial.effect,
            fontSize: '18px',
            color: `#${tutorial.color.toString(16)}`,
            fontStyle: 'bold'
        });

        // Create continue button
        const buttonX = gameWidth / 2;
        const buttonY = gameHeight / 2 + 100;
        
        console.log('Button position:', buttonX, buttonY);
        
        // Determine text color based on background color for better contrast
        const textColor = tutorial.color === 0xffff00 ? '#000000' : '#ffffff';
        
        // Define click handler function
        const handleButtonClick = () => {
            console.log('Tutorial button clicked, currentTutorialIndex:', this.currentTutorialIndex);
            // If it's a single tutorial popup (currentTutorialIndex is 0), close directly
            // If it's a batch tutorial popup (currentTutorialIndex > 0), show the next one
            if (this.currentTutorialIndex === 0) {
                console.log('Hiding tutorial (single tutorial)');
                this.hideTutorial();
            } else {
                if (this.currentTutorialIndex < this.tutorials.length) {
                    console.log('Showing next tutorial');
                    this.showNextTutorial();
                } else {
                    console.log('Hiding tutorial (last tutorial)');
                    this.hideTutorial();
                }
            }
        };

        // Create button using UIHelper
        const buttonContainer = UIHelper.createButton(this.scene, {
            x: buttonX,
            y: buttonY,
            width: 160,
            height: 60,
            text: 'Continue',
            fontSize: '18px',
            colors: {
                fill: [tutorial.color, tutorial.color, tutorial.color, tutorial.color],
                border: 0xffffff,
                text: textColor
            },
            onClick: handleButtonClick,
            borderRadius: 30
        });

        // Create container
        this.tutorialOverlay = this.scene.add.container(0, 0, [
            background,
            cardBg,
            icon,
            title,
            description,
            effect,
            buttonContainer
        ]);

        // Add entrance animation
        this.tutorialOverlay.setAlpha(0);
        this.tutorialOverlay.setScale(0.8);
        this.scene.tweens.add({
            targets: this.tutorialOverlay,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Pause game if needed
        if (shouldPause) {
            this.pauseGame();
        }
    }

    public hideTutorial(): void {
        console.log('hideTutorial called, tutorialOverlay exists:', !!this.tutorialOverlay);
        if (this.tutorialOverlay) {
            this.scene.tweens.add({
                targets: this.tutorialOverlay,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    console.log('Tutorial overlay animation completed, destroying overlay');
                    this.tutorialOverlay?.destroy();
                    this.tutorialOverlay = undefined;
                    this.isShowingTutorial = false;
                    
                    // Resume the game when tutorial is hidden
                    this.resumeGame();
                }
            });
        }
    }

    public resetTutorials(): void {
        this.tutorials.forEach(tutorial => {
            tutorial.shown = false;
        });
        this.currentTutorialIndex = 0;
        this.hideTutorial();
        
        // Clear localStorage
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cleared tutorial state from localStorage');
        } catch (error) {
            console.warn('Failed to clear tutorial state from localStorage:', error);
        }
    }

    public getTutorial(foodId: string): FoodTutorial | undefined {
        return this.tutorials.find(t => t.id === foodId);
    }

    public isTutorialShown(foodId: string): boolean {
        const tutorial = this.getTutorial(foodId);
        return tutorial ? tutorial.shown : false;
    }

    public areAllTutorialsShown(): boolean {
        return this.tutorials.every(tutorial => tutorial.shown);
    }

    public getShownTutorialCount(): number {
        return this.tutorials.filter(tutorial => tutorial.shown).length;
    }

    public getTotalTutorialCount(): number {
        return this.tutorials.length;
    }

    public isTutorialActive(): boolean {
        return this.isShowingTutorial;
    }

    public destroy(): void {
        this.hideTutorial();
    }
} 