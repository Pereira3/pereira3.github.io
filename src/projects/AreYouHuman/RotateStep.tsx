import { useId, useState } from "react";
import {
	Bird,
	Cat,
	Dog,
	Rabbit,
	Rat,
	Snail,
	Squirrel,
	Turtle,
} from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { pick, randomInt } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/RotateStep.module.css";

const ANIMALS = [
	{ name: "cat", icon: Cat },
	{ name: "dog", icon: Dog },
	{ name: "rabbit", icon: Rabbit },
	{ name: "squirrel", icon: Squirrel },
	{ name: "turtle", icon: Turtle },
	{ name: "bird", icon: Bird },
	{ name: "snail", icon: Snail },
	{ name: "rat", icon: Rat },
] as const;

type Animal = (typeof ANIMALS)[number];

const ROUNDS = 3;
const TOLERANCE = 12; // how many degrees off upright still counts
const MAX_MISSES = 3; // wrong answers allowed; the next one blocks access

type Picture = {
	animal: Animal;
	offset: number; // how far it starts from upright, clockwise, in degrees
};

// A new animal, never the one before, turned well away from upright.
function makePicture(previous?: Animal): Picture {
	return {
		animal: pick(ANIMALS.filter((animal) => animal !== previous)),
		offset: randomInt(40, 320),
	};
}

// How far from upright, from -180 to 180 degrees: positive is tilted to the right.
function tilt(angle: number): number {
	const turned = angle % 360;
	return turned > 180 ? turned - 360 : turned;
}

// For screen readers, which can't see the picture: the slider says how it's tilted.
function describe(off: number): string {
	if (Math.abs(off) <= TOLERANCE) return "Upright";
	if (Math.abs(off) >= 150) return "Upside down";
	return `Tilted ${Math.abs(off)} degrees to the ${off > 0 ? "right" : "left"}`;
}

// A picture of an animal, turned at random: turn it with the slider until it stands
// upright, then press Verify. Three animals in a row. A wrong answer brings a new one,
// up to MAX_MISSES times.
export function RotateStep({ pass, fail }: StepProps) {
	const [round, setRound] = useState(0);
	const [picture, setPicture] = useState(() => makePicture());
	const [value, setValue] = useState(0);
	const [misses, setMisses] = useState(0);
	const [missed, setMissed] = useState(false); // the last answer was wrong
	const sliderId = useId();

	const off = tilt(picture.offset + value);
	const Icon = picture.animal.icon;

	function next() {
		setPicture(makePicture(picture.animal));
		setValue(0);
	}

	function check() {
		if (Math.abs(off) <= TOLERANCE) {
			if (round + 1 === ROUNDS) return pass();
			setRound(round + 1);
			setMissed(false);
			next();
		} else if (misses >= MAX_MISSES) {
			fail();
		} else {
			setMisses(misses + 1);
			setMissed(true);
			next();
		}
	}

	return (
		<>
			<p className={shared.instruction}>
				Turn the {picture.animal.name} until it stands upright.
			</p>

			<div className={styles.frame}>
				{/* The ground turns with the animal: upright, it's at the bottom. */}
				<div
					className={styles.scene}
					style={{ rotate: `${picture.offset + value}deg` }}
				>
					<Icon
						className={styles.animal}
						size={96}
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<div className={styles.ground} />
				</div>
			</div>

			{/* For screen readers and voice control; the instruction says the rest. */}
			<label className="visually-hidden" htmlFor={sliderId}>
				Turn
			</label>
			{/* The same slider for every picture, only set back to 0, so it keeps the
			    keyboard focus from one animal to the next. */}
			<input
				id={sliderId}
				className={styles.slider}
				type="range"
				min={0}
				max={359}
				value={value}
				aria-valuetext={describe(off)}
				onChange={(event) => setValue(Number(event.target.value))}
				onKeyDown={(event) => event.key === "Enter" && check()}
			/>

			{missed && (
				<p className={styles.misses} role="status">
					Not quite upright, here's another one. {misses} of{" "}
					{MAX_MISSES} misses used.
				</p>
			)}

			<div className={shared.answers}>
				<button
					type="button"
					className={shared.primary}
					onClick={check}
				>
					Verify
				</button>
			</div>

			<p className={shared.counter}>
				Animal {round + 1} of {ROUNDS}
			</p>
		</>
	);
}
