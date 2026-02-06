
import { Game } from './Game';

export class InputManager {
    private game: Game;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private minSwipeDistance: number = 30; // pixels

    constructor(game: Game) {
        this.game = game;
        this.initListeners();
    }

    private initListeners() {
        window.addEventListener('keydown', this.handleKeyDown);

        const target = document.body;
        target.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        target.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        target.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);

        const target = document.body;
        target.removeEventListener('touchstart', this.handleTouchStart);
        target.removeEventListener('touchend', this.handleTouchEnd);
        target.removeEventListener('touchmove', this.handleTouchMove);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'ArrowLeft': this.game.moveLeft(); break;
            case 'ArrowRight': this.game.moveRight(); break;
            case 'ArrowUp': this.game.rotate(1); break; // CW
            case 'KeyZ': this.game.rotate(-1); break; // CCW
            case 'ArrowDown': this.game.gravity(); break; // Soft Drop
            case 'Space': this.game.hardDrop(); break;
            case 'KeyP': this.game.togglePause(); break;
        }
    };

    private handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    };

    private handleTouchEnd = (e: TouchEvent) => {
        if (e.changedTouches.length > 0) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            this.handleGesture(this.touchStartX, this.touchStartY, touchEndX, touchEndY);
        }
    };

    private handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
    };

    private handleGesture(sx: number, sy: number, ex: number, ey: number) {
        const dx = ex - sx;
        const dy = ey - sy;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < this.minSwipeDistance) {
            // Tap
            this.game.rotate(1);
            return;
        }

        if (absDx > absDy) {
            // Horizontal
            if (dx > 0) {
                this.game.moveRight();
            } else {
                this.game.moveLeft();
            }
        } else {
            // Vertical
            if (dy > 0) {
                // Down - Hard Drop
                this.game.hardDrop();
            }
        }
    }
}
