import {Sconstants} from "../../../beam-bots-shared/sconstants";
import {ConstantsWeb} from "../../../shared/constants-web";

export class CanvasContextWrapper {
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(ConstantsWeb.CANVAS_HEIGHT / Sconstants.GAME_LOGIC_HEIGHT, ConstantsWeb.CANVAS_HEIGHT / Sconstants.GAME_LOGIC_HEIGHT);
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

    public fillText(text: string, x: number, y: number, maxWidth?: number): void {
        this.context.fillText(text, x, y, maxWidth);
    }

    public beginPath(): void {
        this.context.beginPath();
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

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
        this.context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }

    public fillRect(x: number, y: number, width: number, height: number): void {
        this.context.fillRect(x, y, width, height);
    }
}