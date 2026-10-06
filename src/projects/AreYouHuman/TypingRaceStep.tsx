import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ClipboardEvent, CSSProperties } from "react";
import { Car } from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { shuffle } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/TypingRaceStep.module.css";

// Lowercase, so capital letters never cost the visitor fuel.
const PHRASES = [
	"beep boop i am human",
	"robots cannot type this",
	"my fingers are real",
	"words are my fuel",
	"faster than a bot",
	"no robots allowed",
	"type fast and win",
	"click clack goes the car",
	"humans love racing",
	"the finish line is near",
];

const RACE_LENGTH = 60; // correctly typed characters needed to reach the finish line
const BOT_SECONDS = 22; // the bot's time to the finish line, about 33 words a minute
const WIN_PAUSE_MS = 800; // time to see the car cross the line before moving on

type Phase = "ready" | "racing" | "won";

// How much of the phrase has been typed correctly, from its start.
function correctLength(typed: string, phrase: string): number {
	let length = 0;
	while (
		length < typed.length &&
		typed[length].toLowerCase() === phrase[length]
	)
		length++;
	return length;
}

// A 2D race against a bot: every character typed correctly moves your car forward.
// Finish the phrases and cross the line before the bot does, or the step fails.
export function TypingRaceStep({ pass, fail, pauseTimer }: StepProps) {
	const [phrases] = useState(() => shuffle(PHRASES));
	const [phase, setPhase] = useState<Phase>("ready");
	const [index, setIndex] = useState(0); // the phrase being typed
	const [fuel, setFuel] = useState(0); // characters from the phrases already finished
	const [typed, setTyped] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const onLose = useEffectEvent(fail);
	const onWin = useEffectEvent(pass);

	const phrase = phrases[index % phrases.length];
	const correct = correctLength(typed, phrase);
	const progress = Math.min(1, (fuel + correct) / RACE_LENGTH);

	// The bot reaches the finish line BOT_SECONDS after the start. Its car's animation
	// lasts as long, but the result comes from this timer, so it holds without animations.
	useEffect(() => {
		if (phase !== "racing") return;
		inputRef.current?.focus();
		const timer = window.setTimeout(onLose, BOT_SECONDS * 1000);
		return () => window.clearTimeout(timer);
	}, [phase]);

	// After a win, a short pause to see the car cross the line.
	useEffect(() => {
		if (phase !== "won") return;
		const timer = window.setTimeout(onWin, WIN_PAUSE_MS);
		return () => window.clearTimeout(timer);
	}, [phase]);

	function type(input: string) {
		// A space typed out of habit after finishing a phrase isn't a typo in the next one.
		const value = input.trimStart();
		if (fuel + correctLength(value, phrase) >= RACE_LENGTH) {
			setTyped(value);
			setPhase("won");
		} else if (value.toLowerCase() === phrase) {
			setFuel(fuel + phrase.length);
			setIndex(index + 1);
			setTyped("");
		} else {
			setTyped(value);
		}
	}

	// Once the race starts, the bot is the clock: the step's own countdown stops, so it
	// can't run out mid-race and end the step before either car reaches the line.
	function startRace() {
		pauseTimer();
		setPhase("racing");
	}

	// Pasting would make it too easy; the fuel has to be typed.
	function blockPaste(event: ClipboardEvent<HTMLInputElement>) {
		event.preventDefault();
	}

	const mistake = typed.length > correct;

	return (
		<>
			<p className={styles.instruction}>
				Type the phrases to fuel your car. Beat the bot to the finish.
			</p>

			{/* The race is a picture of the progress; the phrase and the box below carry it. */}
			<div className={styles.track} aria-hidden="true">
				<div className={styles.lane}>
					<span className={styles.name}>You</span>
					<span className={styles.road}>
						<span
							className={`${styles.car} ${styles.player}`}
							style={{ "--progress": progress } as CSSProperties}
						>
							<Car size={28} />
						</span>
					</span>
				</div>
				<div className={styles.lane}>
					<span className={styles.name}>Bot</span>
					<span className={styles.road}>
						<span
							className={
								phase === "ready"
									? `${styles.car} ${styles.bot}`
									: `${styles.car} ${styles.bot} ${styles.driving}`
							}
							style={{
								animationDuration: `${BOT_SECONDS}s`,
								animationPlayState:
									phase === "won" ? "paused" : "running",
							}}
						>
							<Car size={28} />
						</span>
					</span>
				</div>
			</div>

			<p className={styles.phrase}>
				<span className={styles.typed}>{phrase.slice(0, correct)}</span>
				{phrase.slice(correct)}
			</p>

			{phase === "ready" ? (
				<button
					type="button"
					className={shared.primary}
					onClick={startRace}
				>
					Start the race
				</button>
			) : (
				<input
					ref={inputRef}
					className={
						mistake
							? `${styles.input} ${styles.wrong}`
							: styles.input
					}
					value={typed}
					onChange={(event) => type(event.target.value)}
					onPaste={blockPaste}
					disabled={phase === "won"}
					aria-label="Type the phrase"
					aria-invalid={mistake}
					autoComplete="off"
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck={false}
				/>
			)}
		</>
	);
}
