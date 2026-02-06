
import { Application, Container, Graphics } from 'pixi.js';
import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, COLORS } from './Constants';
import type { Board } from './Board';
import type { Tetromino } from './Tetromino';

export class Renderer {
    public app: Application;
    public gameContainer: Container;
    public gridGraphics: Graphics;

    constructor() {
        this.app = new Application();
        this.gameContainer = new Container();
        this.gridGraphics = new Graphics();
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
        this.gameContainer.addChild(this.gridGraphics);

        // Initial draw
        // this.drawGrid(); // Removed, Game loop handles rendering
        this.handleResize();

        // Listen for resize
        window.addEventListener('resize', () => this.handleResize());
    }


    // New render method called every frame (or on change)
    render(board: Board, activePiece: Tetromino | null, paused: boolean = false) {
        // simple clear and redraw
        // Optimization: Use a container for static board, only update active piece?
        // For now, easy clear/redraw.

        const g = this.gridGraphics;
        g.clear();

        // 1. Draw Grid Background
        g.rect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        g.fill(0x000000); // Black background

        // Draw grid lines
        for (let x = 1; x < BOARD_WIDTH; x++) {
            g.moveTo(x * BLOCK_SIZE, 0);
            g.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            g.stroke({ width: 1, color: COLORS.grid, alpha: 0.3 });
        }

        for (let y = 1; y < BOARD_HEIGHT; y++) {
            g.moveTo(0, y * BLOCK_SIZE);
            g.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            g.stroke({ width: 1, color: COLORS.grid, alpha: 0.3 });
        }

        // 2. Draw Locked Blocks
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const color = board.grid[y][x];
                if (color !== 0) {
                    this.drawBlock(g, x, y, color);
                }
            }
        }

        // 3. Draw Active Piece
        if (activePiece && !paused) {
            this.drawGhostPiece(g, board, activePiece);

            for (let y = 0; y < activePiece.shape.length; y++) {
                for (let x = 0; x < activePiece.shape[y].length; x++) {
                    if (activePiece.shape[y][x]) {
                        this.drawBlock(g, activePiece.x + x, activePiece.y + y, COLORS[activePiece.type]);
                    }
                }
            }
        }

        // Borders
        g.rect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        g.stroke({ width: 2, color: COLORS.grid });

        if (paused) {
            this.drawPauseOverlay(g);
        }
    }

    drawBlock(g: Graphics, x: number, y: number, color: number, alpha: number = 1.0) {
        const size = BLOCK_SIZE;
        const px = x * size;
        const py = y * size;

        // "Neon/Glass" Style
        // 1. Fill with slight transparency
        g.rect(px + 1, py + 1, size - 2, size - 2);
        g.fill({ color: color, alpha: 0.8 * alpha });

        // 2. Inner highlight (glassy reflection)
        g.rect(px + 4, py + 4, size - 8, size - 8);
        g.fill({ color: 0xFFFFFF, alpha: 0.2 * alpha });

        // 3. Border/Glow
        g.rect(px + 1, py + 1, size - 2, size - 2);
        g.stroke({ width: 2, color: color, alpha: 1.0 * alpha });
    }

    drawGhostPiece(g: Graphics, board: Board, piece: Tetromino) {
        // Find hard drop position
        let ghostY = piece.y;
        while (true) {
            // Temporarily move down
            // We can't use piece logic directly if we want to be safe,
            // but logically we can check isValidPosition with offsets.
            // Since we passed 'board' and 'piece' as strict objects to render,
            // we should probably use a helper or duplicate logic.
            // BUT: 'board' instance has isValidPosition.
            // Let's assume board is the Board instance.

            if (board.isValidPosition(piece, 0, ghostY - piece.y + 1)) {
                ghostY++;
            } else {
                break;
            }
        }

        // Draw ghost
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawBlock(g, piece.x + x, ghostY + y, COLORS.ghost, 0.3);
                }
            }
        }
    }

    drawPauseOverlay(g: Graphics) {
        // Semi-transparent overlay
        g.rect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        g.fill({ color: 0x000000, alpha: 0.7 });

        // Text rendering in Pixi requires Text object which needs to be added to container.
        // Graphics cannot draw text directly.
        // For simplicity in this step, we'll just draw a Pause Symbol using graphics.

        const cx = (BOARD_WIDTH * BLOCK_SIZE) / 2;
        const cy = (BOARD_HEIGHT * BLOCK_SIZE) / 2;

        g.rect(cx - 20, cy - 30, 15, 60);
        g.fill(0xFFFFFF);

        g.rect(cx + 5, cy - 30, 15, 60);
        g.fill(0xFFFFFF);
    }

    handleResize() {
        // Center the game container
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        const boardWidth = BOARD_WIDTH * BLOCK_SIZE;
        const boardHeight = BOARD_HEIGHT * BLOCK_SIZE;

        // Scale to fit if necessary (mobile first)


        // Actually for pixel art / retro feel, maybe integer scaling? But request said "fill mobile viewport".
        // Let's just scale deeply.

        // Better responsiveness:
        // We want the board to be as large as possible but fit in screen with some padding.
        const targetScale = Math.min(
            (screenWidth * 0.9) / boardWidth,
            (screenHeight * 0.9) / boardHeight
        );

        this.gameContainer.scale.set(targetScale);

        this.gameContainer.x = (screenWidth - boardWidth * targetScale) / 2;
        this.gameContainer.y = (screenHeight - boardHeight * targetScale) / 2;
    }

    destroy() {
        window.removeEventListener('resize', () => this.handleResize());
        this.app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
    }
}
