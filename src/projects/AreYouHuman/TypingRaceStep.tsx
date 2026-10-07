import { useEffect, useState } from "react";
import type { ClipboardEvent, CSSProperties } from "react";
import { Car } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
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
	"no captcha can stop me",
	"keep your eyes on the road",
	"real hands on a real keyboard",
	"one more lap to go",
	"the engine runs on letters",
	"press the keys and go",
	"every letter counts",
	"full speed ahead",
	"a human was here",
	"only humans drink coffee",
	"the bot is catching up",
	"humans make typos sometimes",
	"slow and steady wins",
	"the bot never takes a break",
];

const PHRASE_COUNT = 5; // phrases to type to reach the finish line
const BOT_WPM = 25; // the bot's typing speed, in words per minute
const WIN_PAUSE_MS = 2200; // time to see the car cross the line and read the final speed
const TICK_MS = 250; // how often the speed is refreshed while racing, even between keys

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

// Words per minute, counting every 5 characters as a word, as typing tests do.
function wordsPerMinute(characters: number, ms: number): number {
	return ms > 0 ? Math.round(characters / 5 / (ms / 60_000)) : 0;
}

// A 2D race against a bot: every character typed correctly moves your car forward.
// Finish the phrases and cross the line before the bot does, or the step fails.
export function TypingRaceStep({ pass, fail, removeTimer }: StepProps) {
	const [phrases] = useState(() => shuffle(PHRASES).slice(0, PHRASE_COUNT));
	const [phase, setPhase] = useState<Phase>("ready");
	const [index, setIndex] = useState(0); // the phrase being typed
	const [fuel, setFuel] = useState(0); // characters from the phrases already finished
	const [typed, setTyped] = useState("");
	const [startedAt, setStartedAt] = useState(0); // performance.now() at the first key
	const [now, setNow] = useState(0); // performance.now() at the last key or tick
	const [keys, setKeys] = useState(0); // characters typed, right or wrong
	const [rightKeys, setRightKeys] = useState(0); // of those, the ones that matched the phrase

	// The race is as long as the phrases drawn and the bot always types at BOT_WPM,
	// so its time to the finish line depends on them.
	const raceLength = phrases.reduce((sum, each) => sum + each.length, 0);
	const botSeconds = (raceLength / 5 / BOT_WPM) * 60;

	const phrase = phrases[index];
	const correct = correctLength(typed, phrase);
	const progress = Math.min(1, (fuel + correct) / raceLength);
	const wpm = wordsPerMinute(fuel + correct, now - startedAt);
	const accuracy = keys > 0 ? Math.round((rightKeys / keys) * 100) : 100;

	// The bot reaches the finish line botSeconds after the start. Its car's animation
	// lasts as long, but the result comes from this timer, so it holds without animations.
	// Winning ends the racing phase, which stops the timer.
	useTimeout(fail, phase === "racing" ? botSeconds * 1000 : null);

	// Refreshes the speed between keys too, so it drops while the visitor pauses.
	useEffect(() => {
		if (phase !== "racing") return;
		const ticker = window.setInterval(
			() => setNow(performance.now()),
			TICK_MS,
		);
		return () => window.clearInterval(ticker);
	}, [phase]);

	// After a win, a short pause to see the car cross the line.
	useTimeout(pass, phase === "won" ? WIN_PAUSE_MS : null);

	// time is when the key was typed, on the same clock as performance.now().
	function type(input: string, time: number) {
		// A space typed out of habit after finishing a phrase isn't a typo in the next one.
		const value = input.trimStart();
		const right = correctLength(value, phrase);

		// The race, and its clock for the speed, start with the first character.
		if (phase === "ready" && value) startRace(time);
		setNow(time);

		// Each new character counts as right only if everything up to it matches the
		// phrase, so the keys typed after a typo count as wrong until it's fixed.
		if (value.length > typed.length) {
			setKeys(keys + value.length - typed.length);
			setRightKeys(rightKeys + Math.max(0, right - typed.length));
		}

		if (fuel + right >= raceLength) {
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

	// Once the race starts, the bot is the clock: the step's countdown and its bar are
	// removed, so it can't run out mid-race and end the step before either car reaches
	// the line, and the bot's car is the only time on screen.
	function startRace(time: number) {
		removeTimer();
		setStartedAt(time);
		setPhase("racing");
	}

	// Pasting would make it too easy; the fuel has to be typed.
	function blockPaste(event: ClipboardEvent<HTMLInputElement>) {
		event.preventDefault();
	}

	const mistake = typed.length > correct;

	return (
		<>
			<p className={shared.instruction}>
				Click the box and type to fuel your car. Beat the bot to the
				finish.
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
								animationDuration: `${botSeconds}s`,
								animationPlayState:
									phase === "won" ? "paused" : "running",
							}}
						>
							<Car size={28} />
						</span>
					</span>
				</div>
			</div>

			{/* Across the line, the phrase and the box give way to the final speed. */}
			{phase === "won" ? (
				<p className={shared.result} role="status">
					You finished at {wpm} WPM with {accuracy}% accuracy
				</p>
			) : (
				<>
					<p className={styles.phrase}>
						<span className={styles.typed}>
							{phrase.slice(0, correct)}
						</span>
						{phrase.slice(correct)}
					</p>

					<input
						className={
							mistake
								? `${styles.input} ${styles.wrong}`
								: styles.input
						}
						value={typed}
						onChange={(event) =>
							type(event.target.value, event.timeStamp)
						}
						onPaste={blockPaste}
						placeholder={
							phase === "ready"
								? "Click here and type to start"
								: undefined
						}
						aria-label="Type the phrase"
						aria-invalid={mistake}
						autoComplete="off"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
					/>

					<p className={`${shared.counter} ${styles.stats}`}>
						{phase === "ready"
							? `${PHRASE_COUNT} phrases. The race starts with your first key; the bot types ${BOT_WPM} words a minute.`
							: `Phrase ${index + 1} of ${PHRASE_COUNT} · ${wpm} WPM · ${accuracy}% accuracy`}
					</p>
				</>
			)}
		</>
	);
}
