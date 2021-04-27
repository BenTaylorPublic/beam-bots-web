import {IGameScene} from "../i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/set-minigame-ice-circle-scene";
import {
    MgIceCircleAccelerationDirection,
    PlayerInfoMgIceCircle
} from "../../../../beam-bots-shared/scene-interfaces/minigame-ice-circle-interfaces";
import {Point2D} from "../../../../beam-bots-shared/interfaces";
import {PlayerState} from "../player-state";
import {MinigameIceCircleDirectionChange} from "../../../../beam-bots-shared/communication-objects/client-to-server/minigame-ice-circle/minigame-ice-circle-direction-change";
import {MinigameIceCircleUpdate} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/minigame-ice-circle-update";
import {HelperWebFunctions} from "../../../../shared/helper-web-functions";
import {HelperSharedFunctions} from "../../../../beam-bots-shared/helper-shared-functions";
import {KeybindsController} from "../keybinds-controller";

export class MinigameIceCircle extends IGameScene {
    public name: GameScenes = "MinigameIceCircle";
    private acceleration: number;
    private playersFromServer: PlayerInfoMgIceCircle[];
    private playersLocally: PlayerInfoMgIceCircle[];
    private lastUpdate: number;
    private localPlayerRadius: number;
    private circleCenter: Point2D;
    private circleRadius: number;
    private wStatus: KeyboardEventKeyState;
    private aStatus: KeyboardEventKeyState;
    private sStatus: KeyboardEventKeyState;
    private dStatus: KeyboardEventKeyState;

    constructor(setMinigameIceCircleScene: SetMinigameIceCircleScene) {
        super();
        this.wStatus = "UP";
        this.aStatus = "UP";
        this.sStatus = "UP";
        this.dStatus = "UP";
        this.lastUpdate = Date.now();
        this.context.font = "50px monospace";
        this.acceleration = setMinigameIceCircleScene.acceleration;
        this.playersFromServer = setMinigameIceCircleScene.players;
        this.playersLocally = [];
        for (let i: number = 0; i < this.playersFromServer.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(this.playersFromServer[i]));
        }
        this.circleCenter = HelperWebFunctions.convertGameLogicCoordsToLocalCoords(setMinigameIceCircleScene.circleCenter);
        this.circleRadius = HelperWebFunctions.convertGameLogicPixelsToLocalPixels(setMinigameIceCircleScene.circleRadius);
        this.localPlayerRadius = HelperWebFunctions.convertGameLogicPixelsToLocalPixels(setMinigameIceCircleScene.playerHitBoxRadius);
        this.background.style.backgroundImage = "url('/assets/ice_circle_bg.png')";
        KeybindsController.registerKeyCallback("w", this.wKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("a", this.aKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("s", this.sKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("d", this.dKeyEvent.bind(this));
    }

    public handleCommunication(
        type: CommunicationObjectTypesServerToClient,
        communicationTypeAndObject: CommunicationTypeAndObject): void {
        switch (type) {
            case "MinigameIceCircleUpdate":
                this.updateReceived(communicationTypeAndObject.object as MinigameIceCircleUpdate);
                break;
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    public wKeyEvent(state: KeyboardEventKeyState): void {
        this.wStatus = state;
        this.setDirection();
    }

    public aKeyEvent(state: KeyboardEventKeyState): void {
        this.aStatus = state;
        this.setDirection();
    }

    public sKeyEvent(state: KeyboardEventKeyState): void {
        this.sStatus = state;
        this.setDirection();
    }

    public dKeyEvent(state: KeyboardEventKeyState): void {
        this.dStatus = state;
        this.setDirection();
    }

    protected loop(ms: number): void {
        this.context.fillStyle = "transparent";
        this.context.beginPath();
        this.context.arc(this.circleCenter.x, this.circleCenter.y, this.circleRadius, 0, 2 * Math.PI);
        this.context.lineWidth = 2;
        this.context.strokeStyle = "#FF0000";
        this.context.stroke();
        const accelerationToAdd: number = this.acceleration / (1000 / ms);

        for (let i: number = 0; i < this.playersLocally.length; i++) {
            //Work out players velocity
            const playerInfo: PlayerInfoMgIceCircle = this.playersLocally[i];
            HelperSharedFunctions.mgIceCircleAddAcceleration(playerInfo, accelerationToAdd);
            HelperSharedFunctions.mgIceCircleCalculateNewPosition(playerInfo, ms);
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(playerInfo.player.color);
            this.context.beginPath();
            const localPath: Point2D = HelperWebFunctions.convertGameLogicCoordsToLocalCoords(playerInfo.location);
            this.context.arc(localPath.x, localPath.y, this.localPlayerRadius, 0, 2 * Math.PI);
            this.context.fill();
        }
    }

    private updateReceived(update: MinigameIceCircleUpdate): void {
        this.lastUpdate = update.time;
        this.playersFromServer = update.players;
        this.playersLocally = [];
        for (let i: number = 0; i < this.playersFromServer.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(this.playersFromServer[i]));
        }
    }

    private clonePlayerInfo(playerInfo: PlayerInfoMgIceCircle): PlayerInfoMgIceCircle {
        const result: PlayerInfoMgIceCircle = {
            accelerationDirection: playerInfo.accelerationDirection,
            location: HelperSharedFunctions.clonePoint2D(playerInfo.location),
            player: playerInfo.player,
            status: playerInfo.status,
            velocity: HelperSharedFunctions.clonePoint2D(playerInfo.velocity)
        };
        return result;
    }

    private setDirection(): void {
        let result: MgIceCircleAccelerationDirection = "NOWHERE";
        if (this.wStatus === "DOWN") {
            if (this.aStatus === "DOWN") {
                result = "TOP LEFT";
            } else if (this.dStatus === "DOWN") {
                result = "TOP RIGHT";
            } else {
                result = "UP";
            }
        } else if (this.sStatus === "DOWN") {
            if (this.aStatus === "DOWN") {
                result = "BOTTOM LEFT";
            } else if (this.dStatus === "DOWN") {
                result = "BOTTOM RIGHT";
            } else {
                result = "DOWN";
            }
        } else {
            if (this.aStatus === "DOWN") {
                result = "LEFT";
            } else if (this.dStatus === "DOWN") {
                result = "RIGHT";
            }
        }

        const direction: MinigameIceCircleDirectionChange = {
            newDirection: result
        };
        PlayerState.sendCommunication("MinigameIceCircleDirectionChange", direction);
    }
}