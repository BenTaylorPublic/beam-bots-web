import {io, Socket} from "socket.io-client";
import DisconnectReason = Socket.DisconnectReason;
import {ErrorService} from "../../shared/services/error-service";
import {PlayerState} from "./game/player-state";
import {CommunicationTypeAndObject} from "../../beam-bots-shared/communication-objects/communication-object";

class IndexView {

    public static initialize(): void {
        this.setupSocket();
    }

    private static setupSocket(): void {

        const serverIp: string | null = localStorage.getItem("serverIp");
        const serverPort: string | null = localStorage.getItem("serverPort");
        const password: string | null = localStorage.getItem("password");
        const username: string | null = localStorage.getItem("username");
        if (serverIp == null) {
            throw ErrorService.error(1004, "serverIp is null, go to /settings.html");
        }
        if (serverPort == null) {
            throw ErrorService.error(1005, "serverPort is null, go to /settings.html");
        }
        if (password == null) {
            throw ErrorService.error(1006, "password is null, go to /settings.html");
        }
        if (username == null) {
            throw ErrorService.error(1007, "username is null, go to /settings.html");
        }

        const socket: Socket = io(`http://${serverIp}:${serverPort}`);
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

}

IndexView.initialize();