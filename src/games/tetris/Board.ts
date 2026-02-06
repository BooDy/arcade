
import { BOARD_HEIGHT, BOARD_WIDTH, COLORS } from './Constants';
import { Tetromino } from './Tetromino';

export class Board {
    public grid: number[][]; // 0 if empty, otherwise color hex

    constructor() {
        this.grid = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
    }

    isValidPosition(piece: Tetromino, offsetX = 0, offsetY = 0, customShape?: number[][]): boolean {
        const shape = customShape || piece.shape;
        const testX = piece.x + offsetX;
        const testY = piece.y + offsetY;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = testX + x;
                    const boardY = testY + y;

                    // Boundaries
                    if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                        return false;
                    }

                    // Collision with locked blocks
                    // Note: boardY < 0 is "above board", usually allowed for spawning/rotating, 
                    // but we shouldn't collide with anything there (it's empty virtual space)
                    if (boardY >= 0 && this.grid[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    lockPiece(piece: Tetromino) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                        this.grid[boardY][boardX] = COLORS[piece.type];
                    }
                }
            }
        }
    }

    clearLines(): number {
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check this row index again since we pulled down
            }
        }
        return linesCleared;
    }
}
