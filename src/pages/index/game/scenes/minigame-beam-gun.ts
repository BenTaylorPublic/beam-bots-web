import {IGameScene} from "./i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {Player, Point2D, Rectangle} from "../../../../beam-bots-shared/interfaces";
import {HelperSharedFunctions} from "../../../../beam-bots-shared/helper-shared-functions";
import {KeybindsController} from "../keybinds-controller";
import {Sconstants} from "../../../../beam-bots-shared/sconstants";
import {AudioController} from "../audio-controller";
import {KeyboardEventKeyState} from "../../../../shared/types";
import {
    MgBeamGunDirection,
    MgBeamGunGameState,
    MgBeamGunPlayerInfo
} from "../../../../beam-bots-shared/scene-interfaces/minigame-beam-gun-interfaces";
import {SetMinigameBeamGunScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/set-minigame-beam-gun-scene";
import {HelperWebFunctions} from "../../../../shared/helper-web-functions";
import {PlayerState} from "../player-state";
import {MinigameBeamGunDirectionChange} from "../../../../beam-bots-shared/communication-objects/client-to-server/minigame-beam-gun/minigame-beam-gun-direction-change";
import {MinigameBeamGunUpdate} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-update";
import {ConstantsWeb} from "../../../../shared/constants-web";
import {MinigameWinner} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-winner";
import {MinigameBeamGunTeleport} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-teleport";
import {MinigameBeamGunGunReady} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-gun-ready";
import {ErrorService} from "../../../../shared/services/error-service";
import {MinigameBeamGunRequestFireGun} from "../../../../beam-bots-shared/communication-objects/client-to-server/minigame-beam-gun/minigame-beam-gun-request-fire-gun";
import {MinigameBeamGunFireGun} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-fire-gun";
import {MinigameBeamGunFireResult} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-fire-result";
import {MinigameBeamGunEndOfKillzone} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-end-of-killzone";

export class MinigameBeamGun extends IGameScene {
    public name: GameScenes = "MinigameBeamGun";
    private playersLocally: MgBeamGunPlayerInfo[];
    private lastUpdate: number;
    private aStatus: KeyboardEventKeyState;
    private dStatus: KeyboardEventKeyState;
    private gameState: MgBeamGunGameState;
    private startTime: number;
    private winningPlayer: Player | null;
    private countdownText: 4 | 3 | 2 | 1 | 0 | -1;
    private playerXVelocity: number;
    private gunXVelocity: number;
    private playerSize: number;
    private gravity: number;
    private boxSize: number;
    private boxImage: HTMLImageElement | null;
    private boxes: Rectangle[];
    private tryJumpUntil: number | null;
    private gunReady: boolean;
    private gunShooting: "not shooting" | "charging" | "killzone active";
    private gunBeamWidth: number;
    private gunBeamInnerWidth: number;
    private gunBeamBottom: number;

    constructor(setMinigameBeamGunScene: SetMinigameBeamGunScene) {
        super();
        this.lastUpdate = Date.now();
        this.tryJumpUntil = null;
        this.gunBeamBottom = 0;
        this.gunReady = false;
        this.gunShooting = "not shooting";
        this.startTime = this.lastUpdate + Sconstants.MG_COUNTDOWN_DELAY;
        this.aStatus = "UP";
        this.dStatus = "UP";
        this.winningPlayer = setMinigameBeamGunScene.winner;
        this.playerXVelocity = setMinigameBeamGunScene.playerXVelocity;
        this.gunXVelocity = setMinigameBeamGunScene.gunXVelocity;
        this.playerSize = setMinigameBeamGunScene.playerSize;
        this.gravity = setMinigameBeamGunScene.gravity;
        this.boxSize = setMinigameBeamGunScene.boxSize;
        this.gunBeamWidth = setMinigameBeamGunScene.gunBeamWidth;
        this.gunBeamInnerWidth = setMinigameBeamGunScene.gunBeamInnerWidth;
        this.boxes = [];
        for (let i: number = 0; i < setMinigameBeamGunScene.boxes.length; i++) {
            const box: Point2D = setMinigameBeamGunScene.boxes[i];
            const rect: Rectangle = HelperSharedFunctions.convertPointToRectangle(box, this.boxSize, this.boxSize);
            this.boxes.push(rect);
            if (rect.bottomLeft.y > this.gunBeamBottom) {
                this.gunBeamBottom = rect.bottomLeft.y;
            }
        }
        this.gameState = setMinigameBeamGunScene.gameState;
        if (this.gameState === "countdown") {
            this.countdownText = 4;
        } else {
            this.countdownText = -1;
        }
        this.playersLocally = [];
        for (let i: number = 0; i < setMinigameBeamGunScene.players.length; i++) {
            this.playersLocally.push(setMinigameBeamGunScene.players[i]);
        }
        this.background.style.backgroundImage = "url('/beam-bots/assets/images/beam_gun_bg.png')";
        KeybindsController.registerKeyCallback("a", this.aKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("d", this.dKeyEvent.bind(this));
        KeybindsController.registerKeyCallback(" ", this.spaceKeyEvent.bind(this));

        AudioController.loadAudio([]);
        this.loadCountdownAudio();

        this.boxImage = null;
        const boxAsImage: HTMLImageElement = new Image();
        boxAsImage.onload = () => {
            this.boxImage = boxAsImage;
        };
        boxAsImage.src = "/beam-bots/assets/images/beam_gun_box.png";
    }

    public handleCommunication(
        type: CommunicationObjectTypesServerToClient,
        communicationTypeAndObject: CommunicationTypeAndObject): void {
        switch (type) {
            case "MinigameBeamGunUpdate":
                this.updateReceived(communicationTypeAndObject.object as MinigameBeamGunUpdate);
                break;
            case "MinigameBeamGunTeleport":
                this.teleportReceived(communicationTypeAndObject.object as MinigameBeamGunTeleport);
                break;
            case "MinigameBeamGunGunReady":
                this.gunReadyReceived(communicationTypeAndObject.object as MinigameBeamGunGunReady);
                break;
            case "MinigameBeamGunFireGun":
                this.fireGunReceived(communicationTypeAndObject.object as MinigameBeamGunFireGun);
                break;
            case "MinigameBeamGunFireResult":
                this.fireResultReceived(communicationTypeAndObject.object as MinigameBeamGunFireResult);
                break;
            case "MinigameBeamGunEndOfKillzone":
                this.endOfKillzoneReceived(communicationTypeAndObject.object as MinigameBeamGunEndOfKillzone);
                break;
            case "MinigameWinner":
                this.winnerReceived(communicationTypeAndObject.object as MinigameWinner);
                break;
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    public aKeyEvent(state: KeyboardEventKeyState): void {
        this.aStatus = state;
        this.setDirectionAndMaybeJump();
    }

    public dKeyEvent(state: KeyboardEventKeyState): void {
        this.dStatus = state;
        this.setDirectionAndMaybeJump();
    }

    public spaceKeyEvent(state: KeyboardEventKeyState): void {
        if (state === "UP") {
            return;
        }
        if (this.getThisPlayer().inGun) {
            //Send regardless of if gun is ready
            //Server will ignore if it isn't time yet
            const fireGun: MinigameBeamGunRequestFireGun = {};
            PlayerState.sendCommunication("MinigameBeamGunRequestFireGun", fireGun);
        } else if (!this.tryJump()) {
            this.tryJumpUntil = Date.now() + ConstantsWeb.MG_BEAMGUN_TRY_JUMP_FOR_MS;
        }
    }

    protected loop(ms: number): void {
        let updatePositions: boolean = this.gameState === "in progress";
        if (!updatePositions &&
            this.gameState === "countdown" &&
            Date.now() >= this.startTime) {
            this.gameState = "in progress";
            updatePositions = true;
        }

        const notDeadPlayers: MgBeamGunPlayerInfo[] = [];
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            const playerInfo: MgBeamGunPlayerInfo = this.playersLocally[i];
            if (playerInfo.status === "dead") {
                continue;
            }
            notDeadPlayers.push(playerInfo);
        }

        //Drawing the beam
        if (this.gunShooting !== "not shooting") {
            let playerInGun: MgBeamGunPlayerInfo | null = null;
            for (let i: number = 0; i < notDeadPlayers.length; i++) {
                if (notDeadPlayers[i].inGun) {
                    playerInGun = notDeadPlayers[i];
                    break;
                }
            }
            if (playerInGun != null) {
                let color: string = HelperWebFunctions.convertColorToHexcode(playerInGun.player.color, 3);
                if (this.gunShooting === "charging") {
                    color += "88";
                }
                this.context.fillStyle = color;
                const beamTopLeft: Point2D = {
                    x: playerInGun.location.x + (this.playerSize / 2) - (this.gunBeamWidth / 2),
                    y: 0
                };
                this.context.fillRectWithPoint(beamTopLeft, this.gunBeamWidth, this.gunBeamBottom);

                //Draw inner
                color = HelperWebFunctions.convertColorToHexcode(playerInGun.player.color, 4);
                if (this.gunShooting === "charging") {
                    color += "88";
                }
                this.context.fillStyle = color;
                const beamTopLeftInner: Point2D = {
                    x: playerInGun.location.x + (this.playerSize / 2) - (this.gunBeamInnerWidth / 2),
                    y: 0
                };
                this.context.fillRectWithPoint(beamTopLeftInner, this.gunBeamInnerWidth, this.gunBeamBottom);
            }
        }

        if (this.boxImage != null) {
            //Drawing boxes
            for (let i: number = 0; i < this.boxes.length; i++) {
                const box: Point2D = this.boxes[i].topLeft;
                this.context.drawImage(this.boxImage, box.x, box.y, this.boxSize, this.boxSize);
            }
        }

        if (updatePositions) {
            const canGunnerMove: boolean = this.gunShooting === "not shooting";
            HelperSharedFunctions.mgBeamGunHandleAllMovement(
                notDeadPlayers,
                ms,
                this.playerXVelocity,
                this.playerSize,
                this.gravity,
                this.boxes,
                this.gunXVelocity,
                !canGunnerMove);
        }

        //Drawing the players
        for (let i: number = 0; i < notDeadPlayers.length; i++) {
            const playerInfo: MgBeamGunPlayerInfo = notDeadPlayers[i];
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(playerInfo.player.color);
            this.context.fillRectWithPoint(playerInfo.location, this.playerSize, this.playerSize);
            if (playerInfo.inGun &&
                this.gunReady) {
                const topLeft: Point2D = {
                    x: playerInfo.location.x + (this.playerSize / 2) - (this.gunBeamWidth / 2),
                    y: playerInfo.location.y + this.playerSize
                };
                this.context.fillRectWithPoint(topLeft, this.gunBeamWidth, 10);
            }
        }


        if (this.tryJumpUntil != null &&
            Date.now() < this.tryJumpUntil) {
            this.tryJump();
        }

        if (this.gameState === "winner") {
            this.drawWinnerBanner(this.winningPlayer);
        }
        if (this.countdownText !== -1) {
            this.countdownText = this.handleCountdown(this.startTime, this.countdownText);
        }
    }

    private winnerReceived(minigameBeamGunWinner: MinigameWinner): void {
        this.gameState = "winner";
        this.winningPlayer = minigameBeamGunWinner.winner;
    }

    //Returns true if it succeeds
    private tryJump(): boolean {
        if (this.gameState === "countdown") {
            return false;
        }

        const collidables: Rectangle[] = [...this.boxes];

        let playerRect: Rectangle | null = null;
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            if (this.playersLocally[i].player.id === PlayerState.player.id) {
                //me
                playerRect = HelperSharedFunctions.convertPointToRectangle(this.playersLocally[i].location, this.playerSize, this.playerSize);
            } else if (this.playersLocally[i].status !== "dead") {
                collidables.push(HelperSharedFunctions.convertPointToRectangle(this.playersLocally[i].location, this.playerSize, this.playerSize));
            }
        }

        if (playerRect == null) {
            console.error("Player was null?");
            return false;
        }

        let ontop: boolean = false;
        for (let i: number = 0; i < collidables.length; i++) {
            const collidable: Rectangle = collidables[i];

            if (HelperSharedFunctions.rectangleOnTopOfRectangle(playerRect, collidable)) {
                ontop = true;
                break;
            }
        }

        if (ontop) {
            this.setDirectionAndMaybeJump(true);
            this.tryJumpUntil = null;
            return true;
        }
        return false;
    }

    private setDirectionAndMaybeJump(jump: boolean = false): void {
        let result: MgBeamGunDirection = "NOWHERE";
        if (this.aStatus === "DOWN") {
            result = "LEFT";
        } else if (this.dStatus === "DOWN") {
            result = "RIGHT";
        }

        const direction: MinigameBeamGunDirectionChange = {
            newDirection: result,
            jump: jump
        };
        PlayerState.sendCommunication("MinigameBeamGunDirectionChange", direction);
    }

    private gunReadyReceived(gunReady: MinigameBeamGunGunReady): void {
        this.gunReady = true;
    }

    private fireGunReceived(fireGun: MinigameBeamGunFireGun): void {
        this.gunReady = false;
        this.gunShooting = "charging";
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            if (fireGun.playerInfo.player.id === this.playersLocally[i].player.id) {
                this.playersLocally[i] = fireGun.playerInfo;
            }
        }
    }

    private fireResultReceived(fireResult: MinigameBeamGunFireResult): void {
        for (let i: number = 0; i < fireResult.boxesDestroyed.length; i++) {
            const box: Point2D = fireResult.boxesDestroyed[i];
            for (let j: number = this.boxes.length - 1; j >= 0; j--) {
                if (HelperSharedFunctions.match(this.boxes[j].topLeft, box)) {
                    this.boxes.splice(j, 1);
                    break;
                }
            }
        }
        this.gunShooting = "killzone active";
    }

    private endOfKillzoneReceived(endOfKillzone: MinigameBeamGunEndOfKillzone): void {
        this.gunShooting = "not shooting";
    }

    private teleportReceived(teleport: MinigameBeamGunTeleport): void {
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            if (teleport.playerToGun.player.id === this.playersLocally[i].player.id) {
                this.playersLocally[i] = teleport.playerToGun;
            }
            if (teleport.playerToGround != null &&
                teleport.playerToGround.player.id === this.playersLocally[i].player.id) {
                this.playersLocally[i] = teleport.playerToGround;
            }
        }
    }

    private updateReceived(update: MinigameBeamGunUpdate): void {
        this.lastUpdate = update.time;
        this.playersLocally = [];
        for (let i: number = 0; i < update.players.length; i++) {
            this.playersLocally.push(update.players[i]);
        }
    }

    private getThisPlayer(): MgBeamGunPlayerInfo {
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            if (this.playersLocally[i].player.id === PlayerState.player.id) {
                return this.playersLocally[i];
            }
        }
        throw ErrorService.error(1017, "Couldn't find this player in `getThisPlayer()`");
    }
}