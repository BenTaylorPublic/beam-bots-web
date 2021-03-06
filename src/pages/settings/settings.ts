import {HttpService} from "../../shared/services/http-service";
import {ErrorService} from "../../shared/services/error-service";
import {ConstantsWeb} from "../../shared/constants-web";
import {Sconstants} from "../../beam-bots-shared/sconstants";

class SettingsView {
    private static serverUrl: HTMLInputElement;
    private static password: HTMLInputElement;
    private static username: HTMLInputElement;
    private static testConnectionButton: HTMLButtonElement;

    public static initialize(): void {
        HttpService.initialize(true);
        this.getDomElements();
        this.addEventListeners();
        this.getValuesFromStorage();

        if (ConstantsWeb.USE_HTTPS_SERVER) {
            this.serverUrl.value = HttpService.serverUrl;
            this.serverUrl.disabled = true;
        }
    }

    private static getValuesFromStorage(): void {
        let value: string | null = localStorage.getItem("serverUrl");
        this.serverUrl.value = value == null ? "" : value;
        value = localStorage.getItem("password");
        this.password.value = value == null ? "" : value;
        value = localStorage.getItem("username");
        this.username.value = value == null ? "" : value;
    }

    private static getDomElements(): void {
        this.serverUrl = document.getElementById("serverUrl") as HTMLInputElement;
        this.password = document.getElementById("password") as HTMLInputElement;
        this.username = document.getElementById("username") as HTMLInputElement;
        this.testConnectionButton = document.getElementById("testConnectionButton") as HTMLButtonElement;
    }

    private static addEventListeners(): void {
        this.testConnectionButton.addEventListener("click", this.testConnection.bind(this));
    }

    private static testConnection(): void {
        const lettersRegex: RegExp = new RegExp(/[^a-zA-Z]/);
        if (lettersRegex.test(this.username.value)) {
            throw ErrorService.error(1001, "Only A-Z in your name please");
        }
        if (this.username.value.length > Sconstants.MAX_NAME_LENGTH) {
            throw ErrorService.error(1013, `Max name length: ${Sconstants.MAX_NAME_LENGTH}`);
        }
        if (!ConstantsWeb.USE_HTTPS_SERVER) {
            localStorage.setItem("serverUrl", this.serverUrl.value);
            HttpService.serverUrl = this.serverUrl.value;
        }
        localStorage.setItem("password", this.password.value);
        HttpService.setPassword(this.password.value);
        const url: string = `/test-connection/${this.username.value}`;
        HttpService.get(url, this.password.value, this.testConnectionResultSuccess.bind(this), this.testConnectionResultError.bind(this));
    }

    private static testConnectionResultSuccess(): void {
        localStorage.setItem("username", this.username.value);
        alert("Success, redirecting you to index");
        if (ConstantsWeb.USE_HTTPS_SERVER) {
            location.href = "/beam-bots";
        } else {
            location.href = "/";
        }
    }

    private static testConnectionResultError(): void {
        throw ErrorService.error(1002, "Test connection failed, please check your details");
    }
}

SettingsView.initialize();