import {HttpService} from "../../shared/services/http-service";

class AdminView {
    public static initialize(): void {
        HttpService.initialize();
    }

}

AdminView.initialize();