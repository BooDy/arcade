
import { Tetromino } from './Tetromino';
import type { TetrominoType } from './Constants';

export class TetrominoFactory {
    private bag: TetrominoType[] = [];

    constructor() {
        this.fillBag();
    }

    private fillBag() {
        const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        // Shuffle
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        this.bag = types;
    }

    public next(): Tetromino {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        const type = this.bag.pop()!;
        return new Tetromino(type);
    }
}
