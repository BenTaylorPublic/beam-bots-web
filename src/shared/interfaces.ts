export interface AudioData {
    url: string;
    name: string;
    element?: HTMLAudioElement;
}

export interface SpriteSheetState {
    name: string;
    startRow: number;
    startColumn: number;
    amountOfFrames: number;
}