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
    private playerSize: number;
    private gravity: number;
    private boxSize: number;
    private boxImage: HTMLImageElement | null;
    private boxes: Point2D[];
    private tryJumpUntil: number | null;

    constructor(setMinigameBeamGunScene: SetMinigameBeamGunScene) {
        super();
        this.lastUpdate = Date.now();
        this.tryJumpUntil = null;
        this.startTime = this.lastUpdate + Sconstants.MG_COUNTDOWN_DELAY;
        this.aStatus = "UP";
        this.dStatus = "UP";
        this.winningPlayer = setMinigameBeamGunScene.winner;
        this.playerXVelocity = setMinigameBeamGunScene.playerXVelocity;
        this.playerSize = setMinigameBeamGunScene.playerSize;
        this.gravity = setMinigameBeamGunScene.gravity;
        this.boxSize = setMinigameBeamGunScene.boxSize;
        this.boxes = setMinigameBeamGunScene.boxes;
        this.gameState = setMinigameBeamGunScene.gameState;
        if (this.gameState === "countdown") {
            this.countdownText = 4;
        } else {
            this.countdownText = -1;
        }
        this.playersLocally = [];
        for (let i: number = 0; i < setMinigameBeamGunScene.players.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(setMinigameBeamGunScene.players[i]));
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
        if (!this.tryJump()) {
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

        if (this.boxImage != null) {
            //Drawing boxes
            for (let i: number = 0; i < this.boxes.length; i++) {
                const box: Point2D = this.boxes[i];
                this.context.drawImage(this.boxImage, box.x, box.y, this.boxSize, this.boxSize);
            }
        }

        for (let i: number = 0; i < this.playersLocally.length; i++) {
            const playerInfo: MgBeamGunPlayerInfo = this.playersLocally[i];
            if (playerInfo.status === "dead") {
                continue;
            }

            if (updatePositions) {
                HelperSharedFunctions.mgBeamGunHandleMovement(playerInfo, ms, this.playerXVelocity, this.playerSize, this.gravity, this.boxes, this.boxSize);
            }
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(playerInfo.player.color);
            this.context.fillRectWithPoint(playerInfo.location, this.playerSize, this.playerSize);
        }

        if (this.tryJumpUntil != null) {
            this.tryJump();
        }


        if (this.gameState === "winner") {
            this.drawWinnerBanner(this.winningPlayer);
        }
        if (this.countdownText !== -1) {
            this.countdownText = this.handleCountdown(this.startTime, this.countdownText);
        }
    }

    //Returns true if it succeeds
    private tryJump(): boolean {
        let playerRect: Rectangle | null = null;
        for (let i: number = 0; i < this.playersLocally.length; i++) {
            if (this.playersLocally[i].player.id === PlayerState.player.id) {
                //me
                playerRect = HelperSharedFunctions.convertPointToRectangle(this.playersLocally[i].location, this.playerSize, this.playerSize);
            }
        }

        if (playerRect == null) {
            console.error("Player was null?");
            return false;
        }

        let ontop: boolean = false;
        for (let i: number = 0; i < this.boxes.length; i++) {
            const box: Point2D = this.boxes[i];
            const boxRect: Rectangle = HelperSharedFunctions.convertPointToRectangle(box, this.boxSize, this.boxSize);

            if (HelperSharedFunctions.rectangleOnTopOfRectangle(playerRect, boxRect)) {
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

    private clonePlayerInfo(playerInfo: MgBeamGunPlayerInfo): MgBeamGunPlayerInfo {
        const result: MgBeamGunPlayerInfo = {
            direction: playerInfo.direction,
            location: HelperSharedFunctions.clonePoint2D(playerInfo.location),
            player: playerInfo.player,
            status: playerInfo.status,
            yVelocity: playerInfo.yVelocity
        };
        return result;
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

    private updateReceived(update: MinigameBeamGunUpdate): void {
        this.lastUpdate = update.time;
        this.playersLocally = [];
        for (let i: number = 0; i < update.players.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(update.players[i]));
        }
    }
}