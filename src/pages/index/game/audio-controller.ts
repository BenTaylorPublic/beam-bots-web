import {AudioData} from "../../../shared/interfaces";

export class AudioController {
    private static audio: AudioData[];

    public static initialize(): void {
        this.audio = [];
    }

    public static loadAudio(audioDataToLoad: AudioData[]): void {
        for (let i: number = 0; i < audioDataToLoad.length; i++) {
            const audioData: AudioData = audioDataToLoad[i];
            audioData.element = new Audio("/beam-bots/assets/sounds/" + audioData.url);
            this.audio.push(audioData);
        }
    }

    public static playAudio(name: string): void {
        for (let i: number = 0; i < this.audio.length; i++) {
            const audioData: AudioData = this.audio[i];
            if (audioData.name === name && audioData.element != null) {
                audioData.element.play();
                return;
            }
        }
    }

    public static removeAllAudio(): void {
        this.audio = [];
    }
}