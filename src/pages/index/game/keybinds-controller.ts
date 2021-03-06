import {KeyboardEventCallback, KeyboardEventKeyState} from "../../../shared/types";

export class KeybindsController {
    private static keysToCallbacks: { [key: string]: KeyboardEventCallback[] };

    public static initialize(): void {
        this.keysToCallbacks = {};
        window.onkeydown = this.keydown.bind(this);
        window.onkeyup = this.keyup.bind(this);
    }

    public static registerKeyCallback(key: string, callback: KeyboardEventCallback): void {
        if (this.keysToCallbacks[key] == null) {
            this.keysToCallbacks[key] = [callback];
        } else {
            this.keysToCallbacks[key].push(callback);
        }
    }

    public static removeAllCallbacks(): void {
        //Remove callbacks that aren't the escape menu
        const keys: string[] = Object.keys(this.keysToCallbacks);
        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];
            if (key !== "`") {
                delete this.keysToCallbacks[key];
            }
        }
    }

    private static keyup(keyboardEvent: KeyboardEvent): void {
        this.runCallbacks(keyboardEvent.key.toLowerCase(), "UP");
    }

    private static keydown(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.repeat) {
            //Useless...
            return;
        }
        this.runCallbacks(keyboardEvent.key.toLowerCase(), "DOWN");
    }

    private static runCallbacks(key: string, state: KeyboardEventKeyState): void {
        const callbacks: KeyboardEventCallback[] | null = this.keysToCallbacks[key];
        if (callbacks != null) {
            for (let i: number = 0; i < callbacks.length; i++) {
                callbacks[i](state);
            }
        }
    }
}