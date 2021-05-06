import {AudioData, AudioDataWithElements} from "../../../shared/interfaces";
import {ConstantsWeb} from "../../../shared/constants-web";

export class AudioController {
    private static audio: AudioDataWithElements[];
    private static volume: number;

    public static initialize(): void {
        this.audio = [];
        this.volume = ConstantsWeb.DEFAULT_VOLUME;
    }

    public static loadAudio(audioDataToLoad: AudioData[]): void {
        for (let i: number = 0; i < audioDataToLoad.length; i++) {
            const audioData: AudioDataWithElements = {
                url: audioDataToLoad[i].url,
                name: audioDataToLoad[i].name,
                elements: []
            };
            const element: HTMLAudioElement = new Audio(ConstantsWeb.SOUND_PATH + audioData.url);
            element.volume = this.volume;
            audioData.elements.push(element);
            this.audio.push(audioData);
        }
    }

    public static playAudio(name: string): void {
        if (this.volume === 0) {
            //No point if volume is 0
            return;
        }

        for (let i: number = 0; i < this.audio.length; i++) {
            const audioData: AudioDataWithElements = this.audio[i];
            if (audioData.name === name) {
                this.play(audioData);
                return;
            }
        }
        console.error(`Audio not found: ${name}`);
    }

    public static removeAllAudio(): void {
        this.audio = [];
    }

    public static setVolume(volume: number): void {
        this.volume = volume / 100;
        for (let i: number = 0; i < this.audio.length; i++) {
            const audioData: AudioDataWithElements = this.audio[i];
            for (let j: number = 0; j < this.audio.length; j++) {
                audioData.elements[j].volume = this.volume;
            }
        }
    }

    private static play(audioData: AudioDataWithElements): void {
        for (let i: number = 0; i < audioData.elements.length; i++) {
            const element: HTMLAudioElement = audioData.elements[i];
            if (element.paused) {
                audioData.elements[i].play();
                return;
            }
        }
        const newElement: HTMLAudioElement = new Audio(ConstantsWeb.SOUND_PATH + audioData.url);
        newElement.volume = this.volume;
        audioData.elements.push(newElement);
        newElement.play();
    }
}