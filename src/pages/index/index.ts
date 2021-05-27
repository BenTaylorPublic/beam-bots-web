import {io, Socket} from "socket.io-client";
import {ErrorService} from "../../shared/services/error-service";
import {PlayerState} from "./game/player-state";
import {CommunicationTypeAndObject} from "../../beam-bots-shared/communication-objects/communication-object";
import {ConstantsWeb} from "../../shared/constants-web";
import {KeybindsController} from "./game/keybinds-controller";
import {HttpService} from "../../shared/services/http-service";
import {AudioController} from "./game/audio-controller";
import {KeyboardEventKeyState} from "../../shared/types";
import {Sconstants} from "../../beam-bots-shared/sconstants";
import {SceneController} from "./game/scene-controller";
import DisconnectReason = Socket.DisconnectReason;

export class IndexView {
    public static pingDiv: HTMLDivElement;
    private static escapeMenu: HTMLDivElement;
    private static showPingCheckbox: HTMLInputElement;
    private static volumeRange: HTMLInputElement;
    private static volumeNumber: HTMLSpanElement;
    private static escapeMenuShowing: boolean;
    private static resizeTimeout: number | null;
    private static fullscreenButton: HTMLButtonElement;

    public static initialize(): void {
        this.escapeMenuShowing = false;
        this.resizeTimeout = null;

        AudioController.initialize();
        HttpService.initialize();
        this.setupDom();
        this.setupSocket();
        KeybindsController.initialize();
        KeybindsController.registerKeyCallback("`", this.toggleEscapeMenu.bind(this));
    }

    private static setupSocket(): void {
        const username: string | null = localStorage.getItem("username");
        if (username == null) {
            throw ErrorService.error(1007, "username is null, go to https://bentaylor.dev/beam-bots/settings");
        } else if (username.length > Sconstants.MAX_NAME_LENGTH) {
            throw ErrorService.error(1014, `Username max length is ${Sconstants.MAX_NAME_LENGTH}, go to https://bentaylor.dev/beam-bots/settings`);
        }

        const password: string | null = localStorage.getItem("password");
        if (password == null) {
            throw ErrorService.error(1015, "password is null, go to https://bentaylor.dev/beam-bots/settings");
        }

        const socket: Socket = io(HttpService.serverUrl);
        PlayerState.initialize(socket);

        socket.on("connect", () => {
            PlayerState.connected(username, password);
        });

        socket.on("disconnect", (reason: DisconnectReason) => {
            throw ErrorService.error(1003, `Connection lost, reason: ${reason}`);
        });

        socket.on("communication", (communicationTypeAndObject: CommunicationTypeAndObject) => {
            PlayerState.handleCommunication(communicationTypeAndObject);
        });
    }

    private static setupDom(): void {
        this.fullscreenButton = document.getElementById("fullscreen") as HTMLButtonElement;

        this.detectSizing();

        const clientVersionDiv: HTMLDivElement = document.getElementById("clientVersion") as HTMLDivElement;
        clientVersionDiv.innerText = `Client v${ConstantsWeb.VERSION}`;

        const closeEscapeMenuButton: HTMLButtonElement = document.getElementById("escapeClose") as HTMLButtonElement;
        closeEscapeMenuButton.onclick = this.closeEscapeMenu.bind(this);

        this.escapeMenu = document.getElementById("escapeMenu") as HTMLDivElement;
        this.showPingCheckbox = document.getElementById("showPing") as HTMLInputElement;
        this.showPingCheckbox.onchange = this.toggleShowPing.bind(this);
        this.pingDiv = document.getElementById("ping") as HTMLDivElement;
        const showPing: string | null = localStorage.getItem("showPing");
        if (showPing === "true") {
            this.showPingCheckbox.checked = true;
            this.pingDiv.classList.remove("displayNone");
        } else {
            this.showPingCheckbox.checked = false;
            this.pingDiv.classList.add("displayNone");
        }

        this.volumeRange = document.getElementById("volume") as HTMLInputElement;
        this.volumeNumber = document.getElementById("volumeNumber") as HTMLSpanElement;
        const volumeString: string | null = localStorage.getItem("volume");
        const volume: number = volumeString == null ? ConstantsWeb.DEFAULT_VOLUME : Number(volumeString);
        this.volumeRange.value = volume.toString();
        AudioController.setVolume(volume);
        this.volumeRange.onchange = this.changeVolume.bind(this);
        this.volumeNumber.innerText = volume.toString();

        const fullscreenButton: HTMLButtonElement = document.getElementById("fullscreen") as HTMLButtonElement;
        fullscreenButton.onclick = this.fullscreen.bind(this);

        document.body.onresize = this.handleResizing.bind(this);
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

    private static closeEscapeMenu(): void {
        this.escapeMenuShowing = false;
        this.escapeMenu.classList.add("displayNone");
    }

    private static fullscreen(): void {
        const body: HTMLBodyElement = document.body as HTMLBodyElement;

        if (document.fullscreenElement != null) {
            document.exitFullscreen();
            this.fullscreenButton.innerText = "Fullscreen";
        } else {
            body.requestFullscreen();
            this.fullscreenButton.innerText = "Exit Fullscreen";
        }
    }

    private static toggleShowPing(): void {
        if (this.showPingCheckbox.checked) {
            localStorage.setItem("showPing", "true");
            this.pingDiv.classList.remove("displayNone");
        } else {
            localStorage.setItem("showPing", "false");
            this.pingDiv.classList.add("displayNone");
        }
    }

    private static changeVolume(): void {
        const volume: number = Number(this.volumeRange.value);
        AudioController.setVolume(volume);
        this.volumeNumber.innerText = volume.toString();
        localStorage.setItem("volume", volume.toString());
    }

    private static handleResizing(): void {
        if (this.resizeTimeout != null) {
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
            this.detectSizing();
            this.resizeTimeout = null;
        }, 100);
    }

    private static detectSizing(): void {
        //Update menu button
        if (document.fullscreenElement != null) {
            this.fullscreenButton.innerText = "Exit Fullscreen";
        } else {
            this.fullscreenButton.innerText = "Fullscreen";
        }

        const height: number = window.innerHeight;
        const width: number = window.innerWidth;

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

        if (canvas.width === canvasWidth &&
            canvas.height === canvasHeight) {
            //Don't bother
            SceneController.updateScaling();
            return;
        }

        canvas.height = canvasHeight;
        canvas.style.height = `${canvas.height}px`;
        canvas.width = canvasWidth;
        canvas.style.width = `${canvas.width}px`;

        const overlay: HTMLDivElement = document.getElementById("overlay") as HTMLDivElement;
        overlay.style.height = `${Sconstants.GAME_LOGIC_HEIGHT}px`;
        overlay.style.width = `${Sconstants.GAME_LOGIC_WIDTH}px`;

        const background: HTMLDivElement = document.getElementById("background") as HTMLDivElement;
        background.style.height = `${canvas.height}px`;
        background.style.width = `${canvas.width}px`;

        const escapeMenu: HTMLDivElement = document.getElementById("escapeMenu") as HTMLDivElement;
        escapeMenu.style.height = `${canvas.height}px`;
        escapeMenu.style.width = `${canvas.width}px`;

        SceneController.updateScaling();
    }
}

IndexView.initialize();