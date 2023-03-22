export interface Selectable {
    selected: boolean;
    setSelection(selectState: boolean): void;
}