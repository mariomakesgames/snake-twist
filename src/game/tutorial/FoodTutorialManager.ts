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
                id: 'regular-food',
                name: 'Regular Food',
                description: 'Basic green food that makes your snake grow by 1 segment',
                effect: '+1 segment, +10 points',
                color: 0x00ff00,
                icon: '🍎',
                shown: false
            },
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
    }

    private resumeGame(): void {
        const gameState = (window as any).gameState;
        if (gameState && !gameState.isGameOver) {
            gameState.isPaused = false;
            console.log('Game resumed after tutorial');
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
        this.currentTutorialIndex++;
        
        // Mark tutorial as shown
        tutorial.shown = true;
        this.saveTutorialState();
    }

    private createTutorialOverlay(tutorial: FoodTutorial, shouldPause: boolean = true): void {
        // Remove existing overlay
        this.hideTutorial();

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // Create semi-transparent background
        const background = this.scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0.7
        );

        // Create tutorial card
        const cardWidth = 400;
        const cardHeight = 300;
        const card = this.scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            cardWidth,
            cardHeight,
            0x333333
        );
        card.setStrokeStyle(3, tutorial.color);

        // Create icon
        const icon = this.scene.add.text(
            gameWidth / 2,
            gameHeight / 2 - 80,
            tutorial.icon,
            {
                fontSize: '48px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Create title
        const title = this.scene.add.text(
            gameWidth / 2,
            gameHeight / 2 - 30,
            tutorial.name,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Create description
        const description = this.scene.add.text(
            gameWidth / 2,
            gameHeight / 2 + 10,
            tutorial.description,
            {
                fontSize: '16px',
                color: '#cccccc',
                fontFamily: 'Arial',
                wordWrap: { width: cardWidth - 40 }
            }
        ).setOrigin(0.5);

        // Create effect text
        const effect = this.scene.add.text(
            gameWidth / 2,
            gameHeight / 2 + 50,
            tutorial.effect,
            {
                fontSize: '18px',
                color: `#${tutorial.color.toString(16)}`,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Create continue button
        const buttonWidth = 120;
        const buttonHeight = 40;
        const button = this.scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2 + 100,
            buttonWidth,
            buttonHeight,
            tutorial.color
        );
        button.setStrokeStyle(2, 0xffffff);

        const buttonText = this.scene.add.text(
            gameWidth / 2,
            gameHeight / 2 + 100,
            'Continue',
            {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Make button interactive
        button.setInteractive();
        button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power2'
            });
        });

        button.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true
            });
        });

        button.on('pointerup', () => {
            if (this.currentTutorialIndex < this.tutorials.length) {
                this.showNextTutorial();
            } else {
                this.hideTutorial();
            }
        });

        // Create container
        this.tutorialOverlay = this.scene.add.container(0, 0, [
            background,
            card,
            icon,
            title,
            description,
            effect,
            button,
            buttonText
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
        if (this.tutorialOverlay) {
            this.scene.tweens.add({
                targets: this.tutorialOverlay,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
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