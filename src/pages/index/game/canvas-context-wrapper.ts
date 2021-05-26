import {Sconstants} from "../../../beam-bots-shared/sconstants";
import {SpriteSheet} from "./sprite-sheet";
import {Point2D} from "../../../beam-bots-shared/interfaces";
import {AnimatedSpriteSheet} from "./animated-sprite-sheet";

export class CanvasContextWrapper {
    public static width: number;
    public static height: number;
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.context.imageSmoothingEnabled = false;
        this.updateScaling();
    }

    public static initialize(width: number, height: number): void {
        CanvasContextWrapper.width = width;
        CanvasContextWrapper.height = height;
    }

    public updateScaling(): void {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.canvas.height / Sconstants.GAME_LOGIC_HEIGHT, this.canvas.height / Sconstants.GAME_LOGIC_HEIGHT);
        CanvasContextWrapper.width = this.canvas.width;
        CanvasContextWrapper.height = this.canvas.height;
    }

    public clear(): void {
        this.context.clearRect(0, 0, Sconstants.GAME_LOGIC_WIDTH, Sconstants.GAME_LOGIC_HEIGHT);
    }

    public set font(value: string) {
        this.context.font = value;
    }

    public set textAlign(value: CanvasTextAlign) {
        this.context.textAlign = value;
    }

    public set fillStyle(value: string) {
        this.context.fillStyle = value;
    }

    public set lineWidth(value: number) {
        this.context.lineWidth = value;
    }

    public set strokeStyle(value: string) {
        this.context.strokeStyle = value;
    }

    public drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number): void {
        this.context.drawImage(image, x, y, width, height);
    }

    public drawImageFromSpriteSheet(spriteSheet: SpriteSheet, spriteSheetSection: Point2D, screenPoint: Point2D, scale: number): void {
        this.context.drawImage(
            spriteSheet.image,
            spriteSheet.xForCanvas(spriteSheetSection.x),
            spriteSheet.yForCanvas(spriteSheetSection.y),
            spriteSheet.frameWidth,
            spriteSheet.frameHeight,
            screenPoint.x,
            screenPoint.y,
            scale * spriteSheet.frameWidth,
            scale * spriteSheet.frameHeight);
    }

    //ass lol
    public drawImageFromAnimatedSpriteSheet(ass: AnimatedSpriteSheet, screenPoint: Point2D, scale: number): void {
        this.context.drawImage(
            ass.image,
            ass.xForCanvas,
            ass.yForCanvas,
            ass.frameWidth,
            ass.frameHeight,
            screenPoint.x,
            screenPoint.y,
            scale * ass.frameWidth,
            scale * ass.frameHeight);
    }

    public fillText(text: string, x: number, y: number, maxWidth?: number): void {
        this.context.fillText(text, x, y, maxWidth);
    }

    public beginPath(): void {
        this.context.beginPath();
    }

    public moveTo(x: number, y: number): void {
        this.context.moveTo(x, y);
    }

    public moveToPoint(point: Point2D): void {
        this.context.moveTo(point.x, point.y);
    }

    public lineTo(x: number, y: number): void {
        this.context.lineTo(x, y);
    }

    public lineToPoint(point: Point2D): void {
        this.context.lineTo(point.x, point.y);
    }

    public stroke(): void {
        this.context.stroke();
    }

    public fill(): void {
        this.context.fill();
    }

    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
        this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    }

    public circle(point: Point2D, radius: number): void {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        this.context.fill();
    }

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
        this.context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }

    public fillRect(x: number, y: number, width: number, height: number): void {
        this.context.fillRect(x, y, width, height);
    }

    public fillRectWithPoint(point: Point2D, width: number, height: number): void {
        this.context.fillRect(point.x, point.y, width, height);
    }

    public strokeRect(x: number, y: number, width: number, height: number): void {
        this.context.strokeRect(x, y, width, height);
    }
}