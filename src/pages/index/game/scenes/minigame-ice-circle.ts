import {IGameScene} from "../i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/set-minigame-ice-circle-scene";

export class MinigameIceCircle extends IGameScene {
    public name: GameScenes = "MinigameIceCircle";
    private acceleration: number;
    private hitboxRadius: number;

    constructor(setMinigameIceCircleScene: SetMinigameIceCircleScene) {
        super();
        this.context.font = "50px monospace";
        this.acceleration = setMinigameIceCircleScene.acceleration;
        this.hitboxRadius = setMinigameIceCircleScene.playerHitBoxRadius;
        this.background.style.backgroundImage = "url('/assets/ice_circle_bg.png')";
    }

    public handleCommunication(
        type: CommunicationObjectTypesServerToClient,
        communicationTypeAndObject: CommunicationTypeAndObject): void {
        switch (type) {
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    protected loop(): void {
        this.context.fillStyle = "black";
        this.context.fillText("Minigame Ice Circle Scene", 50, 50);
    }
}