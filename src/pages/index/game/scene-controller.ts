import {GameScenes} from "../../../beam-bots-shared/types";
import {Lobby} from "./scenes/lobby";
import {ErrorService} from "../../../shared/services/error-service";
import {IGameScene} from "./i-game-scene";
import {MinigameIceCircle} from "./scenes/minigame-ice-circle";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";

export class SceneController {
    private static scene: IGameScene | null;

    public static initialize(): void {
        this.scene = null;
    }

    public static handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        const type: CommunicationObjectTypesServerToClient = communicationTypeAndObject.type as CommunicationObjectTypesServerToClient;

        switch (type) {
            case "SetLobbyScene":
                this.setScene("Lobby");
                return;
        }

        if (this.scene == null) {
            throw ErrorService.error(1011, `Communication type passed to SceneController, when scene is null '${communicationTypeAndObject.type}'`);
        }

        this.scene.handleCommunication(communicationTypeAndObject);
    }

    public static setScene(scene: GameScenes, object: null = null): void {
        this.scene?.destroy();

        switch (scene) {
            case "Lobby":
                this.scene = new Lobby();
                break;
            case "MinigameIceCircle":
                this.scene = new MinigameIceCircle();
                break;
            default:
                throw ErrorService.error(1010, `Unknown scene '${scene}'`);
        }

        //Async
        this.scene.startLoop();
    }
}