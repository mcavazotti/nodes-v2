export interface HTMLComponent {
    getHtml(): string;
    getOuterElement(): HTMLElement | null;
    setListeners(): void;
    destroy():void;
    dirty: boolean;
}