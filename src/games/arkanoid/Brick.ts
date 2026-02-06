import { Graphics } from 'pixi.js';
import { BRICK_WIDTH, BRICK_HEIGHT, COLORS } from './Constants';

export class Brick extends Graphics {
    public value: number = 1;

    constructor() {
        super();
        this.fill(COLORS.BRICK);
        this.rect(0, 0, BRICK_WIDTH, BRICK_HEIGHT);
        this.fill();
    }
}
