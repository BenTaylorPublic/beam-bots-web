import {IGameScene} from "../i-game-scene";
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

    constructor() {
        super();
        this.background.style.backgroundColor = "black";
        this.setupOverlay();
        this.logo = null;
        const logoAsImage: HTMLImageElement = new Image();
        logoAsImage.onload = () => {
            this.logo = logoAsImage;
        };
        logoAsImage.src = "/beam-bots/assets/images/logo.png";
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
            const x: number = Sconstants.GAME_LOGIC_WIDTH - this.logo.width;
            this.context.drawImage(this.logo, x, 0, this.logo.width, this.logo.height);
        }
        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            this.context.fillStyle = HelperWebFunctions.convertColorToHexcode(PlayerState.allPlayers[i].color);
            this.context.fillText(PlayerState.allPlayers[i].name, 0, (i + 1) * ConstantsWeb.LOBBY_NAME_FONT_SIZE);
        }

    }

    private setupOverlay(): void {
        const startButton: HTMLButtonElement = document.createElement("button");
        startButton.innerText = "Start";
        startButton.style.position = "absolute";
        startButton.style.bottom = "10px";
        startButton.style.right = "10px";
        startButton.onclick = this.startButtonClicked.bind(this);
        this.overlay.appendChild(startButton);
    }

    private startButtonClicked(): void {
        const lobbyStartButtonClicked: LobbyStartButtonClicked = {};
        PlayerState.sendCommunication<LobbyStartButtonClicked>("LobbyStartButtonClicked", lobbyStartButtonClicked);
    }

}