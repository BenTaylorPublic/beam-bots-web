import {AudioData} from "../../../shared/interfaces";
import {ConstantsWeb} from "../../../shared/constants-web";

export class AudioController {
    private static audio: AudioData[];
    private static volume: number;

    public static initialize(): void {
        this.audio = [];
        this.volume = ConstantsWeb.DEFAULT_VOLUME;
    }

    public static loadAudio(audioDataToLoad: AudioData[]): void {
        for (let i: number = 0; i < audioDataToLoad.length; i++) {
            const audioData: AudioData = audioDataToLoad[i];
            audioData.element = new Audio("/beam-bots/assets/sounds/" + audioData.url);
            audioData.element.volume = this.volume;
            this.audio.push(audioData);
        }
    }

    public static playAudio(name: string): void {
        if (this.volume === 0) {
            //No point if volume is 0
            return;
        }

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

    public static setVolume(volume: number): void {
        this.volume = volume;
        for (let i: number = 0; i < this.audio.length; i++) {
            const audioData: AudioData = this.audio[i];
            if (audioData.element != null) {
                audioData.element.volume = this.volume;
            }
        }
    }
}