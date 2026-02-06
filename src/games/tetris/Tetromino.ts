
import { SHAPES, WALL_KICKS_JLSTZ, WALL_KICKS_I } from './Constants';
import type { TetrominoType } from './Constants';

export class Tetromino {
    public x: number;
    public y: number;
    public shape: number[][];
    public type: TetrominoType;
    public rotationIndex: number; // 0, 1, 2, 3

    constructor(type: TetrominoType) {
        this.type = type;
        this.shape = SHAPES[type].map(row => [...row]); // Deep copy
        this.rotationIndex = 0;

        // Spawn position: simplified centering
        // Usually spawn at x=3 or 4, y depends on hidden rows.
        // For 10 width, I spawns at 3, others at 3 or 4.
        // Let's standard 3 for O, 3 for others.
        this.x = 3;
        this.y = -2; // Start slightly above visible board to avoid instant collision if top is full? Or standard 0?
        // Standard Tetris: spawns mostly within rows 21/22 (which are hidden).
        // Our board is 20 rows visible. Let's spawn at -1 or -2.
        // Actually simplicity: spawn at y=0 if possible, or -size.
        this.y = -2;
    }

    // Pure rotation logic (math), returns new shape
    getRotatedShape(direction: 1 | -1): number[][] {
        const N = this.shape.length;
        const newShape = Array.from({ length: N }, () => Array(N).fill(0));

        if (direction === 1) { // Clockwise
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    newShape[x][N - 1 - y] = this.shape[y][x];
                }
            }
        } else { // Counter-Clockwise
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    newShape[N - 1 - x][y] = this.shape[y][x];
                }
            }
        }
        return newShape;
    }

    applyRotation(newShape: number[][], newRotationIndex: number) {
        this.shape = newShape;
        this.rotationIndex = newRotationIndex;
    }

    // Helper to get wall kick tests for current rotation
    getWallKicks(direction: 1 | -1): number[][] {
        // 0->1, 1->2, 2->3, 3->0 (CW)
        // 0->3, 3->2, 2->1, 1->0 (CCW)

        // To lookup in the big table (which is all transitions indexed 0-7), we map:
        // 0->1 is index 0
        // 1->0 is index 1
        // ...
        // Let's simplify:

        // SRS states: 0=0, 1=R, 2=2, 3=L

        let table = (this.type === 'I') ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
        if (this.type === 'O') return [[0, 0]]; // O doesn't kick

        const current = this.rotationIndex;
        let next = (current + direction + 4) % 4;

        // Map transition to index in our flattened table
        // 0->1 : 0
        // 1->0 : 1
        // 1->2 : 2
        // 2->1 : 3
        // 2->3 : 4
        // 3->2 : 5
        // 3->0 : 6
        // 0->3 : 7

        let index = 0;
        if (current === 0 && next === 1) index = 0;
        else if (current === 1 && next === 0) index = 1;
        else if (current === 1 && next === 2) index = 2;
        else if (current === 2 && next === 1) index = 3;
        else if (current === 2 && next === 3) index = 4;
        else if (current === 3 && next === 2) index = 5;
        else if (current === 3 && next === 0) index = 6;
        else if (current === 0 && next === 3) index = 7;

        return table[index];
    }
}
