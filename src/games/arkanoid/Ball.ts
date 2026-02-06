import { Graphics } from 'pixi.js';
import { BALL_RADIUS, BALL_SPEED, COLORS } from './Constants';

export class Ball extends Graphics {
    public vx: number = 0;
    public vy: number = 0;
    public speed: number = BALL_SPEED;

    constructor() {
        super();
        this.fill(COLORS.BALL);
        this.circle(0, 0, BALL_RADIUS);
        this.fill();
    }

    reset(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    launch() {
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = -this.speed;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
}
