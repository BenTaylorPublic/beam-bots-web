import {ConstantsWeb} from "./constants-web";
import {PlayerColors} from "../beam-bots-shared/types";

export class HelperWebFunctions {

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