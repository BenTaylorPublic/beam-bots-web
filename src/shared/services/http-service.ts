import {ErrorService} from "./error-service";
import {ConstantsWeb} from "../constants-web";
import {TCallback, VoidCallback} from "../types";

export class HttpService {
    public static serverUrl: string;
    private static httpServerPath: string = "/beam-bots-server";
    private static password: string;

    public static initialize(onSettings: boolean = false): void {
        if (ConstantsWeb.USE_HTTPS_SERVER) {
            this.serverUrl = "https://bentaylor.dev";
        } else if (!onSettings) {
            const serverUrl: string | null = localStorage.getItem("serverUrl");
            const password: string | null = localStorage.getItem("password");
            if (serverUrl == null) {
                throw ErrorService.error(1004, "serverUrl is null, go to /beam-bots/settings");
            }
            if (password == null) {
                throw ErrorService.error(1006, "password is null, go to /beam-bots/settings");
            }
            this.serverUrl = serverUrl;
            this.password = password;
        }
    }

    public static setPassword(password: string): void {
        this.password = password;
    }

    public static get<T>(url: string, password: string, successCallback: TCallback<T> | VoidCallback, errorCallback: VoidCallback | null = null): void {
        const request = new XMLHttpRequest();
        request.onloadend = () => this.handleAllResponses<T>(request, successCallback, errorCallback, url);
        request.open("GET", this.getFullUrl(url));

        request.setRequestHeader("Authorization", password);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Response-Type", "application/json");
        request.send();
    }

    public static post<T>(url: string, successCallback: TCallback<T> | VoidCallback, errorCallback: VoidCallback | null = null): void {
        const request = new XMLHttpRequest();
        request.onloadend = () => this.handleAllResponses<T>(request, successCallback, errorCallback, url);
        request.open("POST", this.getFullUrl(url));
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Response-Type", "application/json");
        request.send();
    }

    private static handleAllResponses<T>(request: XMLHttpRequest, successCallbackcallback: TCallback<T> | VoidCallback, errorCallback: VoidCallback | null, route: string): void {
        switch (request.status) {
            case 200:
                successCallbackcallback(JSON.parse(request.response) as T);
                break;
            case 204:
                (successCallbackcallback as VoidCallback)();
                break;
            default:
                console.error(request);
                if (errorCallback != null) {
                    errorCallback();
                } else {
                    throw ErrorService.error(1000, `Route errored and it's not setup to be handled '${route}'`);
                }
                break;
        }
    }

    private static getFullUrl(url: string): string {
        return this.serverUrl + this.httpServerPath + url;
    }
}