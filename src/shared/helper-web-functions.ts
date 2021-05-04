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

    public static replaceColorInImage(image: HTMLImageElement, color1: string, color2: string): HTMLImageElement | null {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            return null;
        }
        ctx.drawImage(image, 0, 0);

        const oldColor: number[] = HelperWebFunctions.convertHexToRgb(color1);
        const newColor: number[] = HelperWebFunctions.convertHexToRgb(color2);
        const imageData: ImageData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        for (let i: number = 0; i < imageData.data.length; i += 4) {
            // is this pixel the old rgb?
            if (imageData.data[i] === oldColor[0] &&
                imageData.data[i + 1] === oldColor[1] &&
                imageData.data[i + 2] === oldColor[2]
            ) {
                // change to your new rgb
                imageData.data[i] = newColor[0];
                imageData.data[i + 1] = newColor[1];
                imageData.data[i + 2] = newColor[2];
            }
        }
        // put the altered data back on the canvas
        ctx.putImageData(imageData, 0, 0);
        const img: HTMLImageElement = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        return img;
    }

    public static convertHexToRgb(hex: string): number[] {
        hex = hex.replace("#", "");
        const rString: string = `${hex.charAt(0)}${hex.charAt(1)}`;
        const gString: string = `${hex.charAt(2)}${hex.charAt(3)}`;
        const bString: string = `${hex.charAt(4)}${hex.charAt(5)}`;
        const r: number = parseInt(rString, 16);
        const g: number = parseInt(gString, 16);
        const b: number = parseInt(bString, 16);

        return [r, g, b];
    }
}