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
    MgBeamGunGameState,
    MgBeamGunPlayerInfo
} from "../../../../beam-bots-shared/scene-interfaces/minigame-beam-gun-interfaces";
import {SetMinigameBeamGunScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/set-minigame-beam-gun-scene";

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

    constructor(setMinigameBeamGunScene: SetMinigameBeamGunScene) {
        super();
        this.lastUpdate = Date.now();
        this.startTime = this.lastUpdate + Sconstants.MG_ICECIRCLE_COUNTDOWN_DELAY;
        this.aStatus = "UP";
        this.dStatus = "UP";
        this.winningPlayer = setMinigameBeamGunScene.winner;
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
            velocity: HelperSharedFunctions.clonePoint2D(playerInfo.velocity)
        };
        return result;
    }

    private setDirection(): void {
        throw new Error("setDirection not implemented");
    }
}