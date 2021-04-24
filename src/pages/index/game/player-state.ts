import {Socket} from "socket.io-client";
import {
    Player,
    UpdatedPlayerList
} from "../../../beam-bots-shared/communication-objects/server-to-client/updated-player-list";
import {SetName} from "../../../beam-bots-shared/communication-objects/client-to-server/set-name";
import {
    CommunicationObject,
    CommunicationObjectTypes,
    CommunicationObjectTypesClientToServer,
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {SceneController} from "./scene-controller";

export class PlayerState {
    public static allPlayers: Player[];
    private static socket: Socket;
    private static player: Player;

    public static initialize(socket: Socket): void {
        this.allPlayers = [];
        this.socket = socket;
        SceneController.initialize();
    }

    public static handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        const type: CommunicationObjectTypesServerToClient = communicationTypeAndObject.type as CommunicationObjectTypesServerToClient;
        switch (type) {
            case "UpdatedPlayerList":
                this.updatedPlayerList(communicationTypeAndObject.object as UpdatedPlayerList);
                break;
            default:
                SceneController.handleCommunication(communicationTypeAndObject);
                break;
        }
    }

    public static connected(username: string): void {
        this.player = {
            id: -1,
            name: username,
            color: "blue"
        };
        this.sendCommunication<SetName>("SetName", {name: username});
    }

    public static disconnected(): void {
    }

    public static sendCommunication<T>(type: CommunicationObjectTypesClientToServer, object: T): void {
        const communicationTypeAndObject: CommunicationTypeAndObject = {
            type: type,
            object: object
        };
        this.socket.emit("communication", communicationTypeAndObject);
    }

    private static updatedPlayerList(newPlayerList: UpdatedPlayerList): void {
        this.allPlayers = newPlayerList.players;
        for (let i: number = 0; i < this.allPlayers.length; i++) {
            if (this.allPlayers[i].name === this.player.name) {
                this.player = this.allPlayers[i];
                return;
            }
        }
    }
}