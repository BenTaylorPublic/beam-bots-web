import {HttpService} from "../../shared/services/http-service";
import {ErrorService} from "../../shared/services/error-service";
import {SimpleMessage} from "../../beam-bots-shared/interfaces";

class AdminView {
    private static adminPassword: HTMLInputElement;
    private static clientPassword: HTMLInputElement;
    private static adminUsername: HTMLInputElement;

    public static initialize(): void {
        HttpService.initialize();
        this.setupDom();
    }

    private static setupDom(): void {
        const connectButton: HTMLButtonElement = document.getElementById("connectButton") as HTMLButtonElement;
        connectButton.onclick = this.tryConnect.bind(this);
        this.adminPassword = document.getElementById("adminPassword") as HTMLInputElement;
        this.clientPassword = document.getElementById("clientPassword") as HTMLInputElement;
        this.adminUsername = document.getElementById("adminUsername") as HTMLInputElement;

        const adminPasswordFromStorage: string | null = localStorage.getItem("adminPassword");
        if (adminPasswordFromStorage != null) {
            this.adminPassword.value = adminPasswordFromStorage;
            //Try connect
            HttpService.get("/admin/check-password",
                this.adminPassword.value,
                this.testConnectionResultSuccess.bind(this),
                () => {
                    //Ignore result
                });
        }

        const setClientPassword: HTMLButtonElement = document.getElementById("setClientPasswordButton") as HTMLButtonElement;
        setClientPassword.onclick = this.setClientPassword.bind(this);

        const setAdminUsername: HTMLButtonElement = document.getElementById("setAdminUsernameButton") as HTMLButtonElement;
        setAdminUsername.onclick = this.setAdminUsername.bind(this);

        const clearAdminUsername: HTMLButtonElement = document.getElementById("clearAdminUsernameButton") as HTMLButtonElement;
        clearAdminUsername.onclick = this.clearAdminUsername.bind(this);
    }

    private static tryConnect(): void {
        HttpService.get("/admin/check-password", this.adminPassword.value, this.testConnectionResultSuccess.bind(this), this.testConnectionResultError.bind(this));
    }

    private static testConnectionResultSuccess(): void {
        const loginDiv: HTMLDivElement = document.getElementById("adminLogin") as HTMLDivElement;
        loginDiv.classList.add("displayNone");

        const adminContentDiv: HTMLDivElement = document.getElementById("adminContent") as HTMLDivElement;
        adminContentDiv.classList.remove("displayNone");

        localStorage.setItem("adminPassword", this.adminPassword.value);

        HttpService.get<SimpleMessage>("/admin/client-password", this.adminPassword.value, this.clientPasswordResult.bind(this));
    }

    private static clientPasswordResult(result: SimpleMessage): void {
        this.clientPassword.value = result.text;
    }

    private static testConnectionResultError(): void {
        throw ErrorService.error(1016, "Test connection failed, please check your details");
    }

    private static setClientPassword(): void {
        HttpService.put(`/admin/client-password/${this.clientPassword.value}`, this.adminPassword.value, this.alertSuccess.bind(this));
    }

    private static alertSuccess(): void {
        alert("Success");
    }

    private static setAdminUsername(): void {
        HttpService.put(`/admin/admin-username/${this.adminUsername.value}`, this.adminPassword.value, this.alertSuccess.bind(this));
    }

    private static clearAdminUsername(): void {
        HttpService.put("/admin/admin-username/null", this.adminPassword.value, this.alertSuccess.bind(this));
    }
}

AdminView.initialize();