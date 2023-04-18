export abstract class HTMLComponent {
    dirty: boolean = false;

    protected htmlElement: HTMLElement | null = null;

    abstract getHtml(): string;
    abstract setListeners(): void;
    abstract htmlElementGetter(): HTMLElement;
    
    destroy(): void {
        this.htmlElement?.remove();
        this.htmlElement = null;
    }


    setHTMLElement() {
        this.htmlElement = this.htmlElementGetter();
    }

    getOuterElement(): HTMLElement | null {
        return this.htmlElement;
    }
}