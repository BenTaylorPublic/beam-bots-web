import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {KeybindsController} from "../keybinds-controller";
import {ConstantsWeb} from "../../../../shared/constants-web";
import {CanvasContextWrapper} from "../canvas-context-wrapper";
import {AudioController} from "../audio-controller";
import {Player} from "../../../../beam-bots-shared/interfaces";
import {HelperWebFunctions} from "../../../../shared/helper-web-functions";
import {Sconstants} from "../../../../beam-bots-shared/sconstants";
import {OverlayWrapper} from "../overlay-wrapper";

export abstract class IGameScene {
    public context: CanvasContextWrapper;
    protected overlay: OverlayWrapper;
    protected background: HTMLDivElement;
    protected stopLoop: boolean;
    private lastLoopTime: number;
    public abstract name: GameScenes;

    constructor() {
        this.stopLoop = false;
        this.background = document.getElementById("background") as HTMLDivElement;
        this.lastLoopTime = Date.now();
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        this.context = new CanvasContextWrapper(canvas);
        this.context.updateScaling();
        const overlay: HTMLDivElement = document.getElementById("overlay") as HTMLDivElement;
        this.overlay = new OverlayWrapper(overlay);
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
        this.overlay.clear();
        this.context.clear();
        this.context.textAlign = "start";
        this.stopLoop = true;
    }

    protected failedToHandleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        console.warn(`Unknown communication type in ${this.name}, '${communicationTypeAndObject.type}'`);
    }

    protected drawWinnerBanner(player: Player | null): void {
        let backgroundColor: string;
        let textColor: string;
        let text: string;
        if (player != null) {
            backgroundColor = HelperWebFunctions.convertColorToHexcode(player.color);
            textColor = "#000000";
            text = `${player.name} wins!`;
        } else {
            backgroundColor = "#333333";
            textColor = "#FFFFFF";
            text = "Draw!";
        }
        this.context.font = "170px monospace";
        this.context.fillStyle = backgroundColor;
        this.context.fillRect(0, 600, Sconstants.GAME_LOGIC_WIDTH, 230);
        this.context.fillStyle = textColor;
        this.context.textAlign = "center";
        this.context.fillText(text, Sconstants.GAME_LOGIC_WIDTH / 2, 770);
    }

    protected handleCountdown(startTime: number, countdownText: 4 | 3 | 2 | 1 | 0 | -1): 4 | 3 | 2 | 1 | 0 | -1 {
        const now: number = Date.now();
        const timeDifference: number = startTime - now;
        const timeToCompareTo: number = (countdownText * 1_000) - 1_000;
        if (timeDifference < timeToCompareTo) {
            countdownText--;
            if (countdownText === 3) {
                AudioController.playAudio("countdown");
            }
        }
        if (countdownText !== -1 && countdownText !== 4) {
            let color: string = "#000000";
            switch (countdownText) {
                case 3:
                    color = ConstantsWeb.RED1;
                    break;
                case 2:
                    color = ConstantsWeb.ORANGE1;
                    break;
                case 1:
                    color = ConstantsWeb.YELLOW1;
                    break;
                case 0:
                    color = ConstantsWeb.GREEN1;
                    break;
            }
            this.context.font = "170px monospace";
            this.context.fillStyle = color;
            this.context.fillRect(1080, 100, 400, 230);
            this.context.fillStyle = "#000000";
            this.context.textAlign = "center";
            const text: string = countdownText === 0 ? "GO!" : countdownText.toString();
            this.context.fillText(text, Sconstants.GAME_LOGIC_WIDTH / 2, 270);
        }

        return countdownText;
    }

    protected loadCountdownAudio(): void {
        AudioController.loadAudio([{
            name: "countdown",
            url: "ice_circle_countdown.wav"
        }]);
    }

    public abstract handleCommunication(type: CommunicationObjectTypesServerToClient, communicationTypeAndObject: CommunicationTypeAndObject): void;

    protected abstract loop(ms: number): void;
}