import {IGameScene} from "../i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/set-minigame-ice-circle-scene";

export class MinigameIceCircle extends IGameScene {
    public name: GameScenes = "MinigameIceCircle";

    constructor(setMinigameIceCircleScene: SetMinigameIceCircleScene) {
        super();
        this.context.font = "50px monospace";
    }

    public handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        const type: CommunicationObjectTypesServerToClient = communicationTypeAndObject.type as CommunicationObjectTypesServerToClient;
        switch (type) {
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    protected loop(): void {
        this.context.fillStyle = "white";
        this.context.fillText("Minigame Ice Circle Scene", 50, 400);
    }
}