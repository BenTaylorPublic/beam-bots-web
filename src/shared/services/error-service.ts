import {HttpService} from "./http-service";

export class ErrorService {
    //Next: 1018
    public static error(code: number, message: string): string {

        try {
            const url: string = `/error-service/${code}`;
            HttpService.post(url, () => {
            }, () => {
            });
        } catch (e) {
            console.error("Post error code to server error: ", e);
        }

        //Check to ensure that this isn't going to popup above an existing error popup
        const existingError: HTMLElement | null = document.getElementById("errorDivBackground");
        if (existingError != null) {
            const errorString: string = `ErrorService: An existing error is already showing, but a new error received (${code}: ${message})`;
            console.error(errorString);
            return errorString;
        }

        const errorDivBackground: HTMLDivElement = document.createElement("div");
        errorDivBackground.id = "errorDivBackground";

        const errorDiv: HTMLDivElement = document.createElement("div");

        //Heading
        const headerDiv: HTMLHeadingElement = document.createElement("h1");
        headerDiv.innerText = "Error";
        errorDiv.appendChild(headerDiv);

        //Error code
        const codeDiv: HTMLDivElement = document.createElement("div");
        codeDiv.innerText = "Code: " + code.toString();
        errorDiv.appendChild(codeDiv);

        //Error message
        const messageDiv: HTMLDivElement = document.createElement("div");
        messageDiv.innerText = "Message: " + message.toString();
        errorDiv.appendChild(messageDiv);

        //Refresh message
        const refreshMessageDiv: HTMLDivElement = document.createElement("div");
        refreshMessageDiv.innerText = "Please refresh to continue";
        refreshMessageDiv.id = "refreshMessage";
        errorDiv.appendChild(refreshMessageDiv);

        const refreshButton: HTMLButtonElement = document.createElement("button");
        refreshButton.innerText = "Refresh";
        refreshButton.addEventListener("click", this.refresh.bind(this));
        errorDiv.appendChild(refreshButton);

        errorDivBackground.appendChild(errorDiv);

        document.body.appendChild(errorDivBackground);

        return message;
    }

    private static refresh(): void {
        window.location.reload();
    }
}