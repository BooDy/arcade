
import { Application, Container, Graphics } from 'pixi.js';
import { COLORS, TILE_SIZE } from './Constants';
import { Maze } from './Maze';
import { PacMan } from './PacMan';

export class PacManRenderer {
    public app: Application;
    public gameContainer: Container;
    public mazeGraphics: Graphics;
    public entityGraphics: Graphics;

    constructor() {
        this.app = new Application();
        this.gameContainer = new Container();
        this.mazeGraphics = new Graphics();
        this.entityGraphics = new Graphics();
    }

    async init(container: HTMLElement) {
        await this.app.init({
            background: COLORS.background,
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });
        container.appendChild(this.app.canvas);

        this.app.stage.addChild(this.gameContainer);
        this.gameContainer.addChild(this.mazeGraphics);
        this.gameContainer.addChild(this.entityGraphics);

        window.addEventListener('resize', () => this.handleResize());
    }

    drawMaze(maze: Maze) {
        const g = this.mazeGraphics;
        g.clear();

        for (let y = 0; y < maze.rows; y++) {
            for (let x = 0; x < maze.cols; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                if (maze.isWall(x, y)) {
                    // Wall
                    g.rect(px, py, TILE_SIZE, TILE_SIZE);
                    g.stroke({ width: 2, color: COLORS.wall });
                    // g.fill(COLORS.wallInner); // Maybe just stroke for neon look?
                    // Inner glow
                    g.rect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                    g.stroke({ width: 1, color: COLORS.wallInner, alpha: 0.5 });
                } else if (maze.isPellet(x, y)) {
                    // Pellet
                    g.circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 3);
                    g.fill(COLORS.pellet);
                } else if (maze.isPowerPellet(x, y)) {
                    // Power Pellet
                    g.circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 8);
                    g.fill(COLORS.powerPellet);
                }
            }
        }
    }

    render(pacman: PacMan) {
        const g = this.entityGraphics;
        g.clear();

        // Draw Pacman
        const px = pacman.x * TILE_SIZE + TILE_SIZE / 2;
        const py = pacman.y * TILE_SIZE + TILE_SIZE / 2;

        g.circle(px, py, TILE_SIZE / 2 - 2);
        g.fill(COLORS.pacman);

        // Simple mouth
        // Determine rotation based on direction
        // (Just a simple dot for eye maybe?)
    }

    renderGhosts(ghosts: any[]) {
        const g = this.entityGraphics;
        // Don't clear here, assume render(pacman) cleared it or we manage it.
        // Actually, render(pacman) clears entityGraphics. So we should call renderEntities(pacman, ghosts) maybe?
        // Or just let both draw to same layer without clearing in between if called sequentially.

        for (const ghost of ghosts) {
            const px = ghost.x * TILE_SIZE;
            const py = ghost.y * TILE_SIZE;

            // Body
            g.rect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            g.fill({ color: ghost.color });

            // Eyes
            g.circle(px + 8, py + 10, 2);
            g.fill(0xFFFFFF);
            g.circle(px + TILE_SIZE - 8, py + 10, 2);
            g.fill(0xFFFFFF);
        }
    }

    handleResize() {
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        // Maze aspect ratio
        // We need maze dimensions from somewhere if we haven't stored them.
        // But render is called on frame.
        // Let's assume standard maze size approx 28x31 * TILE_SIZE
        const targetWidth = 28 * TILE_SIZE;
        const targetHeight = 31 * TILE_SIZE; // Approx

        const scale = Math.min(
            (screenWidth * 0.95) / targetWidth,
            (screenHeight * 0.95) / targetHeight
        );

        this.gameContainer.scale.set(scale);
        this.gameContainer.x = (screenWidth - targetWidth * scale) / 2;
        this.gameContainer.y = (screenHeight - targetHeight * scale) / 2;
    }

    destroy() {
        this.app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
    }
}
