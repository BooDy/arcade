import { MAZE_COLS, MAZE_ROWS } from './Constants';

export class Maze {
    public grid: number[][]; // 0: Empty/Path, 1: Wall, 2: Pellet, 3: Power Pellet, 4: Ghost House

    constructor() {
        this.grid = [];
        this.generateMaze();
    }

    private generateMaze() {
        // Initialize full wall grid
        for (let r = 0; r < MAZE_ROWS; r++) {
            const row = [];
            for (let c = 0; c < MAZE_COLS; c++) {
                row.push(1);
            }
            this.grid.push(row);
        }

        // Define Ghost House area (Center)
        // Adjust for 31x28. Center is approx 14, 15.
        // Ghost House: Rows 13, 14, 15. Cols 10 to 17.
        const houseMinRow = 13;
        const houseMaxRow = 15;
        const houseMinCol = 10;
        const houseMaxCol = 17;

        // Clear Ghost House Interior
        for (let r = houseMinRow; r <= houseMaxRow; r++) {
            for (let c = houseMinCol; c <= houseMaxCol; c++) {
                this.grid[r][c] = 4; // Ghost House
            }
        }

        // Add Ghost House Entrance (Gate)
        this.grid[houseMinRow - 1][13] = 0;
        this.grid[houseMinRow - 1][14] = 0;

        // Reserve area around house to avoid carving weirdly into it?
        // Actually, just treating it as visited should be enough?
        // But we want walls AROUND it. 
        // We'll mark the walls around the house as "visited" for the generator or just protect them physically?
        // Better: Define a "forbidden" zone for the carving algorithm.
        // Forbidden: The house itself + its walls.
        // House Walls: 12, 16 (Rows), 9, 18 (Cols).


        // Carve Maze using Recursive Backtracker (DFS) with Symmetry
        const stack: { r: number, c: number }[] = [];
        const startR = 1;
        const startC = 1;

        this.setPath(startR, startC);
        stack.push({ r: startR, c: startC });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.r, current.c, houseMinRow - 1, houseMaxRow + 1, houseMinCol - 1, houseMaxCol + 1);

            if (neighbors.length > 0) {
                // Pick random neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Carve path (wall between)
                const wallR = (current.r + next.r) / 2;
                const wallC = (current.c + next.c) / 2;

                this.setPath(wallR, wallC);
                this.setPath(next.r, next.c);

                stack.push(next);
            } else {
                stack.pop();
            }
        }

        // Add Warp Tunnel
        const tunnelRow = 14;
        for (let c = 0; c < 6; c++) {
            this.grid[tunnelRow][c] = 0;
            this.grid[tunnelRow][MAZE_COLS - 1 - c] = 0;
        }

        // Create Loops (remove some random walls) to improve gameplay
        // Don't remove borders or house walls
        for (let i = 0; i < 40; i++) {
            let r = Math.floor(Math.random() * (MAZE_ROWS - 2)) + 1;
            let c = Math.floor(Math.random() * (MAZE_COLS / 2 - 2)) + 1; // Left half only, then mirror

            if (this.grid[r][c] === 1) {
                // Check if it separates two paths
                let hasPathAbove = this.grid[r - 1][c] !== 1;
                let hasPathBelow = this.grid[r + 1][c] !== 1;
                let hasPathLeft = this.grid[r][c - 1] !== 1;
                let hasPathRight = this.grid[r][c + 1] !== 1;

                if ((hasPathAbove && hasPathBelow && !hasPathLeft && !hasPathRight) ||
                    (hasPathLeft && hasPathRight && !hasPathAbove && !hasPathBelow)) {

                    // Don't break house walls
                    if (r >= houseMinRow - 1 && r <= houseMaxRow + 1 && c >= houseMinCol - 1 && c <= houseMaxCol + 1) continue;

                    this.setPath(r, c);
                }
            }
        }

        // Fill with pellets
        for (let r = 1; r < MAZE_ROWS - 1; r++) {
            for (let c = 1; c < MAZE_COLS - 1; c++) {
                if (this.grid[r][c] === 0) {
                    // Avoid tunnel entrance and house path
                    if (r === tunnelRow && (c < 6 || c > MAZE_COLS - 7)) continue;
                    if (r === houseMinRow - 1 && (c === 13 || c === 14)) continue; // Gate

                    this.grid[r][c] = 2; // Pellet
                }
            }
        }

        // Add Power Pellets in corners (approximate)
        this.safeSet(3, 3, 3);
        this.safeSet(3, MAZE_COLS - 4, 3);
        this.safeSet(MAZE_ROWS - 4, 3, 3);
        this.safeSet(MAZE_ROWS - 4, MAZE_COLS - 4, 3);
    }

    // Helper to set path mirrored
    private setPath(r: number, c: number) {
        this.grid[r][c] = 0;
        this.grid[r][MAZE_COLS - 1 - c] = 0;
    }

    private safeSet(r: number, c: number, val: number) {
        if (this.grid[r] && this.grid[r][c] !== undefined && this.grid[r][c] !== 1) {
            this.grid[r][c] = val;
        }
    }

    private getUnvisitedNeighbors(r: number, c: number, avoidRMin: number, avoidRMax: number, avoidCMin: number, avoidCMax: number) {
        const neighbors = [];
        // Step 2
        const dirs = [
            { dr: -2, dc: 0 },
            { dr: 2, dc: 0 },
            { dr: 0, dc: -2 },
            { dr: 0, dc: 2 }
        ];

        for (const d of dirs) {
            const nc = c + d.dc;
            const nr = r + d.dr;

            // Bounds check (keep 1 cell border)
            if (nr > 0 && nr < MAZE_ROWS - 1 && nc > 0 && nc < (MAZE_COLS / 2)) {
                // We only generate Left Half (col 0 to 13). 
                // MAZE_COLS = 28. Half is 14. 
                // We want to stop before the center line maybe? 
                // Or connect to center line?
                // Let's generate up to col 13.

                // Avoid Ghost House
                if (nr >= avoidRMin && nr <= avoidRMax && nc >= avoidCMin && nc <= avoidCMax) continue;

                if (this.grid[nr][nc] === 1) { // If wall (unvisited in DFS context largely)
                    neighbors.push({ r: nr, c: nc });
                }
            }
        }
        return neighbors;
    }

    isWall(x: number, y: number): boolean {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) {
            // Allow warp tunnel
            if (y === 14) return false;
            return true;
        }
        return this.grid[y][x] === 1;
    }

    isPellet(x: number, y: number): boolean {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) return false;
        return this.grid[y][x] === 2;
    }

    isPowerPellet(x: number, y: number): boolean {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) return false;
        return this.grid[y][x] === 3;
    }

    eatPellet(x: number, y: number): number {
        if (this.isPellet(x, y)) {
            this.grid[y][x] = 0;
            return 10;
        }
        if (this.isPowerPellet(x, y)) {
            this.grid[y][x] = 0;
            return 50;
        }
        return 0;
    }

    // Check if tile is ghost house (for ghost logic if needed)
    isGhostHouse(x: number, y: number): boolean {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[0].length) return false;
        return this.grid[y][x] === 4;
    }

    get rows() { return this.grid.length; }
    get cols() { return this.grid[0].length; }
}
