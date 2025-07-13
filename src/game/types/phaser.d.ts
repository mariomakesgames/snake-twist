declare namespace Phaser {
    const AUTO: number;
    const Physics: {
        Arcade: {
            Factory: any;
        };
    };
    const Math: {
        Between: (min: number, max: number) => number;
        Vector2: new (x: number, y: number) => Vector2;
        RND: {
            pick: <T>(array: T[]) => T;
        };
    };
    
    class Scene {
        add: {
            rectangle: (x: number, y: number, width: number, height: number, color: number) => GameObjects.Rectangle;
            graphics: () => GameObjects.Graphics;
        };
        physics: {
            add: {
                existing: (gameObject: any) => any;
                overlap: (obj1: any, obj2: any, callback: Function, context?: any, scene?: any) => void;
            };
            world: {
                setBounds: (x: number, y: number, width: number, height: number) => void;
                on: (event: string, callback: Function, context?: any) => void;
            };
        };
        input: {
            keyboard: {
                createCursorKeys: () => any;
                on: (event: string, callback: Function) => void;
            };
        };
        time: {
            now: number;
            delayedCall: (delay: number, callback: Function, args?: any[], context?: any) => any;
        };
        scale: {
            width: number;
            height: number;
        };
        scene: {
            restart: () => void;
        };
    }
    
    class Game {
        constructor(config: any);
    }
    
    namespace GameObjects {
        class Rectangle {
            x: number;
            y: number;
            body?: any;
            setPosition: (x: number, y: number) => this;
            setFillStyle: (color: number) => this;
            setOrigin: (x: number, y: number) => this;
            destroy: () => void;
        }
        
        class Graphics {
            lineStyle: (width: number, color: number, alpha: number) => this;
            moveTo: (x: number, y: number) => this;
            lineTo: (x: number, y: number) => this;
            stroke: () => this;
        }
    }
    
    class Vector2 {
        x: number;
        y: number;
        constructor(x: number, y: number);
        set: (x: number, y: number) => this;
        copy: (source: Vector2) => this;
    }
} 