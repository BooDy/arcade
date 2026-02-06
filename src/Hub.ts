
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
            <div style="
                position: absolute; top: 0; left: 0; width: 100vw; min-height: 100vh;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                color: white; font-family: 'Inter', sans-serif; z-index: 2000;
                overflow-y: auto; padding: 20px 0;
            " id="hub-menu">
                <h1 style="font-size: 3rem; margin-bottom: 2rem; text-shadow: 0 0 10px #00d4ff;">ARCADE HUB</h1>
                
                <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center;">
                    <div class="game-card" data-game="tetris" style="
                        width: 200px; height: 300px; background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 15px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        cursor: pointer; transition: all 0.3s ease;
                    ">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">T</div>
                        <h3>TETRIS</h3>
                    </div>

                    <div class="game-card" data-game="pacman" style="
                        width: 200px; height: 300px; background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 15px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        cursor: pointer; transition: all 0.3s ease;
                    ">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">C</div>
                        <h3>PAC-MAN</h3>
                    </div>

                    <div class="game-card" data-game="arkanoid" style="
                        width: 200px; height: 300px; background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 15px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        cursor: pointer; transition: all 0.3s ease;
                    ">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">A</div>
                        <h3>ARKANOID</h3>
                    </div>
                </div>
            </div>
        `;

        // Add hover effects via JS since inline styles are limited for hover
        // Actually simpler to just add listeners
        const cards = this.hubContainer.querySelectorAll('.game-card');
        cards.forEach(card => {
            const el = card as HTMLElement;
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateY(-10px)';
                el.style.background = 'rgba(255,255,255,0.1)';
                el.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translateY(0)';
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.boxShadow = 'none';
            });
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
            backBtn.style.cssText = `
                position: absolute; top: 20px; left: 20px;
                padding: 10px 20px; background: rgba(255,0,0,0.2); 
                border: 1px solid rgba(255,0,0,0.5); color: white;
                border-radius: 5px; cursor: pointer; z-index: 2000;
                font-weight: bold;
            `;
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
        this.hubContainer.style.display = 'block';

        const backBtn = document.getElementById('hub-back-btn');
        if (backBtn) backBtn.style.display = 'none';

        // Also ensure Pause button from Tetris is hidden? 
        // TetrisGame.stop() handles hiding its specific buttons, hopefully.
        // But if we had global buttons, we hide them here.
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.style.display = 'none';
    }
}
