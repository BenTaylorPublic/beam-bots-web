import {GameScenes} from "../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {ErrorService} from "../../../shared/services/error-service";

export abstract class IGameScene {
    protected overlay: HTMLDivElement;
    protected background: HTMLDivElement;
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected stopLoop: boolean;
    public abstract name: GameScenes;

    constructor() {
        this.stopLoop = false;
        this.background = document.getElementById("background") as HTMLDivElement;
        this.overlay = document.getElementById("overlay") as HTMLDivElement;
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
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

    public abstract handleCommunication(type: CommunicationObjectTypesServerToClient, communicationTypeAndObject: CommunicationTypeAndObject): void;

    protected abstract loop(): void;
}