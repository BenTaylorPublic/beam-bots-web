import {IGameScene} from "./i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {Player} from "../../../../beam-bots-shared/interfaces";
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
    private boxesAcross: number;
    private boxesDeep: number;
    private boxesY: number;
    private boxImage: HTMLImageElement | null;

    constructor(setMinigameBeamGunScene: SetMinigameBeamGunScene) {
        super();
        this.lastUpdate = Date.now();
        this.startTime = this.lastUpdate + Sconstants.MG_COUNTDOWN_DELAY;
        this.aStatus = "UP";
        this.dStatus = "UP";
        this.winningPlayer = setMinigameBeamGunScene.winner;
        this.playerXVelocity = setMinigameBeamGunScene.playerXVelocity;
        this.playerSize = setMinigameBeamGunScene.playerSize;
        this.gravity = setMinigameBeamGunScene.gravity;
        this.boxSize = setMinigameBeamGunScene.boxSize;
        this.boxesAcross = setMinigameBeamGunScene.boxesAcross;
        this.boxesDeep = setMinigameBeamGunScene.boxesDeep;
        this.boxesY = setMinigameBeamGunScene.boxesY;
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
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    public aKeyEvent(state: KeyboardEventKeyState): void {
        this.aStatus = state;
        this.setDirection();
    }

    public dKeyEvent(state: KeyboardEventKeyState): void {
        this.dStatus = state;
        this.setDirection();
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
            for (let y: number = 0; y < this.boxesDeep; y++) {
                for (let x: number = 0; x < this.boxesAcross; x++) {
                    const xPos: number = x * this.boxSize;
                    const yPos: number = y * this.boxSize + this.boxesY;
                    this.context.drawImage(this.boxImage, xPos, yPos, this.boxSize, this.boxSize);
                }
            }
        }

        for (let i: number = 0; i < this.playersLocally.length; i++) {
            const playerInfo: MgBeamGunPlayerInfo = this.playersLocally[i];
            if (playerInfo.status === "dead") {
                continue;
            }
            if (updatePositions) {
                //TODO
            }
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(playerInfo.player.color);
            this.context.fillRectWithPoint(playerInfo.location, this.playerSize, this.playerSize);
        }


        if (this.gameState === "winner") {
            this.drawWinnerBanner(this.winningPlayer);
        }
        if (this.countdownText !== -1) {
            this.countdownText = this.handleCountdown(this.startTime, this.countdownText);
        }
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

    private setDirection(): void {
        let result: MgBeamGunDirection = "NOWHERE";
        if (this.aStatus === "DOWN") {
            result = "LEFT";
        } else if (this.dStatus === "DOWN") {
            result = "RIGHT";
        }

        const direction: MinigameBeamGunDirectionChange = {
            newDirection: result
        };
        PlayerState.sendCommunication("MinigameBeamGunDirectionChange", direction);
    }
}