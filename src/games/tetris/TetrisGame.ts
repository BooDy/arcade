
import type { IGame } from '../../interfaces/GameInterface';
import { Game } from './Game';
import { Renderer } from './Renderer';
import { InputManager } from './InputManager';

export class TetrisGame implements IGame {
    private game: Game | null = null;
    private renderer: Renderer | null = null;
    private inputManager: InputManager | null = null;
    private container: HTMLElement | null = null;
    private pauseBtn: HTMLElement | null = null;

    async init(appContainer: HTMLElement): Promise<void> {
        this.container = appContainer;
        this.renderer = new Renderer();
        await this.renderer.init(this.container);

        this.game = new Game(this.renderer);
        this.inputManager = new InputManager(this.game);

        // Setup Pause Button (if it exists in DOM, or create it?)
        // The Hub/Main might handle the button visibility, 
        // but the Logic needs to be wired.
        // Let's assume the button is global for now or we find it.
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.style.display = 'flex'; // Show it
            // Clone to remove old listeners
            const newBtn = pauseBtn.cloneNode(true) as HTMLElement;
            pauseBtn.parentNode?.replaceChild(newBtn, pauseBtn);

            this.pauseBtn = newBtn;
            this.pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    }

    start(): void {
        this.game?.start();
    }

    stop(): void {
        this.game?.stop();
        this.renderer?.destroy();
        this.inputManager?.destroy();
        this.game = null;
        this.renderer = null;
        this.inputManager = null;

        // Hide pause button
        if (this.pauseBtn) {
            this.pauseBtn.style.display = 'none';
        }
    }

    togglePause() {
        if (this.game) {
            this.game.togglePause();
            if (this.pauseBtn) {
                this.pauseBtn.innerText = this.game.paused ? '▶' : '||';
            }
        }
    }
}
