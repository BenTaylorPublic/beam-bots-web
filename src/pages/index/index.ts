import {ExampleService} from "../../shared/example-service";

class IndexView {

    public static initialize(): void {
        ExampleService.logHelloWorld();
    }
}

IndexView.initialize();