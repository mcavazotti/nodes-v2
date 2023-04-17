export abstract class HTMLComponent {
    dirty: boolean = false;

    protected htmlElement: HTMLDivElement | null = null;

    abstract getHtml(): string;
    abstract setListeners(): void;
    
    destroy(): void {
        this.htmlElement?.remove();
        this.htmlElement = null;
    }

    generateTemplate(): HTMLTemplateElement {
        if (this.htmlElement) return this.htmlElement.parentElement as HTMLTemplateElement;

        const template = document.createElement('template');
        template.innerHTML = this.getHtml();
        this.htmlElement = template.content.firstElementChild as HTMLDivElement;
        return template;
    }

    getOuterElement(): HTMLElement | null {
        return this.htmlElement;
    }
}