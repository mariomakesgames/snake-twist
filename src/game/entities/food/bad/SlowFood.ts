import { Food } from '../Food';

export class SlowFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to pink
        this.sprite.setFillStyle(0xff88ff);
        console.log('Slow food created!');
    }
} 