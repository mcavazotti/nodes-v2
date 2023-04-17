import { HTMLComponent } from "../../core/render/html-component";

export abstract class NodeParameter<T> extends HTMLComponent {
    dirty: boolean;
    uId!: string;
    constructor(public readonly label: string, protected onValueChange: (val: T) => void, public value: T | null = null, uId?: string) {
        super();
        this.dirty = false;
        if (uId)
            this.uId = uId;
    }

    setUid(uId: string) {
        this.uId = uId;
    }

    abstract getHtml(): string;
    abstract setListeners(): void;
}