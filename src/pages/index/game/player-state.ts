import {Socket} from "socket.io-client";
import {UpdatedPlayerList} from "../../../beam-bots-shared/communication-objects/server-to-client/updated-player-list";
import {ClientToServerHello} from "../../../beam-bots-shared/communication-objects/client-to-server/client-to-server-hello";
import {
    CommunicationObjectTypesClientToServer,
    CommunicationObjectTypesServerToClient,
    CommunicationTypeAndObject
} from "../../../beam-bots-shared/communication-objects/communication-object";
import {SceneController} from "./scene-controller";
import {Player} from "../../../beam-bots-shared/interfaces";
import {ConstantsWeb} from "../../../shared/constants-web";
import {Ping} from "../../../beam-bots-shared/communication-objects/client-to-server/ping";
import {Pong} from "../../../beam-bots-shared/communication-objects/server-to-client/pong";
import {ServerToClientHello} from "../../../beam-bots-shared/communication-objects/server-to-client/server-to-client-hello";
import {IndexView} from "../index";

export class PlayerState {
    public static allPlayers: Player[];
    public static player: Player;
    private static socket: Socket;

    public static initialize(socket: Socket): void {
        this.allPlayers = [];
        this.socket = socket;
        SceneController.initialize();
        this.startPinging();
    }

    public static handleCommunication(communicationTypeAndObject: CommunicationTypeAndObject): void {
        const type: CommunicationObjectTypesServerToClient = communicationTypeAndObject.type as CommunicationObjectTypesServerToClient;
        switch (type) {
            case "Pong":
                this.pong(communicationTypeAndObject.object as Pong);
                break;
            case "UpdatedPlayerList":
                this.updatedPlayerList(communicationTypeAndObject.object as UpdatedPlayerList);
                break;
            case "ServerToClientHello":
                this.serverToClientHello(communicationTypeAndObject.object as ServerToClientHello);
                break;
            default:
                SceneController.handleCommunication(communicationTypeAndObject);
                break;
        }
    }

    public static connected(username: string, password: string): void {
        this.player = {
            id: -1,
            name: username,
            color: "blue",
            admin: false
        };
        this.sendCommunication<ClientToServerHello>("ClientToServerHello", {
            name: username,
            password: password
        });
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

    private static async startPinging(): Promise<void> {
        setInterval(() => {
            const ping: Ping = {
                startTime: Date.now()
            };
            this.sendCommunication("Ping", ping);
        }, ConstantsWeb.PING_FREQUENCY);
    }

    private static pong(pong: Pong): void {
        IndexView.pingDiv.innerText = `Ping: ${Date.now() - pong.startTime}ms`;
    }

    private static serverToClientHello(hello: ServerToClientHello): void {
        const serverVersionDiv: HTMLDivElement = document.getElementById("serverVersion") as HTMLDivElement;
        serverVersionDiv.innerText = `Server v${hello.serverVersion}`;
    }
}