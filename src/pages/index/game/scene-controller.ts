import {GameScenes} from "../../../beam-bots-shared/types";
import {Lobby} from "./scenes/lobby";
import {ErrorService} from "../../../shared/services/error-service";
import {IGameScene} from "./scenes/i-game-scene";
import {MinigameIceCircle} from "./scenes/minigame-ice-circle";
import {
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {SetMinigameIceCircleScene} from "../../../beam-bots-shared/communication-objects/server-to-client/minigame-ice-circle/set-minigame-ice-circle-scene";
import {MinigameBeamGun} from "./scenes/minigame-beam-gun";
import {SetMinigameBeamGunScene} from "../../../beam-bots-shared/communication-objects/server-to-client/minigame-beam-gun/set-minigame-beam-gun-scene";

export class SceneController {
    private static scene: IGameScene | null;

    public static initialize(): void {
        this.scene = null;
    }

    public static updateScaling(): void {
        if (this.scene != null) {
            this.scene.context.updateScaling();
        }
    }

    public static handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        const type: CommunicationObjectTypesServerToClient = communicationTypeAndObject.type as CommunicationObjectTypesServerToClient;

        switch (type) {
            case "SetMinigameIceCircleScene":
                this.setScene("MinigameIceCircle", communicationTypeAndObject.object);
                return;
            case "SetMinigameBeamGunScene":
                this.setScene("MinigameBeamGun", communicationTypeAndObject.object);
                return;
            case "SetLobbyScene":
                this.setScene("Lobby");
                return;
        }

        if (this.scene == null) {
            throw ErrorService.error(1011, `Communication type passed to SceneController, when scene is null '${communicationTypeAndObject.type}'`);
        }

        this.scene.handleCommunication(type, communicationTypeAndObject);
    }

    public static setScene(scene: GameScenes, object: null | any = null): void {
        this.scene?.destroy();

        switch (scene) {
            case "Lobby":
                this.scene = new Lobby();
                break;
            case "MinigameIceCircle":
                this.scene = new MinigameIceCircle(object as SetMinigameIceCircleScene);
                break;
            case "MinigameBeamGun":
                this.scene = new MinigameBeamGun(object as SetMinigameBeamGunScene);
                break;
            default:
                throw ErrorService.error(1010, `Unknown scene '${scene}'`);
        }

        //Async
        this.scene.startLoop();
    }
}