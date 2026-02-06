
import { Ticker } from 'pixi.js';
import { Board } from './Board';
import { Renderer } from './Renderer';
import { Tetromino } from './Tetromino';
import { TetrominoFactory } from './TetrominoFactory';
import { HAPTIC_PATTERNS } from './Constants';

export class Game {
    private board: Board;
    private tetrominoFactory: TetrominoFactory;
    public activePiece: Tetromino | null = null;
    private renderer: Renderer;

    private dropTimer: number = 0;
    private dropInterval: number = 1000; // ms per drop

    private gameOver: boolean = false;
    public paused: boolean = false;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.board = new Board();
        this.tetrominoFactory = new TetrominoFactory();
        this.spawnPiece();
    }

    start() {
        Ticker.shared.add(this.update, this);
    }

    stop() {
        Ticker.shared.remove(this.update, this);
    }

    togglePause() {
        if (this.gameOver) return;
        this.paused = !this.paused;
    }

    update(ticker: Ticker) {
        if (this.gameOver) return;
        // Render every frame to show pause overlay if needed
        this.renderer.render(this.board, this.activePiece, this.paused);

        if (this.paused) return;

        const deltaMS = ticker.deltaMS;
        this.dropTimer += deltaMS;

        if (this.dropTimer > this.dropInterval) {
            this.dropTimer = 0;
            this.gravity();
        }
    }

    spawnPiece() {
        const piece = this.tetrominoFactory.next();
        if (this.board.isValidPosition(piece)) {
            this.activePiece = piece;
        } else {
            this.gameOver = true;
            console.log("Game Over");
            // TODO: Handle game over properly
        }
    }

    gravity() {
        if (!this.activePiece || this.paused) return;

        if (this.board.isValidPosition(this.activePiece, 0, 1)) {
            this.activePiece.y += 1;
        } else {
            this.lockPiece();
        }
    }

    lockPiece() {
        if (!this.activePiece) return;
        this.board.lockPiece(this.activePiece);
        const lines = this.board.clearLines();
        if (lines > 0) {
            // TODO: Score, effects
            console.log(`Cleared ${lines} lines`);
            if (navigator.vibrate) navigator.vibrate(HAPTIC_PATTERNS.match);
        } else {
            if (navigator.vibrate) navigator.vibrate(HAPTIC_PATTERNS.drop);
        }
        this.spawnPiece();
    }

    // Inputs
    moveLeft() {
        if (this.gameOver || this.paused || !this.activePiece) return;
        if (this.board.isValidPosition(this.activePiece, -1, 0)) {
            this.activePiece.x -= 1;
        }
    }

    moveRight() {
        if (this.gameOver || this.paused || !this.activePiece) return;
        if (this.board.isValidPosition(this.activePiece, 1, 0)) {
            this.activePiece.x += 1;
        }
    }

    rotate(direction: 1 | -1) {
        if (this.gameOver || this.paused || !this.activePiece) return;

        const originalRotation = this.activePiece.rotationIndex;
        const nextRotationShape = this.activePiece.getRotatedShape(direction);
        const kicks = this.activePiece.getWallKicks(direction);

        // Try basic rotation first (offset 0,0) implied by kicks[0] usually being 0,0

        for (const [offsetX, offsetY] of kicks) {
            // SRS kick data Y is up-positive (standard math) or down-positive (screen)?
            // SRS standard usually: +y is UP. Our board: +y is DOWN.
            // So we might need to negate Y from standard SRS tables.
            // Let's assume the tables provided in Constants.ts are standard SRS.
            // Standard SRS: +y is Up.
            // We need to invert Y for our board coordinates.

            const kickX = offsetX;
            const kickY = -offsetY; // Invert Y

            if (this.board.isValidPosition(this.activePiece, kickX, kickY, nextRotationShape)) {
                // Apply rotation and offset
                this.activePiece.x += kickX;
                this.activePiece.y += kickY;
                this.activePiece.applyRotation(nextRotationShape, (originalRotation + direction + 4) % 4);
                return;
            }
        }
    }

    hardDrop() {
        if (this.gameOver || this.paused || !this.activePiece) return;
        while (this.board.isValidPosition(this.activePiece, 0, 1)) {
            this.activePiece.y += 1;
        }
        this.lockPiece();
        // Reset drop timer to avoid double drop?
        this.dropTimer = 0;
        if (navigator.vibrate) navigator.vibrate(HAPTIC_PATTERNS.hardDrop);
    }
}
