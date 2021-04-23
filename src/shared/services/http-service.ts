import {ErrorService} from "./error-service";

export class HttpService {
    public static get<T>(url: string, password: string, successCallback: TCallback<T> | VoidCallback, errorCallback: VoidCallback | null = null): void {
        const request = new XMLHttpRequest();
        request.onloadend = () => this.handleAllResponses<T>(request, successCallback, errorCallback, url);
        request.open("GET", url);

        request.setRequestHeader("Authorization", password);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Response-Type", "application/json");
        request.send();
    }

    public static post<T>(url: string, successCallback: TCallback<T> | VoidCallback, errorCallback: VoidCallback | null = null): void {
        const request = new XMLHttpRequest();
        request.onloadend = () => this.handleAllResponses<T>(request, successCallback, errorCallback, url);
        request.open("POST", url);
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
}