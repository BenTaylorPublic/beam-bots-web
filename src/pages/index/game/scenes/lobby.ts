import {IGameScene} from "../i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {PlayerState} from "../player-state";

export class Lobby extends IGameScene {
    public name: GameScenes = "Lobby";

    constructor() {
        super();
        this.context.font = "50px monospace";
        this.context.fillStyle = "white";
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
        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            this.context.fillText(`${PlayerState.allPlayers[i].id}: ${PlayerState.allPlayers[i].name}`, 0, (i + 1) * 50);
        }

    }

}