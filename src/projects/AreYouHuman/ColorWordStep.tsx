import { useState } from "react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { pick, shuffle } from "@/projects/AreYouHuman/random";
import styles from "@/projects/AreYouHuman/ColorWordStep.module.css";

// Bright inks that read well on the squares' dark background, in both themes.
const COLORS = [
	{ name: "Red", ink: "#ff6b6b" },
	{ name: "Blue", ink: "#5aa9ff" },
	{ name: "Green", ink: "#4cd98a" },
	{ name: "Yellow", ink: "#ffd84d" },
	{ name: "Purple", ink: "#c49bff" },
	{ name: "Orange", ink: "#ffa552" },
] as const;

type Color = (typeof COLORS)[number];

type Square = {
	word: Color; // the color name written on the square
	ink: Color; // the color it's written in
};

const ROUNDS = 3;
const SQUARES = 6;

// One round. Exactly one square is written in the target ink, and its word names another
// color. One decoy says the target's name in another ink. No word is written in its own ink.
function makeRound() {
	const target = pick(COLORS);
	const others = COLORS.filter((color) => color !== target);
	const answer: Square = { word: pick(others), ink: target };
	const decoy: Square = { word: target, ink: pick(others) };
	const rest = Array.from({ length: SQUARES - 2 }, (): Square => {
		const ink = pick(others);
		return { word: pick(COLORS.filter((color) => color !== ink)), ink };
	});
	return { target, squares: shuffle([answer, decoy, ...rest]) };
}

// Color names written in other colors: press the one written in the asked color, not the
// one that says it. Three rounds in a row; a wrong press fails.
export function ColorWordStep({ pass, fail }: StepProps) {
	const [round, setRound] = useState(0);
	const [{ target, squares }, setGrid] = useState(makeRound);

	function choose(square: Square) {
		if (square.ink !== target) {
			fail();
		} else if (round + 1 === ROUNDS) {
			pass();
		} else {
			setRound(round + 1);
			setGrid(makeRound());
		}
	}

	return (
		<>
			<div className={styles.prompt}>
				<span>Press the word written in</span>
				<strong>{target.name}</strong>
			</div>

			<ul className={styles.grid}>
				{squares.map((square, index) => (
					// The whole grid is replaced each round, so the position is a stable key.
					<li key={`${round}-${index}`}>
						<button
							type="button"
							className={styles.square}
							style={{ color: square.ink.ink }}
							aria-label={`${square.word.name}, written in ${square.ink.name.toLowerCase()}`}
							onClick={() => choose(square)}
						>
							{square.word.name}
						</button>
					</li>
				))}
			</ul>

			<p className={styles.round}>
				Round {round + 1} of {ROUNDS}
			</p>
		</>
	);
}
