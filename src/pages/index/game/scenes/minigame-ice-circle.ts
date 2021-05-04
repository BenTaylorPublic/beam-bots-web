import {IGameScene} from "../i-game-scene";
import {GameScenes, PlayerColors} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/set-minigame-ice-circle-scene";
import {
    MgIceCircleAccelerationDirection,
    MgIceCircleGameState,
    MgIceCirclePlayerInfo
} from "../../../../beam-bots-shared/scene-interfaces/minigame-ice-circle-interfaces";
import {Player, Point2D} from "../../../../beam-bots-shared/interfaces";
import {PlayerState} from "../player-state";
import {MinigameIceCircleDirectionChange} from "../../../../beam-bots-shared/communication-objects/client-to-server/minigame-ice-circle/minigame-ice-circle-direction-change";
import {MinigameIceCircleUpdate} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/minigame-ice-circle-update";
import {HelperWebFunctions} from "../../../../shared/helper-web-functions";
import {HelperSharedFunctions} from "../../../../beam-bots-shared/helper-shared-functions";
import {KeybindsController} from "../keybinds-controller";
import {ConstantsWeb} from "../../../../shared/constants-web";
import {MinigameIceCircleWinner} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/minigame-ice-circle-winner";
import {Sconstants} from "../../../../beam-bots-shared/sconstants";
import {AudioController} from "../audio-controller";
import {AnimatedSpriteSheet} from "../animated-sprite-sheet";
import {ColorToAnimatedSpriteMap, KeyboardEventKeyState} from "../../../../shared/types";
import {SpriteSheetState} from "../../../../shared/interfaces";

export class MinigameIceCircle extends IGameScene {
    public name: GameScenes = "MinigameIceCircle";
    private acceleration: number;
    private playersFromServer: MgIceCirclePlayerInfo[];
    private playersLocally: MgIceCirclePlayerInfo[];
    private lastUpdate: number;
    private localPlayerRadius: number;
    private circleCenter: Point2D;
    private circleHorizontalRadius: number;
    private circleVerticalRadius: number;
    private wStatus: KeyboardEventKeyState;
    private aStatus: KeyboardEventKeyState;
    private sStatus: KeyboardEventKeyState;
    private dStatus: KeyboardEventKeyState;
    private gameState: MgIceCircleGameState;
    private startTime: number;
    private winningPlayer: Player | null;
    private countdownText: 4 | 3 | 2 | 1 | 0 | -1;
    private spriteSheets: ColorToAnimatedSpriteMap;

    constructor(setMinigameIceCircleScene: SetMinigameIceCircleScene) {
        super();
        this.lastUpdate = Date.now();
        this.startTime = this.lastUpdate + Sconstants.MG_ICECIRCLE_COUNTDOWN_DELAY;
        this.wStatus = "UP";
        this.aStatus = "UP";
        this.sStatus = "UP";
        this.dStatus = "UP";
        this.winningPlayer = setMinigameIceCircleScene.winner;
        this.acceleration = setMinigameIceCircleScene.acceleration;
        this.playersFromServer = setMinigameIceCircleScene.players;
        this.gameState = setMinigameIceCircleScene.gameState;
        if (this.gameState === "countdown") {
            this.countdownText = 4;
        } else {
            this.countdownText = -1;
        }
        this.playersLocally = [];
        for (let i: number = 0; i < this.playersFromServer.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(this.playersFromServer[i]));
        }
        this.circleCenter = setMinigameIceCircleScene.circleCenter;
        this.circleVerticalRadius = setMinigameIceCircleScene.circleVerticalRadius;
        this.circleHorizontalRadius = setMinigameIceCircleScene.circleHorizontalRadius;
        this.localPlayerRadius = setMinigameIceCircleScene.playerHitBoxRadius;
        this.background.style.backgroundImage = "url('/beam-bots/assets/images/ice_circle_bg.png')";
        KeybindsController.registerKeyCallback("w", this.wKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("a", this.aKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("s", this.sKeyEvent.bind(this));
        KeybindsController.registerKeyCallback("d", this.dKeyEvent.bind(this));

        AudioController.loadAudio([{
            name: "falling",
            url: "ice_circle_falling.wav"
        }, {
            name: "collision",
            url: "ice_circle_collision.wav"
        }, {
            name: "countdown",
            url: "ice_circle_countdown.wav"
        }]);

        const spriteSheetStates: SpriteSheetState[] = [{
            name: "NOWHERE",
            startRow: 0,
            startColumn: 1,
            amountOfFrames: 1,
        }, {
            name: "DOWN",
            startRow: 0,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "BOTTOM LEFT",
            startRow: 1,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "LEFT",
            startRow: 2,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "UP",
            startRow: 3,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "TOP LEFT",
            startRow: 4,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "TOP RIGHT",
            startRow: 5,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "RIGHT",
            startRow: 6,
            startColumn: 0,
            amountOfFrames: 4,
        }, {
            name: "BOTTOM RIGHT",
            startRow: 7,
            startColumn: 0,
            amountOfFrames: 4,
        }];
        this.spriteSheets = {};
        const spriteSheetAsImage: HTMLImageElement = new Image();
        spriteSheetAsImage.onload = () => {

            for (let i: number = 0; i < this.playersLocally.length; i++) {
                // const playerColor:
                // const imageRecolored: HTMLImageElement = HelperWebFunctions.replaceColorInImage(spriteSheetAsImage, HelperWebFunctions.convertColorToHexcode(this.pl))
                this.spriteSheets[this.playersLocally[i].player.color] = new AnimatedSpriteSheet(spriteSheetAsImage, spriteSheetStates, "NOWHERE", ConstantsWeb.MG_ICECIRCLE_ANIMATION_MS, 8, 4);
            }
        };
        spriteSheetAsImage.src = "/beam-bots/assets/images/ice_circle_character.png";
    }

    public handleCommunication(
        type: CommunicationObjectTypesServerToClient,
        communicationTypeAndObject: CommunicationTypeAndObject): void {
        switch (type) {
            case "MinigameIceCircleUpdate":
                this.updateReceived(communicationTypeAndObject.object as MinigameIceCircleUpdate);
                break;
            case "MinigameIceCircleWinner":
                this.winnerReceived(communicationTypeAndObject.object as MinigameIceCircleWinner);
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
        let updatePositions: boolean = this.gameState === "in progress";
        if (!updatePositions &&
            this.gameState === "countdown" &&
            Date.now() >= this.startTime) {
            this.gameState = "in progress";
            updatePositions = true;
        }
        if (ConstantsWeb.MG_ICECIRCLE_DRAW_ELLIPSE) {
            this.context.fillStyle = "transparent";
            this.context.beginPath();
            this.context.ellipse(this.circleCenter.x, this.circleCenter.y, this.circleHorizontalRadius, this.circleVerticalRadius, 0, 0, 2 * Math.PI);
            this.context.lineWidth = 10;
            this.context.strokeStyle = "#FF0000";
            this.context.stroke();
        }
        const accelerationToAdd: number = this.acceleration / (1000 / ms);

        for (let i: number = 0; i < this.playersLocally.length; i++) {
            const playerInfo: MgIceCirclePlayerInfo = this.playersLocally[i];
            if (playerInfo.status === "dead") {
                continue;
            }
            if (updatePositions) {
                HelperSharedFunctions.mgIceCircleAddAcceleration(playerInfo, accelerationToAdd);
                HelperSharedFunctions.mgIceCircleCalculateNewPosition(playerInfo, ms);
            }
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(playerInfo.player.color);
            this.context.beginPath();
            this.context.arc(playerInfo.location.x, playerInfo.location.y, this.localPlayerRadius, 0, 2 * Math.PI);
            this.context.fill();

            if (this.spriteSheets[playerInfo.player.color] != null) {
                const locationToDraw: Point2D = HelperSharedFunctions.subtract(playerInfo.location, {
                    x: 65,
                    y: 180
                });
                this.context.drawImageFromAnimatedSpriteSheet(this.spriteSheets[playerInfo.player.color] as AnimatedSpriteSheet, locationToDraw, 7);
            }
        }
        if (this.gameState === "winner") {
            //Drawing winner popup
            let backgroundColor: string;
            let textColor: string;
            let text: string;
            if (this.winningPlayer != null) {
                backgroundColor = HelperWebFunctions.convertColorToHexcode(this.winningPlayer.color);
                textColor = "#000000";
                text = `${this.winningPlayer.name} wins!`;
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
        if (this.countdownText !== -1) {
            const now: number = Date.now();
            const timeDifference: number = this.startTime - now;
            const timeToCompareTo: number = (this.countdownText * 1_000) - 1_000;
            if (timeDifference < timeToCompareTo) {
                this.countdownText--;
                if (this.countdownText === 3) {
                    AudioController.playAudio("countdown");
                }
            }
            if (this.countdownText !== -1 && this.countdownText !== 4) {
                let color: string = "#000000";
                switch (this.countdownText) {
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
                const text: string = this.countdownText === 0 ? "GO!" : this.countdownText.toString();
                this.context.fillText(text, Sconstants.GAME_LOGIC_WIDTH / 2, 270);
            }
        }
    }

    private winnerReceived(minigameIceCircleWinner: MinigameIceCircleWinner): void {
        this.gameState = "winner";
        this.winningPlayer = minigameIceCircleWinner.winner;
    }

    private updateReceived(update: MinigameIceCircleUpdate): void {
        this.lastUpdate = update.time;
        this.playersFromServer = update.players;
        this.playersLocally = [];
        for (let i: number = 0; i < this.playersFromServer.length; i++) {
            this.playersLocally.push(this.clonePlayerInfo(this.playersFromServer[i]));
            const playerColor: PlayerColors = this.playersFromServer[i].player.color;
            this.spriteSheets[playerColor]?.setNewState(this.playersLocally[i].accelerationDirection);
        }

        if (update.reasonForUpdate === "PlayerFell") {
            AudioController.playAudio("falling");
        } else if (update.reasonForUpdate === "Collision") {
            AudioController.playAudio("collision");
        }
    }

    private clonePlayerInfo(playerInfo: MgIceCirclePlayerInfo): MgIceCirclePlayerInfo {
        const result: MgIceCirclePlayerInfo = {
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