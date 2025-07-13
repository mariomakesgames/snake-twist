import { Food } from '../Food';

export class ShrinkFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to red
        this.sprite.setFillStyle(0xff0000);
        console.log('Shrink food created!');
    }
} 