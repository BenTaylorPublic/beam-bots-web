import {IGameScene} from "./i-game-scene";
import {GameScenes} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {PlayerState} from "../player-state";
import {LobbyStartButtonClicked} from "../../../../beam-bots-shared/communication-objects/client-to-server/lobby/lobby-start-button-clicked";
import {Sconstants} from "../../../../beam-bots-shared/sconstants";
import {HelperWebFunctions} from "../../../../shared/helper-web-functions";
import {ConstantsWeb} from "../../../../shared/constants-web";
import {Player, Rectangle} from "../../../../beam-bots-shared/interfaces";
import {HelperSharedFunctions} from "../../../../beam-bots-shared/helper-shared-functions";
import {LobbyMinigame} from "../../../../shared/interfaces";
import {SetLobbyScene} from "../../../../beam-bots-shared/communication-objects/server-to-client/set-lobby-scene";
import {LobbyMinigameClicked} from "../../../../beam-bots-shared/communication-objects/client-to-server/lobby/lobby-minigame-clicked";
import {MinigameBeamGunUpdate} from "../../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/minigame-beam-gun-update";
import {LobbySelectedMinigameUpdate} from "../../../../beam-bots-shared/communication-objects/server-to-client/lobby/lobby-selected-minigame-update";

export class Lobby extends IGameScene {
    public name: GameScenes = "Lobby";
    private logo: HTMLImageElement | null;
    private escapeMenuTip: HTMLImageElement | null;
    private crown: HTMLImageElement | null;
    private minigameList: LobbyMinigame[];
    private selectedMinigame: GameScenes | null;

    constructor(setLobbyScene: SetLobbyScene) {
        super();
        this.background.style.backgroundColor = "black";
        this.setupOverlay();
        this.logo = null;
        this.escapeMenuTip = null;
        this.crown = null;
        this.minigameList = [];
        this.selectedMinigame = setLobbyScene.minigameSelected;

        const logoAsImage: HTMLImageElement = new Image();
        logoAsImage.onload = () => {
            logoAsImage.width = logoAsImage.width / 1.5;
            logoAsImage.height = logoAsImage.height / 1.5;
            this.logo = logoAsImage;
        };
        logoAsImage.src = "/beam-bots/assets/images/logo.png";

        const escapeMenuTipAsImage: HTMLImageElement = new Image();
        escapeMenuTipAsImage.onload = () => {
            escapeMenuTipAsImage.width = escapeMenuTipAsImage.width / 1.5;
            escapeMenuTipAsImage.height = escapeMenuTipAsImage.height / 1.5;
            this.escapeMenuTip = escapeMenuTipAsImage;
        };
        escapeMenuTipAsImage.src = "/beam-bots/assets/images/lobby_escape_menu_tip.png";

        const crownAsImage: HTMLImageElement = new Image();
        crownAsImage.onload = () => {
            this.crown = crownAsImage;
        };
        crownAsImage.src = "/beam-bots/assets/images/lobby_crown.png";

        const minigameIceCirclePicAsImage: HTMLImageElement = new Image();
        minigameIceCirclePicAsImage.onload = () => {
            this.minigameImageLoaded({
                index: 0,
                image: minigameIceCirclePicAsImage,
                minigame: "MinigameIceCircle",
                selected: this.selectedMinigame === "MinigameIceCircle"
            });
        };
        minigameIceCirclePicAsImage.src = "/beam-bots/assets/images/ice_circle_bg.png";

        const minigameBeamGunPicAsImage: HTMLImageElement = new Image();
        minigameBeamGunPicAsImage.onload = () => {
            this.minigameImageLoaded({
                index: 1,
                image: minigameBeamGunPicAsImage,
                minigame: "MinigameBeamGun",
                selected: this.selectedMinigame === "MinigameBeamGun"
            });
        };
        minigameBeamGunPicAsImage.src = "/beam-bots/assets/images/lobby_beam_gun.png";
    }

    public handleCommunication(
        type: CommunicationObjectTypesServerToClient,
        communicationTypeAndObject: CommunicationTypeAndObject): void {
        switch (type) {
            case "LobbySelectedMinigameUpdate":
                this.minigameSelected(communicationTypeAndObject.object as LobbySelectedMinigameUpdate);
                break;
            default:
                this.failedToHandleCommunication(communicationTypeAndObject);
                break;
        }
    }

    protected loop(ms: number): void {
        this.context.font = `${ConstantsWeb.LOBBY_NAME_FONT_SIZE}px monospace`;
        if (this.logo != null) {
            //Centered
            const x: number = (Sconstants.GAME_LOGIC_WIDTH - this.logo.width) / 2;
            this.context.drawImage(this.logo, x, 0, this.logo.width, this.logo.height);
        }

        this.context.textAlign = "left";
        //If there is a crown to draw, the names move out
        let textStartX: number = 0;
        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            if (PlayerState.allPlayers[i].admin) {
                textStartX = 170;
                break;
            }
        }

        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            const player: Player = PlayerState.allPlayers[i];
            const y: number = (i + 1) * ConstantsWeb.LOBBY_NAME_FONT_SIZE + 250;

            if (player.admin &&
                this.crown != null) {
                this.context.drawImage(this.crown, 0, y - ConstantsWeb.LOBBY_NAME_FONT_SIZE, 150, 150);
            }

            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(player.color);
            this.context.fillText(player.name, textStartX, y);
        }

        //MINIGAMES
        if (this.minigameList.length === ConstantsWeb.LOBBY_AMOUNT_OF_MINIGAMES) {
            let x: number = ConstantsWeb.LOBBY_ICONS_START_X;

            for (const minigame of this.minigameList) {
                this.context.drawImage(minigame.image, x, ConstantsWeb.LOBBY_ICONS_START_Y, ConstantsWeb.LOBBY_ICONS_WIDTH, ConstantsWeb.LOBBY_ICONS_HEIGHT);

                //This will be an outline
                this.context.beginPath();
                this.context.strokeStyle = minigame.selected ? "#22EE22" : "#444444";
                this.context.strokeRect(x, ConstantsWeb.LOBBY_ICONS_START_Y, ConstantsWeb.LOBBY_ICONS_WIDTH, ConstantsWeb.LOBBY_ICONS_HEIGHT);
                this.context.fillStyle = "transparent";
                this.context.lineWidth = 10;
                this.context.stroke();

                x += ConstantsWeb.LOBBY_ICONS_WIDTH + ConstantsWeb.LOBBY_ICONS_GAP;
            }

        }

        //Tips box
        const tipsBoxWidth: number = Sconstants.GAME_LOGIC_WIDTH / 2 - 100;
        const tipsBoxX: number = Sconstants.GAME_LOGIC_WIDTH / 2;
        const tipsBoxY: number = 800;
        this.context.beginPath();
        this.context.strokeStyle = "white";
        this.context.strokeRect(tipsBoxX, tipsBoxY, tipsBoxWidth, 500);
        this.context.fillStyle = "transparent";
        this.context.lineWidth = 10;
        this.context.stroke();

        //Clear room for the heading
        const tipsHeadingTextWidth: number = 300;
        const tipsHeadingX: number = tipsBoxX + (tipsBoxWidth / 2) - (tipsHeadingTextWidth / 2);
        this.context.fillStyle = "black";
        this.context.fillRect(tipsHeadingX, tipsBoxY - 20, tipsHeadingTextWidth, 40);


        this.context.font = `${ConstantsWeb.LOBBY_TIP_HEADING_FONT_SIZE}px monospace`;
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText("Tip", tipsHeadingX + (tipsHeadingTextWidth / 2), tipsBoxY + 10, tipsHeadingTextWidth);


        this.context.fillStyle = "white";
        this.context.textAlign = "center";

        switch (this.selectedMinigame) {
            case null:
                if (this.escapeMenuTip != null) {
                    this.context.drawImage(this.escapeMenuTip, tipsBoxX + 20, tipsBoxY + 20, this.escapeMenuTip.width, this.escapeMenuTip.height);
                }
                this.context.fillText("Press this for", tipsHeadingX + (tipsHeadingTextWidth / 2) + 300, tipsBoxY + 200);
                this.context.fillText("a settings menu", tipsHeadingX + (tipsHeadingTextWidth / 2) + 300, tipsBoxY + 300);
                break;
            case "MinigameIceCircle":
                this.context.fillText("Controls: WASD", tipsHeadingX + (tipsHeadingTextWidth / 2), tipsBoxY + 200);
                break;
            case "MinigameBeamGun":
                this.context.fillText("Controls: A, D, and SPACE", tipsHeadingX + (tipsHeadingTextWidth / 2), tipsBoxY + 200);
                break;
        }
    }

    private setupOverlay(): void {
        const startButton: HTMLButtonElement = document.createElement("button");
        startButton.innerText = "Start";
        startButton.style.position = "absolute";
        startButton.style.bottom = "10px";
        startButton.style.right = "0";
        startButton.style.left = "0";
        startButton.style.margin = "auto";
        startButton.onclick = this.startButtonClicked.bind(this);
        this.overlay.appendChild(startButton);
    }

    private startButtonClicked(): void {
        const lobbyStartButtonClicked: LobbyStartButtonClicked = {};
        PlayerState.sendCommunication<LobbyStartButtonClicked>("LobbyStartButtonClicked", lobbyStartButtonClicked);
    }

    private minigameSelected(minigameSelected: LobbySelectedMinigameUpdate): void {
        this.selectedMinigame = minigameSelected.minigame;
        for (const minigame of this.minigameList) {
            minigame.selected = minigame.minigame === minigameSelected.minigame;
        }
    }

    private minigameImageLoaded(minigameInfo: LobbyMinigame): void {
        this.minigameList.push(minigameInfo);
        if (this.minigameList.length === ConstantsWeb.LOBBY_AMOUNT_OF_MINIGAMES) {
            this.minigameList.sort((a, b) => {
                return a.index - b.index;
            });
            let x: number = ConstantsWeb.LOBBY_ICONS_START_X;
            for (const minigame of this.minigameList) {
                const rect: Rectangle = HelperSharedFunctions.convertPointToRectangle({
                    x: x,
                    y: ConstantsWeb.LOBBY_ICONS_START_Y
                }, ConstantsWeb.LOBBY_ICONS_WIDTH, ConstantsWeb.LOBBY_ICONS_HEIGHT);
                this.overlay.addClickableRectangle(rect, () => {
                    const lobbyMinigameClicked: LobbyMinigameClicked = {
                        minigame: minigame.minigame
                    };
                    PlayerState.sendCommunication<LobbyMinigameClicked>("LobbyMinigameClicked", lobbyMinigameClicked);
                });
                x += ConstantsWeb.LOBBY_ICONS_WIDTH + ConstantsWeb.LOBBY_ICONS_GAP;
            }
        }
    }
}