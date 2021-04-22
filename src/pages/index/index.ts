import {ExampleService} from "../../shared/example-service";
import {io} from "socket.io-client";

class IndexView {

    public static initialize(): void {
        ExampleService.logHelloWorld();

        const socket = io("http://localhost:8181");
        socket.on("connect", () => {
            console.log(socket.id);
        });
    }
}

IndexView.initialize();