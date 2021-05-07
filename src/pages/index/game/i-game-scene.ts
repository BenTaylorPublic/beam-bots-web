import {GameScenes} from "../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {KeybindsController} from "./keybinds-controller";
import {ConstantsWeb} from "../../../shared/constants-web";
import {CanvasContextWrapper} from "./canvas-context-wrapper";
import {AudioController} from "./audio-controller";

export abstract class IGameScene {
    public context: CanvasContextWrapper;
    protected overlay: HTMLDivElement;
    protected background: HTMLDivElement;
    protected stopLoop: boolean;
    private lastLoopTime: number;
    public abstract name: GameScenes;

    constructor() {
        this.stopLoop = false;
        this.background = document.getElementById("background") as HTMLDivElement;
        this.overlay = document.getElementById("overlay") as HTMLDivElement;
        this.lastLoopTime = Date.now();
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        this.context = new CanvasContextWrapper(canvas);
        this.context.updateScaling();
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
        AudioController.removeAllAudio();
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