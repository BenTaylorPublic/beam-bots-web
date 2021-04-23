import {HttpService} from "../../shared/services/http-service";
import {ErrorService} from "../../shared/services/error-service";

class SettingsView {
    private static serverIp: HTMLInputElement;
    private static serverPort: HTMLInputElement;
    private static password: HTMLInputElement;
    private static username: HTMLInputElement;
    private static testConnectionButton: HTMLButtonElement;

    public static initialize(): void {
        this.getDomElements();
        this.addEventListeners();
        this.getValuesFromStorage();
    }

    private static getValuesFromStorage(): void {
        let value: string | null = localStorage.getItem("serverIp");
        this.serverIp.value = value == null ? "" : value;
        value = localStorage.getItem("serverPort");
        this.serverPort.value = value == null ? "" : value;
        value = localStorage.getItem("password");
        this.password.value = value == null ? "" : value;
        value = localStorage.getItem("username");
        this.username.value = value == null ? "" : value;
    }

    private static getDomElements(): void {
        this.serverIp = document.getElementById("serverIp") as HTMLInputElement;
        this.serverPort = document.getElementById("serverPort") as HTMLInputElement;
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
        const url: string = `http://${this.serverIp.value}:${this.serverPort.value}/test-connection/${this.username.value}`;
        HttpService.get(url, this.password.value, this.testConnectionResultSuccess.bind(this), this.testConnectionResultError.bind(this));
    }

    private static testConnectionResultSuccess(): void {
        localStorage.setItem("serverIp", this.serverIp.value);
        localStorage.setItem("serverPort", this.serverPort.value);
        localStorage.setItem("password", this.password.value);
        localStorage.setItem("username", this.username.value);
        alert("Success, redirecting you to index");
        location.href = "/";
    }

    private static testConnectionResultError(): void {
        throw ErrorService.error(1002, "Test connection failed, please check your details");
    }
}

SettingsView.initialize();