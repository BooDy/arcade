
import type { IGame } from './interfaces/GameInterface';
import { TetrisGame } from './games/tetris/TetrisGame';
import { PacManGame } from './games/pacman/PacManGame';
import { Arkanoid } from './games/arkanoid/Arkanoid';

export class Hub {
    private appContainer: HTMLElement;
    private hubContainer: HTMLElement;
    private currentGame: IGame | null = null;

    constructor() {
        this.appContainer = document.getElementById('app')!;
        this.hubContainer = document.createElement('div');
        this.hubContainer.id = 'hub-overlay';
        document.body.appendChild(this.hubContainer);

        this.renderHub();
    }

    private renderHub() {
        this.hubContainer.innerHTML = `
            <h1 class="hub-title">ARCADE HUB</h1>
            
            <div class="game-grid">
                <div class="game-card" data-game="tetris">
                    <div class="game-card-icon">T</div>
                    <h3>TETRIS</h3>
                </div>

                <div class="game-card" data-game="pacman">
                    <div class="game-card-icon">C</div>
                    <h3>PAC-MAN</h3>
                </div>

                <div class="game-card" data-game="arkanoid">
                    <div class="game-card-icon">A</div>
                    <h3>ARKANOID</h3>
                </div>
            </div>
        `;

        const cards = this.hubContainer.querySelectorAll('.game-card');
        cards.forEach(card => {
            const el = card as HTMLElement;
            el.addEventListener('click', () => {
                const gameType = el.getAttribute('data-game');
                if (gameType) this.launchGame(gameType);
            });
        });
    }

    private async launchGame(type: string) {
        // Hide Hub
        this.hubContainer.style.display = 'none';

        // Clear App Container (just in case)
        this.appContainer.innerHTML = '';
        this.appContainer.style.display = 'flex'; // Ensure visible

        if (type === 'tetris') {
            this.currentGame = new TetrisGame();
        } else if (type === 'pacman') {
            this.currentGame = new PacManGame();
        } else if (type === 'arkanoid') {
            this.currentGame = new Arkanoid();
        }

        if (this.currentGame) {
            await this.currentGame.init(this.appContainer);
            this.currentGame.start();
            this.createBackButton();
        }
    }

    private createBackButton() {
        let backBtn = document.getElementById('hub-back-btn');

        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.id = 'hub-back-btn';
            backBtn.innerText = 'EXIT';
            // Styles are now in CSS
            backBtn.addEventListener('click', () => this.returnToHub());
            document.body.appendChild(backBtn);
        }
        backBtn.style.display = 'block';
    }

    private returnToHub() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }

        this.appContainer.innerHTML = ''; // Clear game canvas
        this.hubContainer.style.display = 'flex'; // Restore flex display

        const backBtn = document.getElementById('hub-back-btn');
        if (backBtn) backBtn.style.display = 'none';

        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.style.display = 'none';
    }
}
