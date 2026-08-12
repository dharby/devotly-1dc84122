// Bible-in-a-year plan: 1,189 chapters spread across 365 days, pairing an
// Old Testament portion with a New Testament / Psalms portion each day.

interface Book { name: string; chapters: number }

const OT: Book[] = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 }, { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 }, { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 }, { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
  { name: "Proverbs", chapters: 31 }, { name: "Ecclesiastes", chapters: 12 }, { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 }, { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 }, { name: "Daniel", chapters: 12 }, { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 }, { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 }, { name: "Micah", chapters: 7 }, { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 }, { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 }, { name: "Malachi", chapters: 4 },
];

const NT: Book[] = [
  { name: "Psalms", chapters: 150 },
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 },
];

export const PLAN_DAYS = 365;

function flatten(books: Book[]): { book: string; chapter: number }[] {
  const out: { book: string; chapter: number }[] = [];
  books.forEach((b) => {
    for (let c = 1; c <= b.chapters; c++) out.push({ book: b.name, chapter: c });
  });
  return out;
}

function condense(list: { book: string; chapter: number }[]): string[] {
  const refs: string[] = [];
  let i = 0;
  while (i < list.length) {
    const book = list[i].book;
    const start = list[i].chapter;
    let end = start;
    while (i + 1 < list.length && list[i + 1].book === book && list[i + 1].chapter === end + 1) {
      i++;
      end = list[i].chapter;
    }
    refs.push(start === end ? `${book} ${start}` : `${book} ${start}-${end}`);
    i++;
  }
  return refs;
}

function slice(all: { book: string; chapter: number }[], day: number) {
  const perDay = all.length / PLAN_DAYS;
  const from = Math.floor((day - 1) * perDay);
  const to = Math.floor(day * perDay);
  return all.slice(from, Math.max(to, from + 1));
}

const OT_FLAT = flatten(OT);
const NT_FLAT = flatten(NT);

export interface ReadingDay {
  day: number;
  oldTestament: string[];
  newTestament: string[];
  all: string[];
}

export function getReadingForDay(day: number): ReadingDay {
  const d = Math.min(Math.max(day, 1), PLAN_DAYS);
  const oldTestament = condense(slice(OT_FLAT, d));
  const newTestament = condense(slice(NT_FLAT, d));
  return { day: d, oldTestament, newTestament, all: [...oldTestament, ...newTestament] };
}

/** Day number (1-based) of the plan for a given start date. */
export function currentPlanDay(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(diff + 1, 1), PLAN_DAYS);
}
