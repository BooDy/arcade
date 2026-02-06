
import { Direction } from './Constants';
import { Maze } from './Maze';

export class PacMan {
    public x: number = 0;
    public y: number = 0;

    public direction: Direction = Direction.NONE;
    public nextDirection: Direction = Direction.NONE;
    public speed: number = 0.15; // tiles per frame approx

    private maze: Maze;

    constructor(maze: Maze) {
        this.maze = maze;
        this.reset();
    }

    reset() {
        this.x = 14;
        this.y = 17; // Correct spawn
        this.direction = Direction.NONE;
        this.nextDirection = Direction.NONE;
    }

    setNextDirection(dir: Direction) {
        this.nextDirection = dir;
    }

    update() {
        // 1. Try to turn if aligned with grid center
        const centerThreshold = 0.1;
        const distToCenterX = Math.abs(this.x - Math.round(this.x));
        const distToCenterY = Math.abs(this.y - Math.round(this.y));
        const nearCenter = distToCenterX < centerThreshold && distToCenterY < centerThreshold;

        if (nearCenter) {
            if (this.nextDirection !== Direction.NONE) {
                // Check if we can turn
                const cx = Math.round(this.x);
                const cy = Math.round(this.y);
                const dx = this.getDirX(this.nextDirection);
                const dy = this.getDirY(this.nextDirection);

                if (!this.maze.isWall(cx + dx, cy + dy)) {
                    this.direction = this.nextDirection;
                    this.nextDirection = Direction.NONE;
                    // Snap exactly to center to turn cleanly
                    this.x = cx;
                    this.y = cy;
                }
            }
        }

        // 2. Move
        const dx = this.getDirX(this.direction);
        const dy = this.getDirY(this.direction);

        if (this.direction !== Direction.NONE) {
            // Predict next position
            const nextX = this.x + dx * this.speed;
            const nextY = this.y + dy * this.speed;

            // Collision Check (Look ahead)
            const checkX = Math.round(this.x + dx * 0.51);
            const checkY = Math.round(this.y + dy * 0.51);

            if (this.maze.isWall(checkX, checkY)) {
                // Wall hit - Stop at center
                const dist = Math.sqrt((checkX - this.x) ** 2 + (checkY - this.y) ** 2);
                if (dist < 0.6) {
                    this.x = Math.round(this.x);
                    this.y = Math.round(this.y);
                    return;
                }
            }

            this.x = nextX;
            this.y = nextY;

            // Warp Tunnel
            if (this.x < -0.5) this.x = this.maze.cols - 0.5;
            if (this.x > this.maze.cols - 0.5) this.x = -0.5;
        }

        // 3. Eat Pellets
        return this.maze.eatPellet(Math.round(this.x), Math.round(this.y));
    }

    private getDirX(dir: Direction): number {
        if (dir === Direction.LEFT) return -1;
        if (dir === Direction.RIGHT) return 1;
        return 0;
    }

    private getDirY(dir: Direction): number {
        if (dir === Direction.UP) return -1;
        if (dir === Direction.DOWN) return 1;
        return 0;
    }
}
