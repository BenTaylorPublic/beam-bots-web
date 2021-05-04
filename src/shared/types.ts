import {PlayerColors} from "beam-bots-shared/types";
import {AnimatedSpriteSheet} from "../pages/index/game/animated-sprite-sheet";

export type TCallback<T> = (data: T) => void;
export type VoidCallback = () => void;
export type KeyboardEventKeyState = "DOWN" | "UP";
export type KeyboardEventCallback = (data: KeyboardEventKeyState) => void;
export type MgIceCircleColorToAnimatedSpriteMap = {
    [color in PlayerColors]: AnimatedSpriteSheet;
};