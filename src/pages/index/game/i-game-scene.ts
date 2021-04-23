import {GameScenes} from "../../../beam-bots-shared/types";
import {CommunicationTypeAndObject} from "../../../beam-bots-shared/communication-objects/communication-object";
import {ErrorService} from "../../../shared/services/error-service";
import {Constants} from "../../../shared/constants";

export abstract class IGameScene {
    protected overlay: HTMLDivElement;
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected stopLoop: boolean;
    public abstract name: GameScenes;

    constructor() {
        this.stopLoop = false;
        this.overlay = document.getElementById("overlay") as HTMLDivElement;
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.canvas.height = Constants.CANVAS_HEIGHT;
        this.canvas.style.height = `${this.canvas.height}px`;
        this.canvas.width = Constants.CANVAS_WIDTH;
        this.canvas.style.width = `${this.canvas.width}px`;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public async startLoop(): Promise<void> {
        return new Promise((resolve) => {
            const interval: number = setInterval(() => {
                if (this.stopLoop) {
                    clearInterval(interval);
                    return;
                }
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.loop();
            }, 50);
        });
    }

    public destroy(): void {
        this.overlay.innerHTML = "";
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stopLoop = true;
    }

    protected failedToHandleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        throw ErrorService.error(1012, `Unknown communication type in ${this.name}, '${communicationTypeAndObject.type}'`);
    }

    public abstract handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void;

    protected abstract loop(): void;
}