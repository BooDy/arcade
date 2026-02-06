
import { Direction } from './Constants';
import { Maze } from './Maze';

export class PacMan {
    public x: number = 0; // Grid coordinates (float for smooth movement?) 
    // Recommendation: Use Logic Coordinates (Grid) + Progress, 
    // or Pixel Coordinates. 
    // Let's use Pixel-ish Coordinates relative to Grid: x=1.5 means center of tile 1 and 2.
    public y: number = 0;

    // Visual position might be interpolated.
    // Let's stick to Grid coordinates as float.

    public direction: Direction = Direction.NONE;
    public nextDirection: Direction = Direction.NONE;
    public speed: number = 0.15; // tiles per frame approx?

    private maze: Maze;

    constructor(maze: Maze) {
        this.maze = maze;
        this.reset();
    }

    reset() {
        // Find a starting spot (usually 14, 23 in original, but let's just pick one from layout)
        // Middle bottomish
        this.x = 14;
        this.y = 23;
        this.direction = Direction.NONE;
        this.nextDirection = Direction.NONE;
    }

    setNextDirection(dir: Direction) {
        this.nextDirection = dir;
    }

    update() {
        // 1. Try to turn if aligned with grid center
        // Check if we are close to the center of a tile
        const centerThreshold = 0.1;
        const distToCenterX = Math.abs(this.x - Math.round(this.x));
        const distToCenterY = Math.abs(this.y - Math.round(this.y));
        const nearCenter = distToCenterX < centerThreshold && distToCenterY < centerThreshold;

        if (nearCenter) {
            // Snap to center to avoid drift
            // this.x = Math.round(this.x);
            // this.y = Math.round(this.y);
            // Actually only snap the non-moving axis, or both if turning?

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
            // Check wall ahead
            // If we are moving, we check collision
            // Simple logic: if we are at center (approx) and wall is ahead, stop.
            // If we are not at center, we just continue (we are between tiles).

            // Current integer tile
            // const cx = Math.floor(this.x + 0.5); // Round
            // const cy = Math.floor(this.y + 0.5);

            // Predict next position
            const nextX = this.x + dx * this.speed;
            const nextY = this.y + dy * this.speed;

            // Which tile does that center fall into?
            // Actually, better:
            // If moving Right (dx=1): Check (Ceil(x), y). Is it a wall?
            // If dist to wall < radius, stop.

            // Simplified: Center-to-Center logic
            // Check the tile we are entering
            // If dx > 0 (Right), check tile (Math.floor(x) + 1, y)
            // But only if we are past the center.

            const checkX = Math.round(this.x + dx * 0.51); // Look slightly ahead
            const checkY = Math.round(this.y + dy * 0.51);

            if (this.maze.isWall(checkX, checkY)) {
                // Wall hit.
                // Snap to current tile center
                // this.x = Math.round(this.x);
                // this.y = Math.round(this.y);
                // Stop?
                // Actually in PacMan you stop exactly at center if blocked.

                const dist = Math.sqrt((checkX - this.x) ** 2 + (checkY - this.y) ** 2);
                if (dist < 0.6) { // If too close to wall center
                    this.x = Math.round(this.x);
                    this.y = Math.round(this.y);
                    // Stop
                    // this.direction = Direction.NONE; // Optional: Keep trying to move or stop? 
                    // usually visually stops but keeps "intent" if user holds key? 
                    // For internal state, let's keep direction but not change x/y.
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
