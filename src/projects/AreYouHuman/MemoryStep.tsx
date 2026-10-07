import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { randomInt } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/MemoryStep.module.css";

// The same bright inks as the color words.
const SQUARES = [
	{ name: "Red", color: "#ff6b6b" },
	{ name: "Blue", color: "#5aa9ff" },
	{ name: "Green", color: "#4cd98a" },
	{ name: "Yellow", color: "#ffd84d" },
] as const;

const LENGTHS = [3, 4, 5]; // one sequence per round, each one longer
const MAX_MISSES = 2; // wrong sequences allowed; the next one blocks access
const FLASH_MS = 550; // how long each square lights up while the sequence plays
const PAUSE_MS = 300; // the dark moment between two flashes, and before the first
const PRESS_MS = 220; // how long a square lights up when the visitor presses it

function makeSequence(length: number): number[] {
	return Array.from({ length }, () => randomInt(0, SQUARES.length - 1));
}

type Phase = "ready" | "watching" | "repeating";

// Squares light up one after another: press them in the same order. Three rounds, each
// a square longer. A wrong press shows a new sequence of the same length, up to
// MAX_MISSES times.
export function MemoryStep({ pass, fail }: StepProps) {
	const [phase, setPhase] = useState<Phase>("ready");
	const [round, setRound] = useState(0);
	const [sequence, setSequence] = useState(() => makeSequence(LENGTHS[0]));
	const [misses, setMisses] = useState(0);
	const [missed, setMissed] = useState(false); // this round's last try was wrong
	const firstSquareRef = useRef<HTMLButtonElement>(null);
	// While watching: even ticks are the dark pauses, odd ticks light up the squares
	// in order, so tick 2i+1 lights up sequence[i].
	const [tick, setTick] = useState(0);
	const [entered, setEntered] = useState(0); // squares repeated right so far
	const [pressed, setPressed] = useState<{ square: number } | null>(null);

	const lit =
		phase === "watching" && tick % 2 === 1
			? sequence[(tick - 1) / 2]
			: (pressed?.square ?? null);

	// Plays the sequence: one tick after another, then it's the visitor's turn.
	useTimeout(
		() => {
			if (tick + 1 > sequence.length * 2) setPhase("repeating");
			else setTick(tick + 1);
		},
		phase === "watching" ? (tick % 2 === 1 ? FLASH_MS : PAUSE_MS) : null,
		tick,
	);

	// On the visitor's turn, focus goes to the first square. The Start button is gone
	// and the squares were disabled while the sequence played, so otherwise keyboard
	// focus would be lost on the page.
	useEffect(() => {
		if (phase === "repeating") firstSquareRef.current?.focus();
	}, [phase]);

	// A pressed square goes dark again after a moment. Each press is a new object, so
	// pressing the same square twice still starts the wait over.
	useTimeout(() => setPressed(null), pressed ? PRESS_MS : null, pressed);

	function watch(length: number) {
		setSequence(makeSequence(length));
		setTick(0);
		setEntered(0);
		setPressed(null);
		setPhase("watching");
	}

	function press(square: number) {
		if (phase !== "repeating") return;
		setPressed({ square });
		if (square !== sequence[entered]) {
			if (misses >= MAX_MISSES) return fail();
			setMisses(misses + 1);
			setMissed(true);
			watch(LENGTHS[round]);
		} else if (entered + 1 < sequence.length) {
			setEntered(entered + 1);
		} else if (round + 1 === LENGTHS.length) {
			pass();
		} else {
			setRound(round + 1);
			setMissed(false);
			watch(LENGTHS[round + 1]);
		}
	}

	function status(): string {
		if (phase === "ready")
			return `${LENGTHS.length} sequences, each one a square longer.`;
		if (phase === "watching") return "Watch…";
		return `Your turn: ${entered} of ${sequence.length}`;
	}

	return (
		<>
			<p className={shared.instruction}>
				Repeat the squares in the order they light up.
			</p>

			<div className={styles.board}>
				{SQUARES.map((square, index) => (
					<button
						key={square.name}
						ref={index === 0 ? firstSquareRef : undefined}
						type="button"
						className={styles.square}
						style={{ "--square": square.color } as CSSProperties}
						data-lit={lit === index}
						aria-label={square.name}
						disabled={phase !== "repeating"}
						onClick={() => press(index)}
					/>
				))}
				{phase === "ready" && (
					<button
						type="button"
						className={`${shared.primary} ${styles.start}`}
						onClick={() => watch(LENGTHS[0])}
					>
						Start
					</button>
				)}
			</div>

			{/* Says each square as it lights up, for screen readers. */}
			<p className="visually-hidden" aria-live="assertive">
				{phase === "watching" && lit !== null ? SQUARES[lit].name : ""}
			</p>

			{missed && (
				<p className={styles.misses} role="status">
					Not quite, here's a new sequence. {misses} of {MAX_MISSES}{" "}
					misses used.
				</p>
			)}

			<p className={shared.counter}>
				Round {round + 1} of {LENGTHS.length} · {status()}
			</p>
		</>
	);
}
