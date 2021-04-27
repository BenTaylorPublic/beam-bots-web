type TCallback<T> = (data: T) => void;
type VoidCallback = () => void;
type KeyboardEventKeyState = "DOWN" | "UP";
type KeyboardEventCallback = (data: KeyboardEventKeyState) => void;