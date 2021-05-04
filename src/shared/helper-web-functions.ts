import {ConstantsWeb} from "./constants-web";
import {PlayerColors} from "../beam-bots-shared/types";

export class HelperWebFunctions {

    public static async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(() => resolve(1), ms));
    }

    public static convertColorToHexcode(color: PlayerColors, number: number = 1): string {
        switch (color) {
            case "blue":
                switch (number) {
                    case 2:
                        return ConstantsWeb.BLUE2;
                    case 3:
                        return ConstantsWeb.BLUE3;
                    case 4:
                        return ConstantsWeb.BLUE4;
                    default:
                        return ConstantsWeb.BLUE1;
                }
            case "red":
                switch (number) {
                    case 2:
                        return ConstantsWeb.RED2;
                    case 3:
                        return ConstantsWeb.RED3;
                    case 4:
                        return ConstantsWeb.RED4;
                    default:
                        return ConstantsWeb.RED1;
                }
            case "green":
                switch (number) {
                    case 2:
                        return ConstantsWeb.GREEN2;
                    case 3:
                        return ConstantsWeb.GREEN3;
                    case 4:
                        return ConstantsWeb.GREEN4;
                    default:
                        return ConstantsWeb.GREEN1;
                }
            case "purple":
                switch (number) {
                    case 2:
                        return ConstantsWeb.PURPLE2;
                    case 3:
                        return ConstantsWeb.PURPLE3;
                    case 4:
                        return ConstantsWeb.PURPLE4;
                    default:
                        return ConstantsWeb.PURPLE1;
                }
            case "pink":
                switch (number) {
                    case 2:
                        return ConstantsWeb.PINK2;
                    case 3:
                        return ConstantsWeb.PINK3;
                    case 4:
                        return ConstantsWeb.PINK4;
                    default:
                        return ConstantsWeb.PINK1;
                }
            case "yellow":
                switch (number) {
                    case 2:
                        return ConstantsWeb.YELLOW2;
                    case 3:
                        return ConstantsWeb.YELLOW3;
                    case 4:
                        return ConstantsWeb.YELLOW4;
                    default:
                        return ConstantsWeb.YELLOW1;
                }
            case "orange":
                switch (number) {
                    case 2:
                        return ConstantsWeb.ORANGE2;
                    case 3:
                        return ConstantsWeb.ORANGE3;
                    case 4:
                        return ConstantsWeb.ORANGE4;
                    default:
                        return ConstantsWeb.ORANGE1;
                }
            case "brown":
                switch (number) {
                    case 2:
                        return ConstantsWeb.BROWN2;
                    case 3:
                        return ConstantsWeb.BROWN3;
                    case 4:
                        return ConstantsWeb.BROWN4;
                    default:
                        return ConstantsWeb.BROWN1;
                }
        }
    }

    public static replaceColorInImage(image: HTMLImageElement, colorsToReplace: string[], colosrToInput: string[]): HTMLImageElement {
        if (colorsToReplace.length !== colosrToInput.length) {
            throw Error("Color lengths are off");
        }

        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw Error("ctx is null");
        }
        ctx.drawImage(image, 0, 0);
        const oldColors: number[][] = [];
        const newColors: number[][] = [];

        for (let i: number = 0; i < colorsToReplace.length; i++) {
            oldColors.push(HelperWebFunctions.convertHexToRgb(colorsToReplace[i]));
            newColors.push(HelperWebFunctions.convertHexToRgb(colosrToInput[i]));
        }

        const imageData: ImageData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        for (let i: number = 0; i < imageData.data.length; i += 4) {
            for (let j: number = 0; j < oldColors.length; j++) {
                if (imageData.data[i] === oldColors[j][0] &&
                    imageData.data[i + 1] === oldColors[j][1] &&
                    imageData.data[i + 2] === oldColors[j][2]
                ) {
                    imageData.data[i] = newColors[j][0];
                    imageData.data[i + 1] = newColors[j][1];
                    imageData.data[i + 2] = newColors[j][2];
                }
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