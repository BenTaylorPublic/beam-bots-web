import {SpriteSheet} from "./sprite-sheet";
import {SpriteSheetState} from "../../../shared/interfaces";

export class AnimatedSpriteSheet {
    private spriteSheet: SpriteSheet;
    private lastAnimationTime: number;
    private msDelayBetweenAnimations: number;
    private states: SpriteSheetState[];
    private currentState: SpriteSheetState;
    private currentRow: number;
    private currentColumn: number;
    private currentIndex: number;
    private rows: number;
    private columns: number;

    constructor(imageElement: HTMLImageElement, states: SpriteSheetState[], currentStateName: string, msDelayBetweenAnimations: number, rows: number, columns: number) {
        this.spriteSheet = new SpriteSheet(imageElement, rows, columns);
        this.rows = rows;
        this.columns = columns;
        this.lastAnimationTime = Date.now();
        this.msDelayBetweenAnimations = msDelayBetweenAnimations;
        this.states = states;
        this.currentIndex = 0;

        for (let i: number = 0; i < this.states.length; i++) {
            if (this.states[i].name === currentStateName) {
                this.currentState = this.states[i];
                this.currentRow = this.currentState.startRow;
                this.currentColumn = this.currentState.startColumn;
                return;
            }
        }

        //Just to stop ts from complaining
        this.currentState = states[0];
        throw new Error("currentState not set");
    }

    get image(): HTMLImageElement {
        return this.spriteSheet.image;
    }

    get frameWidth(): number {
        return this.spriteSheet.frameWidth;
    }

    get frameHeight(): number {
        return this.spriteSheet.frameHeight;
    }

    get xForCanvas(): number {
        this.updateCurrentRowAndColumnIfNeeded();
        return this.spriteSheet.frameWidth * this.currentColumn;
    }

    get yForCanvas(): number {
        this.updateCurrentRowAndColumnIfNeeded();
        return this.spriteSheet.frameHeight * this.currentRow;
    }

    public setNewState(stateName: string): void {
        if (this.currentState.name === stateName) {
            //Ignore request
            return;
        }

        for (let i: number = 0; i < this.states.length; i++) {
            if (this.states[i].name === stateName) {
                this.currentState = this.states[i];
                this.currentRow = this.currentState.startRow;
                this.currentColumn = this.currentState.startColumn;
                this.currentIndex = 0;
                return;
            }
        }
        throw new Error("currentState not found");
    }

    private updateCurrentRowAndColumnIfNeeded(): void {
        const now: number = Date.now();
        if (now - this.lastAnimationTime > this.msDelayBetweenAnimations) {
            this.lastAnimationTime += this.msDelayBetweenAnimations;
            this.currentColumn++;
            this.currentIndex++;
            if (this.currentIndex === this.currentState.amountOfFrames) {
                //Reset to first frame
                this.currentIndex = 0;
                this.currentRow = this.currentState.startRow;
                this.currentColumn = this.currentState.startColumn;
            } else if (this.currentColumn === this.columns) {
                this.currentColumn = 0;
                this.currentRow++;
            }
        }
    }
}