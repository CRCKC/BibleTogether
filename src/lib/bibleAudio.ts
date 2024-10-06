import { bibleshort, type BibleChapter } from "./bible";

export class BibleAudio {
    private _audio: HTMLAudioElement | undefined;
    // private subscription;

    public setAudio(bible: BibleChapter) {
        const index = bibleshort.findIndex((v) => v == bible.scroll) + 1;

        const link = `https://raw.githubusercontent.com/CRCKC/solid-waddle/refs/heads/main/audio/${index}_${bible.scroll}/${bible.scroll}_${bible.chapter}.mp3`;
        this._audio?.pause();
        this._audio = new Audio(link);
    }

    public stopChapterAudio() {
        this._audio?.pause();
        return;
    }

    public playChapterAudio() {
        this._audio?.play();
        return;
    }
}


export function getAudioLink(bible: BibleChapter) {
    const index = bibleshort.findIndex((v) => v == bible.scroll) + 1;
    const link = `https://raw.githubusercontent.com/CRCKC/solid-waddle/refs/heads/main/audio/${index}_${bible.scroll}/${bible.scroll}_${bible.chapter}.mp3`;
    return link;
}