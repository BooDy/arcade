
export const TILE_SIZE = 24;
export const MAZE_ROWS = 31;
export const MAZE_COLS = 28;

export const COLORS = {
    background: 0x000000,
    wall: 0x0000FF,       // Classic Blue
    wallInner: 0x0000AA,
    pacman: 0xFFFF00,
    ghostRed: 0xFF0000,
    ghostPink: 0xFFB8FF,
    ghostCyan: 0x00FFFF,
    ghostOrange: 0xFFB852,
    pellet: 0xFFB8AE,
    powerPellet: 0xFFB8AE,
};

export const Direction = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
} as const;

export type Direction = typeof Direction[keyof typeof Direction];
