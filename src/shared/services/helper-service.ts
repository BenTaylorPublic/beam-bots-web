import {Constants} from "../constants";
import {Sconstants} from "../../beam-bots-shared/sconstants";

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

    public static async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(() => resolve(1), ms));
    }
}