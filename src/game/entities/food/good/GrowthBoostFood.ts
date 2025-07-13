import { Food } from '../Food';

export class GrowthBoostFood extends Food {
    constructor(scene: Phaser.Scene) {
        super(scene);
        // Change color to yellow
        this.sprite.setFillStyle(0xffff00);
        console.log('Growth boost food created!');
    }
} 