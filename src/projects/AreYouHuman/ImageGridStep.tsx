import { useState } from "react";
import {
	Bike,
	Bird,
	Bus,
	Car,
	Check,
	Plane,
	Ship,
	TrafficCone,
	TreePine,
} from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import {
	pick,
	randomBetween,
	randomInt,
	shuffle,
} from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/ImageGridStep.module.css";

const OBJECTS = [
	{ name: "bicycles", label: "Bicycle", icon: Bike },
	{ name: "cars", label: "Car", icon: Car },
	{ name: "buses", label: "Bus", icon: Bus },
	{ name: "traffic cones", label: "Traffic cone", icon: TrafficCone },
	{ name: "boats", label: "Boat", icon: Ship },
	{ name: "planes", label: "Plane", icon: Plane },
	{ name: "birds", label: "Bird", icon: Bird },
	{ name: "trees", label: "Tree", icon: TreePine },
] as const;

type GameObject = (typeof OBJECTS)[number];

type Square = {
	object: GameObject;
	rotate: number; // each picture is turned and sized a little differently
	scale: number;
};

// Nine squares: three or four with the object to find, the rest with other objects.
function makeGrid() {
	const target = pick(OBJECTS);
	const others = OBJECTS.filter((object) => object !== target);
	const count = randomInt(3, 4);
	const objects = shuffle([
		...Array.from({ length: count }, () => target),
		...Array.from({ length: 9 - count }, () => pick(others)),
	]);
	const squares: Square[] = objects.map((object) => ({
		object,
		rotate: randomBetween(-30, 30),
		scale: randomBetween(0.75, 1.15),
	}));
	return { target, squares };
}

const MAX_MISSES = 3; // wrong answers allowed; the next one blocks access

// "Select all squares with…": every square with the object must be selected, and nothing else.
// A wrong answer brings a new set of squares, up to MAX_MISSES times.
export function ImageGridStep({ pass, fail }: StepProps) {
	const [{ target, squares }, setGrid] = useState(makeGrid);
	const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
	const [misses, setMisses] = useState(0);

	function toggle(index: number) {
		setSelected((previous) => {
			const next = new Set(previous);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	}

	function check() {
		const correct = squares.every(
			(square, index) =>
				(square.object === target) === selected.has(index),
		);
		if (correct) {
			pass();
		} else if (misses >= MAX_MISSES) {
			fail();
		} else {
			setMisses(misses + 1);
			setGrid(makeGrid());
			setSelected(new Set());
		}
	}

	return (
		<>
			<div className={styles.prompt}>
				<span>Select all squares with</span>
				<strong>{target.name}</strong>
			</div>

			<ul className={styles.grid}>
				{squares.map((square, index) => {
					const Icon = square.object.icon;
					return (
						<li key={index}>
							<button
								type="button"
								className={styles.square}
								aria-pressed={selected.has(index)}
								aria-label={square.object.label}
								onClick={() => toggle(index)}
							>
								<Icon
									size={46}
									aria-hidden="true"
									style={{
										transform: `rotate(${square.rotate}deg) scale(${square.scale})`,
									}}
								/>
								{selected.has(index) && (
									<Check
										className={styles.mark}
										size={14}
										strokeWidth={3}
										aria-hidden="true"
									/>
								)}
							</button>
						</li>
					);
				})}
			</ul>

			{misses > 0 && (
				<p className={styles.misses} role="status">
					Not quite, here's a new set. {misses} of {MAX_MISSES} misses
					used.
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
		</>
	);
}
