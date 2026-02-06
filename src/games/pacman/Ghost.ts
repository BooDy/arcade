
import { Direction } from './Constants';
import { Maze } from './Maze';

export class Ghost {
    public x: number;
    public y: number;
    public color: number;
    public direction: Direction = Direction.LEFT;
    public speed: number = 0.1; // Slightly slower than PacMan?

    private maze: Maze;
    private targetX: number = 0;
    private targetY: number = 0;

    constructor(maze: Maze, startX: number, startY: number, color: number) {
        this.maze = maze;
        this.x = startX;
        this.y = startY;
        this.color = color;
    }

    update(targetX: number, targetY: number) {
        this.targetX = targetX;
        this.targetY = targetY;

        // Move
        // We don't use dx/dy from current direction to decide intersection,
        // we use position relative to tile center.

        // Check if at center of tile (intersection decision point)
        const centerThreshold = 0.1;
        const distToCenterX = Math.abs(this.x - Math.round(this.x));
        const distToCenterY = Math.abs(this.y - Math.round(this.y));
        const atIntersection = distToCenterX < centerThreshold && distToCenterY < centerThreshold;

        if (atIntersection) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);

            // Choose best direction
            this.direction = this.chooseBestDirection();
        }

        // Apply movement
        const moveX = this.getDirX(this.direction);
        const moveY = this.getDirY(this.direction);

        // Check wall ahead
        const checkX = Math.round(this.x + moveX * 0.51);
        const checkY = Math.round(this.y + moveY * 0.51);

        if (!this.maze.isWall(checkX, checkY)) {
            this.x += moveX * this.speed;
            this.y += moveY * this.speed;

            // Warp Tunnel
            if (this.x < -0.5) this.x = this.maze.cols - 0.5;
            if (this.x > this.maze.cols - 0.5) this.x = -0.5;
        } else {
            // Stuck? Just reverse?
            // this.direction = this.getOppositeDirection(this.direction);
        }
    }

    private chooseBestDirection(): Direction {
        const options = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        let bestDir: Direction = Direction.NONE;
        let minDist = Infinity;

        const opposite = this.getOppositeDirection(this.direction);

        for (const dir of options) {
            // Don't reverse immediately unless stuck
            if (dir === opposite && this.direction !== Direction.NONE) continue;

            const dx = this.getDirX(dir);
            const dy = this.getDirY(dir);

            // Is it a valid move?
            // Note: Ghosts usually can't turn UP at specific spots in original, but we ignore that.
            if (!this.maze.isWall(Math.round(this.x) + dx, Math.round(this.y) + dy)) {
                // Calculate distance to target from the NEXT cell
                const nextX = Math.round(this.x) + dx;
                const nextY = Math.round(this.y) + dy;

                const dist = (nextX - this.targetX) ** 2 + (nextY - this.targetY) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = dir as Direction;
                }
            }
        }

        // If stuck (dead end), reverse
        if (bestDir === Direction.NONE) {
            return opposite;
        }

        return bestDir;
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

    private getOppositeDirection(dir: Direction): Direction {
        if (dir === Direction.UP) return Direction.DOWN;
        if (dir === Direction.DOWN) return Direction.UP;
        if (dir === Direction.LEFT) return Direction.RIGHT;
        if (dir === Direction.RIGHT) return Direction.LEFT;
        return Direction.NONE;
    }
}
