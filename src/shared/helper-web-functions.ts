import {Point2D} from "../beam-bots-shared/interfaces";
import {Sconstants} from "../beam-bots-shared/sconstants";
import {ConstantsWeb} from "./constants-web";
import {PlayerColors} from "../beam-bots-shared/types";

export class HelperWebFunctions {
    private static conversionRateForCoords: number;

    public static initialize(): void {
        this.conversionRateForCoords = ConstantsWeb.CANVAS_HEIGHT / Sconstants.GAME_LOGIC_HEIGHT;
    }

    public static convertGameLogicCoordsToLocalCoords(originalPoint: Point2D): Point2D {
        return {
            x: Math.floor(originalPoint.x * this.conversionRateForCoords),
            y: Math.floor(originalPoint.y * this.conversionRateForCoords)
        };
    }

    public static convertGameLogicPixelsToLocalPixels(pixels: number): number {
        return Math.floor(pixels * this.conversionRateForCoords);
    }

    public static async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(() => resolve(1), ms));
    }

    public static convertColorToHexcode(color: PlayerColors): string {
        switch (color) {
            case "blue":
                return ConstantsWeb.BLUE;
            case "red":
                return ConstantsWeb.RED;
            case "green":
                return ConstantsWeb.GREEN;
            case "purple":
                return ConstantsWeb.PURPLE;
            case "pink":
                return ConstantsWeb.PINK;
            case "yellow":
                return ConstantsWeb.YELLOW;
            case "orange":
                return ConstantsWeb.ORANGE;
            case "brown":
                return ConstantsWeb.BROWN;
        }
    }
}