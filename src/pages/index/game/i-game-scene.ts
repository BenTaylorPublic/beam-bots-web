import {GameScenes} from "../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {KeybindsController} from "./keybinds-controller";
import {ConstantsWeb} from "../../../shared/constants-web";
import {CanvasContextWrapper} from "./canvas-context-wrapper";

export abstract class IGameScene {
    protected overlay: HTMLDivElement;
    protected background: HTMLDivElement;
    protected context: CanvasContextWrapper;
    protected stopLoop: boolean;
    private lastLoopTime: number;
    public abstract name: GameScenes;

    constructor() {
        this.stopLoop = false;
        this.background = document.getElementById("background") as HTMLDivElement;
        this.overlay = document.getElementById("overlay") as HTMLDivElement;
        this.lastLoopTime = Date.now();
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.context = new CanvasContextWrapper(canvas, context);
    }

    public async startLoop(): Promise<void> {
        return new Promise((resolve) => {
            const interval: number = setInterval(() => {
                if (this.stopLoop) {
                    clearInterval(interval);
                    return;
                }
                this.context.clear();
                const newLoopTime: number = Date.now();
                this.loop(newLoopTime - this.lastLoopTime);
                this.lastLoopTime = newLoopTime;
            }, ConstantsWeb.TICK_DELAY);
        });
    }

    public destroy(): void {
        KeybindsController.removeAllCallbacks();
        this.background.style.backgroundImage = "";
        this.overlay.innerHTML = "";
        this.context.clear();
        this.context.textAlign = "start";
        this.stopLoop = true;
    }

    protected failedToHandleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        console.warn(`Unknown communication type in ${this.name}, '${communicationTypeAndObject.type}'`);
    }

    public abstract handleCommunication(type: CommunicationObjectTypesServerToClient, communicationTypeAndObject: CommunicationTypeAndObject): void;

    protected abstract loop(ms: number): void;
}