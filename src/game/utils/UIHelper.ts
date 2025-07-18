export interface ButtonConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize?: string;
    colors: {
        fill: number[];
        border: number;
        text: string;
        stroke?: string;
    };
    onClick: () => void;
    borderRadius?: number;
}

export interface TextConfig {
    x: number;
    y: number;
    text: string;
    fontSize: string;
    color: string;
    fontFamily?: string;
    fontStyle?: string;
    stroke?: string;
    strokeThickness?: number;
    align?: string;
    wordWrap?: { width: number; useAdvancedWrap?: boolean };
    lineSpacing?: number;
    padding?: { top: number; bottom: number };
}

export interface PanelConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: number;
    borderColor: number;
    borderWidth?: number;
    borderRadius?: number;
    alpha?: number;
}

export class UIHelper {
    /**
     * Creates a styled text element with common configuration
     */
    static createText(scene: Phaser.Scene, config: TextConfig): Phaser.GameObjects.Text {
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: config.fontSize,
            color: config.color,
            fontFamily: config.fontFamily || 'Arial, sans-serif',
            fontStyle: config.fontStyle || 'normal',
            align: config.align || 'center',
            wordWrap: config.wordWrap,
            lineSpacing: config.lineSpacing,
            padding: config.padding
        };

        if (config.stroke) {
            textConfig.stroke = config.stroke;
            textConfig.strokeThickness = config.strokeThickness || 1;
        }

        const text = scene.add.text(config.x, config.y, config.text, textConfig);
        text.setOrigin(0.5);
        return text;
    }

    /**
     * Creates a button with background, text, and click handlers
     */
    static createButton(scene: Phaser.Scene, config: ButtonConfig): Phaser.GameObjects.Container {
        const borderRadius = config.borderRadius || 30;

        // Create button background with gradient
        const background = scene.add.graphics();
        background.fillGradientStyle(
            config.colors.fill[0], config.colors.fill[1],
            config.colors.fill[2], config.colors.fill[3], 1
        );
        background.fillRoundedRect(
            -config.width / 2, -config.height / 2,
            config.width, config.height, borderRadius
        );

        // Add border
        background.lineStyle(3, config.colors.border, 1);
        background.strokeRoundedRect(
            -config.width / 2, -config.height / 2,
            config.width, config.height, borderRadius
        );

        // Create button text
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: config.fontSize || '20px',
            color: config.colors.text,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        };

        if (config.colors.stroke) {
            textConfig.stroke = config.colors.stroke;
            textConfig.strokeThickness = 1;
        }

        const text = scene.add.text(0, 0, config.text, textConfig).setOrigin(0.5);

        // Create container
        const container = scene.add.container(config.x, config.y, [background, text]);
        container.setActive(true).setVisible(true);

        // Make interactive
        background.setInteractive(
            new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
            Phaser.Geom.Rectangle.Contains
        );

        // Add click handlers
        const handleClick = () => {
            config.onClick();
        };

        background.on('pointerup', handleClick);
        text.setInteractive(
            new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
            Phaser.Geom.Rectangle.Contains
        );
        text.on('pointerup', handleClick);

        return container;
    }

    /**
     * Creates a panel with rounded corners
     */
    static createPanel(scene: Phaser.Scene, config: PanelConfig): Phaser.GameObjects.Graphics {
        const panel = scene.add.graphics();
        
        if (config.alpha !== undefined) {
            panel.setAlpha(config.alpha);
        }

        panel.fillStyle(config.fillColor, 1);
        panel.fillRoundedRect(
            config.x - config.width / 2,
            config.y - config.height / 2,
            config.width,
            config.height,
            config.borderRadius || 25
        );

        panel.lineStyle(config.borderWidth || 4, config.borderColor, 1);
        panel.strokeRoundedRect(
            config.x - config.width / 2,
            config.y - config.height / 2,
            config.width,
            config.height,
            config.borderRadius || 25
        );

        return panel;
    }

    /**
     * Creates a background overlay
     */
    static createOverlay(scene: Phaser.Scene, color: number = 0x000000, alpha: number = 0.8): Phaser.GameObjects.Rectangle {
        return scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, color, alpha)
            .setOrigin(0, 0);
    }

    /**
     * Creates a loading button state (disabled with loading text)
     */
    static setButtonLoadingState(
        container: Phaser.GameObjects.Container,
        loadingText: string,
        disabledColors: { fill: number[]; border: number; text: string }
    ): void {
        const background = container.getAt(0) as Phaser.GameObjects.Graphics;
        const text = container.getAt(1) as Phaser.GameObjects.Text;

        if (background && text) {
            background.clear();
            background.fillGradientStyle(
                disabledColors.fill[0], disabledColors.fill[1],
                disabledColors.fill[2], disabledColors.fill[3], 1
            );
            background.fillRoundedRect(-120, -30, 240, 60, 30);
            background.lineStyle(3, disabledColors.border, 1);
            background.strokeRoundedRect(-120, -30, 240, 60, 30);

            text.setText(loadingText);
            text.setColor(disabledColors.text);

            // Disable interactivity
            background.disableInteractive();
            text.disableInteractive();
            container.disableInteractive();
        }
    }

    /**
     * Restores a button to its normal state
     */
    static restoreButtonState(
        container: Phaser.GameObjects.Container,
        normalText: string,
        normalColors: { fill: number[]; border: number; text: string }
    ): void {
        const background = container.getAt(0) as Phaser.GameObjects.Graphics;
        const text = container.getAt(1) as Phaser.GameObjects.Text;

        if (background && text) {
            background.clear();
            background.fillGradientStyle(
                normalColors.fill[0], normalColors.fill[1],
                normalColors.fill[2], normalColors.fill[3], 1
            );
            background.fillRoundedRect(-120, -30, 240, 60, 30);
            background.lineStyle(3, normalColors.border, 1);
            background.strokeRoundedRect(-120, -30, 240, 60, 30);

            text.setText(normalText);
            text.setColor(normalColors.text);

            // Re-enable interactivity
            background.setInteractive(
                new Phaser.Geom.Rectangle(-120, -30, 240, 60),
                Phaser.Geom.Rectangle.Contains
            );
            text.setInteractive(
                new Phaser.Geom.Rectangle(-120, -30, 240, 60),
                Phaser.Geom.Rectangle.Contains
            );
            container.setInteractive(
                new Phaser.Geom.Rectangle(-120, -30, 240, 60),
                Phaser.Geom.Rectangle.Contains
            );
        }
    }

    /**
     * Creates particle effects around a target
     */
    static createParticleEffect(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject & { x: number; y: number },
        count: number = 20,
        color: number = 0x4CAF50,
        radius: number = 100
    ): void {
        for (let i = 0; i < count; i++) {
            const particle = scene.add.circle(
                target.x + (Math.random() - 0.5) * radius,
                target.y + (Math.random() - 0.5) * radius,
                3,
                color
            );

            scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                scale: 0,
                duration: 800 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Creates a pulsing animation for a game object
     */
    static createPulseAnimation(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject,
        scale: number = 1.05,
        duration: number = 500,
        repeat: number = 5
    ): void {
        scene.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            repeat: repeat
        });
    }
} 