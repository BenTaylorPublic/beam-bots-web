import {GameScenes} from "../beam-bots-shared/types";

export interface AudioData {
    url: string;
    name: string;
}

export interface AudioDataWithElements {
    url: string;
    name: string;
    elements: HTMLAudioElement[];
}

export interface SpriteSheetState {
    name: string;
    startRow: number;
    startColumn: number;
    amountOfFrames: number;
}

export interface LobbyMinigame {
    minigame: GameScenes;
    image: HTMLImageElement;
    selected: boolean;
    index: number;
}