import {IGameScene} from "../i-game-scene";
import {GameScenes, PlayerColors} from "../../../../beam-bots-shared/types";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../../beam-bots-shared/communication-objects/communication-object";
import {PlayerState} from "../player-state";
import {ConstantsWeb} from "../../../../shared/constants-web";
import {LobbyStartButtonClicked} from "../../../../beam-bots-shared/communication-objects/client-to-server/lobby/lobby-start-button-clicked";

export class Lobby extends IGameScene {
    public name: GameScenes = "Lobby";

    constructor() {
        super();
        this.background.style.backgroundColor = "black";
        this.context.font = "50px monospace";
        this.setupOverlay();
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
        for (let i: number = 0; i < PlayerState.allPlayers.length; i++) {
            this.context.fillStyle = this.convertColorToHex(PlayerState.allPlayers[i].color);
            this.context.fillText(PlayerState.allPlayers[i].name, 0, (i + 1) * 50);
        }

    }

    private convertColorToHex(color: PlayerColors): string {
        switch (color) {
            case "blue":
                return ConstantsWeb.BLUE;
            case "red":
                return ConstantsWeb.RED;
            case "green":
                return ConstantsWeb.GREEN;
            case "purple":
                return ConstantsWeb.PURPLE;
            case "pink":
                return ConstantsWeb.PINK;
            case "yellow":
                return ConstantsWeb.YELLOW;
            case "orange":
                return ConstantsWeb.ORANGE;
            case "brown":
                return ConstantsWeb.BROWN;
            default:
                return "#FFFFFF";
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