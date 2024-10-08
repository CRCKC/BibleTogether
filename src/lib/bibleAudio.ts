import { bibleshort, type BibleChapter } from "./bible";

const GITHUB_DATABASE_BASEURL = "https://raw.githubusercontent.com/CRCKC/BibleTogether/refs/heads/data";

export function getAudioLink(bible: BibleChapter) {
    const index = bibleshort.findIndex((v) => v == bible.scroll) + 1;
    const link = `${GITHUB_DATABASE_BASEURL}/audio/${index}_${bible.scroll}/${bible.scroll}_${bible.chapter}.mp3`;
    return link;
}