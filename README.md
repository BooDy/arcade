# Arcade Hub

A retro-style Arcade Hub built with web technologies (TypeScript, Vite, PixiJS). Currently features two playable games:

*   **Tetris**: A feature-complete Tetris clone with mobile support (swipe controls, haptics), ghost pieces, and pause functionality.
*   **Pac-Man**: A functional Pac-Man clone with maze navigation, ghosts (AI), collision detection, and scoring.

## Features

*   **Hub Interface**: Central menu to select and switch between games.
*   **Mobile First**: Optimized for touch interaction (swipe gestures, on-screen controls) and installs as a PWA (Progressive Web App).
*   **Modular Architecture**: Each game is isolated with a common `IGame` interface, easy to add more.

## Getting Started

### Prerequisites

*   Node.js (latest LTS recommended)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone git@github.com:BooDy/arcade.git
    cd arcade
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173` (or the URL shown in the terminal).

### Build for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

## Controls

### Tetris
*   **Arrow Left/Right**: Move
*   **Arrow Up**: Rotate
*   **Arrow Down**: Soft Drop
*   **Space**: Hard Drop
*   **P**: Pause
*   **Touch**: Swipe for move/drop, Tap to rotate.

### Pac-Man
*   **Arrow Keys**: Move
*   **Swipe**: Move (Mobile)

## License

MIT
