import {Constants} from "../constants";
import {Sconstants} from "../../beam-bots-shared/sconstants";
import {Point2D} from "../../beam-bots-shared/interfaces";
import {PlayerColors} from "../../beam-bots-shared/types";

export class HelperService {
    private static conversionRateForCoords: number;

    public static initialize(): void {
        this.conversionRateForCoords = Constants.CANVAS_HEIGHT / Sconstants.GAME_LOGIC_HEIGHT;
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
                return Constants.BLUE;
            case "red":
                return Constants.RED;
            case "green":
                return Constants.GREEN;
            case "purple":
                return Constants.PURPLE;
            case "pink":
                return Constants.PINK;
            case "yellow":
                return Constants.YELLOW;
            case "orange":
                return Constants.ORANGE;
            case "brown":
                return Constants.BROWN;
        }
    }
}