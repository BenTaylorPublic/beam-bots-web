import {io, Socket} from "socket.io-client";
import {ErrorService} from "../../shared/services/error-service";
import {PlayerState} from "./game/player-state";
import {CommunicationTypeAndObject} from "../../beam-bots-shared/communication-objects/communication-object";
import {ConstantsWeb} from "../../shared/constants-web";
import {KeybindsController} from "./game/keybinds-controller";
import {HttpService} from "../../shared/services/http-service";
import DisconnectReason = Socket.DisconnectReason;

class IndexView {

    public static initialize(): void {
        HttpService.initialize();
        this.setupSocket();
        this.setupDom();
        KeybindsController.initialize();
    }

    private static setupSocket(): void {
        const username: string | null = localStorage.getItem("username");
        if (username == null) {
            throw ErrorService.error(1007, "username is null, go to https://bentaylor.dev/beam-bots/settings");
        }

        const socket: Socket = io(HttpService.serverUrl);
        PlayerState.initialize(socket);

        socket.on("connect", () => {
            PlayerState.connected(username);
        });

        socket.on("disconnect", (reason: DisconnectReason) => {
            throw ErrorService.error(1003, `Connection lost, reason: ${reason}`);
        });

        socket.on("communication", (communicationTypeAndObject: CommunicationTypeAndObject) => {
            PlayerState.handleCommunication(communicationTypeAndObject);
        });
    }

    private static setupDom(): void {
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.height = ConstantsWeb.CANVAS_HEIGHT;
        canvas.style.height = `${canvas.height}px`;
        canvas.width = ConstantsWeb.CANVAS_WIDTH;
        canvas.style.width = `${canvas.width}px`;

        const overlay: HTMLDivElement = document.getElementById("overlay") as HTMLDivElement;
        overlay.style.height = `${canvas.height}px`;
        overlay.style.width = `${canvas.width}px`;

        const background: HTMLDivElement = document.getElementById("background") as HTMLDivElement;
        background.style.height = `${canvas.height}px`;
        background.style.width = `${canvas.width}px`;
    }

}

IndexView.initialize();