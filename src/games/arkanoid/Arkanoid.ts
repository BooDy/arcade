import { Application, Container, Ticker, Text, TextStyle } from 'pixi.js';
import type { IGame } from '../../interfaces/GameInterface';
import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Brick } from './Brick';
import {
    STAGE_WIDTH, STAGE_HEIGHT, COLORS,
    BRICK_ROWS, BRICK_COLS, BRICK_WIDTH, BRICK_HEIGHT,
    BRICK_PADDING, BRICK_OFFSET_TOP, BRICK_OFFSET_LEFT,
    PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS
} from './Constants';

export class Arkanoid implements IGame {
    private app: Application;
    private gameContainer: Container;
    private paddle: Paddle;
    private ball: Ball;
    private bricks: Brick[] = [];
    private score: number = 0;
    private running: boolean = false;
    private paused: boolean = false;
    private pauseBtn: HTMLElement | null = null;
    private scoreText: Text;
    private gameOverText: Text;
    private keys: { [key: string]: boolean } = {};

    constructor() {
        this.app = new Application();
        this.gameContainer = new Container();
        this.paddle = new Paddle();
        this.ball = new Ball();

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#ffffff',
        });
        this.scoreText = new Text({ text: 'Score: 0', style });

        const goStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: '#ff0000',
            align: 'center'
        });
        this.gameOverText = new Text({ text: 'GAME OVER', style: goStyle });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = STAGE_WIDTH / 2;
        this.gameOverText.y = STAGE_HEIGHT / 2;
        this.gameOverText.visible = false;
    }

    async init(appContainer: HTMLElement): Promise<void> {
        await this.app.init({
            background: COLORS.BACKGROUND,
            resizeTo: window,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            antialias: true,
        });

        // Prevent default browser touch actions (scrolling/zooming)
        this.app.canvas.style.touchAction = 'none';
        appContainer.appendChild(this.app.canvas);

        this.app.stage.addChild(this.gameContainer);

        // Setup game objects
        this.resetGame();

        // Input handling
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('resize', this.onResize);

        // Touch handling
        this.app.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.app.canvas.addEventListener('touchstart', this.onTouchMove, { passive: false });

        // Setup Pause Button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.style.display = 'flex';
            // Clone to remove old listeners
            const newBtn = pauseBtn.cloneNode(true) as HTMLElement;
            pauseBtn.parentNode?.replaceChild(newBtn, pauseBtn);

            this.pauseBtn = newBtn;
            this.pauseBtn.innerText = '||';
            this.pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Initial resize
        this.onResize();
    }

    private togglePause() {
        if (!this.running && !this.paused) return; // Don't pause if not running (unless already paused?)
        // Actually running is true when game is active.

        this.paused = !this.paused;
        if (this.pauseBtn) {
            this.pauseBtn.innerText = this.paused ? '▶' : '||';
        }
    }

    private resetGame() {
        this.gameContainer.removeChildren();
        this.bricks = [];
        this.score = 0;
        this.scoreText.text = 'Score: 0';
        this.gameOverText.visible = false;
        this.paused = false;
        if (this.pauseBtn) this.pauseBtn.innerText = '||';

        // Add bricks
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                const brick = new Brick();
                brick.x = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
                brick.y = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
                this.gameContainer.addChild(brick);
                this.bricks.push(brick);
            }
        }

        // Add paddle
        this.paddle.x = STAGE_WIDTH / 2;
        this.paddle.y = STAGE_HEIGHT - 50;
        this.gameContainer.addChild(this.paddle);

        // Add ball
        this.ball.reset(STAGE_WIDTH / 2, STAGE_HEIGHT - 70);
        this.gameContainer.addChild(this.ball);

        // Add UI
        this.scoreText.x = 10;
        this.scoreText.y = 10;
        this.gameContainer.addChild(this.scoreText);
        this.gameContainer.addChild(this.gameOverText);
    }

    start(): void {
        this.running = true;
        this.paused = false;
        this.ball.launch();
        this.app.ticker.add(this.update, this);
    }

    stop(): void {
        this.running = false;
        this.app.ticker.remove(this.update, this);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('resize', this.onResize);

        if (this.pauseBtn) {
            this.pauseBtn.style.display = 'none';
        }

        this.app.destroy({ removeView: true }, { children: true });
    }

    private onKeyDown = (e: KeyboardEvent) => {
        this.keys[e.code] = true;
        if (!this.running && e.code === 'Space') {
            // Restart if game over?
            if (this.gameOverText.visible) {
                this.resetGame();
                this.start();
            }
        }
        if (e.code === 'KeyP') {
            this.togglePause();
        }
    }

    private onKeyUp = (e: KeyboardEvent) => {
        this.keys[e.code] = false;
    }

    private onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.app.canvas.getBoundingClientRect();
        const scaleX = STAGE_WIDTH / rect.width;
        const touchX = (touch.clientX - rect.left) * scaleX;

        this.paddle.x = Math.max(PADDLE_WIDTH / 2, Math.min(STAGE_WIDTH - PADDLE_WIDTH / 2, touchX));
    }

    private onResize = () => {
        const scaleX = window.innerWidth / STAGE_WIDTH;
        const scaleY = window.innerHeight / STAGE_HEIGHT;
        const scale = Math.min(scaleX, scaleY) * 0.95;

        this.gameContainer.scale.set(scale);
        this.gameContainer.x = (window.innerWidth - STAGE_WIDTH * scale) / 2;
        this.gameContainer.y = (window.innerHeight - STAGE_HEIGHT * scale) / 2;
    }

    private update(_ticker: Ticker) {
        if (!this.running || this.gameOverText.visible || this.paused) return;

        // Paddle Movement
        if (this.keys['ArrowLeft']) {
            this.paddle.moveLeft();
        }
        if (this.keys['ArrowRight']) {
            this.paddle.moveRight();
        }

        // Ball Movement
        this.ball.move();

        // Wall Collisions
        if (this.ball.x - BALL_RADIUS < 0) {
            this.ball.x = BALL_RADIUS;
            this.ball.vx *= -1;
        } else if (this.ball.x + BALL_RADIUS > STAGE_WIDTH) {
            this.ball.x = STAGE_WIDTH - BALL_RADIUS;
            this.ball.vx *= -1;
        }

        if (this.ball.y - BALL_RADIUS < 0) {
            this.ball.y = BALL_RADIUS;
            this.ball.vy *= -1;
        } else if (this.ball.y + BALL_RADIUS > STAGE_HEIGHT) {
            // Game Over
            this.running = false;
            this.gameOverText.visible = true;
            return;
        }

        // Paddle Collision
        const pLeft = this.paddle.x - PADDLE_WIDTH / 2;
        const pRight = this.paddle.x + PADDLE_WIDTH / 2;
        const pTop = this.paddle.y - PADDLE_HEIGHT / 2;
        const pBottom = this.paddle.y + PADDLE_HEIGHT / 2;

        if (this.ball.y + BALL_RADIUS >= pTop &&
            this.ball.y - BALL_RADIUS <= pBottom &&
            this.ball.x >= pLeft && this.ball.x <= pRight) {

            this.ball.y = pTop - BALL_RADIUS;
            this.ball.vy *= -1;

            // Add some English based on where it hit paddle
            const hitPoint = this.ball.x - this.paddle.x;
            this.ball.vx = hitPoint * 0.15;
        }

        // Brick Collision
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];

            const bLeft = brick.x;
            const bRight = brick.x + BRICK_WIDTH;
            const bTop = brick.y;
            const bBottom = brick.y + BRICK_HEIGHT;

            if (this.ball.x + BALL_RADIUS > bLeft &&
                this.ball.x - BALL_RADIUS < bRight &&
                this.ball.y + BALL_RADIUS > bTop &&
                this.ball.y - BALL_RADIUS < bBottom) {

                // Remove brick
                this.gameContainer.removeChild(brick);
                this.bricks.splice(i, 1);

                this.ball.vy *= -1;
                this.score += 10;
                this.scoreText.text = `Score: ${this.score}`;
                break; // Only hit one brick per frame
            }
        }

        if (this.bricks.length === 0) {
            // Win?
            this.resetGame();
            this.ball.launch();
        }
    }
}
