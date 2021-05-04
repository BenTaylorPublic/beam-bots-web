export class SpriteSheet {
    private _image: HTMLImageElement;
    private _frameWidth: number;
    private _frameHeight: number;

    constructor(imageElement: HTMLImageElement, rows: number, columns: number) {
        this._image = imageElement;
        this._frameWidth = imageElement.width / columns;
        this._frameHeight = imageElement.height / rows;
    }

    get image(): HTMLImageElement {
        return this._image;
    }

    get frameWidth(): number {
        return this._frameWidth;
    }

    get frameHeight(): number {
        return this._frameHeight;
    }

    public xForCanvas(spriteSheetSectionX: number): number {
        return spriteSheetSectionX * this._frameWidth;
    }

    public yForCanvas(spriteSheetSectionY: number): number {
        return spriteSheetSectionY * this._frameHeight;
    }

}