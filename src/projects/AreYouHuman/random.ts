// Small helpers for the captchas, which are different on every attempt.

export function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
	return Math.floor(randomBetween(min, max + 1));
}

export function pick<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

// Returns a shuffled copy, leaving the original list untouched.
export function shuffle<T>(items: readonly T[]): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
