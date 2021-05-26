import {Rectangle} from "../../../beam-bots-shared/interfaces";
import {Sconstants} from "../../../beam-bots-shared/sconstants";
import {CanvasContextWrapper} from "./canvas-context-wrapper";
import {ConstantsWeb} from "../../../shared/constants-web";
import {VoidCallback} from "../../../shared/types";

export class OverlayWrapper {
    private overlay: HTMLDivElement;

    constructor(div: HTMLDivElement) {
        this.overlay = div;
        this.updateScaling();
    }

    public clear(): void {
        this.overlay.innerHTML = "";
    }

    public appendChild(element: HTMLElement): void {
        this.overlay.appendChild(element);
    }

    public addClickableRectangle(rect: Rectangle, clickCallback: VoidCallback): void {
        const newDiv: HTMLDivElement = document.createElement("div");
        newDiv.style.position = "absolute";
        newDiv.style.top = rect.topLeft.y.toString() + "px";
        newDiv.style.left = rect.topLeft.x.toString() + "px";
        newDiv.style.width = (rect.topRight.x - rect.topLeft.x).toString() + "px";
        newDiv.style.height = (rect.bottomLeft.y - rect.topLeft.y).toString() + "px";
        newDiv.style.cursor = "pointer";
        if (ConstantsWeb.DEBUG_OVERLAY_HITBOX_TEST) {
            newDiv.style.backgroundColor = "red";
        }
        newDiv.onclick = clickCallback;
        this.overlay.appendChild(newDiv);
    }

    public updateScaling(): void {
        const widthRatio: number = CanvasContextWrapper.width / Sconstants.GAME_LOGIC_WIDTH;
        this.overlay.style.scale = widthRatio.toString();

        const bodyExtraWidth: number = window.innerWidth - CanvasContextWrapper.width;
        this.overlay.style.marginLeft = ((bodyExtraWidth / 2) - ((Sconstants.GAME_LOGIC_WIDTH - CanvasContextWrapper.width) / 2)) + "px";
    }
}