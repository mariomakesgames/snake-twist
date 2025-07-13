import { Food } from '../Food';

export class SpeedBoostFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to orange
        this.sprite.setFillStyle(0xff8800);
        console.log('Speed boost food created!');
    }
} 