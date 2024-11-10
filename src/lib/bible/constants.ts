import bibleJson from './maxChap.json';
import bibleChineseJson from './chinese.json';
import bibleIndexJson from "./index.json";
import bibleScheduleJson from "./schedule.json";

export const bibleList = bibleJson as { [scroll: string]: number; }
export const bibleChinese = bibleChineseJson as { [scroll: string]: string };
export const bibleshort = ["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"];
export const bibleIndex = bibleIndexJson as { [scroll: string]: number; };
export const bibleSchedule = bibleScheduleJson as {
    [year: number]: {
        [month: number]: Array<{
            "scroll": string,
            "start": number,
            "end": number
        }>
    }
}