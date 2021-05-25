export class OverlayWrapper {
    private div: HTMLDivElement;

    constructor(div: HTMLDivElement) {
        this.div = div;
    }

    public clear(): void {
        this.div.innerHTML = "";
    }

    public appendChild(element: HTMLElement): void {
        this.div.appendChild(element);
    }
}