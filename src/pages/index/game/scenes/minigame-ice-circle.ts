import {IGameScene} from "../i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/set-minigame-ice-circle-scene";
import {PlayerInfoMgIceCircle} from "../../../../beam-bots-shared/scene-interfaces/minigame-ice-circle-interfaces";
import {Point2D} from "../../../../beam-bots-shared/interfaces";
import {HelperService} from "../../../../shared/services/helper-service";

export class MinigameIceCircle extends IGameScene {
    public name: GameScenes = "MinigameIceCircle";
    private acceleration: number;
    private players: PlayerInfoMgIceCircle[];
    private localPlayerRadius: number;

    constructor(setMinigameIceCircleScene: SetMinigameIceCircleScene) {
        super();
        this.context.font = "50px monospace";
        this.acceleration = setMinigameIceCircleScene.acceleration;
        this.players = setMinigameIceCircleScene.players;
        this.localPlayerRadius = HelperService.convertGameLogicPixelsToLocalPixels(setMinigameIceCircleScene.playerHitBoxRadius);
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
        for (let i: number = 0; i < this.players.length; i++) {
            this.context.fillStyle = HelperService.convertColorToHexcode(this.players[i].player.color);
            this.context.beginPath();
            const localPath: Point2D = HelperService.convertGameLogicCoordsToLocalCoords(this.players[i].location);
            this.context.arc(localPath.x, localPath.y, this.localPlayerRadius, 0, 2 * Math.PI);
            this.context.fill();
        }
    }
}