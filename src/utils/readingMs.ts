const MS_PER_WORD = 1000 / 3; // an unhurried 180 words a minute

// Time to read a text and act on it, in milliseconds: a third of a second for every
// word, plus `extra` for whatever comes after reading, and never under `min`.
// Longer texts get more time without anyone counting.
export function readingMs(
	text: string,
	{ extra = 0, min = 0 }: { extra?: number; min?: number } = {},
): number {
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(min, Math.round(extra + words * MS_PER_WORD));
}
