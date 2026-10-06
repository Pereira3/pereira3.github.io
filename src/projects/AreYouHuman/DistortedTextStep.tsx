import { useId, useState } from "react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { pick, randomBetween, randomInt } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/DistortedTextStep.module.css";
import { RefreshCw } from "lucide-react";

// Letters and digits that can't be confused with each other (no 0/O, 1/I/L).
const CHARACTERS = [..."ABCDEFGHJKMNPQRSTUVWXYZ23456789"];
const LENGTH = 6;

// Six random characters, each placed, turned and sized differently, with lines
// struck through them and a wavy distortion over the whole word.
function makeText() {
	const code = Array.from({ length: LENGTH }, () => pick(CHARACTERS)).join(
		"",
	);
	const letters = [...code].map((char, index) => ({
		char,
		x: 42 + index * 43 + randomBetween(-5, 5),
		y: 62 + randomBetween(-10, 10),
		rotate: randomBetween(-30, 30),
		size: randomBetween(30, 42),
	}));
	const strikes = Array.from({ length: 3 }, () => ({
		from: randomBetween(30, 75),
		bend: randomBetween(10, 95),
		to: randomBetween(30, 75),
	}));
	return {
		code,
		letters,
		strikes,
		seed: randomInt(1, 999),
		tilt: randomBetween(-6, 6),
	};
}

// Type the barely readable text. Anything but an exact match fails.
// The refresh button swaps in a new text as often as the visitor likes, while time allows.
export function DistortedTextStep({ pass, fail }: StepProps) {
	const [text, setText] = useState(makeText);
	const [answer, setAnswer] = useState("");
	const waveId = useId();

	function newText() {
		setText(makeText());
		setAnswer("");
	}

	function check() {
		if (answer.trim().toUpperCase() === text.code) pass();
		else fail();
	}

	return (
		<>
			<p className={styles.instruction}>Type the text you see.</p>

			<div className={styles.frame}>
				<svg
					className={styles.picture}
					viewBox="0 0 300 100"
					role="img"
					aria-label="Distorted text"
				>
					<defs>
						<filter id={waveId}>
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.015 0.06"
								numOctaves={2}
								seed={text.seed}
							/>
							<feDisplacementMap in="SourceGraphic" scale={9} />
						</filter>
					</defs>

					<g
						filter={`url(#${waveId})`}
						transform={`rotate(${text.tilt} 150 50)`}
					>
						{text.letters.map((letter, index) => (
							<text
								key={index}
								className={styles.letter}
								x={letter.x}
								y={letter.y}
								fontSize={letter.size}
								transform={`rotate(${letter.rotate} ${letter.x} ${letter.y - 12})`}
							>
								{letter.char}
							</text>
						))}
						{text.strikes.map((strike, index) => (
							<path
								key={index}
								className={styles.strike}
								d={`M 8 ${strike.from} Q 150 ${strike.bend} 292 ${strike.to}`}
							/>
						))}
					</g>
				</svg>
				<button
					type="button"
					className={styles.refresh}
					onClick={newText}
					aria-label="Show a different text"
					title="Show a different text"
				>
					<RefreshCw size={18} aria-hidden="true" />
				</button>
			</div>

			<form
				className={styles.form}
				onSubmit={(event) => {
					event.preventDefault();
					check();
				}}
			>
				<input
					className={styles.input}
					value={answer}
					onChange={(event) => setAnswer(event.target.value)}
					aria-label="The text in the picture"
					maxLength={LENGTH}
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
				/>
				<button type="submit" className={shared.primary}>
					Verify
				</button>
			</form>
		</>
	);
}
