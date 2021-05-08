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

export class Lobby extends IGameScene {
    public name: GameScenes = "Lobby";
    private logo: HTMLImageElement | null;
    private escapeMenuTip: HTMLImageElement | null;

    constructor() {
        super();
        this.background.style.backgroundColor = "black";
        this.setupOverlay();
        this.logo = null;
        this.escapeMenuTip = null;

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

    protected loop(ms: number): void {
        this.context.font = `${ConstantsWeb.LOBBY_NAME_FONT_SIZE}px monospace`;
        if (this.logo != null) {
            //Centered
            const x: number = (Sconstants.GAME_LOGIC_WIDTH - this.logo.width) / 2;
            this.context.drawImage(this.logo, x, 0, this.logo.width, this.logo.height);
        }
        this.context.textAlign = "left";
        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(PlayerState.allPlayers[i].color);
            this.context.fillText(PlayerState.allPlayers[i].name, 0, (i + 1) * ConstantsWeb.LOBBY_NAME_FONT_SIZE + 250);
        }

        //Tips box
        const tipsBoxWidth: number = Sconstants.GAME_LOGIC_WIDTH / 2 - 100;
        const tipsBoxX: number = Sconstants.GAME_LOGIC_WIDTH / 2;
        const tipsBoxY: number = 800;
        this.context.beginPath();
        this.context.strokeRect(tipsBoxX, tipsBoxY, tipsBoxWidth, 500);
        this.context.fillStyle = "transparent";
        this.context.lineWidth = 10;
        this.context.strokeStyle = "white";
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

        if (this.escapeMenuTip != null) {
            this.context.drawImage(this.escapeMenuTip, tipsBoxX + 20, tipsBoxY + 20, this.escapeMenuTip.width, this.escapeMenuTip.height);
        }

        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText("Press this for", tipsHeadingX + (tipsHeadingTextWidth / 2) + 300, tipsBoxY + 200);
        this.context.fillText("a settings menu", tipsHeadingX + (tipsHeadingTextWidth / 2) + 300, tipsBoxY + 300);


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

}