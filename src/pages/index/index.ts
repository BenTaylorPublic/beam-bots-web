import {io, Socket} from "socket.io-client";
import {ErrorService} from "../../shared/services/error-service";
import {PlayerState} from "./game/player-state";
import {CommunicationTypeAndObject} from "../../beam-bots-shared/communication-objects/communication-object";
import {ConstantsWeb} from "../../shared/constants-web";
import {KeybindsController} from "./game/keybinds-controller";
import {HttpService} from "../../shared/services/http-service";
import DisconnectReason = Socket.DisconnectReason;

class IndexView {
    private static escapeMenu: HTMLDivElement;
    private static escapeMenuShowing: boolean;

    public static initialize(): void {
        this.escapeMenuShowing = false;

        HttpService.initialize();
        this.setupSocket();
        this.setupDom();
        KeybindsController.initialize();
        KeybindsController.registerKeyCallback("escape", this.toggleEscapeMenu.bind(this));
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
        const body: HTMLElement = document.body;
        const html: HTMLElement = document.documentElement;

        const height: number = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const width: number = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

        let canvasWidth: number = 0;
        let canvasHeight: number = 0;
        if (width / height > 16 / 9) {
            //Width is highest, so it'll be pillar boxed
            canvasHeight = height;
            canvasWidth = Math.ceil(height * (16 / 9));
        } else {
            //Height is highest, so it'll be letter boxed
            canvasWidth = width;
            canvasHeight = Math.ceil(width * (9 / 16));
        }
        if (canvasHeight < ConstantsWeb.MINIMUM_CANVAS_HEIGHT) {
            canvasHeight = ConstantsWeb.MINIMUM_CANVAS_HEIGHT;
        }
        if (canvasWidth < ConstantsWeb.MINIMUM_CANVAS_WIDTH) {
            canvasWidth = ConstantsWeb.MINIMUM_CANVAS_WIDTH;
        }

        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.height = canvasHeight;
        canvas.style.height = `${canvas.height}px`;
        canvas.width = canvasWidth;
        canvas.style.width = `${canvas.width}px`;

        const overlay: HTMLDivElement = document.getElementById("overlay") as HTMLDivElement;
        overlay.style.height = `${canvas.height}px`;
        overlay.style.width = `${canvas.width}px`;

        const background: HTMLDivElement = document.getElementById("background") as HTMLDivElement;
        background.style.height = `${canvas.height}px`;
        background.style.width = `${canvas.width}px`;

        const escapeMenu: HTMLDivElement = document.getElementById("escapeMenu") as HTMLDivElement;
        escapeMenu.style.height = `${canvas.height}px`;
        escapeMenu.style.width = `${canvas.width}px`;

        const clientVersionDiv: HTMLDivElement = document.getElementById("clientVersion") as HTMLDivElement;
        clientVersionDiv.innerText = `Client v${ConstantsWeb.VERSION}`;

        this.escapeMenu = document.getElementById("escapeMenu") as HTMLDivElement;
    }

    private static toggleEscapeMenu(data: KeyboardEventKeyState): void {
        if (data === "DOWN") {
            if (this.escapeMenuShowing) {
                this.escapeMenuShowing = false;
                this.escapeMenu.classList.add("displayNone");
            } else {
                this.escapeMenuShowing = true;
                this.escapeMenu.classList.remove("displayNone");
            }
        }
    }
}

IndexView.initialize();