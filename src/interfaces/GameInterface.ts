

export interface IGame {
    init(appContainer: HTMLElement): Promise<void>;
    start(): void;
    stop(): void;
    // Optional pause if we want the Hub to control it, 
    // but games might handle it internally.
    pause?(): void;
    resume?(): void;
}
