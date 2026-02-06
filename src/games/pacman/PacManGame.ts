
import type { IGame } from '../../interfaces/GameInterface';
import { Maze } from './Maze';
import { PacMan } from './PacMan';
import { Ghost } from './Ghost';
import { PacManRenderer } from './Renderer';
import { Direction, COLORS } from './Constants';

export class PacManGame implements IGame {
    private container: HTMLElement | null = null;
    private renderer: PacManRenderer;
    private maze: Maze;
    private pacman: PacMan;
    private ghosts: Ghost[] = [];
    private running: boolean = false;
    private score: number = 0;
    private gameOver: boolean = false;

    constructor() {
        this.renderer = new PacManRenderer();
        this.maze = new Maze();
        this.pacman = new PacMan(this.maze);
        this.initGhosts();
    }

    private initGhosts() {
        // Blinky (Red) - Target PacMan
        this.ghosts.push(new Ghost(this.maze, 13, 11, COLORS.ghostRed));
        // Pinky (Pink) - Target PacMan + Offset
        this.ghosts.push(new Ghost(this.maze, 14, 11, COLORS.ghostPink));
        // Inky (Cyan)
        this.ghosts.push(new Ghost(this.maze, 13, 13, COLORS.ghostCyan)); // In box
        // Clyde (Orange)
        this.ghosts.push(new Ghost(this.maze, 14, 13, COLORS.ghostOrange));
    }

    async init(appContainer: HTMLElement): Promise<void> {
        this.container = appContainer;
        await this.renderer.init(this.container);
        this.renderer.drawMaze(this.maze);
        this.renderer.handleResize(); // Initial scale

        this.initControls();
        this.createScoreOverlay();
    }

    private createScoreOverlay() {
        let scoreEl = document.getElementById('pacman-score');
        if (!scoreEl) {
            scoreEl = document.createElement('div');
            scoreEl.id = 'pacman-score';
            scoreEl.style.cssText = `
                 position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
                 font-family: monospace; font-size: 24px; color: white; font-weight: bold;
                 z-index: 100; text-shadow: 2px 2px 0 #000;
             `;
            document.body.appendChild(scoreEl);
        }
        scoreEl.style.display = 'block';
        scoreEl.innerText = `SCORE: ${this.score}`;
    }

    start(): void {
        console.log('PacManGame.start called');
        this.running = true;
        this.renderer.app.ticker.add(this.update, this);
    }


    stop(): void {
        this.running = false;
        this.renderer.app.ticker.remove(this.update, this);
        this.renderer.destroy();
        window.removeEventListener('keydown', this.handleKeyDown);

        const scoreEl = document.getElementById('pacman-score');
        if (scoreEl) scoreEl.style.display = 'none';

        // Remove game over overlay if exists
        const go = document.getElementById('pacman-gameover');
        if (go) go.remove();
    }

    update() {
        // console.log('PacManGame.update running', this.running, this.gameOver);
        if (!this.running || this.gameOver) return;

        // Update PacMan
        const points = this.pacman.update();
        if (points && points > 0) {
            this.score += points;
            const scoreEl = document.getElementById('pacman-score');
            if (scoreEl) scoreEl.innerText = `SCORE: ${this.score}`;
        }

        // Update Ghosts
        for (const ghost of this.ghosts) {
            ghost.update(this.pacman.x, this.pacman.y);

            // Collision Check
            const dist = Math.sqrt((ghost.x - this.pacman.x) ** 2 + (ghost.y - this.pacman.y) ** 2);
            if (dist < 0.8) {
                this.handleGameOver();
            }
        }

        this.renderer.render(this.pacman);
        this.renderer.renderGhosts(this.ghosts);
    }

    private handleGameOver() {
        this.gameOver = true;
        const go = document.createElement('div');
        go.id = 'pacman-gameover';
        go.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-family: monospace; font-size: 40px; color: red; font-weight: bold;
            text-shadow: 3px 3px 0 #000; background: rgba(0,0,0,0.8); padding: 20px;
            border: 2px solid white; text-align: center;
        `;
        go.innerHTML = `GAME OVER<br><span style="font-size:20px; color:white">Tap to Exit</span>`;
        go.addEventListener('click', () => {
            // No action needed for now
        });
        document.body.appendChild(go);
    }

    private initControls() {
        window.addEventListener('keydown', this.handleKeyDown);

        // Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal
                if (Math.abs(dx) > 30) { // Threshold
                    if (dx > 0) this.pacman.setNextDirection(Direction.RIGHT);
                    else this.pacman.setNextDirection(Direction.LEFT);
                }
            } else {
                // Vertical
                if (Math.abs(dy) > 30) {
                    if (dy > 0) this.pacman.setNextDirection(Direction.DOWN);
                    else this.pacman.setNextDirection(Direction.UP);
                }
            }
        }, { passive: false });
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        console.log('Key pressed:', e.code);
        if (this.gameOver) return;
        switch (e.code) {
            case 'ArrowUp': this.pacman.setNextDirection(Direction.UP); break;
            case 'ArrowDown': this.pacman.setNextDirection(Direction.DOWN); break;
            case 'ArrowLeft': this.pacman.setNextDirection(Direction.LEFT); break;
            case 'ArrowRight': this.pacman.setNextDirection(Direction.RIGHT); break;
        }
    }
}
