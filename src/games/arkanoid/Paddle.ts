import { Graphics } from 'pixi.js';
import { PADDLE_WIDTH, PADDLE_HEIGHT, COLORS, STAGE_WIDTH, PADDLE_SPEED } from './Constants';

export class Paddle extends Graphics {
    constructor() {
        super();
        this.fill(COLORS.PADDLE);
        // Draw centered so x/y is the center
        this.rect(-PADDLE_WIDTH / 2, -PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
        this.fill();
    }

    moveLeft() {
        this.x -= PADDLE_SPEED;
        if (this.x < PADDLE_WIDTH / 2) {
            this.x = PADDLE_WIDTH / 2;
        }
    }

    moveRight() {
        this.x += PADDLE_SPEED;
        if (this.x > STAGE_WIDTH - PADDLE_WIDTH / 2) {
            this.x = STAGE_WIDTH - PADDLE_WIDTH / 2;
        }
    }
}
